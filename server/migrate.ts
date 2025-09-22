
import { db } from './db';
import { sql } from 'drizzle-orm';

export async function runMigrations() {
  console.log('Database schema already applied via Drizzle. Skipping manual migrations.');
  // Schema is managed by Drizzle and applied via `npm run db:push`
  // No manual migrations needed
}
