
import TournamentCard from "./tournament-card";
import type { Tournament } from "@shared/schema";

interface TournamentGridProps {
  tournaments: Tournament[];
}

export default function TournamentGrid({ tournaments }: TournamentGridProps) {
  if (!tournaments || tournaments.length === 0) {
    return (
      <div className="text-center py-20" data-testid="empty-tournaments">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-3 text-foreground">No tournaments available</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Check back later for new tournaments! We're constantly adding exciting new competitions for you to join.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Grid Container with Stagger Animation */}
      <div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 lg:gap-8" 
        data-testid="tournament-grid"
      >
        {tournaments.map((tournament, index) => (
          <div 
            key={tournament.id}
            className="animate-fade-in-up"
            style={{ 
              animationDelay: `${index * 100}ms`,
              animationFillMode: 'both'
            }}
          >
            <TournamentCard tournament={tournament} />
          </div>
        ))}
      </div>

      {/* Grid Stats */}
      {tournaments.length > 0 && (
        <div className="flex justify-center pt-8 border-t border-border/50">
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>{tournaments.length} tournaments displayed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live updates enabled</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
