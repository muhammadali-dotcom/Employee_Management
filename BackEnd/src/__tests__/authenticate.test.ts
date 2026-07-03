import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate } from '../middleware/authenticate';

jest.mock('jsonwebtoken');
const mockJwt = jwt as jest.Mocked<typeof jwt>;

const mockRes = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

let mockReq: Request;
let mockRes_: Response;
let mockNext: NextFunction;
const originalSecret = process.env.JWT_ACCESS_SECRET;

beforeEach(() => {
  mockReq = { headers: {} } as any as Request;
  mockRes_ = mockRes();
  mockNext = jest.fn();
  process.env.JWT_ACCESS_SECRET = 'test-secret';
});

afterEach(() => {
  process.env.JWT_ACCESS_SECRET = originalSecret;
});

describe('authenticate', () => {
  // TC-SQA-AUTH-001
  it('calls next() and sets req.user when token is valid', () => {
    mockJwt.verify.mockReturnValue({ id: '1', role: 'employee' } as any);
    mockReq.headers['authorization'] = 'Bearer validtoken';
    authenticate(mockReq, mockRes_, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockReq.user).toEqual({ id: '1', role: 'employee' });
  });

  // TC-SQA-AUTH-002
  it('returns 401 when Authorization header is missing', () => {
    mockReq.headers = {};
    authenticate(mockReq, mockRes_, mockNext);
    expect(mockRes_.status).toHaveBeenCalledWith(401);
    expect(mockRes_.json).toHaveBeenCalledWith({ error: 'Authentication required' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  // TC-SQA-AUTH-003
  it('returns 401 when header format is wrong', () => {
    mockReq.headers['authorization'] = 'Token abc123';
    authenticate(mockReq, mockRes_, mockNext);
    expect(mockRes_.status).toHaveBeenCalledWith(401);
    expect(mockRes_.json).toHaveBeenCalledWith({ error: 'Authentication required' });
  });

  // TC-SQA-AUTH-004
  it('returns 401 with Token expired for expired tokens', () => {
    mockJwt.verify.mockImplementation(() => {
      throw new jwt.TokenExpiredError('jwt expired', new Date());
    });
    mockReq.headers['authorization'] = 'Bearer expiredtoken';
    authenticate(mockReq, mockRes_, mockNext);
    expect(mockRes_.status).toHaveBeenCalledWith(401);
    expect(mockRes_.json).toHaveBeenCalledWith({ error: 'Token expired' });
  });

  // TC-SQA-AUTH-005
  it('returns 401 with Invalid token for tampered tokens', () => {
    mockJwt.verify.mockImplementation(() => {
      throw new Error('invalid signature');
    });
    mockReq.headers['authorization'] = 'Bearer tamperedtoken';
    authenticate(mockReq, mockRes_, mockNext);
    expect(mockRes_.status).toHaveBeenCalledWith(401);
    expect(mockRes_.json).toHaveBeenCalledWith({ error: 'Invalid token' });
  });

  // TC-SQA-AUTH-006
  it('returns 401 when JWT_ACCESS_SECRET is not set', () => {
    delete process.env.JWT_ACCESS_SECRET;
    mockReq.headers['authorization'] = 'Bearer sometoken';
    authenticate(mockReq, mockRes_, mockNext);
    expect(mockRes_.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });
});
