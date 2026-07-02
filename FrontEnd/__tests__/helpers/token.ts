export interface TestUserPayload {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'super_admin' | 'employee';
}

/** Builds a fake (unsigned) JWT whose payload can be decoded client-side. */
export const makeFakeToken = (payload: TestUserPayload): string => {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64');
  return `${header}.${body}.signature`;
};

export const superAdminUser: TestUserPayload = {
  id: 'admin-1',
  firstName: 'Ada',
  lastName: 'Admin',
  email: 'admin@company.com',
  role: 'super_admin',
};

export const employeeUser: TestUserPayload = {
  id: 'emp-1',
  firstName: 'Eve',
  lastName: 'Employee',
  email: 'emp@company.com',
  role: 'employee',
};
