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
  googleId:     string | null;
  authProvider: 'local' | 'google';
  lastLoginAt?: Date | null;
  createdAt?:   Date;
  updatedAt?:   Date;
}

type EmployeeCreationAttributes = Optional<EmployeeAttributes, 'id' | 'authProvider'>;

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
  declare googleId:     string | null;
  declare authProvider: 'local' | 'google';
  declare lastLoginAt:  Date | null;
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
      unique:    true,
      validate: { isEmail: true },
      // Normalize on write so lookups (login, Google login) never fail due
      // to case differences between how an admin typed it and how a login
      // provider reports it (Google always returns lowercase emails).
      set(value: string) {
        this.setDataValue('email', value.trim().toLowerCase());
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
      references: { model: 'departments', key: 'id' },
    },
    status: {
      type:         DataTypes.ENUM('active', 'inactive', 'on_break', 'on_leave', 'absent'),
      defaultValue: 'active',
    },
    joinDate: {
      type:      DataTypes.DATEONLY,
      allowNull: false,
    },
    passwordHash: {
      type:      DataTypes.STRING,
      allowNull: true,
    },
    googleId: {
      type:      DataTypes.STRING,
      allowNull: true,
      unique:    true,
    },
    authProvider: {
      type:         DataTypes.STRING(20),
      allowNull:    false,
      defaultValue: 'local',
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
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
