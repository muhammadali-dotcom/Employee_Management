// ─────────────────────────────────────────────────────────────────────────────
// src/index.ts  —  MAIN ENTRY POINT
//
// This is the first file that runs when you start the server.
// Order matters here:
//   1. Middleware (cors, json parser)
//   2. Routes
//   3. 404 handler  (after routes — catches unmatched URLs)
//   4. Error handler (last — catches all thrown errors)
// ─────────────────────────────────────────────────────────────────────────────

import dotenv from 'dotenv';

// Load .env FIRST — before any other module reads process.env
dotenv.config();

import sequelize from './config/database';
import app        from './app';

const PORT = process.env.PORT || 4000;

// ── Start Server ──────────────────────────────────────────────────────────────
const start = async () => {
  // Start Express server immediately
  app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/health`);
    console.log(`   Employees:    http://localhost:${PORT}/api/employees`);
    console.log(`   Departments:  http://localhost:${PORT}/api/departments`);
    console.log(`   Attendance:   http://localhost:${PORT}/api/attendance`);
  });

  // Connect to database and sync models in the background
  try {
    // Test the database connection
    await sequelize.authenticate();
    console.log('✅ Connected to PostgreSQL');

    // Sync models → creates/updates tables to match your model definitions
    await sequelize.sync({ alter: true });
    console.log('✅ Database tables synced');
  } catch (error) {
    console.error('❌ Database connection/sync failed:');
    if (error instanceof Error) {
      console.error(`   Error message: ${error.message}`);
    } else {
      console.error(`   Unknown error:`, error);
    }
    console.error('   Please verify that PostgreSQL is running and credentials in BackEnd/.env are correct.');
  }
}

start();
