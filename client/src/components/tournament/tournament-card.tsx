import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Users, Trophy, MapPin } from "lucide-react";
import { Link } from "wouter";

interface TournamentCardProps {
  tournament: {
    id: string;
    title: string;
    game: string;
    gameMode: string | null;
    mapName?: string | null;
    entryFee: string;
    prizePool: string;
    maxParticipants: number;
    currentParticipants: number | null;
    startTime: string | Date | null;
    status: string;
    imageUrl?: string | null;
  };
}

export default function TournamentCard({ tournament }: TournamentCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-destructive/20 text-destructive';
      case 'upcoming':
        return 'bg-primary/20 text-primary';
      case 'completed':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-accent/20 text-accent';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'live':
        return 'LIVE NOW';
      case 'upcoming':
        return 'STARTING SOON';
      case 'completed':
        return 'COMPLETED';
      default:
        return 'REGISTRATION';
    }
  };

  const getGradientClass = (game: string) => {
    switch (game.toLowerCase()) {
      case 'bgmi':
        return 'gradient-fire';
      case 'free fire':
        return 'gradient-electric';
      case 'cod mobile':
        return 'gradient-victory';
      default:
        return 'gradient-fire';
    }
  };

  const formatDateTime = (dateString: string | Date | null) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const slotsLeft = tournament.maxParticipants - (tournament.currentParticipants || 0);
  const isFull = slotsLeft <= 0;
  const isCompleted = tournament.status === 'completed';

  return (
    <Card className="tournament-card rounded-xl p-0 overflow-hidden group cursor-pointer border border-border" data-testid={`tournament-card-${tournament.id}`}>
      {/* Tournament Image */}
      <div className="relative h-48 bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden">
        {tournament.imageUrl ? (
          <img 
            src={tournament.imageUrl} 
            alt={tournament.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className={`w-full h-full ${getGradientClass(tournament.game)} flex items-center justify-center`}>
            <Trophy className="w-16 h-16 text-black/30" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <Badge className={`${getStatusColor(tournament.status)} font-medium`} data-testid={`status-${tournament.id}`}>
            {tournament.status === 'live' && (
              <span className="w-2 h-2 bg-current rounded-full animate-pulse mr-2"></span>
            )}
            {getStatusText(tournament.status)}
          </Badge>
        </div>

        {/* Slots Indicator */}
        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="font-mono text-xs" data-testid={`slots-${tournament.id}`}>
            {tournament.currentParticipants || 0}/{tournament.maxParticipants}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-5">
        {/* Tournament Title */}
        <h3 className="font-bold text-lg mb-2 line-clamp-1" data-testid={`title-${tournament.id}`}>
          {tournament.title}
        </h3>
        
        {/* Game Info */}
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
          <span>{tournament.gameMode || 'Squad'}</span>
          {tournament.mapName && (
            <>
              <span>•</span>
              <MapPin className="w-3 h-3" />
              <span>{tournament.mapName}</span>
            </>
          )}
        </div>
        
        {/* Prize and Entry */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className={`text-2xl font-bold bg-clip-text text-transparent ${getGradientClass(tournament.game)}`} data-testid={`prize-${tournament.id}`}>
              ₹{parseFloat(tournament.prizePool).toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-muted-foreground">Prize Pool</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold" data-testid={`entry-${tournament.id}`}>
              {parseFloat(tournament.entryFee) === 0 ? (
                <span className="text-accent">FREE</span>
              ) : (
                `₹${parseFloat(tournament.entryFee).toLocaleString('en-IN')}`
              )}
            </div>
            <div className="text-xs text-muted-foreground">Entry Fee</div>
          </div>
        </div>
        
        {/* Start Time */}
        <div className="bg-muted/30 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Clock className="w-3 h-3" />
            {tournament.status === 'completed' ? 'Completed' : 'Starts'}
          </div>
          <div className="font-mono text-sm font-bold" data-testid={`time-${tournament.id}`}>
            {formatDateTime(tournament.startTime)}
          </div>
        </div>
        
        {/* Action Button */}
        <Link href={`/tournaments/${tournament.id}`}>
          <Button 
            className={`w-full font-bold py-3 transition-transform hover:scale-105 ${
              isCompleted 
                ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                : isFull
                ? 'bg-destructive hover:bg-destructive/80 text-destructive-foreground'
                : `${getGradientClass(tournament.game)} text-black`
            }`}
            disabled={isCompleted}
            data-testid={`action-button-${tournament.id}`}
          >
            {isCompleted 
              ? 'View Results' 
              : isFull 
              ? 'Tournament Full' 
              : parseFloat(tournament.entryFee) === 0 
              ? 'Join Free' 
              : 'Join Tournament'
            }
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
