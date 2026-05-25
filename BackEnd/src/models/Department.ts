// ─────────────────────────────────────────────────────────────────────────────
// src/models/Department.ts  —  DEPARTMENT MODEL
//
// Defines the "departments" table in PostgreSQL.
// Each property here becomes a column in the table.
// ─────────────────────────────────────────────────────────────────────────────

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// All fields the Department has
interface DepartmentAttributes {
  id:          string;
  name:        string;
  description: string | null;
  createdAt?:  Date;
  updatedAt?:  Date;
}

type DepartmentCreationAttributes = Optional<DepartmentAttributes, 'id'>;

class Department extends Model<DepartmentAttributes, DepartmentCreationAttributes>
  implements DepartmentAttributes {
  declare id:          string;
  declare name:        string;
  declare description: string | null;
  declare createdAt:   Date;
  declare updatedAt:   Date;
}

Department.init(
  {
    id: {
      type:         DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,  // auto-generate a UUID like "a3f2c1d4-..."
      primaryKey:   true,
    },
    name: {
      type:      DataTypes.STRING(100),
      allowNull: false,   // required — cannot be empty
      unique:    true,    // no two departments can have the same name
    },
    description: {
      type:      DataTypes.TEXT,
      allowNull: true,    // optional
    },
  },
  {
    sequelize,              // which database connection to use
    tableName:  'departments',
    timestamps: true,       // auto-adds createdAt and updatedAt columns
  }
);

export default Department;
