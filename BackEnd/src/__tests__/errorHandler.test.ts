import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../middleware/errorHandler';

const mockRes = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

let mockReq: Request;
let mockRes_: Response;
let mockNext: NextFunction;
const originalEnv = process.env.NODE_ENV;

beforeEach(() => {
  mockReq = {} as Request;
  mockRes_ = mockRes();
  mockNext = jest.fn();
});

afterEach(() => {
  process.env.NODE_ENV = originalEnv;
});

describe('errorHandler', () => {
  // TC-SQA-ERR-001
  it('shows message and stack in development mode', () => {
    process.env.NODE_ENV = 'development';
    const err = new Error('Something exploded');
    errorHandler(err, mockReq, mockRes_, mockNext);
    expect(mockRes_.status).toHaveBeenCalledWith(500);
    expect(mockRes_.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Something exploded', stack: expect.any(String) }));
  });

  // TC-SQA-ERR-002
  it('hides error details in production mode', () => {
    process.env.NODE_ENV = 'production';
    const err = new Error('DB password is abc123');
    errorHandler(err, mockReq, mockRes_, mockNext);
    expect(mockRes_.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Something went wrong' }));
    const result = (mockRes_.json as jest.Mock).mock.calls[0][0];
    expect(result.stack).toBeUndefined();
  });
});
