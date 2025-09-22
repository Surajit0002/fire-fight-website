import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  username: varchar("username").unique(),
  gameId: varchar("game_id"),
  country: varchar("country"),
  walletBalance: decimal("wallet_balance", { precision: 10, scale: 2 }).default("0.00"),
  kycStatus: varchar("kyc_status").default("pending"), // pending, verified, rejected
  kycDocuments: jsonb("kyc_documents"),
  isAdmin: boolean("is_admin").default(false),
  isBanned: boolean("is_banned").default(false),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Teams table
export const teams = pgTable("teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  tag: varchar("tag"),
  logoUrl: varchar("logo_url"),
  captainId: varchar("captain_id").notNull().references(() => users.id),
  maxPlayers: integer("max_players").default(4),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Team members table
export const teamMembers = pgTable("team_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role").default("player"), // captain, player
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Tournament status enum
export const tournamentStatusEnum = pgEnum("tournament_status", [
  "upcoming", "live", "completed", "cancelled"
]);

// Tournaments table
export const tournaments = pgTable("tournaments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  game: varchar("game").notNull(), // BGMI, Free Fire, COD Mobile, etc.
  gameMode: varchar("game_mode"), // Solo, Squad, Team
  mapName: varchar("map_name"),
  entryFee: decimal("entry_fee", { precision: 10, scale: 2 }).notNull(),
  prizePool: decimal("prize_pool", { precision: 10, scale: 2 }).notNull(),
  maxParticipants: integer("max_participants").notNull(),
  currentParticipants: integer("current_participants").default(0),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  registrationDeadline: timestamp("registration_deadline"),
  status: tournamentStatusEnum("status").default("upcoming"),
  rules: text("rules"),
  streamUrl: varchar("stream_url"),
  roomCode: varchar("room_code"),
  roomPassword: varchar("room_password"),
  isRoomCodeRevealed: boolean("is_room_code_revealed").default(false),
  hostId: varchar("host_id").notNull().references(() => users.id),
  imageUrl: varchar("image_url"),
  prizeDistribution: jsonb("prize_distribution"), // [{ position: 1, amount: 50000, percentage: 50 }]
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tournament participants table
export const tournamentParticipants = pgTable("tournament_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id, { onDelete: "cascade" }),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  teamId: varchar("team_id").references(() => teams.id, { onDelete: "cascade" }),
  registrationTime: timestamp("registration_time").defaultNow(),
  paymentStatus: varchar("payment_status").default("pending"), // pending, completed, failed, refunded
  paymentIntentId: varchar("payment_intent_id"),
});

// Matches table
export const matches = pgTable("matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id, { onDelete: "cascade" }),
  matchNumber: integer("match_number").default(1),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  status: varchar("status").default("scheduled"), // scheduled, live, completed
  results: jsonb("results"), // Array of participant results with kills, placement, etc.
  winnerId: varchar("winner_id").references(() => users.id),
  winnerTeamId: varchar("winner_team_id").references(() => teams.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Match reports table (for user-submitted results)
export const matchReports = pgTable("match_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  matchId: varchar("match_id").notNull().references(() => matches.id, { onDelete: "cascade" }),
  reporterId: varchar("reporter_id").notNull().references(() => users.id),
  screenshotUrl: varchar("screenshot_url"),
  kills: integer("kills"),
  placement: integer("placement"),
  points: integer("points"),
  verificationStatus: varchar("verification_status").default("pending"), // pending, verified, rejected
  adminNotes: text("admin_notes"),
  submittedAt: timestamp("submitted_at").defaultNow(),
});

// Wallet transactions table
export const walletTransactions = pgTable("wallet_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type").notNull(), // deposit, withdrawal, tournament_entry, prize_payout, refund
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status").default("pending"), // pending, completed, failed
  description: text("description"),
  tournamentId: varchar("tournament_id").references(() => tournaments.id),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  adminId: varchar("admin_id").references(() => users.id), // For manual adjustments
  adminReason: text("admin_reason"), // Reason for manual adjustment
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type").notNull(), // tournament, payment, system, match
  isRead: boolean("is_read").default(false),
  data: jsonb("data"), // Additional data like tournament_id, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// Support tickets table
export const supportTickets = pgTable("support_tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  subject: varchar("subject").notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull(), // payment, tournament, technical, account
  status: varchar("status").default("open"), // open, in_progress, resolved, closed
  priority: varchar("priority").default("medium"), // low, medium, high, urgent
  assignedToId: varchar("assigned_to_id").references(() => users.id),
  attachments: jsonb("attachments"), // Array of file URLs
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Support ticket messages table
export const ticketMessages = pgTable("ticket_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketId: varchar("ticket_id").notNull().references(() => supportTickets.id, { onDelete: "cascade" }),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  attachments: jsonb("attachments"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  teams: many(teams),
  teamMemberships: many(teamMembers),
  tournamentsHosted: many(tournaments),
  tournamentParticipations: many(tournamentParticipants),
  walletTransactions: many(walletTransactions),
  notifications: many(notifications),
  supportTickets: many(supportTickets),
  matchReports: many(matchReports),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  captain: one(users, {
    fields: [teams.captainId],
    references: [users.id],
  }),
  members: many(teamMembers),
  tournamentParticipations: many(tournamentParticipants),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
}));

export const tournamentsRelations = relations(tournaments, ({ one, many }) => ({
  host: one(users, {
    fields: [tournaments.hostId],
    references: [users.id],
  }),
  participants: many(tournamentParticipants),
  matches: many(matches),
}));

export const tournamentParticipantsRelations = relations(tournamentParticipants, ({ one }) => ({
  tournament: one(tournaments, {
    fields: [tournamentParticipants.tournamentId],
    references: [tournaments.id],
  }),
  user: one(users, {
    fields: [tournamentParticipants.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [tournamentParticipants.teamId],
    references: [teams.id],
  }),
}));

export const matchesRelations = relations(matches, ({ one, many }) => ({
  tournament: one(tournaments, {
    fields: [matches.tournamentId],
    references: [tournaments.id],
  }),
  winner: one(users, {
    fields: [matches.winnerId],
    references: [users.id],
  }),
  winnerTeam: one(teams, {
    fields: [matches.winnerTeamId],
    references: [teams.id],
  }),
  reports: many(matchReports),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTournamentSchema = createInsertSchema(tournaments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  currentParticipants: true,
});

export const insertTournamentParticipantSchema = createInsertSchema(tournamentParticipants).omit({
  id: true,
  registrationTime: true,
});

export const insertWalletTransactionSchema = createInsertSchema(walletTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMatchReportSchema = createInsertSchema(matchReports).omit({
  id: true,
  submittedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Tournament = typeof tournaments.$inferSelect;
export type InsertTournament = z.infer<typeof insertTournamentSchema>;
export type TournamentParticipant = typeof tournamentParticipants.$inferSelect;
export type InsertTournamentParticipant = z.infer<typeof insertTournamentParticipantSchema>;
export type Match = typeof matches.$inferSelect;
export type MatchReport = typeof matchReports.$inferSelect;
export type InsertMatchReport = z.infer<typeof insertMatchReportSchema>;
export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type InsertWalletTransaction = z.infer<typeof insertWalletTransactionSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;
