// ─────────────────────────────────────────────────────────────────────────────
// src/models/Employee.ts  —  EMPLOYEE MODEL
//
// Defines the "employees" table in PostgreSQL.
// Also sets up the relationship: Employee belongs to a Department.
// ─────────────────────────────────────────────────────────────────────────────

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Department from './Department';

interface EmployeeAttributes {
  id:           string;
  firstName:    string;
  lastName:     string;
  email:        string;
  phone:        string | null;
  role:         string;
  departmentId: string | null;
  status:       'active' | 'inactive' | 'on_break' | 'on_leave' | 'absent';
  joinDate:     string;
  passwordHash: string | null;
  createdAt?:   Date;
  updatedAt?:   Date;
}

type EmployeeCreationAttributes = Optional<EmployeeAttributes, 'id'>;

class Employee extends Model<EmployeeAttributes, EmployeeCreationAttributes>
  implements EmployeeAttributes {
  declare id:           string;
  declare firstName:    string;
  declare lastName:     string;
  declare email:        string;
  declare phone:        string | null;
  declare role:         string;
  declare departmentId: string | null;
  declare status:       'active' | 'inactive' | 'on_break' | 'on_leave' | 'absent';
  declare joinDate:     string;
  declare passwordHash: string | null;
  declare createdAt:    Date;
  declare updatedAt:    Date;
}

Employee.init(
  {
    id: {
      type:         DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey:   true,
    },
    firstName: {
      type:      DataTypes.STRING(100),
      allowNull: false,
    },
    lastName: {
      type:      DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type:      DataTypes.STRING(255),
      allowNull: false,
      unique:    true,   // no two employees can share an email
      validate: {
        isEmail: true,   // Sequelize validates email format automatically
      },
    },
    phone: {
      type:      DataTypes.STRING(30),
      allowNull: true,
    },
    role: {
      type:      DataTypes.STRING(100),
      allowNull: false,
    },
    departmentId: {
      type:       DataTypes.UUID,
      allowNull:  true,
      references: {
        model: 'departments',  // foreign key → departments.id
        key:   'id',
      },
    },
    status: {
      // ENUM means only these exact values are allowed in the database
      type:         DataTypes.ENUM('active', 'inactive', 'on_break', 'on_leave', 'absent'),
      defaultValue: 'active',
    },
    joinDate: {
      type:      DataTypes.DATEONLY,  // stores only the date, no time (e.g. "2021-03-15")
      allowNull: false,
    },
    passwordHash: {
      type:      DataTypes.STRING,
      allowNull: true,   // null until super admin sets a password for the employee
    },
  },
  {
    sequelize,
    tableName:  'employees',
    timestamps: true,
  }
);

// ── Associations (relationships between tables) ───────────────────────────────
// An Employee belongs to one Department
Employee.belongsTo(Department, {
  foreignKey: 'departmentId',
  as:         'department',   // when you query an employee, include 'department'
});

// A Department has many Employees
Department.hasMany(Employee, {
  foreignKey: 'departmentId',
  as:         'employees',
});

export default Employee;
