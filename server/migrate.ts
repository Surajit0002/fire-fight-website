
import { db } from './db';
import { sql } from 'drizzle-orm';

export async function runMigrations() {
  console.log('Running database migrations...');
  
  try {
    // Add missing columns to users table
    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS phone varchar,
      ADD COLUMN IF NOT EXISTS country varchar,
      ADD COLUMN IF NOT EXISTS wallet_balance decimal(10,2) DEFAULT '0.00',
      ADD COLUMN IF NOT EXISTS kyc_status varchar DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS kyc_documents jsonb,
      ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS stripe_customer_id varchar,
      ADD COLUMN IF NOT EXISTS stripe_subscription_id varchar
    `);

    // Create teams table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS teams (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar NOT NULL,
        tag varchar,
        logo_url varchar,
        game_type varchar DEFAULT 'BGMI',
        team_code varchar UNIQUE,
        captain_id varchar NOT NULL REFERENCES users(id),
        max_players integer DEFAULT 4,
        created_at timestamp DEFAULT now(),
        updated_at timestamp DEFAULT now()
      )
    `);

    // Create team_members table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS team_members (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        team_id varchar NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        user_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role varchar DEFAULT 'player',
        joined_at timestamp DEFAULT now()
      )
    `);

    // Create tournament status enum if it doesn't exist
    await db.execute(sql`
      CREATE TYPE IF NOT EXISTS tournament_status AS ENUM ('upcoming', 'live', 'completed', 'cancelled')
    `);

    // Create tournaments table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS tournaments (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        title varchar NOT NULL,
        description text,
        game varchar NOT NULL,
        game_mode varchar,
        map_name varchar,
        entry_fee decimal(10,2) NOT NULL,
        prize_pool decimal(10,2) NOT NULL,
        max_participants integer NOT NULL,
        current_participants integer DEFAULT 0,
        start_time timestamp NOT NULL,
        end_time timestamp,
        registration_deadline timestamp,
        status tournament_status DEFAULT 'upcoming',
        rules text,
        stream_url varchar,
        room_code varchar,
        room_password varchar,
        is_room_code_revealed boolean DEFAULT false,
        host_id varchar NOT NULL REFERENCES users(id),
        image_url varchar,
        prize_distribution jsonb,
        created_at timestamp DEFAULT now(),
        updated_at timestamp DEFAULT now()
      )
    `);

    // Create tournament_participants table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS tournament_participants (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        tournament_id varchar NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
        user_id varchar REFERENCES users(id) ON DELETE CASCADE,
        team_id varchar REFERENCES teams(id) ON DELETE CASCADE,
        registration_time timestamp DEFAULT now(),
        payment_status varchar DEFAULT 'pending',
        payment_intent_id varchar
      )
    `);

    // Create matches table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS matches (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        tournament_id varchar NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
        match_number integer DEFAULT 1,
        start_time timestamp,
        end_time timestamp,
        status varchar DEFAULT 'scheduled',
        results jsonb,
        winner_id varchar REFERENCES users(id),
        winner_team_id varchar REFERENCES teams(id),
        created_at timestamp DEFAULT now()
      )
    `);

    // Create match_reports table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS match_reports (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        match_id varchar NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
        reporter_id varchar NOT NULL REFERENCES users(id),
        screenshot_url varchar,
        kills integer,
        placement integer,
        points integer,
        verification_status varchar DEFAULT 'pending',
        admin_notes text,
        submitted_at timestamp DEFAULT now()
      )
    `);

    // Create wallet_transactions table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS wallet_transactions (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type varchar NOT NULL,
        amount decimal(10,2) NOT NULL,
        status varchar DEFAULT 'pending',
        description text,
        tournament_id varchar REFERENCES tournaments(id),
        stripe_payment_intent_id varchar,
        admin_id varchar REFERENCES users(id),
        admin_reason text,
        created_at timestamp DEFAULT now()
      )
    `);

    // Create notifications table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title varchar NOT NULL,
        message text NOT NULL,
        type varchar NOT NULL,
        is_read boolean DEFAULT false,
        data jsonb,
        created_at timestamp DEFAULT now()
      )
    `);

    // Create support_tickets table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        subject varchar NOT NULL,
        description text NOT NULL,
        category varchar NOT NULL,
        status varchar DEFAULT 'open',
        priority varchar DEFAULT 'medium',
        assigned_to_id varchar REFERENCES users(id),
        attachments jsonb,
        created_at timestamp DEFAULT now(),
        updated_at timestamp DEFAULT now()
      )
    `);

    // Create ticket_messages table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ticket_messages (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        ticket_id varchar NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
        sender_id varchar NOT NULL REFERENCES users(id),
        message text NOT NULL,
        attachments jsonb,
        created_at timestamp DEFAULT now()
      )
    `);

    console.log('Database migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}
