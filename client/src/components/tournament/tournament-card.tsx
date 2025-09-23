
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Clock, Users, Trophy, MapPin, Zap, Eye, Star, Calendar, DollarSign, GamepadIcon, Timer } from "lucide-react";
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
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'live':
        return {
          color: 'bg-red-500 text-white',
          text: 'LIVE',
          icon: '🔴',
          pulse: true
        };
      case 'upcoming':
        return {
          color: 'bg-blue-500 text-white',
          text: 'UPCOMING',
          icon: '⏳',
          pulse: false
        };
      case 'completed':
        return {
          color: 'bg-gray-500 text-white',
          text: 'FINISHED',
          icon: '✅',
          pulse: false
        };
      default:
        return {
          color: 'bg-green-500 text-white',
          text: 'OPEN',
          icon: '🎮',
          pulse: false
        };
    }
  };

  const getGameColor = (game: string) => {
    const gameColors: Record<string, string> = {
      'bgmi': 'from-orange-400 to-red-500',
      'free fire': 'from-blue-400 to-purple-500',
      'cod mobile': 'from-yellow-400 to-orange-500',
      'valorant': 'from-red-400 to-pink-500',
      'pubg mobile': 'from-green-400 to-teal-500'
    };
    return gameColors[game.toLowerCase()] || 'from-primary to-accent';
  };

  const formatDateTime = (dateString: string | Date | null) => {
    if (!dateString) return { date: 'TBD', time: 'TBD' };
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return {
        date: `${diffDays}d`,
        time: date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      };
    } else if (diffHours > 0) {
      return {
        date: `${diffHours}h`,
        time: 'left'
      };
    } else {
      return {
        date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        time: date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      };
    }
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const slotsLeft = tournament.maxParticipants - (tournament.currentParticipants || 0);
  const fillPercentage = ((tournament.currentParticipants || 0) / tournament.maxParticipants) * 100;
  const isFull = slotsLeft <= 0;
  const isCompleted = tournament.status === 'completed';
  const statusConfig = getStatusConfig(tournament.status);
  const gameGradient = getGameColor(tournament.game);
  const dateTime = formatDateTime(tournament.startTime);

  return (
    <Card className="group relative overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl h-full">
      {/* Status Badge */}
      <div className="absolute top-3 right-3 z-10">
        <Badge className={`${statusConfig.color} text-xs font-bold px-2 py-1 ${statusConfig.pulse ? 'animate-pulse' : ''}`}>
          {statusConfig.icon} {statusConfig.text}
        </Badge>
      </div>

      {/* Header with Game Info */}
      <CardHeader className="pb-3 pt-4">
        <div className="flex items-start gap-3">
          {/* Game Icon */}
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gameGradient} flex items-center justify-center shadow-lg`}>
            <GamepadIcon className="w-6 h-6 text-white" />
          </div>
          
          {/* Tournament Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm line-clamp-2 group-hover:text-primary transition-colors" data-testid={`title-${tournament.id}`}>
              {tournament.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground font-medium">{tournament.game}</span>
              <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
              <span className="text-xs text-muted-foreground">{tournament.gameMode || 'Squad'}</span>
            </div>
            {tournament.mapName && (
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{tournament.mapName}</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-4 space-y-4">
        {/* Prize Pool & Entry Fee */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-primary/10 rounded-lg p-3 text-center border border-primary/20">
            <Trophy className="w-4 h-4 mx-auto mb-1 text-primary" />
            <div className="text-lg font-bold text-primary" data-testid={`prize-${tournament.id}`}>
              {formatCurrency(tournament.prizePool)}
            </div>
            <div className="text-xs text-muted-foreground">Prize Pool</div>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-3 text-center border border-muted">
            <DollarSign className="w-4 h-4 mx-auto mb-1 text-foreground" />
            <div className="text-sm font-semibold" data-testid={`entry-${tournament.id}`}>
              {parseFloat(tournament.entryFee) === 0 ? (
                <span className="text-green-500 font-bold">FREE</span>
              ) : (
                formatCurrency(tournament.entryFee)
              )}
            </div>
            <div className="text-xs text-muted-foreground">Entry Fee</div>
          </div>
        </div>

        {/* Participants & Time */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 bg-muted/30 rounded-lg p-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium" data-testid={`participants-${tournament.id}`}>
                {tournament.currentParticipants || 0}/{tournament.maxParticipants}
              </div>
              <div className="text-xs text-muted-foreground">Players</div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-muted/30 rounded-lg p-2">
            <Timer className="w-4 h-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium" data-testid={`time-${tournament.id}`}>
                {dateTime.date}
              </div>
              <div className="text-xs text-muted-foreground">{dateTime.time}</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Slots filled</span>
            <span className="font-medium">{Math.round(fillPercentage)}%</span>
          </div>
          <div className="w-full bg-muted/50 rounded-full h-2">
            <div 
              className={`h-full bg-gradient-to-r ${gameGradient} rounded-full transition-all duration-500`}
              style={{ width: `${fillPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Action Button */}
        <Link href={`/tournaments/${tournament.id}`}>
          <Button 
            className={`
              w-full text-sm font-bold py-2 transition-all duration-300
              ${isCompleted 
                ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                : isFull
                ? 'bg-destructive hover:bg-destructive/90 text-white'
                : `bg-gradient-to-r ${gameGradient} text-white hover:shadow-lg`
              }
            `}
            size="sm"
            disabled={isCompleted}
            data-testid={`action-button-${tournament.id}`}
          >
            {isCompleted ? (
              <>
                <Eye className="w-4 h-4 mr-1" />
                View Results
              </>
            ) : isFull ? (
              <>
                <Users className="w-4 h-4 mr-1" />
                Full
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-1" />
                Join Now
                {slotsLeft <= 5 && slotsLeft > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs bg-white/20 text-white">
                    {slotsLeft} left
                  </Badge>
                )}
              </>
            )}
          </Button>
        </Link>
      </CardContent>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </Card>
  );
}
