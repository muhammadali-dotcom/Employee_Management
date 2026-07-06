// Vercel serverless entry point — wraps the Express app for the Node runtime.
// Vercel calls this file's default export as the (req, res) handler for every
// request; Express apps are already callable with that signature.

import type { IncomingMessage, ServerResponse } from 'http';
import dotenv from 'dotenv';
dotenv.config();

import sequelize from '../src/config/database';
import app        from '../src/app';

// Reuse the DB connection across warm invocations instead of reconnecting
// on every request.
let dbReady: Promise<void> | null = null;

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (!dbReady) {
    dbReady = sequelize.authenticate().catch((err) => {
      dbReady = null; // allow retry on next request
      throw err;
    });
  }
  await dbReady;
  return (app as unknown as (req: IncomingMessage, res: ServerResponse) => void)(req, res);
}
