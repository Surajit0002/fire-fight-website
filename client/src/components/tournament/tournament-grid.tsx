import TournamentCard from "./tournament-card";

interface TournamentGridProps {
  tournaments: any[];
}

export default function TournamentGrid({ tournaments }: TournamentGridProps) {
  if (!tournaments || tournaments.length === 0) {
    return (
      <div className="text-center py-12" data-testid="empty-tournaments">
        <div className="text-muted-foreground mb-4">No tournaments available</div>
        <p className="text-sm text-muted-foreground">Check back later for new tournaments!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="tournament-grid">
      {tournaments.map((tournament) => (
        <TournamentCard key={tournament.id} tournament={tournament} />
      ))}
    </div>
  );
}
