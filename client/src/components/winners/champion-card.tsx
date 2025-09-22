import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, Users } from "lucide-react";

interface ChampionCardProps {
  winner: {
    winnerId?: string;
    winnerTeamId?: string;
    tournamentTitle: string;
    prizePool: string;
    game: string;
    endTime: string;
  };
  position: number;
}

export default function ChampionCard({ winner, position }: ChampionCardProps) {
  const getGradientClass = (pos: number) => {
    switch (pos) {
      case 1:
        return 'from-primary/10 to-primary/5 border-primary/20';
      case 2:
        return 'from-accent/10 to-accent/5 border-accent/20';
      case 3:
        return 'from-destructive/10 to-destructive/5 border-destructive/20';
      default:
        return 'from-muted/10 to-muted/5 border-muted/20';
    }
  };

  const getPositionBadge = (pos: number) => {
    switch (pos) {
      case 1:
        return { emoji: '🥇', class: 'gradient-fire' };
      case 2:
        return { emoji: '🥈', class: 'gradient-electric' };
      case 3:
        return { emoji: '🥉', class: 'gradient-victory' };
      default:
        return { emoji: '🏆', class: 'bg-muted' };
    }
  };

  const getPositionColor = (pos: number) => {
    switch (pos) {
      case 1:
        return 'text-primary';
      case 2:
        return 'text-accent';
      case 3:
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const end = new Date(dateString);
    const diffMs = now.getTime() - end.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return 'Recently';
  };

  const positionBadge = getPositionBadge(position);

  return (
    <Card className={`bg-gradient-to-br ${getGradientClass(position)} rounded-xl border`} data-testid={`champion-card-${position}`}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-16 h-16 ${positionBadge.class} rounded-full flex items-center justify-center text-2xl font-bold text-black`}>
            {positionBadge.emoji}
          </div>
          <div>
            <div className="font-bold text-lg" data-testid={`winner-name-${position}`}>
              {winner.winnerTeamId ? 'Team Victory' : 'Solo Champion'}
            </div>
            <div className="text-sm text-muted-foreground" data-testid={`tournament-name-${position}`}>
              {winner.tournamentTitle}
            </div>
            <Badge variant="secondary" className="mt-1">
              {winner.game}
            </Badge>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Prize Won</span>
            <div className="text-right">
              <div className={`text-2xl font-bold ${getPositionColor(position)}`} data-testid={`prize-amount-${position}`}>
                ₹{parseFloat(winner.prizePool).toLocaleString('en-IN')}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Completed</span>
            <div className="text-right">
              <div className="text-sm font-medium flex items-center gap-1" data-testid={`completion-time-${position}`}>
                <Clock className="w-3 h-3" />
                {formatTimeAgo(winner.endTime)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Type</span>
            <div className="text-right">
              <div className="text-sm font-medium flex items-center gap-1">
                {winner.winnerTeamId ? (
                  <>
                    <Users className="w-3 h-3" />
                    Team Tournament
                  </>
                ) : (
                  <>
                    <Trophy className="w-3 h-3" />
                    Solo Tournament
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
