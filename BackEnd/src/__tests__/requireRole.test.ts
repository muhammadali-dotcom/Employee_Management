import { Response, NextFunction } from 'express';
import { requireRole } from '../middleware/requireRole';

const mockRes = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

let mockRes_: Response;
let mockNext: NextFunction;

beforeEach(() => {
  mockRes_ = mockRes();
  mockNext = jest.fn();
});

describe('requireRole', () => {
  // TC-SQA-ROLE-001
  it('calls next() when user has the required role', () => {
    const req = { user: { id: '1', role: 'super_admin' } } as any;
    const mw = requireRole('super_admin');
    mw(req, mockRes_, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockRes_.status).not.toHaveBeenCalled();
  });

  // TC-SQA-ROLE-002
  it('returns 401 when req.user is undefined', () => {
    const req = { user: undefined } as any;
    const mw = requireRole('super_admin');
    mw(req, mockRes_, mockNext);
    expect(mockRes_.status).toHaveBeenCalledWith(401);
    expect(mockRes_.json).toHaveBeenCalledWith({ error: 'Authentication required' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  // TC-SQA-ROLE-003
  it('returns 403 when user role does not match', () => {
    const req = { user: { id: '2', role: 'employee' } } as any;
    const mw = requireRole('super_admin');
    mw(req, mockRes_, mockNext);
    expect(mockRes_.status).toHaveBeenCalledWith(403);
    expect(mockRes_.json).toHaveBeenCalledWith({ error: 'Forbidden: insufficient permissions' });
  });
});
