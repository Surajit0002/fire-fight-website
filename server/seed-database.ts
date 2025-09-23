import { db } from './db';
import {
  users,
  teams,
  tournaments,
  tournamentParticipants,
  matches,
  matchReports,
  walletTransactions,
  notifications,
  teamMembers,
  supportTickets,
  ticketMessages,
} from '@shared/schema';
import { sql } from 'drizzle-orm';

const sampleUsers = [
  {
    id: 'user-admin-1',
    email: 'admin@esportsplatform.com',
    firstName: 'Admin',
    lastName: 'User',
    username: 'admin_chief',
    gameId: 'ADMIN001',
    phone: '+1-555-0001',
    country: 'USA',
    walletBalance: '5000.00',
    kycStatus: 'verified',
    isAdmin: true,
    profileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
  },
  {
    id: 'user-pro-1',
    email: 'shadowstrike@gmail.com',
    firstName: 'Alex',
    lastName: 'Shadow',
    username: 'ShadowStrike_Pro',
    gameId: 'BGMI_7829156',
    phone: '+1-555-0002',
    country: 'India',
    walletBalance: '2500.75',
    kycStatus: 'verified',
    profileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=shadow'
  },
  {
    id: 'user-pro-2',
    email: 'phoenixgamer@outlook.com',
    firstName: 'Maya',
    lastName: 'Phoenix',
    username: 'Phoenix_Rising',
    gameId: 'BGMI_4521839',
    phone: '+1-555-0003',
    country: 'India',
    walletBalance: '3200.50',
    kycStatus: 'verified',
    profileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=phoenix'
  },
  {
    id: 'user-player-3',
    email: 'vipersniper@yahoo.com',
    firstName: 'Raj',
    lastName: 'Viper',
    username: 'ViperSniper',
    gameId: 'BGMI_9876543',
    phone: '+91-9876543210',
    country: 'India',
    walletBalance: '1500.25',
    kycStatus: 'verified',
    profileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=viper'
  },
  {
    id: 'user-player-4',
    email: 'thunderbolt@gmail.com',
    firstName: 'Priya',
    lastName: 'Thunder',
    username: 'ThunderBolt_X',
    gameId: 'BGMI_1357924',
    phone: '+91-9845632170',
    country: 'India',
    walletBalance: '800.00',
    kycStatus: 'verified',
    profileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=thunder'
  },
  {
    id: 'user-player-5',
    email: 'blazehunter@hotmail.com',
    firstName: 'Arjun',
    lastName: 'Blaze',
    username: 'BlazeHunter_99',
    gameId: 'BGMI_2468135',
    phone: '+91-9123456789',
    country: 'India',
    walletBalance: '1200.75',
    kycStatus: 'verified',
    profileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=blaze'
  },
  {
    id: 'user-player-6',
    email: 'stormbreaker@gmail.com',
    firstName: 'Ananya',
    lastName: 'Storm',
    username: 'StormBreaker',
    gameId: 'BGMI_8642097',
    phone: '+91-9876512340',
    country: 'India',
    walletBalance: '950.50',
    kycStatus: 'rejected',
    profileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=storm'
  },
  {
    id: 'user-player-7',
    email: 'nightfury@protonmail.com',
    firstName: 'Karan',
    lastName: 'Night',
    username: 'NightFury_Elite',
    gameId: 'BGMI_5739284',
    phone: '+91-9234567890',
    country: 'India',
    walletBalance: '2100.00',
    kycStatus: 'verified',
    profileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=night'
  },
  {
    id: 'user-player-8',
    email: 'cyberpunk@outlook.com',
    firstName: 'Neha',
    lastName: 'Cyber',
    username: 'CyberPunk_2077',
    gameId: 'BGMI_3691472',
    phone: '+91-9345678901',
    country: 'India',
    walletBalance: '1750.25',
    kycStatus: 'pending',
    isBanned: true,
    profileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cyber'
  },
  {
    id: 'user-player-9',
    email: 'dragonslayer@gmail.com',
    firstName: 'Vikram',
    lastName: 'Dragon',
    username: 'DragonSlayer_X',
    gameId: 'BGMI_5647382',
    phone: '+91-9456781230',
    country: 'India',
    walletBalance: '1350.00',
    kycStatus: 'verified',
    profileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dragon'
  },
  {
    id: 'user-player-10',
    email: 'titanfist@outlook.com',
    firstName: 'Ravi',
    lastName: 'Titan',
    username: 'TitanFist_Pro',
    gameId: 'BGMI_9182736',
    phone: '+91-9567890123',
    country: 'India',
    walletBalance: '2250.75',
    kycStatus: 'verified',
    profileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=titan'
  }
];

const sampleTeams = [
  {
    id: 'team-1',
    name: 'Shadow Warriors',
    tag: 'SW',
    logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=SW',
    gameType: 'BGMI',
    teamCode: 'SW2024',
    captainId: 'user-pro-1',
    maxPlayers: 4
  },
  {
    id: 'team-2',
    name: 'Phoenix Squad',
    tag: 'PS',
    logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=PS',
    gameType: 'BGMI',
    teamCode: 'PHX2024',
    captainId: 'user-pro-2',
    maxPlayers: 4
  },
  {
    id: 'team-3',
    name: 'Viper Strike',
    tag: 'VS',
    logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=VS',
    gameType: 'BGMI',
    teamCode: 'VIP2024',
    captainId: 'user-player-3',
    maxPlayers: 4
  },
  {
    id: 'team-4',
    name: 'Thunder Bolts',
    tag: 'TB',
    logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=TB',
    gameType: 'BGMI',
    teamCode: 'THB2024',
    captainId: 'user-player-7',
    maxPlayers: 4
  },
  {
    id: 'team-5',
    name: 'Dragon Fury',
    tag: 'DF',
    logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=DF',
    gameType: 'BGMI',
    teamCode: 'DRG2024',
    captainId: 'user-player-9',
    maxPlayers: 4
  },
  {
    id: 'team-6',
    name: 'Titan Force',
    tag: 'TF',
    logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=TF',
    gameType: 'BGMI',
    teamCode: 'TTN2024',
    captainId: 'user-player-10',
    maxPlayers: 4
  }
];

// Calculate relative timestamps from current time
const now = new Date();
const sampleTournaments = [
  {
    id: 'tournament-1',
    title: 'BGMI Winter Championship 2024',
    description: 'The ultimate BGMI tournament with the biggest prize pool of the season. Top teams from across India compete for glory!',
    game: 'BGMI',
    gameMode: 'Squad',
    mapName: 'Sanhok',
    entryFee: '500.00',
    prizePool: '100000.00',
    maxParticipants: 64,
    currentParticipants: 4,
    startTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    endTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 4 hours later
    registrationDeadline: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000 + 23 * 60 * 60 * 1000), // 1 hour before start
    status: 'upcoming' as const,
    rules: 'Standard BGMI tournament rules apply. No hacking, teaming, or unsportsmanlike conduct allowed.',
    streamUrl: 'https://youtube.com/watch?v=tournament1',
    roomCode: 'BGMI2024W',
    roomPassword: 'winter123',
    isRoomCodeRevealed: false,
    hostId: 'user-admin-1',
    imageUrl: 'https://picsum.photos/400/250?random=1',
    prizeDistribution: [
      { position: 1, amount: 50000, percentage: 50 },
      { position: 2, amount: 30000, percentage: 30 },
      { position: 3, amount: 20000, percentage: 20 }
    ]
  },
  {
    id: 'tournament-2',
    title: 'Friday Night Showdown',
    description: 'Weekly Friday tournament for competitive players. Fast-paced action with instant rewards!',
    game: 'BGMI',
    gameMode: 'Squad',
    mapName: 'Erangel',
    entryFee: '100.00',
    prizePool: '8000.00',
    maxParticipants: 32,
    currentParticipants: 3,
    startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000), // Started 2 hours ago
    endTime: new Date(now.getTime() + 30 * 60 * 1000), // Ends in 30 minutes
    registrationDeadline: new Date(now.getTime() - 3 * 60 * 60 * 1000), // Registration closed 3 hours ago
    status: 'live' as const,
    rules: 'Quick matches, survival of the fittest!',
    streamUrl: 'https://youtube.com/watch?v=tournament2',
    roomCode: 'FNS2023',
    roomPassword: 'friday99',
    isRoomCodeRevealed: true,
    hostId: 'user-admin-1',
    imageUrl: 'https://picsum.photos/400/250?random=2',
    prizeDistribution: [
      { position: 1, amount: 4000, percentage: 50 },
      { position: 2, amount: 2400, percentage: 30 },
      { position: 3, amount: 1600, percentage: 20 }
    ]
  },
  {
    id: 'tournament-3',
    title: 'Newbie Championship',
    description: 'Tournament designed for new players to get competitive experience. Low entry fee, great learning opportunity!',
    game: 'BGMI',
    gameMode: 'Squad',
    mapName: 'Miramar',
    entryFee: '50.00',
    prizePool: '2000.00',
    maxParticipants: 24,
    currentParticipants: 4,
    startTime: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    endTime: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
    registrationDeadline: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 - 30 * 60 * 1000), // 30 mins before start
    status: 'completed' as const,
    rules: 'Beginner-friendly tournament with coaching tips!',
    streamUrl: 'https://youtube.com/watch?v=tournament3',
    roomCode: 'NEWBIE23',
    roomPassword: 'learn123',
    isRoomCodeRevealed: true,
    hostId: 'user-admin-1',
    imageUrl: 'https://picsum.photos/400/250?random=3',
    prizeDistribution: [
      { position: 1, amount: 1000, percentage: 50 },
      { position: 2, amount: 600, percentage: 30 },
      { position: 3, amount: 400, percentage: 20 }
    ]
  },
  {
    id: 'tournament-4',
    title: 'Pro League Season 1',
    description: 'Elite tournament for professional BGMI players. Invitation-only event with massive prize pool.',
    game: 'BGMI',
    gameMode: 'Squad',
    mapName: 'Vikendi',
    entryFee: '1000.00',
    prizePool: '250000.00',
    maxParticipants: 16,
    currentParticipants: 0,
    startTime: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    endTime: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000), // 5 hours later
    registrationDeadline: new Date(now.getTime() + 13 * 24 * 60 * 60 * 1000), // 1 day before start
    status: 'cancelled' as const,
    rules: 'Professional tournament rules. Strict anti-cheat measures.',
    streamUrl: 'https://youtube.com/watch?v=tournament4',
    roomCode: 'PROLEAGUE',
    roomPassword: 'elite2024',
    isRoomCodeRevealed: false,
    hostId: 'user-admin-1',
    imageUrl: 'https://picsum.photos/400/250?random=4',
    prizeDistribution: [
      { position: 1, amount: 125000, percentage: 50 },
      { position: 2, amount: 75000, percentage: 30 },
      { position: 3, amount: 50000, percentage: 20 }
    ]
  },
  {
    id: 'tournament-5',
    title: 'Monthly Masters Cup',
    description: 'Monthly competitive tournament with substantial prize pool for skilled players.',
    game: 'BGMI',
    gameMode: 'Squad',
    mapName: 'Karakin',
    entryFee: '200.00',
    prizePool: '15000.00',
    maxParticipants: 48,
    currentParticipants: 6,
    startTime: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    endTime: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours later
    registrationDeadline: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000 - 60 * 60 * 1000), // 1 hour before start
    status: 'completed' as const,
    rules: 'Advanced tournament for experienced players.',
    streamUrl: 'https://youtube.com/watch?v=tournament5',
    roomCode: 'MASTERS25',
    roomPassword: 'cup2025',
    isRoomCodeRevealed: true,
    hostId: 'user-admin-1',
    imageUrl: 'https://picsum.photos/400/250?random=5',
    prizeDistribution: [
      { position: 1, amount: 7500, percentage: 50 },
      { position: 2, amount: 4500, percentage: 30 },
      { position: 3, amount: 3000, percentage: 20 }
    ]
  }
];

const sampleMatches = [
  {
    id: 'match-1',
    tournamentId: 'tournament-3',
    matchNumber: 1,
    startTime: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    endTime: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
    status: 'completed',
    results: [
      { teamId: 'team-1', teamName: 'Shadow Warriors', kills: 12, placement: 1, points: 22, players: [
        { userId: 'user-pro-1', kills: 5, placement: 1, points: 10 },
        { userId: 'user-player-4', kills: 3, placement: 1, points: 5 },
        { userId: 'user-player-5', kills: 2, placement: 1, points: 4 },
        { userId: 'user-player-6', kills: 2, placement: 1, points: 3 }
      ]},
      { teamId: 'team-2', teamName: 'Phoenix Squad', kills: 8, placement: 2, points: 18, players: [
        { userId: 'user-pro-2', kills: 4, placement: 2, points: 8 },
        { userId: 'user-player-7', kills: 2, placement: 2, points: 5 },
        { userId: 'user-player-8', kills: 2, placement: 2, points: 5 }
      ]},
      { teamId: 'team-3', teamName: 'Viper Strike', kills: 6, placement: 3, points: 16, players: [
        { userId: 'user-player-3', kills: 6, placement: 3, points: 16 }
      ]},
      { teamId: 'team-4', teamName: 'Thunder Bolts', kills: 4, placement: 8, points: 8, players: [
        { userId: 'user-player-7', kills: 4, placement: 8, points: 8 }
      ]}
    ],
    winnerTeamId: 'team-1'
  },
  {
    id: 'match-2',
    tournamentId: 'tournament-3',
    matchNumber: 2,
    startTime: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
    endTime: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 + 75 * 60 * 1000),
    status: 'completed',
    results: [
      { teamId: 'team-2', teamName: 'Phoenix Squad', kills: 15, placement: 1, points: 25 },
      { teamId: 'team-4', teamName: 'Thunder Bolts', kills: 10, placement: 2, points: 20 },
      { teamId: 'team-1', teamName: 'Shadow Warriors', kills: 7, placement: 4, points: 13 },
      { teamId: 'team-3', teamName: 'Viper Strike', kills: 5, placement: 6, points: 10 }
    ],
    winnerTeamId: 'team-2'
  },
  {
    id: 'match-3',
    tournamentId: 'tournament-5',
    matchNumber: 1,
    startTime: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    endTime: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
    status: 'completed',
    results: [
      { teamId: 'team-5', teamName: 'Dragon Fury', kills: 18, placement: 1, points: 28 },
      { teamId: 'team-6', teamName: 'Titan Force', kills: 14, placement: 2, points: 24 },
      { teamId: 'team-1', teamName: 'Shadow Warriors', kills: 11, placement: 3, points: 21 },
      { teamId: 'team-2', teamName: 'Phoenix Squad', kills: 9, placement: 5, points: 14 }
    ],
    winnerTeamId: 'team-5'
  },
  {
    id: 'match-4',
    tournamentId: 'tournament-5',
    matchNumber: 2,
    startTime: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
    endTime: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
    status: 'completed',
    results: [
      { teamId: 'team-6', teamName: 'Titan Force', kills: 16, placement: 1, points: 26 },
      { teamId: 'team-5', teamName: 'Dragon Fury', kills: 13, placement: 2, points: 23 },
      { teamId: 'team-3', teamName: 'Viper Strike', kills: 8, placement: 4, points: 18 },
      { teamId: 'team-4', teamName: 'Thunder Bolts', kills: 6, placement: 7, points: 12 }
    ],
    winnerTeamId: 'team-6'
  },
  {
    id: 'match-5',
    tournamentId: 'tournament-2',
    matchNumber: 1,
    startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    endTime: null,
    status: 'live',
    results: null
  }
];

export async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Use database transaction for atomicity
    await db.transaction(async (tx) => {
      // Clear existing data using TRUNCATE for better performance
      console.log('Clearing existing data...');
      await tx.execute(sql`TRUNCATE ${ticketMessages} CASCADE`);
      await tx.execute(sql`TRUNCATE ${supportTickets} CASCADE`);
      await tx.execute(sql`TRUNCATE ${notifications} CASCADE`);
      await tx.execute(sql`TRUNCATE ${walletTransactions} CASCADE`);
      await tx.execute(sql`TRUNCATE ${matchReports} CASCADE`);
      await tx.execute(sql`TRUNCATE ${matches} CASCADE`);
      await tx.execute(sql`TRUNCATE ${tournamentParticipants} CASCADE`);
      await tx.execute(sql`TRUNCATE ${tournaments} CASCADE`);
      await tx.execute(sql`TRUNCATE ${teamMembers} CASCADE`);
      await tx.execute(sql`TRUNCATE ${teams} CASCADE`);
      await tx.execute(sql`TRUNCATE ${users} CASCADE`);

      // Insert users
      console.log('Inserting users...');
      await tx.insert(users).values(sampleUsers);

      // Insert teams
      console.log('Inserting teams...');
      await tx.insert(teams).values(sampleTeams);

      // Insert team members
      console.log('Inserting team members...');
      const teamMembersData = [
        { teamId: 'team-1', userId: 'user-pro-1', role: 'captain' },
        { teamId: 'team-1', userId: 'user-player-4', role: 'player' },
        { teamId: 'team-1', userId: 'user-player-5', role: 'player' },
        { teamId: 'team-1', userId: 'user-player-6', role: 'player' },
        
        { teamId: 'team-2', userId: 'user-pro-2', role: 'captain' },
        { teamId: 'team-2', userId: 'user-player-7', role: 'player' },
        { teamId: 'team-2', userId: 'user-player-8', role: 'player' },
        
        { teamId: 'team-3', userId: 'user-player-3', role: 'captain' },
        
        { teamId: 'team-4', userId: 'user-player-7', role: 'captain' },
        
        { teamId: 'team-5', userId: 'user-player-9', role: 'captain' },
        { teamId: 'team-5', userId: 'user-player-10', role: 'player' },
        
        { teamId: 'team-6', userId: 'user-player-10', role: 'captain' }
      ];
      await tx.insert(teamMembers).values(teamMembersData);

      // Insert tournaments
      console.log('Inserting tournaments...');
      await tx.insert(tournaments).values(sampleTournaments);

      // Insert tournament participants
      console.log('Inserting tournament participants...');
      const participantsData = [
        // Tournament 1 participants (upcoming)
        { tournamentId: 'tournament-1', userId: 'user-pro-1', teamId: 'team-1', paymentStatus: 'completed' },
        { tournamentId: 'tournament-1', userId: 'user-pro-2', teamId: 'team-2', paymentStatus: 'completed' },
        { tournamentId: 'tournament-1', userId: 'user-player-3', teamId: 'team-3', paymentStatus: 'completed' },
        { tournamentId: 'tournament-1', userId: 'user-player-7', teamId: 'team-4', paymentStatus: 'failed' },
        { tournamentId: 'tournament-1', userId: 'user-player-9', teamId: 'team-5', paymentStatus: 'refunded' },
        
        // Tournament 2 participants (live)
        { tournamentId: 'tournament-2', userId: 'user-pro-1', teamId: 'team-1', paymentStatus: 'completed' },
        { tournamentId: 'tournament-2', userId: 'user-pro-2', teamId: 'team-2', paymentStatus: 'completed' },
        { tournamentId: 'tournament-2', userId: 'user-player-3', teamId: 'team-3', paymentStatus: 'completed' },
        
        // Tournament 3 participants (completed)
        { tournamentId: 'tournament-3', userId: 'user-pro-1', teamId: 'team-1', paymentStatus: 'completed' },
        { tournamentId: 'tournament-3', userId: 'user-pro-2', teamId: 'team-2', paymentStatus: 'completed' },
        { tournamentId: 'tournament-3', userId: 'user-player-3', teamId: 'team-3', paymentStatus: 'completed' },
        { tournamentId: 'tournament-3', userId: 'user-player-7', teamId: 'team-4', paymentStatus: 'completed' },
        
        // Tournament 5 participants (completed)
        { tournamentId: 'tournament-5', userId: 'user-pro-1', teamId: 'team-1', paymentStatus: 'completed' },
        { tournamentId: 'tournament-5', userId: 'user-pro-2', teamId: 'team-2', paymentStatus: 'completed' },
        { tournamentId: 'tournament-5', userId: 'user-player-3', teamId: 'team-3', paymentStatus: 'completed' },
        { tournamentId: 'tournament-5', userId: 'user-player-7', teamId: 'team-4', paymentStatus: 'completed' },
        { tournamentId: 'tournament-5', userId: 'user-player-9', teamId: 'team-5', paymentStatus: 'completed' },
        { tournamentId: 'tournament-5', userId: 'user-player-10', teamId: 'team-6', paymentStatus: 'completed' }
      ];
      await tx.insert(tournamentParticipants).values(participantsData);

      // Insert matches
      console.log('Inserting matches...');
      await tx.insert(matches).values(sampleMatches);

      // Insert wallet transactions
      console.log('Inserting wallet transactions...');
      const transactionsData = [
        { userId: 'user-pro-1', type: 'deposit', amount: '1000.00', status: 'completed', description: 'Wallet top-up via UPI' },
        { userId: 'user-pro-1', type: 'tournament_entry', amount: '-500.00', status: 'completed', description: 'Entry fee for BGMI Winter Championship', tournamentId: 'tournament-1' },
        { userId: 'user-pro-1', type: 'prize_payout', amount: '1000.00', status: 'completed', description: 'Prize for Newbie Championship - Team Win' },
        
        { userId: 'user-pro-2', type: 'deposit', amount: '1500.00', status: 'completed', description: 'Wallet top-up via Credit Card' },
        { userId: 'user-pro-2', type: 'tournament_entry', amount: '-100.00', status: 'completed', description: 'Entry fee for Friday Night Showdown', tournamentId: 'tournament-2' },
        { userId: 'user-pro-2', type: 'prize_payout', amount: '600.00', status: 'completed', description: 'Prize for Newbie Championship - 2nd Place' },
        
        { userId: 'user-player-3', type: 'deposit', amount: '800.00', status: 'completed', description: 'Wallet top-up via UPI' },
        { userId: 'user-player-3', type: 'tournament_entry', amount: '-50.00', status: 'completed', description: 'Entry fee for Newbie Championship', tournamentId: 'tournament-3' },
        { userId: 'user-player-3', type: 'prize_payout', amount: '400.00', status: 'completed', description: 'Prize for Newbie Championship - 3rd Place' },
        
        { userId: 'user-player-7', type: 'deposit', amount: '2000.00', status: 'completed', description: 'Wallet top-up via Bank Transfer' },
        { userId: 'user-player-7', type: 'withdrawal', amount: '-500.00', status: 'pending', description: 'Withdrawal to bank account' },
        { userId: 'user-player-7', type: 'tournament_entry', amount: '-200.00', status: 'failed', description: 'Entry fee for Monthly Masters Cup - Payment failed', tournamentId: 'tournament-5' },
        
        { userId: 'user-player-9', type: 'deposit', amount: '1200.00', status: 'completed', description: 'Wallet top-up via UPI' },
        { userId: 'user-player-9', type: 'prize_payout', amount: '7500.00', status: 'completed', description: 'Prize for Monthly Masters Cup - 1st Place' },
        
        { userId: 'user-player-10', type: 'deposit', amount: '2000.00', status: 'completed', description: 'Wallet top-up via Credit Card' },
        { userId: 'user-player-10', type: 'prize_payout', amount: '4500.00', status: 'pending', description: 'Prize for Monthly Masters Cup - 2nd Place' },
        
        { userId: 'user-admin-1', type: 'refund', amount: '50.00', status: 'completed', description: 'Tournament cancellation refund', adminId: 'user-admin-1', adminReason: 'Tournament cancelled due to technical issues' }
      ];
      await tx.insert(walletTransactions).values(transactionsData);

      // Insert notifications
      console.log('Inserting notifications...');
      const notificationsData = [
        { userId: 'user-pro-1', title: 'Tournament Win!', message: 'Congratulations! Your team won the Newbie Championship and earned ₹1,000 prize money.', type: 'tournament', isRead: false, data: { tournamentId: 'tournament-3' } },
        { userId: 'user-pro-1', title: 'Registration Confirmed', message: 'Your registration for BGMI Winter Championship 2024 has been confirmed.', type: 'tournament', isRead: false, data: { tournamentId: 'tournament-1' } },
        
        { userId: 'user-pro-2', title: 'Prize Credited', message: 'Prize money of ₹600 has been credited to your wallet for Newbie Championship.', type: 'payment', isRead: false },
        { userId: 'user-pro-2', title: 'Match Starting Soon', message: 'Your match in Friday Night Showdown starts in 10 minutes. Get ready!', type: 'match', isRead: true, data: { matchId: 'match-5' } },
        
        { userId: 'user-player-3', title: 'Great Performance!', message: 'You secured 3rd place in Newbie Championship. Keep it up!', type: 'tournament', isRead: false, data: { tournamentId: 'tournament-3' } },
        
        { userId: 'user-player-7', title: 'Withdrawal Processing', message: 'Your withdrawal request of ₹500 is being processed. Expected completion: 2-3 business days.', type: 'payment', isRead: false },
        { userId: 'user-player-7', title: 'Payment Failed', message: 'Your payment for Monthly Masters Cup failed. Please try again or contact support.', type: 'payment', isRead: true },
        
        { userId: 'user-player-4', title: 'Team Invitation', message: 'You have been added to Shadow Warriors team. Welcome aboard!', type: 'system', isRead: true },
        
        { userId: 'user-player-8', title: 'Account Suspended', message: 'Your account has been temporarily suspended. Please contact support for details.', type: 'system', isRead: false },
        
        { userId: 'user-player-9', title: 'Champion Alert!', message: 'Amazing! You won the Monthly Masters Cup with Dragon Fury. Prize: ₹7,500!', type: 'tournament', isRead: false, data: { tournamentId: 'tournament-5' } },
        
        { userId: 'user-player-10', title: 'Prize Pending', message: 'Your prize money of ₹4,500 for Monthly Masters Cup is being processed.', type: 'payment', isRead: false },
        
        { userId: 'user-player-6', title: 'KYC Rejected', message: 'Your KYC verification was rejected. Please resubmit with correct documents.', type: 'system', isRead: false }
      ];
      await tx.insert(notifications).values(notificationsData);

      // Insert support tickets
      console.log('Inserting support tickets...');
      const supportTicketsData = [
        {
          id: 'ticket-1',
          userId: 'user-player-6',
          subject: 'KYC Rejection Appeal',
          description: 'My KYC verification was rejected but I believe my documents are correct. I have uploaded clear photos of my Aadhar card and PAN card. Please review again.',
          category: 'account',
          status: 'in_progress',
          priority: 'medium',
          assignedToId: 'user-admin-1',
          attachments: ['https://example.com/docs/aadhar.jpg', 'https://example.com/docs/pan.jpg']
        },
        {
          id: 'ticket-2',
          userId: 'user-player-7',
          subject: 'Tournament Entry Payment Issue',
          description: 'I tried to pay the entry fee for Monthly Masters Cup but the payment failed multiple times. My wallet has sufficient balance. Please help.',
          category: 'payment',
          status: 'resolved',
          priority: 'high',
          assignedToId: 'user-admin-1'
        },
        {
          id: 'ticket-3',
          userId: 'user-player-8',
          subject: 'Account Suspension Appeal',
          description: 'My account was suspended but I have not violated any rules. I was just playing normally. Please review my case and lift the suspension.',
          category: 'account',
          status: 'open',
          priority: 'high'
        },
        {
          id: 'ticket-4',
          userId: 'user-player-4',
          subject: 'Cannot Join Tournament',
          description: 'I am getting an error when trying to register for tournaments. It says "Team full" but my team only has 3 players.',
          category: 'technical',
          status: 'closed',
          priority: 'low',
          assignedToId: 'user-admin-1'
        },
        {
          id: 'ticket-5',
          userId: 'user-player-10',
          subject: 'Prize Money Delay',
          description: 'I won 2nd place in Monthly Masters Cup 2 days ago but still haven\'t received my prize money. The status shows pending.',
          category: 'payment',
          status: 'in_progress',
          priority: 'medium',
          assignedToId: 'user-admin-1'
        }
      ];
      await tx.insert(supportTickets).values(supportTicketsData);

      // Insert ticket messages
      console.log('Inserting ticket messages...');
      const ticketMessagesData = [
        {
          ticketId: 'ticket-1',
          senderId: 'user-player-6',
          message: 'Please let me know what was wrong with my documents so I can fix it.',
          attachments: null
        },
        {
          ticketId: 'ticket-1',
          senderId: 'user-admin-1',
          message: 'Hi, we reviewed your documents. The Aadhar card image is blurry. Please upload a clearer image.',
          attachments: null
        },
        {
          ticketId: 'ticket-2',
          senderId: 'user-admin-1',
          message: 'This has been resolved. The issue was with payment gateway. Your account has been credited for the failed transaction.',
          attachments: null
        },
        {
          ticketId: 'ticket-4',
          senderId: 'user-admin-1',
          message: 'This was a bug in our system. It has been fixed. You should now be able to register for tournaments.',
          attachments: null
        },
        {
          ticketId: 'ticket-5',
          senderId: 'user-admin-1',
          message: 'We are processing your prize payment. It should be credited within 24 hours. Sorry for the delay.',
          attachments: null
        }
      ];
      await tx.insert(ticketMessages).values(ticketMessagesData);

      // Insert match reports
      console.log('Inserting match reports...');
      const matchReportsData = [
        { matchId: 'match-1', reporterId: 'user-pro-1', screenshotUrl: 'https://picsum.photos/800/600?random=101', kills: 12, placement: 1, points: 22, verificationStatus: 'verified', adminNotes: 'Excellent team performance, verified through video replay.' },
        { matchId: 'match-1', reporterId: 'user-pro-2', screenshotUrl: 'https://picsum.photos/800/600?random=102', kills: 8, placement: 2, points: 18, verificationStatus: 'verified' },
        { matchId: 'match-2', reporterId: 'user-pro-2', screenshotUrl: 'https://picsum.photos/800/600?random=103', kills: 15, placement: 1, points: 25, verificationStatus: 'verified', adminNotes: 'Outstanding clutch performance in final circle.' },
        { matchId: 'match-3', reporterId: 'user-player-9', screenshotUrl: 'https://picsum.photos/800/600?random=104', kills: 18, placement: 1, points: 28, verificationStatus: 'verified', adminNotes: 'Dominant performance with highest kill count.' },
        { matchId: 'match-4', reporterId: 'user-player-10', screenshotUrl: 'https://picsum.photos/800/600?random=105', kills: 16, placement: 1, points: 26, verificationStatus: 'pending' }
      ];
      await tx.insert(matchReports).values(matchReportsData);

      console.log('✅ Database seeding completed successfully within transaction!');
    });

    console.log(`
📊 Comprehensive seeded data summary:
- Users: ${sampleUsers.length} (including admin, verified, pending KYC, rejected KYC, banned)
- Teams: ${sampleTeams.length} (with complete member rosters)
- Tournaments: ${sampleTournaments.length} (upcoming, live, completed, cancelled)
- Tournament Participants: Multiple registrations across tournaments
- Matches: ${sampleMatches.length} (with team-based results)
- Wallet Transactions: 17 (deposits, withdrawals, entries, prizes, refunds - all statuses)
- Notifications: 12 (all types: tournament, payment, system, match - read/unread)
- Support Tickets: 5 (all statuses and priorities)
- Ticket Messages: 6 (admin and user conversations)
- Match Reports: 5 (verified and pending)

🎯 All pages now have realistic, comprehensive data for testing:
- Leaderboards with multiple tournaments and varied rankings
- User profiles with different statuses and histories  
- Admin dashboard with complete statistics and pending actions
- Wallet management with all transaction types
- Support system with tickets and conversations
    `);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}