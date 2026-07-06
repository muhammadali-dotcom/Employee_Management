// ─────────────────────────────────────────────────────────────────────────────
// src/app.ts  —  EXPRESS APP (no listen/db-sync — used by both local server and
// the Vercel serverless entry point in api/index.ts)
// ─────────────────────────────────────────────────────────────────────────────

import express      from 'express';
import cors         from 'cors';
import cookieParser from 'cookie-parser';

// Routes
import employeeRoutes   from './routes/employees';
import departmentRoutes from './routes/departments';
import attendanceRoutes from './routes/attendance';
import authRoutes       from './routes/auth';

// Middleware
import { notFound }     from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';

// Import models so Sequelize registers them before sync
import './models/Department';
import './models/Employee';
import './models/Attendance';

const app = express();

// ── 1. Global Middleware ──────────────────────────────────────────────────────

// Allow the Next.js frontend to call this server (CORS)
// credentials: true is required so the browser sends the HttpOnly refresh cookie
app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:3000',
  methods:     ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,   // ← REQUIRED for cookies to be sent cross-origin
}));

// Parse incoming JSON request bodies → available as req.body
app.use(express.json());

// Parse cookies → available as req.cookies (needed for refresh token HttpOnly cookie)
app.use(cookieParser());

// ── 2. Routes ─────────────────────────────────────────────────────────────────

// Health check — visit /health to confirm server is running
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth',       authRoutes);
app.use('/api/employees',   employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/attendance',  attendanceRoutes);

// ── 3. 404 Handler (must be after all routes) ─────────────────────────────────
app.use(notFound);

// ── 4. Global Error Handler (must be last) ────────────────────────────────────
app.use(errorHandler);

export default app;
