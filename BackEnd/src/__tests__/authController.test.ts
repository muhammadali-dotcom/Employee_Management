import { Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Employee from '../models/Employee';
import { login } from '../controllers/authController';

jest.mock('../models/Employee');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

const MockEmployee = Employee as jest.Mocked<typeof Employee>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;

const mockRes = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  return res as Response;
};

let mockRes_: Response;
const originalEnv = { ...process.env };

beforeEach(() => {
  mockRes_ = mockRes();
  process.env.JWT_ACCESS_SECRET = 'access-secret';
  process.env.JWT_REFRESH_SECRET = 'refresh-secret';
});

afterEach(() => {
  process.env = { ...originalEnv };
});

const fakeEmployee = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@test.com',
  role: 'employee',
  passwordHash: '$2b$12$hash',
  update: jest.fn().mockResolvedValue(undefined),
};

describe('login', () => {
  // TC-SQA-LOGIN-001
  it('returns accessToken and user on valid login', async () => {
    MockEmployee.findOne.mockResolvedValue(fakeEmployee as any);
    mockBcrypt.compare.mockResolvedValue(true as never);
    mockJwt.sign.mockReturnValue('fake.token' as any);
    const req = { body: { email: 'john@test.com', password: 'CorrectPass' } } as any;
    await login(req, mockRes_);
    expect(mockRes_.json).toHaveBeenCalledWith(expect.objectContaining({ accessToken: expect.any(String), user: expect.objectContaining({ email: 'john@test.com' }) }));
  });

  // TC-SQA-LOGIN-002
  it('returns 400 when email is missing', async () => {
    const req = { body: { password: 'Test@1234' } } as any;
    await login(req, mockRes_);
    expect(mockRes_.status).toHaveBeenCalledWith(400);
    expect(mockRes_.json).toHaveBeenCalledWith({ error: 'Email and password are required' });
    expect(MockEmployee.findOne).not.toHaveBeenCalled();
  });

  // TC-SQA-LOGIN-003
  it('returns 400 when password is missing', async () => {
    const req = { body: { email: 'john@test.com' } } as any;
    await login(req, mockRes_);
    expect(mockRes_.status).toHaveBeenCalledWith(400);
    expect(mockRes_.json).toHaveBeenCalledWith({ error: 'Email and password are required' });
    expect(MockEmployee.findOne).not.toHaveBeenCalled();
  });

  // TC-SQA-LOGIN-004
  it('returns 400 when both fields are missing', async () => {
    const req = { body: {} } as any;
    await login(req, mockRes_);
    expect(mockRes_.status).toHaveBeenCalledWith(400);
  });

  // TC-SQA-LOGIN-005
  it('returns 401 when email not found', async () => {
    MockEmployee.findOne.mockResolvedValue(null);
    const req = { body: { email: 'ghost@test.com', password: 'any' } } as any;
    await login(req, mockRes_);
    expect(mockRes_.status).toHaveBeenCalledWith(401);
    expect(mockRes_.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    expect(mockBcrypt.compare).not.toHaveBeenCalled();
  });

  // TC-SQA-LOGIN-006
  it('returns 401 when account is not activated', async () => {
    MockEmployee.findOne.mockResolvedValue({ id: '1', email: 'new@test.com', passwordHash: null, role: 'employee' } as any);
    const req = { body: { email: 'new@test.com', password: 'any' } } as any;
    await login(req, mockRes_);
    expect(mockRes_.status).toHaveBeenCalledWith(401);
    expect(mockRes_.json).toHaveBeenCalledWith({ error: 'Account not yet activated' });
    expect(mockBcrypt.compare).not.toHaveBeenCalled();
  });

  // TC-SQA-LOGIN-007
  it('returns 401 when password is wrong', async () => {
    MockEmployee.findOne.mockResolvedValue({ id: '1', email: 'john@test.com', passwordHash: '$2b$12$hash', role: 'employee' } as any);
    mockBcrypt.compare.mockResolvedValue(false as never);
    const req = { body: { email: 'john@test.com', password: 'WrongPass' } } as any;
    await login(req, mockRes_);
    expect(mockRes_.status).toHaveBeenCalledWith(401);
    expect(mockRes_.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
  });

  // TC-SQA-LOGIN-008
  it('returns 400 when email is empty string', async () => {
    const req = { body: { email: '', password: 'Test@1234' } } as any;
    await login(req, mockRes_);
    expect(mockRes_.status).toHaveBeenCalledWith(400);
    expect(MockEmployee.findOne).not.toHaveBeenCalled();
  });

  // TC-SQA-LOGIN-009
  it('returns 400 when password is empty string', async () => {
    const req = { body: { email: 'john@test.com', password: '' } } as any;
    await login(req, mockRes_);
    expect(mockRes_.status).toHaveBeenCalledWith(400);
  });

  // TC-SQA-LOGIN-010
  it('returns 500 when DB throws', async () => {
    MockEmployee.findOne.mockRejectedValue(new Error('DB connection lost'));
    const req = { body: { email: 'john@test.com', password: 'Test' } } as any;
    await login(req, mockRes_);
    expect(mockRes_.status).toHaveBeenCalledWith(500);
    expect(mockRes_.json).toHaveBeenCalledWith({ error: 'Login failed' });
  });
});
