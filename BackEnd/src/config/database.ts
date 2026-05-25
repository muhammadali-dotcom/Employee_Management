// ─────────────────────────────────────────────────────────────────────────────
// src/config/database.ts  —  DATABASE CONNECTION
//
// Creates and exports the Sequelize instance.
// All models import this file to connect to the same database.
// ─────────────────────────────────────────────────────────────────────────────

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME     || 'employee_management',  // database name
  process.env.DB_USER     || 'ems_user',             // postgres username
  process.env.DB_PASSWORD || '',                     // postgres password
  {
    host:    process.env.DB_HOST || 'localhost',
    port:    Number(process.env.DB_PORT) || 5432,
    dialect: 'postgres',   // tells Sequelize we are using PostgreSQL
    logging: false,        // set to: console.log  to see every SQL query in terminal
    pool: {
      max:     5,    // maximum number of connections in pool
      min:     0,    // minimum number of connections in pool
      acquire: 30000, // max ms to wait for a connection before throwing error
      idle:    10000, // max ms a connection can be idle before being released
    },
  }
);

export default sequelize;
