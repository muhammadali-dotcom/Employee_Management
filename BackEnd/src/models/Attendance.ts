// ─────────────────────────────────────────────────────────────────────────────
// src/models/Attendance.ts  —  ATTENDANCE MODEL
//
// Defines the "attendance" table in PostgreSQL.
// Each row = one employee's attendance on one specific date.
// ─────────────────────────────────────────────────────────────────────────────

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Employee from './Employee';

interface AttendanceAttributes {
  id:         string;
  employeeId: string;
  date:       string;
  status:     'present' | 'absent' | 'on_leave' | 'on_break' | 'late';
  checkIn:    string | null;
  checkOut:   string | null;
  note:       string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type AttendanceCreationAttributes = Optional<AttendanceAttributes, 'id'>;

class Attendance extends Model<AttendanceAttributes, AttendanceCreationAttributes>
  implements AttendanceAttributes {
  declare id:         string;
  declare employeeId: string;
  declare date:       string;
  declare status:     'present' | 'absent' | 'on_leave' | 'on_break' | 'late';
  declare checkIn:    string | null;
  declare checkOut:   string | null;
  declare note:       string | null;
  declare createdAt:  Date;
  declare updatedAt:  Date;
}

Attendance.init(
  {
    id: {
      type:         DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey:   true,
    },
    employeeId: {
      type:       DataTypes.UUID,
      allowNull:  false,
      references: {
        model: 'employees',  // foreign key → employees.id
        key:   'id',
      },
    },
    date: {
      type:      DataTypes.DATEONLY,  // e.g. "2026-05-20"
      allowNull: false,
    },
    status: {
      type:      DataTypes.ENUM('present', 'absent', 'on_leave', 'on_break', 'late'),
      allowNull: false,
    },
    checkIn: {
      type:      DataTypes.STRING(10),  // e.g. "09:00"
      allowNull: true,
    },
    checkOut: {
      type:      DataTypes.STRING(10),  // e.g. "17:00"
      allowNull: true,
    },
    note: {
      type:      DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'attendance',
    timestamps: true,
    // Unique constraint: one record per employee per date
    indexes: [
      {
        unique: true,
        fields: ['employeeId', 'date'],
      },
    ],
  }
);

// ── Associations ──────────────────────────────────────────────────────────────
Attendance.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });
Employee.hasMany(Attendance,   { foreignKey: 'employeeId', as: 'attendance' });

export default Attendance;
