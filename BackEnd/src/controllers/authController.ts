// ─────────────────────────────────────────────────────────────────────────────
// src/controllers/authController.ts  —  AUTH BUSINESS LOGIC
//
// Handles: login, token refresh, logout, set-password
// ─────────────────────────────────────────────────────────────────────────────

import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { fn, col, where as sequelizeWhere } from 'sequelize';
import { OAuth2Client } from 'google-auth-library';
import Employee from '../models/Employee';
import { JwtPayload } from '../types';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Case-insensitive email match — compares lower(email column) to the
// lowercased input, so rows stored with mixed case (e.g. before the
// email-lowercasing model hook existed) still match correctly.
const byEmailCaseInsensitive = (email: string) =>
  sequelizeWhere(fn('lower', col('email')), email.toLowerCase().trim());

const BCRYPT_ROUNDS = 12;
const ACCESS_TOKEN_TTL = '180m';
const REFRESH_TOKEN_TTL = '7d';

// ── Helper: sign tokens ───────────────────────────────────────────────────────

const signAccessToken = (payload: JwtPayload): string => {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error('JWT_ACCESS_SECRET not configured');
  return jwt.sign(payload, secret, { expiresIn: ACCESS_TOKEN_TTL });
}

const signRefreshToken = (id: string): string => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error('JWT_REFRESH_SECRET not configured');
  return jwt.sign({ id }, secret, { expiresIn: REFRESH_TOKEN_TTL });
}

const setRefreshCookie = (res: Response, token: string) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    path: '/api/auth',              // cookie only sent to /api/auth routes
  });
}

// ── POST /api/auth/login ──────────────────────────────────────────────────────

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  // Basic field validation
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  try {
    // Find employee including passwordHash (we explicitly include it here).
    const employee = await Employee.findOne({ where: byEmailCaseInsensitive(email) });

    if (!employee) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    if (!employee.passwordHash) {
      res.status(401).json({ error: 'Account not yet activated' });
      return;
    }

    // Constant-time comparison — prevents timing attacks
    const passwordMatch = await bcrypt.compare(password, employee.passwordHash);
    if (!passwordMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Update last login timestamp
    await employee.update({ lastLoginAt: new Date() });

    // Determine role — if the role field contains 'super_admin' treat as super_admin,
    // otherwise treat as employee
    const role = employee.role === 'super_admin' ? 'super_admin' : 'employee';

    const payload: JwtPayload = {
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      role,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(employee.id);

    setRefreshCookie(res, refreshToken);

    res.json({
      accessToken,
      user: payload,
    });
  } catch {
    res.status(500).json({ error: 'Login failed' });
  }
}

// ── POST /api/auth/google ─────────────────────────────────────────────────────
// Body: { idToken: string }  — the credential returned by Google Identity
// Services in the browser (see FrontEnd GoogleLoginButton).
//
// We NEVER trust any user/email data sent in the request body — the only
// thing we trust is the idToken, which we verify directly against Google.

export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  const { idToken } = req.body;

  if (!idToken || typeof idToken !== 'string') {
    res.status(400).json({ error: 'idToken is required' });
    return;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    res.status(500).json({ error: 'Google login is not configured' });
    return;
  }

  try {
    // Verifies the token's signature (against Google's public keys), that it
    // hasn't expired, and that it was issued for OUR client ID (aud claim).
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: clientId,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      res.status(401).json({ error: 'Invalid Google token' });
      return;
    }

    // Refuse unverified emails — anyone could add an unverified alias to
    // their Google account, and we must not let that impersonate a
    // pre-existing employee's email address.
    if (!payload.email_verified) {
      res.status(401).json({ error: 'Google email is not verified' });
      return;
    }

    const googleId = payload.sub;
    const email = payload.email;

    // 1. Already linked to this Google account?
    let employee = await Employee.findOne({ where: { googleId } });

    // 2. Not linked yet — is there an existing employee with this verified
    //    email (e.g. an admin-provisioned account that hasn't used Google
    //    before)? If so, link it. We never create a new employee here.
    if (!employee) {
      employee = await Employee.findOne({ where: byEmailCaseInsensitive(email) });

      if (!employee) {
        res.status(403).json({
          error: 'No account found for this email. Contact your admin to get access.',
        });
        return;
      }

      await employee.update({ googleId });
    }

    await employee.update({ lastLoginAt: new Date() });

    const role = employee.role === 'super_admin' ? 'super_admin' : 'employee';

    const jwtPayload: JwtPayload = {
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      role,
    };

    const accessToken = signAccessToken(jwtPayload);
    const refreshToken = signRefreshToken(employee.id);

    setRefreshCookie(res, refreshToken);

    res.json({
      accessToken,
      user: jwtPayload,
    });
  } catch {
    res.status(401).json({ error: 'Google authentication failed' });
  }
}

// ── POST /api/auth/refresh ────────────────────────────────────────────────────

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    res.status(401).json({ error: 'No refresh token' });
    return;
  }

  try {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) throw new Error('JWT_REFRESH_SECRET not configured');

    const decoded = jwt.verify(token, secret) as { id: string };

    const employee = await Employee.findByPk(decoded.id, {
      attributes: { exclude: ['passwordHash'] },
    });

    if (!employee) {
      res.clearCookie('refreshToken', { path: '/api/auth' });
      res.status(401).json({ error: 'User not found' });
      return;
    }

    const role = employee.role === 'super_admin' ? 'super_admin' : 'employee';

    const payload: JwtPayload = {
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      role,
    };

    const newAccessToken = signAccessToken(payload);
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.clearCookie('refreshToken', { path: '/api/auth' });
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
}

// ── POST /api/auth/logout ─────────────────────────────────────────────────────

export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.clearCookie('refreshToken', { path: '/api/auth' });
  res.json({ message: 'Logged out successfully' });
}

// ── POST /api/auth/set-password ───────────────────────────────────────────────
// Requires: authenticate + requireRole('super_admin')

export const setPassword = async (req: Request, res: Response): Promise<void> => {
  const { employeeId, newPassword } = req.body;

  if (!employeeId || !newPassword) {
    res.status(400).json({ error: 'employeeId and newPassword are required' });
    return;
  }

  if (typeof newPassword !== 'string' || newPassword.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' });
    return;
  }

  try {
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      res.status(404).json({ error: 'Employee not found' });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await employee.update({ passwordHash });

    // Never return the hash or the plaintext
    res.json({ message: 'Password updated successfully' });
  } catch {
    res.status(500).json({ error: 'Failed to update password' });
  }
}
