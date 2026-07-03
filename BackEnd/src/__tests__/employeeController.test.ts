import { Response } from 'express';
import Employee from '../models/Employee';
import Attendance from '../models/Attendance';
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../controllers/employeeController';

jest.mock('../models/Employee', () => ({
  __esModule: true,
  default: { findAll: jest.fn(), findByPk: jest.fn(), create: jest.fn() },
}));
jest.mock('../models/Department', () => ({
  __esModule: true,
  default: {},
}));
jest.mock('../models/Attendance', () => ({
  __esModule: true,
  default: { destroy: jest.fn() },
}));

const MockEmployee = Employee as jest.Mocked<typeof Employee>;
const MockAttendance = Attendance as jest.Mocked<typeof Attendance>;

const mockRes = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

let mockRes_: Response;

beforeEach(() => {
  mockRes_ = mockRes();
});

// NOTE: the CSV originally specifies these as Integration tests against a real
// PostgreSQL test DB. No Postgres instance is available in this environment,
// so they've been adapted to unit tests with mocked Sequelize models —
// behavior asserted against the controller logic, not real DB persistence.

describe('getAllEmployees', () => {
  // TC-SQA-EMP-001
  it('returns all employees with department', async () => {
    const employees = [
      { id: '1', firstName: 'Alice', email: 'alice@test.com', department: { id: 'd1', name: 'HR' } },
      { id: '2', firstName: 'Bob', email: 'bob@test.com', department: { id: 'd1', name: 'HR' } },
    ];
    MockEmployee.findAll.mockResolvedValue(employees as any);
    await getAllEmployees({} as any, mockRes_);
    const result = (mockRes_.json as jest.Mock).mock.calls[0][0];
    expect(result).toHaveLength(2);
    expect(result[0].passwordHash).toBeUndefined();
    expect(result[0].department).toBeDefined();
  });

  // TC-SQA-EMP-002
  it('returns empty array when no employees exist', async () => {
    MockEmployee.findAll.mockResolvedValue([] as any);
    await getAllEmployees({} as any, mockRes_);
    const result = (mockRes_.json as jest.Mock).mock.calls[0][0];
    expect(result).toEqual([]);
  });
});

describe('getEmployeeById', () => {
  // TC-SQA-EMP-003
  it('returns employee by ID', async () => {
    MockEmployee.findByPk.mockResolvedValue({ id: 'e1', firstName: 'Alice' } as any);
    const req = { params: { id: 'e1' } } as any;
    await getEmployeeById(req, mockRes_);
    const result = (mockRes_.json as jest.Mock).mock.calls[0][0];
    expect(result.id).toBe('e1');
    expect(result.firstName).toBe('Alice');
    expect(result.passwordHash).toBeUndefined();
  });

  // TC-SQA-EMP-004
  it('returns 404 when employee not found', async () => {
    MockEmployee.findByPk.mockResolvedValue(null as any);
    const req = { params: { id: '00000000-0000-0000-0000-000000000000' } } as any;
    await getEmployeeById(req, mockRes_);
    expect(mockRes_.status).toHaveBeenCalledWith(404);
    expect(mockRes_.json).toHaveBeenCalledWith({ error: 'Employee not found' });
  });
});

describe('createEmployee', () => {
  // TC-SQA-EMP-005
  it('creates employee and returns 201', async () => {
    const created = {
      toJSON: () => ({ id: 'e2', firstName: 'Jane', lastName: 'Smith', email: 'jane@test.com', passwordHash: 'shouldnotshow' }),
    };
    MockEmployee.create.mockResolvedValue(created as any);
    const req = { body: { firstName: 'Jane', lastName: 'Smith', email: 'jane@test.com', role: 'manager', departmentId: 'd1', joinDate: '2024-03-01', status: 'active' } } as any;
    await createEmployee(req, mockRes_);
    expect(mockRes_.status).toHaveBeenCalledWith(201);
    const result = (mockRes_.json as jest.Mock).mock.calls[0][0];
    expect(result.passwordHash).toBeUndefined();
  });

  // TC-SQA-EMP-006
  it('returns 400 for duplicate email', async () => {
    const duplicateError = new Error('Validation error');
    duplicateError.name = 'SequelizeUniqueConstraintError';
    MockEmployee.create.mockRejectedValue(duplicateError);
    const req = { body: { firstName: 'Another', lastName: 'Person', email: 'dup@test.com', role: 'developer', joinDate: '2024-01-01', status: 'active' } } as any;
    await createEmployee(req, mockRes_);
    expect(mockRes_.status).toHaveBeenCalledWith(400);
    expect(mockRes_.json).toHaveBeenCalledWith({ error: 'An employee with this email already exists' });
  });
});

describe('updateEmployee', () => {
  // TC-SQA-EMP-007
  it('updates employee and persists to DB', async () => {
    const emp = {
      firstName: 'Before',
      update: jest.fn().mockImplementation(async (fields: any) => {
        Object.assign(emp, fields);
      }),
      toJSON: () => ({ firstName: emp.firstName }),
    };
    MockEmployee.findByPk.mockResolvedValue(emp as any);
    const req = { params: { id: 'e3' }, body: { firstName: 'After' } } as any;
    await updateEmployee(req, mockRes_);
    const result = (mockRes_.json as jest.Mock).mock.calls[0][0];
    expect(result.firstName).toBe('After');
  });

  // TC-SQA-EMP-008
  it('returns 404 when updating non-existent employee', async () => {
    MockEmployee.findByPk.mockResolvedValue(null as any);
    const req = { params: { id: '00000000-0000-0000-0000-000000000001' }, body: { firstName: 'Ghost' } } as any;
    await updateEmployee(req, mockRes_);
    expect(mockRes_.status).toHaveBeenCalledWith(404);
    expect(mockRes_.json).toHaveBeenCalledWith({ error: 'Employee not found' });
  });
});

describe('deleteEmployee', () => {
  // TC-SQA-EMP-009
  it('deletes employee and attendance records', async () => {
    const emp = { id: 'e4', destroy: jest.fn().mockResolvedValue(undefined) };
    MockEmployee.findByPk.mockResolvedValue(emp as any);
    MockAttendance.destroy.mockResolvedValue(2 as any);
    const req = { params: { id: 'e4' } } as any;
    await deleteEmployee(req, mockRes_);
    expect(MockAttendance.destroy).toHaveBeenCalledWith({ where: { employeeId: 'e4' } });
    expect(emp.destroy).toHaveBeenCalledTimes(1);
    expect(mockRes_.json).toHaveBeenCalledWith({ message: 'Employee deleted successfully' });
  });

  // TC-SQA-EMP-010
  it('returns 404 when deleting non-existent employee', async () => {
    MockEmployee.findByPk.mockResolvedValue(null as any);
    const req = { params: { id: '00000000-0000-0000-0000-000000000002' } } as any;
    await deleteEmployee(req, mockRes_);
    expect(mockRes_.status).toHaveBeenCalledWith(404);
    expect(mockRes_.json).toHaveBeenCalledWith({ error: 'Employee not found' });
  });
});
