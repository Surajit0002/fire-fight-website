import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, Eye, Users, Clock } from "lucide-react";

interface LiveMatchCardProps {
  match: {
    id: string;
    tournament: {
      id: string;
      title: string;
      game: string;
      prizePool: string;
    };
    matchNumber: number;
    status: string;
    startTime: string;
    results?: any;
  };
}

export default function LiveMatchCard({ match }: LiveMatchCardProps) {
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

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const start = new Date(dateString);
    const diffMs = now.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just started';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ${diffMins % 60}m ago`;
  };

  return (
    <Card className="bg-card rounded-xl p-0 overflow-hidden border border-border glass-effect" data-testid={`live-match-${match.id}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 ${getGradientClass(match.tournament.game)} rounded-lg flex items-center justify-center`}>
              <Target className="w-6 h-6 text-black" />
            </div>
            <div>
              <h3 className="font-bold" data-testid={`match-title-${match.id}`}>
                {match.tournament.title}
              </h3>
              <p className="text-sm text-muted-foreground" data-testid={`match-info-${match.id}`}>
                Match {match.matchNumber} • {match.tournament.game}
              </p>
            </div>
          </div>
          <Badge className="bg-destructive/20 text-destructive flex items-center gap-2" data-testid={`match-status-${match.id}`}>
            <span className="w-2 h-2 bg-destructive rounded-full animate-pulse"></span>
            LIVE
          </Badge>
        </div>
        
        {/* Match Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center">
            <div className="font-bold text-primary" data-testid={`match-prize-${match.id}`}>
              ₹{parseFloat(match.tournament.prizePool).toLocaleString('en-IN')}
            </div>
            <div className="text-sm text-muted-foreground">Prize Pool</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-accent" data-testid={`match-duration-${match.id}`}>
              {formatTimeAgo(match.startTime)}
            </div>
            <div className="text-sm text-muted-foreground">Duration</div>
          </div>
        </div>
        
        {/* Live Stats */}
        <div className="bg-muted/30 rounded-lg p-3 mb-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-primary" data-testid={`teams-alive-${match.id}`}>
                12
              </div>
              <div className="text-xs text-muted-foreground">Teams Alive</div>
            </div>
            <div>
              <div className="text-lg font-bold text-accent" data-testid={`viewers-${match.id}`}>
                2.1K
              </div>
              <div className="text-xs text-muted-foreground">Viewers</div>
            </div>
            <div>
              <div className="text-lg font-bold text-destructive" data-testid={`zone-timer-${match.id}`}>
                1:23
              </div>
              <div className="text-xs text-muted-foreground">Zone Timer</div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Live updates • Real-time scoring
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              data-testid={`view-details-${match.id}`}
            >
              <Users className="w-4 h-4 mr-1" />
              Details
            </Button>
            <Button 
              className={`${getGradientClass(match.tournament.game)} text-black font-medium`}
              size="sm"
              data-testid={`watch-live-${match.id}`}
            >
              <Eye className="w-4 h-4 mr-1" />
              Watch Live
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
