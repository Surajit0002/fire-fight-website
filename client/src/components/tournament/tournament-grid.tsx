
import { useEffect, useState } from "react";
import TournamentCard from "./tournament-card";

interface Tournament {
  id: string;
  title: string;
  game: string;
  gameMode: string | null;
  entryFee: string;
  prizePool: string;
  maxParticipants: number;
  currentParticipants: number | null;
  startTime: string | Date | null;
  status: string;
  imageUrl?: string | null;
}

interface TournamentGridProps {
  tournaments: Tournament[];
  variant?: 'default' | 'wide' | 'compact' | 'large' | 'mixed';
  className?: string;
}

export default function TournamentGrid({ 
  tournaments, 
  variant = 'default',
  className = "" 
}: TournamentGridProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  const getGridClasses = () => {
    switch (variant) {
      case 'wide':
        return 'grid grid-cols-1 lg:grid-cols-2 gap-6';
      case 'compact':
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4';
      case 'large':
        return 'grid grid-cols-1 gap-8';
      case 'mixed':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
      default:
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6';
    }
  };

  const getCardVariant = (index: number) => {
    if (variant === 'mixed') {
      // Mix different card sizes for visual variety
      if (index % 5 === 0) return 'large';
      if (index % 3 === 0) return 'wide';
      if (index % 2 === 0) return 'compact';
      return 'default';
    }
    return variant;
  };

  if (isLoading) {
    return (
      <div className={`${getGridClasses()} ${className}`}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl animate-pulse"
            style={{
              height: variant === 'compact' ? '280px' : 
                     variant === 'wide' || variant === 'large' ? '200px' : 
                     '420px'
            }}
          />
        ))}
      </div>
    );
  }

  if (!tournaments || tournaments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🏆</div>
        <h3 className="text-xl font-bold text-white mb-2">No Tournaments Found</h3>
        <p className="text-gray-400">Check back later for exciting tournaments!</p>
      </div>
    );
  }

  return (
    <div className={`${getGridClasses()} ${className}`}>
      {tournaments.map((tournament, index) => (
        <div
          key={tournament.id}
          className="tournament-card-stagger"
          style={{
            animationDelay: `${index * 100}ms`,
          }}
        >
          <TournamentCard 
            tournament={tournament} 
            variant={getCardVariant(index)}
          />
        </div>
      ))}
    </div>
  );
}
