import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Crown, 
  Medal, 
  Star, 
  Trophy,
  TrendingUp,
  Users
} from "lucide-react";

interface PlayerRankCardProps {
  player: {
    id: string;
    username: string;
    rank: number;
    points: number;
    wins: number;
    totalEarnings: number;
    gamesPlayed: number;
    winRate: number;
    game?: string;
    profileImageUrl?: string;
    isTeam: boolean;
    badge?: string;
  };
}

export default function PlayerRankCard({ player }: PlayerRankCardProps) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-primary" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-accent" />;
    if (rank === 3) return <Star className="w-5 h-5 text-green-500" />;
    return null;
  };

  const getRankStyle = (rank: number) => {
    if (rank <= 3) return "text-primary font-bold";
    if (rank <= 10) return "text-accent font-semibold";
    return "text-muted-foreground";
  };

  const getBadgeColor = (rank: number) => {
    if (rank === 1) return "bg-primary/20 text-primary";
    if (rank === 2) return "bg-accent/20 text-accent";
    if (rank === 3) return "bg-green-500/20 text-green-500";
    if (rank <= 10) return "bg-muted text-muted-foreground";
    return "";
  };

  return (
    <Card 
      className="bg-card border-border hover:border-primary/30 transition-all duration-200 hover:shadow-lg"
      data-testid={`player-rank-${player.rank}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Rank */}
          <div className="flex items-center gap-2 min-w-0">
            <div className={`text-2xl font-bold ${getRankStyle(player.rank)} min-w-[2rem] text-center`}>
              #{player.rank}
            </div>
            {getRankIcon(player.rank)}
          </div>

          {/* Player Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="w-12 h-12 border-2 border-border">
              <AvatarImage src={player.profileImageUrl} alt={player.username} />
              <AvatarFallback className="bg-gradient-fire text-black font-bold">
                {player.isTeam ? (
                  <Users className="w-6 h-6" />
                ) : (
                  player.username.charAt(0).toUpperCase()
                )}
              </AvatarFallback>
            </Avatar>
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg truncate" data-testid={`player-name-${player.rank}`}>
                  {player.username}
                </h3>
                {player.isTeam && (
                  <Badge variant="secondary" className="text-xs">
                    Team
                  </Badge>
                )}
                {player.rank <= 10 && (
                  <Badge className={getBadgeColor(player.rank)}>
                    Top {player.rank <= 3 ? '3' : '10'}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{player.game || 'All Games'}</span>
                <span>•</span>
                <span>{player.gamesPlayed} games</span>
                <span>•</span>
                <span>{player.winRate}% win rate</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="hidden md:flex items-center gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-primary" data-testid={`player-points-${player.rank}`}>
                {player.points.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Points</div>
            </div>
            <div>
              <div className="text-xl font-semibold text-accent" data-testid={`player-wins-${player.rank}`}>
                {player.wins}
              </div>
              <div className="text-xs text-muted-foreground">Wins</div>
            </div>
            <div>
              <div className="text-lg font-medium text-green-500" data-testid={`player-earnings-${player.rank}`}>
                ₹{player.totalEarnings.toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-muted-foreground">Earned</div>
            </div>
          </div>

          {/* Action */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              data-testid={`view-profile-${player.rank}`}
            >
              View Profile
            </Button>
            {player.rank <= 3 && (
              <div className="animate-pulse-glow">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
            )}
          </div>
        </div>

        {/* Mobile Stats */}
        <div className="md:hidden mt-4 pt-4 border-t border-border">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-primary">
                {player.points.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Points</div>
            </div>
            <div>
              <div className="text-xl font-semibold text-accent">
                {player.wins}
              </div>
              <div className="text-xs text-muted-foreground">Wins</div>
            </div>
            <div>
              <div className="text-lg font-medium text-green-500">
                ₹{player.totalEarnings.toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-muted-foreground">Earned</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
