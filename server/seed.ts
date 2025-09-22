
import { db } from "./db";
import { tournaments, users, tournamentParticipants, matches, walletTransactions } from "@shared/schema";

export async function seedDatabase() {
  console.log("Starting database seeding...");

  // Create sample tournaments
  const sampleTournaments = [
    {
      title: "BGMI World Championship 2024",
      description: "The ultimate BGMI tournament with massive prize pool. Compete against the best players from around the world.",
      game: "BGMI",
      gameMode: "Squad",
      mapName: "Erangel",
      entryFee: "500.00",
      prizePool: "100000.00",
      maxParticipants: 100,
      currentParticipants: 45,
      startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      registrationDeadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
      status: "upcoming" as const,
      rules: "1. No cheating or hacking\n2. Respect other players\n3. Follow tournament schedule\n4. Use only allowed weapons",
      hostId: "admin-user-id",
      imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=400&fit=crop",
      prizeDistribution: [
        { position: 1, amount: 50000, percentage: 50 },
        { position: 2, amount: 30000, percentage: 30 },
        { position: 3, amount: 20000, percentage: 20 }
      ]
    },
    {
      title: "Free Fire Friday Frenzy",
      description: "Weekly Free Fire tournament with instant prizes. Show your skills and win big!",
      game: "Free Fire",
      gameMode: "Solo",
      mapName: "Bermuda",
      entryFee: "0.00",
      prizePool: "25000.00",
      maxParticipants: 50,
      currentParticipants: 23,
      startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      registrationDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: "upcoming" as const,
      rules: "Free entry tournament for all skill levels. Fair play expected.",
      hostId: "admin-user-id",
      imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=400&fit=crop",
      prizeDistribution: [
        { position: 1, amount: 15000, percentage: 60 },
        { position: 2, amount: 7000, percentage: 28 },
        { position: 3, amount: 3000, percentage: 12 }
      ]
    },
    {
      title: "COD Mobile Masters",
      description: "Elite Call of Duty Mobile tournament. Battle Royale mode with high stakes.",
      game: "COD Mobile",
      gameMode: "Battle Royale",
      mapName: "Blackout",
      entryFee: "1000.00",
      prizePool: "200000.00",
      maxParticipants: 80,
      currentParticipants: 67,
      startTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
      registrationDeadline: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
      status: "live" as const,
      rules: "Professional tournament with strict anti-cheat measures.",
      hostId: "admin-user-id",
      imageUrl: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&h=400&fit=crop",
      prizeDistribution: [
        { position: 1, amount: 100000, percentage: 50 },
        { position: 2, amount: 60000, percentage: 30 },
        { position: 3, amount: 40000, percentage: 20 }
      ]
    },
    {
      title: "Valorant Victory Arena",
      description: "Tactical shooter tournament for Valorant enthusiasts. Team-based competition.",
      game: "Valorant",
      gameMode: "Team",
      mapName: "Bind",
      entryFee: "750.00",
      prizePool: "150000.00",
      maxParticipants: 32,
      currentParticipants: 28,
      startTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      registrationDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      status: "upcoming" as const,
      rules: "5v5 team matches. Best of 3 rounds.",
      hostId: "admin-user-id",
      imageUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop",
      prizeDistribution: [
        { position: 1, amount: 75000, percentage: 50 },
        { position: 2, amount: 45000, percentage: 30 },
        { position: 3, amount: 30000, percentage: 20 }
      ]
    },
    {
      title: "BGMI Beginner's Cup",
      description: "Tournament designed for new players. Learn and compete in a friendly environment.",
      game: "BGMI",
      gameMode: "Squad",
      mapName: "Sanhok",
      entryFee: "100.00",
      prizePool: "15000.00",
      maxParticipants: 60,
      currentParticipants: 42,
      startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      registrationDeadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      status: "upcoming" as const,
      rules: "For players with rank below Crown only.",
      hostId: "admin-user-id",
      imageUrl: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800&h=400&fit=crop",
      prizeDistribution: [
        { position: 1, amount: 7500, percentage: 50 },
        { position: 2, amount: 4500, percentage: 30 },
        { position: 3, amount: 3000, percentage: 20 }
      ]
    },
    {
      title: "Free Fire Grand Prix",
      description: "Monthly championship with the biggest prize pool. Only for verified players.",
      game: "Free Fire",
      gameMode: "Squad",
      mapName: "Purgatory",
      entryFee: "2000.00",
      prizePool: "500000.00",
      maxParticipants: 120,
      currentParticipants: 95,
      startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      registrationDeadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      status: "upcoming" as const,
      rules: "KYC verification required. Professional tournament standards.",
      hostId: "admin-user-id",
      imageUrl: "https://images.unsplash.com/photo-1556438064-2d7646166914?w=800&h=400&fit=crop",
      prizeDistribution: [
        { position: 1, amount: 250000, percentage: 50 },
        { position: 2, amount: 150000, percentage: 30 },
        { position: 3, amount: 100000, percentage: 20 }
      ]
    },
    {
      title: "Summer Gaming Festival",
      description: "Multi-game tournament celebrating the gaming community. Multiple game modes available.",
      game: "BGMI",
      gameMode: "Solo",
      mapName: "Karakin",
      entryFee: "300.00",
      prizePool: "75000.00",
      maxParticipants: 100,
      currentParticipants: 100,
      startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (completed)
      registrationDeadline: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      status: "completed" as const,
      rules: "Multi-game celebration tournament.",
      hostId: "admin-user-id",
      imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=400&fit=crop",
      prizeDistribution: [
        { position: 1, amount: 37500, percentage: 50 },
        { position: 2, amount: 22500, percentage: 30 },
        { position: 3, amount: 15000, percentage: 20 }
      ]
    },
    {
      title: "Night Owl Championships",
      description: "Late night tournament for night gamers. Perfect for international players.",
      game: "COD Mobile",
      gameMode: "Multiplayer",
      mapName: "Nuketown",
      entryFee: "400.00",
      prizePool: "60000.00",
      maxParticipants: 64,
      currentParticipants: 58,
      startTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      registrationDeadline: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
      status: "upcoming" as const,
      rules: "Night time tournament starting at 11 PM IST.",
      hostId: "admin-user-id",
      imageUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&h=400&fit=crop",
      prizeDistribution: [
        { position: 1, amount: 30000, percentage: 50 },
        { position: 2, amount: 18000, percentage: 30 },
        { position: 3, amount: 12000, percentage: 20 }
      ]
    }
  ];

  try {
    // Insert tournaments
    for (const tournament of sampleTournaments) {
      await db.insert(tournaments).values(tournament).onConflictDoNothing();
    }

    console.log(`✅ Seeded ${sampleTournaments.length} tournaments`);
    console.log("✅ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log("Seeding finished");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}
