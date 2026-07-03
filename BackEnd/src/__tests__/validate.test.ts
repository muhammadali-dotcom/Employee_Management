import { Request, Response, NextFunction } from 'express';
import { validateEmployee, validateDepartment, validateAttendance } from '../middleware/validate';

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

// ── validateEmployee ──────────────────────────────────────────────

describe('validateEmployee', () => {
  // TC-SQA-VAL-001
  it('calls next() when all fields are valid', () => {
    const req = { body: { firstName: 'John', lastName: 'Doe', email: 'john@test.com', role: 'developer', joinDate: '2024-01-15' } } as any as Request;
    validateEmployee(req, mockRes_, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockRes_.status).not.toHaveBeenCalled();
  });

  // TC-SQA-VAL-002
  it('returns 400 when firstName is missing', () => {
    const req = { body: { lastName: 'Doe', email: 'john@test.com', role: 'developer', joinDate: '2024-01-15' } } as any as Request;
    validateEmployee(req, mockRes_, mockNext);
    expect(mockRes_.status).toHaveBeenCalledWith(400);
    expect(mockRes_.json).toHaveBeenCalledWith(expect.objectContaining({ details: expect.arrayContaining(['firstName is required']) }));
    expect(mockNext).not.toHaveBeenCalled();
  });

  // TC-SQA-VAL-003
  it('returns 400 when lastName is missing', () => {
    const req = { body: { firstName: 'John', email: 'john@test.com', role: 'developer', joinDate: '2024-01-15' } } as any as Request;
    validateEmployee(req, mockRes_, mockNext);
    expect(mockRes_.status).toHaveBeenCalledWith(400);
    expect(mockRes_.json).toHaveBeenCalledWith(expect.objectContaining({ details: expect.arrayContaining(['lastName is required']) }));
  });

  // TC-SQA-VAL-004
  it('returns 400 when email is missing', () => {
    const req = { body: { firstName: 'John', lastName: 'Doe', role: 'developer', joinDate: '2024-01-15' } } as any as Request;
    validateEmployee(req, mockRes_, mockNext);
    expect(mockRes_.status).toHaveBeenCalledWith(400);
    expect(mockRes_.json).toHaveBeenCalledWith(expect.objectContaining({ details: expect.arrayContaining(['email is required']) }));
  });

  // TC-SQA-VAL-005
  it('returns 400 when email format is invalid', () => {
    const req = { body: { firstName: 'John', lastName: 'Doe', email: 'notanemail', role: 'developer', joinDate: '2024-01-15' } } as any as Request;
    validateEmployee(req, mockRes_, mockNext);
    expect(mockRes_.status).toHaveBeenCalledWith(400);
    expect(mockRes_.json).toHaveBeenCalledWith(expect.objectContaining({ details: expect.arrayContaining(['email must be a valid email address']) }));
  });

  // TC-SQA-VAL-006
  it('returns 400 when role is missing', () => {
    const req = { body: { firstName: 'John', lastName: 'Doe', email: 'john@test.com', joinDate: '2024-01-15' } } as any as Request;
    validateEmployee(req, mockRes_, mockNext);
    expect(mockRes_.status).toHaveBeenCalledWith(400);
    expect(mockRes_.json).toHaveBeenCalledWith(expect.objectContaining({ details: expect.arrayContaining(['role is required']) }));
  });

  // TC-SQA-VAL-007
  it('returns 400 when joinDate is missing', () => {
    const req = { body: { firstName: 'John', lastName: 'Doe', email: 'john@test.com', role: 'developer' } } as any as Request;
    validateEmployee(req, mockRes_, mockNext);
    expect(mockRes_.status).toHaveBeenCalledWith(400);
    expect(mockRes_.json).toHaveBeenCalledWith(expect.objectContaining({ details: expect.arrayContaining(['joinDate is required']) }));
  });

  // TC-SQA-VAL-008
  it('returns 400 when firstName contains only numbers', () => {
    const req = { body: { firstName: '2223', lastName: 'Doe', email: 'john@test.com', role: 'developer', joinDate: '2024-01-15' } } as any as Request;
    validateEmployee(req, mockRes_, mockNext);
    expect(mockRes_.status).toHaveBeenCalledWith(400);
    expect(mockRes_.json).toHaveBeenCalledWith(expect.objectContaining({ details: expect.arrayContaining(['firstName must contain only letters']) }));
  });

  // TC-SQA-VAL-009
  it('returns 400 when lastName contains only numbers', () => {
    const req = { body: { firstName: 'John', lastName: '9999', email: 'john@test.com', role: 'developer', joinDate: '2024-01-15' } } as any as Request;
    validateEmployee(req, mockRes_, mockNext);
    expect(mockRes_.status).toHaveBeenCalledWith(400);
    expect(mockRes_.json).toHaveBeenCalledWith(expect.objectContaining({ details: expect.arrayContaining(['lastName must contain only letters']) }));
  });

  // TC-SQA-VAL-010
  it('returns 400 when joinDate is in wrong format', () => {
    const req = { body: { firstName: 'John', lastName: 'Doe', email: 'john@test.com', role: 'developer', joinDate: '15-01-2024' } } as any as Request;
    validateEmployee(req, mockRes_, mockNext);
    expect(mockRes_.status).toHaveBeenCalledWith(400);
    expect(mockRes_.json).toHaveBeenCalledWith(expect.objectContaining({ details: expect.arrayContaining(['joinDate must be in YYYY-MM-DD format']) }));
  });

  // TC-AE-063 (mirrors manual test case — mixed letters and numbers)
  it('returns 400 when firstName has mixed letters and numbers', () => {
    const req = { body: { firstName: 'Ali123', lastName: 'Doe', email: 'john@test.com', role: 'developer', joinDate: '2024-01-15' } } as any as Request;
    validateEmployee(req, mockRes_, mockNext);
    expect(mockRes_.status).toHaveBeenCalledWith(400);
    expect(mockRes_.json).toHaveBeenCalledWith(expect.objectContaining({ details: expect.arrayContaining(['firstName must contain only letters']) }));
  });

  // TC-AE-070 (mirrors manual test case — plain text join date)
  it('returns 400 when joinDate is a plain text string', () => {
    const req = { body: { firstName: 'John', lastName: 'Doe', email: 'john@test.com', role: 'developer', joinDate: 'January 15' } } as any as Request;
    validateEmployee(req, mockRes_, mockNext);
    expect(mockRes_.status).toHaveBeenCalledWith(400);
    expect(mockRes_.json).toHaveBeenCalledWith(expect.objectContaining({ details: expect.arrayContaining(['joinDate must be in YYYY-MM-DD format']) }));
  });

  // TC-AE-058 (mirrors manual test case — alphabetic phone)
  it('returns 400 when phone contains alphabetic characters', () => {
    const req = { body: { firstName: 'John', lastName: 'Doe', email: 'john@test.com', phone: 'abc-phone', role: 'developer', joinDate: '2024-01-15' } } as any as Request;
    validateEmployee(req, mockRes_, mockNext);
    expect(mockRes_.status).toHaveBeenCalledWith(400);
    expect(mockRes_.json).toHaveBeenCalledWith(expect.objectContaining({ details: expect.arrayContaining(['phone must contain only digits']) }));
  });

  // TC-AE-059 (mirrors manual test case — phone too short)
  it('returns 400 when phone is too short', () => {
    const req = { body: { firstName: 'John', lastName: 'Doe', email: 'john@test.com', phone: '123', role: 'developer', joinDate: '2024-01-15' } } as any as Request;
    validateEmployee(req, mockRes_, mockNext);
    expect(mockRes_.status).toHaveBeenCalledWith(400);
    expect(mockRes_.json).toHaveBeenCalledWith(expect.objectContaining({ details: expect.arrayContaining(['phone is too short']) }));
  });

  // TC-AE-060 (mirrors manual test case — phone too long)
  it('returns 400 when phone is too long', () => {
    const req = { body: { firstName: 'John', lastName: 'Doe', email: 'john@test.com', phone: '12345678901234567890', role: 'developer', joinDate: '2024-01-15' } } as any as Request;
    validateEmployee(req, mockRes_, mockNext);
    expect(mockRes_.status).toHaveBeenCalledWith(400);
    expect(mockRes_.json).toHaveBeenCalledWith(expect.objectContaining({ details: expect.arrayContaining(['phone is too long']) }));
  });

  // Valid phone should not block a valid submission
  it('calls next() when phone is a valid length and format', () => {
    const req = { body: { firstName: 'John', lastName: 'Doe', email: 'john@test.com', phone: '555-0101', role: 'developer', joinDate: '2024-01-15' } } as any as Request;
    validateEmployee(req, mockRes_, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockRes_.status).not.toHaveBeenCalled();
  });

  // TC-SQA-VAL-011
  it('returns 400 when firstName is whitespace only', () => {
    const req = { body: { firstName: '   ', lastName: 'Doe', email: 'john@test.com', role: 'developer', joinDate: '2024-01-15' } } as any as Request;
    validateEmployee(req, mockRes_, mockNext);
    expect(mockRes_.status).toHaveBeenCalledWith(400);
    expect(mockRes_.json).toHaveBeenCalledWith(expect.objectContaining({ details: expect.arrayContaining(['firstName is required']) }));
  });

  // TC-SQA-VAL-012
  it('returns 400 with all errors when body is empty', () => {
    const req = { body: {} } as any as Request;
    validateEmployee(req, mockRes_, mockNext);
    expect(mockRes_.status).toHaveBeenCalledWith(400);
    expect(mockRes_.json).toHaveBeenCalledWith(expect.objectContaining({ details: expect.arrayContaining(['firstName is required', 'lastName is required', 'email is required']) }));
  });
});

// ── validateDepartment ────────────────────────────────────────────

describe('validateDepartment', () => {
  // TC-SQA-VAL-013
  it('calls next() when department name is valid', () => {
    const req = { body: { name: 'Engineering' } } as any as Request;
    validateDepartment(req, mockRes_, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  // TC-SQA-VAL-014
  it('returns 400 when department name is missing', () => {
    const req = { body: {} } as any as Request;
    validateDepartment(req, mockRes_, mockNext);
    expect(mockRes_.status).toHaveBeenCalledWith(400);
    expect(mockRes_.json).toHaveBeenCalledWith(expect.objectContaining({ details: expect.arrayContaining(['name is required']) }));
    expect(mockNext).not.toHaveBeenCalled();
  });

  // TC-SQA-VAL-015
  it('returns 400 when department name is whitespace only', () => {
    const req = { body: { name: '   ' } } as any as Request;
    validateDepartment(req, mockRes_, mockNext);
    expect(mockRes_.status).toHaveBeenCalledWith(400);
  });
});

// ── validateAttendance ────────────────────────────────────────────

describe('validateAttendance', () => {
  // TC-SQA-VAL-016
  it('calls next() when attendance fields are valid', () => {
    const req = { body: { employeeId: 'uuid', date: '2024-01-15', status: 'present' } } as any as Request;
    validateAttendance(req, mockRes_, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  // TC-SQA-VAL-017
  it('returns 400 when employeeId is missing', () => {
    const req = { body: { date: '2024-01-15', status: 'present' } } as any as Request;
    validateAttendance(req, mockRes_, mockNext);
    expect(mockRes_.status).toHaveBeenCalledWith(400);
    expect(mockRes_.json).toHaveBeenCalledWith(expect.objectContaining({ details: expect.arrayContaining(['employeeId is required']) }));
  });

  // TC-SQA-VAL-018
  it('returns 400 when date is missing', () => {
    const req = { body: { employeeId: 'uuid', status: 'present' } } as any as Request;
    validateAttendance(req, mockRes_, mockNext);
    expect(mockRes_.status).toHaveBeenCalledWith(400);
    expect(mockRes_.json).toHaveBeenCalledWith(expect.objectContaining({ details: expect.arrayContaining(['date is required']) }));
  });

  // TC-SQA-VAL-019
  it('returns 400 when status is invalid', () => {
    const req = { body: { employeeId: 'uuid', date: '2024-01-15', status: 'sleeping' } } as any as Request;
    validateAttendance(req, mockRes_, mockNext);
    expect(mockRes_.status).toHaveBeenCalledWith(400);
    expect(mockRes_.json).toHaveBeenCalledWith(expect.objectContaining({ details: expect.arrayContaining(['status must be one of: present, absent, on_leave, on_break, late']) }));
  });

  // TC-SQA-VAL-020
  it('returns 400 with all errors when attendance body is empty', () => {
    const req = { body: {} } as any as Request;
    validateAttendance(req, mockRes_, mockNext);
    expect(mockRes_.json).toHaveBeenCalledWith(expect.objectContaining({ details: expect.arrayContaining(['employeeId is required', 'date is required', 'status is required']) }));
  });
});
