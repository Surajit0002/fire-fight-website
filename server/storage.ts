import {
  users,
  teams,
  tournaments,
  tournamentParticipants,
  matches,
  matchReports,
  walletTransactions,
  notifications,
  supportTickets,
  teamMembers,
  type User,
  type UpsertUser,
  type Team,
  type InsertTeam,
  type Tournament,
  type InsertTournament,
  type TournamentParticipant,
  type InsertTournamentParticipant,
  type Match,
  type MatchReport,
  type InsertMatchReport,
  type WalletTransaction,
  type InsertWalletTransaction,
  type Notification,
  type InsertNotification,
  type SupportTicket,
  type InsertSupportTicket,
  type TeamMember,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, sql, asc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;
  updateUserWalletBalance(userId: string, amount: string): Promise<User>;
  updateUserStripeInfo(userId: string, data: { stripeCustomerId?: string; stripeSubscriptionId?: string }): Promise<User>;
  
  // Tournament operations
  getTournaments(limit?: number, offset?: number): Promise<Tournament[]>;
  getTournament(id: string): Promise<Tournament | undefined>;
  createTournament(tournament: InsertTournament): Promise<Tournament>;
  updateTournament(id: string, data: Partial<Tournament>): Promise<Tournament>;
  getUpcomingTournaments(): Promise<Tournament[]>;
  getLiveTournaments(): Promise<Tournament[]>;
  getFeaturedTournaments(): Promise<Tournament[]>;
  
  // Tournament participation
  joinTournament(data: InsertTournamentParticipant): Promise<TournamentParticipant>;
  getTournamentParticipants(tournamentId: string): Promise<TournamentParticipant[]>;
  getUserTournaments(userId: string): Promise<TournamentParticipant[]>;
  updateParticipantPaymentStatus(participantId: string, status: string, paymentIntentId?: string): Promise<TournamentParticipant>;
  
  // Team operations
  createTeam(team: InsertTeam): Promise<Team>;
  getTeam(id: string): Promise<Team | undefined>;
  getUserTeams(userId: string): Promise<Team[]>;
  addTeamMember(teamId: string, userId: string, role?: string): Promise<TeamMember>;
  getTeamMembers(teamId: string): Promise<TeamMember[]>;
  
  // Match operations
  getMatches(tournamentId: string): Promise<Match[]>;
  getLiveMatches(): Promise<Match[]>;
  createMatchReport(report: InsertMatchReport): Promise<MatchReport>;
  getMatchReports(matchId: string): Promise<MatchReport[]>;
  
  // Wallet operations
  createWalletTransaction(transaction: InsertWalletTransaction): Promise<WalletTransaction>;
  getUserTransactions(userId: string, limit?: number): Promise<WalletTransaction[]>;
  getPendingWithdrawals(): Promise<WalletTransaction[]>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string): Promise<Notification[]>;
  markNotificationRead(id: string): Promise<void>;
  
  // Support operations
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  getSupportTickets(userId?: string): Promise<SupportTicket[]>;
  
  // Admin operations
  getAllUsers(limit?: number, offset?: number): Promise<User[]>;
  getAllTournaments(limit?: number, offset?: number): Promise<Tournament[]>;
  getAllTransactions(limit?: number, offset?: number): Promise<WalletTransaction[]>;
  getRecentWinners(): Promise<any[]>;
  getDashboardStats(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async updateUserWalletBalance(userId: string, amount: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ walletBalance: amount, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserStripeInfo(userId: string, data: { stripeCustomerId?: string; stripeSubscriptionId?: string }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Tournament operations
  async getTournaments(limit = 20, offset = 0): Promise<Tournament[]> {
    return await db
      .select()
      .from(tournaments)
      .orderBy(desc(tournaments.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getTournament(id: string): Promise<Tournament | undefined> {
    const [tournament] = await db.select().from(tournaments).where(eq(tournaments.id, id));
    return tournament;
  }

  async createTournament(tournament: InsertTournament): Promise<Tournament> {
    const [newTournament] = await db
      .insert(tournaments)
      .values(tournament)
      .returning();
    return newTournament;
  }

  async updateTournament(id: string, data: Partial<Tournament>): Promise<Tournament> {
    const [tournament] = await db
      .update(tournaments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tournaments.id, id))
      .returning();
    return tournament;
  }

  async getUpcomingTournaments(): Promise<Tournament[]> {
    return await db
      .select()
      .from(tournaments)
      .where(eq(tournaments.status, "upcoming"))
      .orderBy(asc(tournaments.startTime))
      .limit(10);
  }

  async getLiveTournaments(): Promise<Tournament[]> {
    return await db
      .select()
      .from(tournaments)
      .where(eq(tournaments.status, "live"))
      .orderBy(desc(tournaments.startTime))
      .limit(10);
  }

  async getFeaturedTournaments(): Promise<Tournament[]> {
    return await db
      .select()
      .from(tournaments)
      .where(or(eq(tournaments.status, "upcoming"), eq(tournaments.status, "live")))
      .orderBy(desc(tournaments.prizePool))
      .limit(8);
  }

  // Tournament participation
  async joinTournament(data: InsertTournamentParticipant): Promise<TournamentParticipant> {
    const [participant] = await db
      .insert(tournamentParticipants)
      .values(data)
      .returning();
    
    // Update tournament current participants count
    await db
      .update(tournaments)
      .set({ 
        currentParticipants: sql`${tournaments.currentParticipants} + 1`,
        updatedAt: new Date()
      })
      .where(eq(tournaments.id, data.tournamentId));
    
    return participant;
  }

  async getTournamentParticipants(tournamentId: string): Promise<TournamentParticipant[]> {
    return await db
      .select()
      .from(tournamentParticipants)
      .where(eq(tournamentParticipants.tournamentId, tournamentId));
  }

  async getUserTournaments(userId: string): Promise<TournamentParticipant[]> {
    return await db
      .select()
      .from(tournamentParticipants)
      .where(eq(tournamentParticipants.userId, userId))
      .orderBy(desc(tournamentParticipants.registrationTime));
  }

  async updateParticipantPaymentStatus(participantId: string, status: string, paymentIntentId?: string): Promise<TournamentParticipant> {
    const [participant] = await db
      .update(tournamentParticipants)
      .set({ paymentStatus: status, paymentIntentId })
      .where(eq(tournamentParticipants.id, participantId))
      .returning();
    return participant;
  }

  // Team operations
  async createTeam(team: InsertTeam): Promise<Team> {
    const [newTeam] = await db
      .insert(teams)
      .values(team)
      .returning();
    
    // Add captain as team member
    await this.addTeamMember(newTeam.id, team.captainId, "captain");
    
    return newTeam;
  }

  async getTeam(id: string): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team;
  }

  async getTeamByCode(teamCode: string): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.teamCode, teamCode));
    return team;
  }

  async updateTeam(id: string, data: Partial<Team>): Promise<Team> {
    const [team] = await db
      .update(teams)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(teams.id, id))
      .returning();
    return team;
  }

  async deleteTeam(id: string): Promise<void> {
    await db.delete(teams).where(eq(teams.id, id));
  }

  async getTeamByCode(teamCode: string): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.teamCode, teamCode));
    return team;
  }

  async updateTeam(id: string, data: Partial<Team>): Promise<Team> {
    const [team] = await db
      .update(teams)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(teams.id, id))
      .returning();
    return team;
  }

  async deleteTeam(id: string): Promise<void> {
    await db.delete(teams).where(eq(teams.id, id));
  }

  async getUserTeams(userId: string): Promise<Team[]> {
    return await db
      .select({
        id: teams.id,
        name: teams.name,
        tag: teams.tag,
        logoUrl: teams.logoUrl,
        gameType: teams.gameType,
        teamCode: teams.teamCode,
        captainId: teams.captainId,
        maxPlayers: teams.maxPlayers,
        createdAt: teams.createdAt,
        updatedAt: teams.updatedAt,
      })
      .from(teams)
      .where(eq(teams.captainId, userId))
      .orderBy(desc(teams.createdAt));
  }

  async addTeamMember(teamId: string, userId: string, role = "player"): Promise<TeamMember> {
    const [member] = await db
      .insert(teamMembers)
      .values({ teamId, userId, role })
      .returning();
    return member;
  }

  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    return await db
      .select({
        id: teamMembers.id,
        teamId: teamMembers.teamId,
        userId: teamMembers.userId,
        role: teamMembers.role,
        joinedAt: teamMembers.joinedAt,
        user: {
          id: users.id,
          username: users.username,
          email: users.email,
          profileImageUrl: users.profileImageUrl,
          gameId: users.gameId,
        }
      })
      .from(teamMembers)
      .leftJoin(users, eq(teamMembers.userId, users.id))
      .where(eq(teamMembers.teamId, teamId));
  }

  async updateTeamMember(memberId: string, data: Partial<TeamMember>): Promise<TeamMember> {
    const [member] = await db
      .update(teamMembers)
      .set(data)
      .where(eq(teamMembers.id, memberId))
      .returning();
    return member;
  }

  async removeTeamMember(memberId: string): Promise<void> {
    await db.delete(teamMembers).where(eq(teamMembers.id, memberId));
  }

  async updateTeamMember(memberId: string, data: Partial<TeamMember>): Promise<TeamMember> {
    const [member] = await db
      .update(teamMembers)
      .set(data)
      .where(eq(teamMembers.id, memberId))
      .returning();
    return member;
  }

  async removeTeamMember(memberId: string): Promise<void> {
    await db.delete(teamMembers).where(eq(teamMembers.id, memberId));
  }

  // Match operations
  async getMatches(tournamentId: string): Promise<Match[]> {
    return await db
      .select()
      .from(matches)
      .where(eq(matches.tournamentId, tournamentId))
      .orderBy(asc(matches.matchNumber));
  }

  async getLiveMatches(): Promise<Match[]> {
    return await db
      .select()
      .from(matches)
      .where(eq(matches.status, "live"))
      .orderBy(desc(matches.startTime))
      .limit(10);
  }

  async createMatchReport(report: InsertMatchReport): Promise<MatchReport> {
    const [newReport] = await db
      .insert(matchReports)
      .values(report)
      .returning();
    return newReport;
  }

  async getMatchReports(matchId: string): Promise<MatchReport[]> {
    return await db
      .select()
      .from(matchReports)
      .where(eq(matchReports.matchId, matchId))
      .orderBy(desc(matchReports.submittedAt));
  }

  // Wallet operations
  async createWalletTransaction(transaction: InsertWalletTransaction): Promise<WalletTransaction> {
    const [newTransaction] = await db
      .insert(walletTransactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  async getUserTransactions(userId: string, limit = 50): Promise<WalletTransaction[]> {
    return await db
      .select()
      .from(walletTransactions)
      .where(eq(walletTransactions.userId, userId))
      .orderBy(desc(walletTransactions.createdAt))
      .limit(limit);
  }

  async getPendingWithdrawals(): Promise<WalletTransaction[]> {
    return await db
      .select()
      .from(walletTransactions)
      .where(and(
        eq(walletTransactions.type, "withdrawal"),
        eq(walletTransactions.status, "pending")
      ))
      .orderBy(asc(walletTransactions.createdAt));
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return newNotification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  }

  async markNotificationRead(id: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }

  // Support operations
  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
    const [newTicket] = await db
      .insert(supportTickets)
      .values(ticket)
      .returning();
    return newTicket;
  }

  async getSupportTickets(userId?: string): Promise<SupportTicket[]> {
    if (userId) {
      return await db
        .select()
        .from(supportTickets)
        .where(eq(supportTickets.userId, userId))
        .orderBy(desc(supportTickets.createdAt));
    }
    
    return await db
      .select()
      .from(supportTickets)
      .orderBy(desc(supportTickets.createdAt))
      .limit(100);
  }

  // Admin operations
  async getAllUsers(limit = 50, offset = 0): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getAllTournaments(limit = 50, offset = 0): Promise<Tournament[]> {
    return await db
      .select()
      .from(tournaments)
      .orderBy(desc(tournaments.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getAllTransactions(limit = 100, offset = 0): Promise<WalletTransaction[]> {
    return await db
      .select()
      .from(walletTransactions)
      .orderBy(desc(walletTransactions.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getRecentWinners(): Promise<any[]> {
    return await db
      .select({
        winnerId: matches.winnerId,
        winnerTeamId: matches.winnerTeamId,
        tournamentId: matches.tournamentId,
        tournamentTitle: tournaments.title,
        prizePool: tournaments.prizePool,
        game: tournaments.game,
        endTime: matches.endTime,
      })
      .from(matches)
      .innerJoin(tournaments, eq(matches.tournamentId, tournaments.id))
      .where(eq(matches.status, "completed"))
      .orderBy(desc(matches.endTime))
      .limit(10);
  }

  async getDashboardStats(): Promise<any> {
    const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [tournamentCount] = await db.select({ count: sql<number>`count(*)` }).from(tournaments);
    const [totalPrizePool] = await db
      .select({ total: sql<number>`sum(${tournaments.prizePool})` })
      .from(tournaments)
      .where(eq(tournaments.status, "completed"));
    
    const liveTournaments = await this.getLiveTournaments();
    
    return {
      totalUsers: userCount.count,
      totalTournaments: tournamentCount.count,
      totalPrizePool: totalPrizePool.total || 0,
      liveTournaments: liveTournaments.length,
    };
  }
}

export const storage = new DatabaseStorage();
