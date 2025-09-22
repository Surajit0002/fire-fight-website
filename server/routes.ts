import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertTournamentSchema, insertTeamSchema, insertSupportTicketSchema, insertMatchReportSchema } from "@shared/schema";
import { z } from "zod";

// Make Stripe optional
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
  });
  console.log("Stripe payment processing enabled");
} else {
  console.warn("Stripe not configured - payment features will be disabled");
}

// WebSocket clients map
const wsClients = new Map<string, WebSocket>();

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Tournament routes
  app.get('/api/tournaments', async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      
      const tournaments = await storage.getTournaments(limit, offset);
      res.json(tournaments);
    } catch (error) {
      console.error("Error fetching tournaments:", error);
      res.status(500).json({ message: "Failed to fetch tournaments" });
    }
  });

  app.get('/api/tournaments/featured', async (req, res) => {
    try {
      const tournaments = await storage.getFeaturedTournaments();
      res.json(tournaments);
    } catch (error) {
      console.error("Error fetching featured tournaments:", error);
      res.status(500).json({ message: "Failed to fetch featured tournaments" });
    }
  });

  app.get('/api/tournaments/upcoming', async (req, res) => {
    try {
      const tournaments = await storage.getUpcomingTournaments();
      res.json(tournaments);
    } catch (error) {
      console.error("Error fetching upcoming tournaments:", error);
      res.status(500).json({ message: "Failed to fetch upcoming tournaments" });
    }
  });

  app.get('/api/tournaments/live', async (req, res) => {
    try {
      const tournaments = await storage.getLiveTournaments();
      res.json(tournaments);
    } catch (error) {
      console.error("Error fetching live tournaments:", error);
      res.status(500).json({ message: "Failed to fetch live tournaments" });
    }
  });

  app.get('/api/tournaments/:id', async (req, res) => {
    try {
      const tournament = await storage.getTournament(req.params.id);
      if (!tournament) {
        return res.status(404).json({ message: "Tournament not found" });
      }
      res.json(tournament);
    } catch (error) {
      console.error("Error fetching tournament:", error);
      res.status(500).json({ message: "Failed to fetch tournament" });
    }
  });

  app.post('/api/tournaments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validatedData = insertTournamentSchema.parse({
        ...req.body,
        hostId: userId,
      });

      const tournament = await storage.createTournament(validatedData);
      
      // Broadcast new tournament to all connected clients
      broadcastToAll('tournament_created', tournament);
      
      res.json(tournament);
    } catch (error) {
      console.error("Error creating tournament:", error);
      res.status(500).json({ message: "Failed to create tournament" });
    }
  });

  // Tournament participation
  app.post('/api/tournaments/:id/join', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tournamentId = req.params.id;
      const { teamId } = req.body;

      const tournament = await storage.getTournament(tournamentId);
      if (!tournament) {
        return res.status(404).json({ message: "Tournament not found" });
      }

      if (tournament.currentParticipants >= tournament.maxParticipants) {
        return res.status(400).json({ message: "Tournament is full" });
      }

      // Create payment intent for entry fee
      let paymentIntentId = null;
      if (parseFloat(tournament.entryFee) > 0) {
        if (!stripe) {
          return res.status(503).json({ message: "Payment processing is not available" });
        }
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(parseFloat(tournament.entryFee) * 100),
          currency: "inr",
          metadata: {
            tournament_id: tournamentId,
            user_id: userId,
            team_id: teamId || '',
          },
        });
        paymentIntentId = paymentIntent.id;
      }

      const participant = await storage.joinTournament({
        tournamentId,
        userId: teamId ? null : userId,
        teamId: teamId || null,
        paymentStatus: parseFloat(tournament.entryFee) === 0 ? "completed" : "pending",
        paymentIntentId,
      });

      res.json({ 
        participant, 
        clientSecret: paymentIntentId && stripe ? (await stripe.paymentIntents.retrieve(paymentIntentId)).client_secret : null 
      });
    } catch (error) {
      console.error("Error joining tournament:", error);
      res.status(500).json({ message: "Failed to join tournament" });
    }
  });

  app.get('/api/tournaments/:id/participants', async (req, res) => {
    try {
      const participants = await storage.getTournamentParticipants(req.params.id);
      res.json(participants);
    } catch (error) {
      console.error("Error fetching participants:", error);
      res.status(500).json({ message: "Failed to fetch participants" });
    }
  });

  // User tournaments
  app.get('/api/user/tournaments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tournaments = await storage.getUserTournaments(userId);
      res.json(tournaments);
    } catch (error) {
      console.error("Error fetching user tournaments:", error);
      res.status(500).json({ message: "Failed to fetch user tournaments" });
    }
  });

  // Team routes
  app.post('/api/teams', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertTeamSchema.parse({
        ...req.body,
        captainId: userId,
      });

      const team = await storage.createTeam(validatedData);
      res.json(team);
    } catch (error) {
      console.error("Error creating team:", error);
      res.status(500).json({ message: "Failed to create team" });
    }
  });

  app.get('/api/teams/:id', async (req, res) => {
    try {
      const team = await storage.getTeam(req.params.id);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      const members = await storage.getTeamMembers(req.params.id);
      res.json({ ...team, members });
    } catch (error) {
      console.error("Error fetching team:", error);
      res.status(500).json({ message: "Failed to fetch team" });
    }
  });

  app.get('/api/user/teams', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const teams = await storage.getUserTeams(userId);
      res.json(teams);
    } catch (error) {
      console.error("Error fetching user teams:", error);
      res.status(500).json({ message: "Failed to fetch user teams" });
    }
  });

  // Matches routes
  app.get('/api/matches/live', async (req, res) => {
    try {
      const matches = await storage.getLiveMatches();
      res.json(matches);
    } catch (error) {
      console.error("Error fetching live matches:", error);
      res.status(500).json({ message: "Failed to fetch live matches" });
    }
  });

  app.get('/api/tournaments/:id/matches', async (req, res) => {
    try {
      const matches = await storage.getMatches(req.params.id);
      res.json(matches);
    } catch (error) {
      console.error("Error fetching tournament matches:", error);
      res.status(500).json({ message: "Failed to fetch tournament matches" });
    }
  });

  app.post('/api/matches/:id/report', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const matchId = req.params.id;
      
      const validatedData = insertMatchReportSchema.parse({
        ...req.body,
        matchId,
        reporterId: userId,
      });

      const report = await storage.createMatchReport(validatedData);
      res.json(report);
    } catch (error) {
      console.error("Error creating match report:", error);
      res.status(500).json({ message: "Failed to create match report" });
    }
  });

  // Wallet routes
  app.get('/api/wallet/balance', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json({ balance: user?.walletBalance || "0.00" });
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
      res.status(500).json({ message: "Failed to fetch wallet balance" });
    }
  });

  app.get('/api/wallet/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      const transactions = await storage.getUserTransactions(userId, limit);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Payment routes
  app.post("/api/create-payment-intent", isAuthenticated, async (req: any, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ message: "Payment processing is not available" });
      }

      const { amount, description } = req.body;
      const userId = req.user.claims.sub;
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: "inr",
        metadata: {
          user_id: userId,
          description: description || "Wallet top-up",
        },
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Error creating payment intent" });
    }
  });

  // Payment success webhook
  app.post('/api/webhook/stripe', async (req, res) => {
    try {
      const paymentIntent = req.body.data.object;
      
      if (req.body.type === 'payment_intent.succeeded') {
        const userId = paymentIntent.metadata.user_id;
        const amount = (paymentIntent.amount / 100).toString();
        
        // Update wallet balance
        const user = await storage.getUser(userId);
        if (user) {
          const newBalance = (parseFloat(user.walletBalance) + parseFloat(amount)).toString();
          await storage.updateUserWalletBalance(userId, newBalance);
          
          // Create transaction record
          await storage.createWalletTransaction({
            userId,
            type: "deposit",
            amount,
            status: "completed",
            description: "Wallet top-up via Stripe",
            stripePaymentIntentId: paymentIntent.id,
          });
        }
      }
      
      res.json({ received: true });
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(400).json({ error: "Webhook failed" });
    }
  });

  // Notifications
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch('/api/notifications/:id/read', isAuthenticated, async (req, res) => {
    try {
      await storage.markNotificationRead(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Support routes
  app.post('/api/support/tickets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertSupportTicketSchema.parse({
        ...req.body,
        userId,
      });

      const ticket = await storage.createSupportTicket(validatedData);
      res.json(ticket);
    } catch (error) {
      console.error("Error creating support ticket:", error);
      res.status(500).json({ message: "Failed to create support ticket" });
    }
  });

  app.get('/api/support/tickets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tickets = await storage.getSupportTickets(userId);
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching support tickets:", error);
      res.status(500).json({ message: "Failed to fetch support tickets" });
    }
  });

  // Leaderboard and stats
  app.get('/api/leaderboard/winners', async (req, res) => {
    try {
      const winners = await storage.getRecentWinners();
      res.json(winners);
    } catch (error) {
      console.error("Error fetching winners:", error);
      res.status(500).json({ message: "Failed to fetch winners" });
    }
  });

  app.get('/api/stats/dashboard', async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Development seeding route
  app.post('/api/seed-database', async (req, res) => {
    try {
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ message: "Seeding not allowed in production" });
      }
      
      const { seedDatabase } = await import('./seed');
      await seedDatabase();
      res.json({ message: "Database seeded successfully" });
    } catch (error) {
      console.error("Seeding error:", error);
      res.status(500).json({ message: "Failed to seed database" });
    }
  });

  // Admin routes
  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;
      
      const users = await storage.getAllUsers(limit, offset);
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/admin/tournaments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;
      
      const tournaments = await storage.getAllTournaments(limit, offset);
      res.json(tournaments);
    } catch (error) {
      console.error("Error fetching tournaments:", error);
      res.status(500).json({ message: "Failed to fetch tournaments" });
    }
  });

  app.get('/api/admin/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = (page - 1) * limit;
      
      const transactions = await storage.getAllTransactions(limit, offset);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Admin analytics endpoints
  app.get('/api/admin/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const timeRange = req.query.timeRange || '7d';
      const reportType = req.query.reportType || 'overview';
      
      // Mock analytics data - replace with real analytics logic
      const analyticsData = {
        overview: {
          dailyActiveUsers: 1234,
          dailyRevenue: 45670,
          activeTournaments: 18,
          conversionRate: 3.4
        },
        trends: [
          { date: '2024-01-01', users: 45, revenue: 2400, tournaments: 8 },
          { date: '2024-01-02', users: 52, revenue: 3200, tournaments: 12 },
          { date: '2024-01-03', users: 38, revenue: 1800, tournaments: 6 },
          { date: '2024-01-04', users: 65, revenue: 4200, tournaments: 15 },
          { date: '2024-01-05', users: 78, revenue: 5600, tournaments: 18 },
          { date: '2024-01-06', users: 95, revenue: 7200, tournaments: 22 },
          { date: '2024-01-07', users: 88, revenue: 6800, tournaments: 20 },
        ]
      };
      
      res.json(analyticsData);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Admin settings endpoints
  app.get('/api/admin/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Mock settings - replace with real settings storage
      const settings = {
        general: {
          platformName: "FireFight Arena",
          platformUrl: "https://firefightarena.com",
          supportEmail: "support@firefightarena.com",
          registrationOpen: true,
          maintenanceMode: false
        },
        payment: {
          platformFee: 5.0,
          minWithdrawal: 100,
          maxWithdrawal: 50000,
          autoPayouts: false
        },
        email: {
          smtpHost: "smtp.gmail.com",
          smtpPort: 587,
          emailNotifications: true
        },
        security: {
          sessionTimeout: 60,
          maxLoginAttempts: 5,
          require2FA: true,
          rateLimiting: true,
          ipWhitelist: false
        }
      };
      
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.put('/api/admin/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Mock settings update - replace with real settings storage
      console.log("Settings update:", req.body);
      
      res.json({ message: "Settings updated successfully" });
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Admin user management endpoints
  app.patch('/api/admin/users/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const adminId = req.user.claims.sub;
      const admin = await storage.getUser(adminId);
      
      if (!admin?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { userId } = req.params;
      const updates = req.body;
      
      // Mock user update - replace with real user update logic
      console.log(`Updating user ${userId}:`, updates);
      
      res.json({ message: "User updated successfully" });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.patch('/api/admin/users/:userId/kyc', isAuthenticated, async (req: any, res) => {
    try {
      const adminId = req.user.claims.sub;
      const admin = await storage.getUser(adminId);
      
      if (!admin?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { userId } = req.params;
      const { status, notes } = req.body;
      
      // Mock KYC update - replace with real KYC update logic
      console.log(`Updating KYC for user ${userId}:`, { status, notes });
      
      res.json({ message: "KYC status updated successfully" });
    } catch (error) {
      console.error("Error updating KYC:", error);
      res.status(500).json({ message: "Failed to update KYC status" });
    }
  });

  // Admin wallet management
  app.post('/api/admin/wallet/adjust', isAuthenticated, async (req: any, res) => {
    try {
      const adminId = req.user.claims.sub;
      const admin = await storage.getUser(adminId);
      
      if (!admin?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { userId, type, amount, reason } = req.body;
      
      // Mock wallet adjustment - replace with real wallet adjustment logic
      console.log(`Wallet adjustment for user ${userId}:`, { type, amount, reason });
      
      res.json({ message: "Wallet adjusted successfully" });
    } catch (error) {
      console.error("Error adjusting wallet:", error);
      res.status(500).json({ message: "Failed to adjust wallet" });
    }
  });

  // Admin tournament management
  app.patch('/api/admin/tournaments/:id', isAuthenticated, async (req: any, res) => {
    try {
      const adminId = req.user.claims.sub;
      const admin = await storage.getUser(adminId);
      
      if (!admin?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const tournamentId = req.params.id;
      const updates = req.body;
      
      // Mock tournament update - replace with real tournament update logic
      console.log(`Updating tournament ${tournamentId}:`, updates);
      
      res.json({ message: "Tournament updated successfully" });
    } catch (error) {
      console.error("Error updating tournament:", error);
      res.status(500).json({ message: "Failed to update tournament" });
    }
  });

  app.delete('/api/admin/tournaments/:id', isAuthenticated, async (req: any, res) => {
    try {
      const adminId = req.user.claims.sub;
      const admin = await storage.getUser(adminId);
      
      if (!admin?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const tournamentId = req.params.id;
      
      // Mock tournament deletion - replace with real tournament deletion logic
      console.log(`Deleting tournament ${tournamentId}`);
      
      res.json({ message: "Tournament deleted successfully" });
    } catch (error) {
      console.error("Error deleting tournament:", error);
      res.status(500).json({ message: "Failed to delete tournament" });
    }
  });

  // Admin withdrawal management
  app.get('/api/admin/withdrawals/pending', isAuthenticated, async (req: any, res) => {
    try {
      const adminId = req.user.claims.sub;
      const admin = await storage.getUser(adminId);
      
      if (!admin?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Mock pending withdrawals - replace with real data
      const pendingWithdrawals = [];
      
      res.json(pendingWithdrawals);
    } catch (error) {
      console.error("Error fetching pending withdrawals:", error);
      res.status(500).json({ message: "Failed to fetch pending withdrawals" });
    }
  });

  app.post('/api/admin/withdrawals/:transactionId/approve', isAuthenticated, async (req: any, res) => {
    try {
      const adminId = req.user.claims.sub;
      const admin = await storage.getUser(adminId);
      
      if (!admin?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { transactionId } = req.params;
      
      // Mock withdrawal approval - replace with real approval logic
      console.log(`Approving withdrawal ${transactionId}`);
      
      res.json({ message: "Withdrawal approved successfully" });
    } catch (error) {
      console.error("Error approving withdrawal:", error);
      res.status(500).json({ message: "Failed to approve withdrawal" });
    }
  });

  app.post('/api/admin/withdrawals/:transactionId/reject', isAuthenticated, async (req: any, res) => {
    try {
      const adminId = req.user.claims.sub;
      const admin = await storage.getUser(adminId);
      
      if (!admin?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { transactionId } = req.params;
      
      // Mock withdrawal rejection - replace with real rejection logic
      console.log(`Rejecting withdrawal ${transactionId}`);
      
      res.json({ message: "Withdrawal rejected successfully" });
    } catch (error) {
      console.error("Error rejecting withdrawal:", error);
      res.status(500).json({ message: "Failed to reject withdrawal" });
    }
  });

  // Admin wallet statistics
  app.get('/api/admin/wallet/stats', isAuthenticated, async (req: any, res) => {
    try {
      const adminId = req.user.claims.sub;
      const admin = await storage.getUser(adminId);
      
      if (!admin?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Mock wallet statistics - replace with real calculations
      const walletStats = {
        totalDeposits: 125000,
        totalWithdrawals: 75000,
        platformRevenue: 12500,
        pendingWithdrawals: 0
      };
      
      res.json(walletStats);
    } catch (error) {
      console.error("Error fetching wallet stats:", error);
      res.status(500).json({ message: "Failed to fetch wallet statistics" });
    }
  });

  // Email testing endpoint
  app.post('/api/admin/test-email', isAuthenticated, async (req: any, res) => {
    try {
      const adminId = req.user.claims.sub;
      const admin = await storage.getUser(adminId);
      
      if (!admin?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Mock email test - replace with real email sending logic
      console.log("Sending test email to admin");
      
      res.json({ message: "Test email sent successfully" });
    } catch (error) {
      console.error("Error sending test email:", error);
      res.status(500).json({ message: "Failed to send test email" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket setup
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket, req) => {
    const clientId = Math.random().toString(36).substring(7);
    wsClients.set(clientId, ws);

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle different message types
        switch (data.type) {
          case 'join_tournament_room':
            // Join specific tournament updates
            ws.send(JSON.stringify({
              type: 'tournament_room_joined',
              tournamentId: data.tournamentId
            }));
            break;
            
          case 'ping':
            ws.send(JSON.stringify({ type: 'pong' }));
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      wsClients.delete(clientId);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      wsClients.delete(clientId);
    });
  });

  // Broadcast function for real-time updates
  function broadcastToAll(type: string, data: any) {
    const message = JSON.stringify({ type, data });
    wsClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  return httpServer;
}
