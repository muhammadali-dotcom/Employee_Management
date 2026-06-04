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

import express      from 'express';
import cors         from 'cors';
import cookieParser from 'cookie-parser';
import dotenv       from 'dotenv';

// Load .env FIRST — before any other module reads process.env
dotenv.config();

import sequelize    from './config/database';

// Routes
import employeeRoutes   from './routes/employees';
import departmentRoutes from './routes/departments';
import attendanceRoutes from './routes/attendance';
import authRoutes       from './routes/auth';

// Middleware
import { notFound }     from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';

// Import models so Sequelize registers them before sync
import './models/Department';
import './models/Employee';
import './models/Attendance';

// Remove the old dotenv.config() call — it's now at the top before imports

const app  = express();
const PORT = process.env.PORT || 4000;

// ── 1. Global Middleware ──────────────────────────────────────────────────────

// Allow the Next.js frontend to call this server (CORS)
// credentials: true is required so the browser sends the HttpOnly refresh cookie
app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:3000',
  methods:     ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,   // ← REQUIRED for cookies to be sent cross-origin
}));

// Parse incoming JSON request bodies → available as req.body
app.use(express.json());

// Parse cookies → available as req.cookies (needed for refresh token HttpOnly cookie)
app.use(cookieParser());

// ── 2. Routes ─────────────────────────────────────────────────────────────────

// Health check — visit http://localhost:4000/health to confirm server is running
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth',       authRoutes);
app.use('/api/employees',   employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/attendance',  attendanceRoutes);

// ── 3. 404 Handler (must be after all routes) ─────────────────────────────────
app.use(notFound);

// ── 4. Global Error Handler (must be last) ────────────────────────────────────
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────────────────────
async function start() {
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
