
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Users, Trophy, MapPin, Zap, Eye, Star, Calendar, DollarSign } from "lucide-react";
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
          color: 'bg-red-500/20 text-red-400 border-red-500/30',
          glow: 'shadow-red-500/25',
          text: 'LIVE NOW',
          icon: '🔴',
          pulse: true
        };
      case 'upcoming':
        return {
          color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
          glow: 'shadow-blue-500/25',
          text: 'STARTING SOON',
          icon: '⏰',
          pulse: false
        };
      case 'completed':
        return {
          color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
          glow: 'shadow-gray-500/25',
          text: 'COMPLETED',
          icon: '✅',
          pulse: false
        };
      default:
        return {
          color: 'bg-green-500/20 text-green-400 border-green-500/30',
          glow: 'shadow-green-500/25',
          text: 'REGISTRATION',
          icon: '📝',
          pulse: false
        };
    }
  };

  const getGameConfig = (game: string) => {
    const gameMap: Record<string, any> = {
      'bgmi': {
        gradient: 'from-orange-500 via-red-500 to-pink-500',
        bgGradient: 'from-orange-500/10 via-red-500/10 to-pink-500/10',
        icon: '🎯',
        color: 'text-orange-400'
      },
      'free fire': {
        gradient: 'from-blue-500 via-purple-500 to-indigo-500',
        bgGradient: 'from-blue-500/10 via-purple-500/10 to-indigo-500/10',
        icon: '🔥',
        color: 'text-blue-400'
      },
      'cod mobile': {
        gradient: 'from-yellow-500 via-orange-500 to-red-500',
        bgGradient: 'from-yellow-500/10 via-orange-500/10 to-red-500/10',
        icon: '⚡',
        color: 'text-yellow-400'
      },
      'valorant': {
        gradient: 'from-red-500 via-pink-500 to-purple-500',
        bgGradient: 'from-red-500/10 via-pink-500/10 to-purple-500/10',
        icon: '🎯',
        color: 'text-red-400'
      },
      'pubg mobile': {
        gradient: 'from-green-500 via-teal-500 to-blue-500',
        bgGradient: 'from-green-500/10 via-teal-500/10 to-blue-500/10',
        icon: '🏆',
        color: 'text-green-400'
      }
    };
    
    return gameMap[game.toLowerCase()] || gameMap['bgmi'];
  };

  const formatDateTime = (dateString: string | Date | null) => {
    if (!dateString) return { date: 'TBD', time: 'TBD' };
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    };
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
  const gameConfig = getGameConfig(tournament.game);
  const dateTime = formatDateTime(tournament.startTime);

  return (
    <div className="group relative">
      {/* Glow Effect */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${gameConfig.gradient} rounded-2xl opacity-0 group-hover:opacity-20 blur transition-all duration-500`}></div>
      
      <Card className="relative bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-xl border-border/50 rounded-2xl overflow-hidden group-hover:border-primary/30 transition-all duration-500 transform group-hover:scale-[1.02] group-hover:shadow-2xl">
        {/* Tournament Image/Background */}
        <div className={`relative h-48 sm:h-52 bg-gradient-to-br ${gameConfig.bgGradient} overflow-hidden`}>
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-4 left-4 w-16 h-16 rounded-full border border-white/20 animate-pulse"></div>
              <div className="absolute top-8 right-8 w-8 h-8 rounded-full border border-white/30 animate-bounce" style={{animationDelay: '0.5s'}}></div>
              <div className="absolute bottom-8 left-8 w-12 h-12 rounded-full border border-white/15 animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>
          </div>

          {tournament.imageUrl ? (
            <img 
              src={tournament.imageUrl} 
              alt={tournament.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${gameConfig.gradient} flex items-center justify-center relative overflow-hidden`}>
              <div className="text-6xl opacity-30 group-hover:scale-110 transition-transform duration-500">
                {gameConfig.icon}
              </div>
              <Trophy className="absolute bottom-4 right-4 w-8 h-8 text-white/20 group-hover:text-white/40 transition-colors" />
            </div>
          )}
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

          {/* Top Section - Status & Slots */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            <Badge className={`${statusConfig.color} border font-medium backdrop-blur-sm shadow-lg ${statusConfig.glow}`} data-testid={`status-${tournament.id}`}>
              <span className="mr-2">{statusConfig.icon}</span>
              {statusConfig.pulse && (
                <span className="w-2 h-2 bg-current rounded-full animate-pulse mr-2"></span>
              )}
              {statusConfig.text}
            </Badge>

            <div className="flex gap-2">
              <Badge variant="secondary" className="backdrop-blur-sm bg-black/40 text-white border-white/20" data-testid={`slots-${tournament.id}`}>
                <Users className="w-3 h-3 mr-1" />
                {tournament.currentParticipants || 0}/{tournament.maxParticipants}
              </Badge>
            </div>
          </div>

          {/* Bottom Section - Game Info */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 text-white/90 text-sm backdrop-blur-sm bg-black/30 rounded-lg px-3 py-1.5">
              <span className="font-medium">{tournament.game}</span>
              <span className="w-1 h-1 bg-white/50 rounded-full"></span>
              <span>{tournament.gameMode || 'Squad'}</span>
              {tournament.mapName && (
                <>
                  <span className="w-1 h-1 bg-white/50 rounded-full"></span>
                  <MapPin className="w-3 h-3" />
                  <span>{tournament.mapName}</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <CardContent className="p-6 space-y-4">
          {/* Tournament Title */}
          <div>
            <h3 className="font-bold text-lg sm:text-xl mb-2 line-clamp-2 group-hover:text-primary transition-colors" data-testid={`title-${tournament.id}`}>
              {tournament.title}
            </h3>
            
            {/* Participation Progress */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Participation</span>
                <span>{Math.round(fillPercentage)}% filled</span>
              </div>
              <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${gameConfig.gradient} transition-all duration-700 rounded-full relative`}
                  style={{ width: `${fillPercentage}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Prize and Entry Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 group-hover:border-primary/40 transition-colors">
              <DollarSign className="w-4 h-4 mx-auto mb-1 text-primary" />
              <div className={`text-xl sm:text-2xl font-bold bg-gradient-to-r ${gameConfig.gradient} bg-clip-text text-transparent`} data-testid={`prize-${tournament.id}`}>
                {formatCurrency(tournament.prizePool)}
              </div>
              <div className="text-xs text-muted-foreground">Prize Pool</div>
            </div>
            
            <div className="text-center p-3 rounded-xl bg-gradient-to-br from-secondary/10 to-muted/10 border border-secondary/20 group-hover:border-secondary/40 transition-colors">
              <Zap className="w-4 h-4 mx-auto mb-1 text-secondary-foreground" />
              <div className="text-lg sm:text-xl font-semibold" data-testid={`entry-${tournament.id}`}>
                {parseFloat(tournament.entryFee) === 0 ? (
                  <span className="text-green-500 font-bold">FREE</span>
                ) : (
                  formatCurrency(tournament.entryFee)
                )}
              </div>
              <div className="text-xs text-muted-foreground">Entry Fee</div>
            </div>
          </div>
          
          {/* Start Time */}
          <div className="bg-muted/30 rounded-xl p-4 border border-muted/50 group-hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {tournament.status === 'completed' ? 'Completed' : 'Starts'}
              </div>
              <Clock className="w-3 h-3 text-muted-foreground" />
            </div>
            <div className="flex items-center justify-between">
              <div className="font-mono text-sm font-bold" data-testid={`time-${tournament.id}`}>
                {dateTime.date}
              </div>
              <div className="font-mono text-sm font-bold text-primary">
                {dateTime.time}
              </div>
            </div>
          </div>
          
          {/* Action Button */}
          <Link href={`/tournaments/${tournament.id}`}>
            <Button 
              className={`
                w-full font-bold py-4 text-base transition-all duration-300 transform
                ${isCompleted 
                  ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                  : isFull
                  ? 'bg-destructive hover:bg-destructive/80 text-destructive-foreground hover:scale-105 hover:shadow-lg'
                  : `bg-gradient-to-r ${gameConfig.gradient} text-white hover:scale-105 hover:shadow-2xl shadow-lg border-0`
                }
                ${!isCompleted && !isFull ? 'animate-pulse-glow' : ''}
              `}
              disabled={isCompleted}
              data-testid={`action-button-${tournament.id}`}
            >
              <div className="flex items-center justify-center gap-2">
                {isCompleted ? (
                  <>
                    <Eye className="w-4 h-4" />
                    View Results
                  </>
                ) : isFull ? (
                  <>
                    <Users className="w-4 h-4" />
                    Tournament Full
                  </>
                ) : (
                  <>
                    <Trophy className="w-4 h-4" />
                    {parseFloat(tournament.entryFee) === 0 ? 'Join Free' : 'Join Tournament'}
                    {slotsLeft <= 5 && slotsLeft > 0 && (
                      <Badge variant="secondary" className="ml-2 text-xs bg-white/20 text-white border-0">
                        {slotsLeft} left
                      </Badge>
                    )}
                  </>
                )}
              </div>
            </Button>
          </Link>
        </CardContent>

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"></div>
      </Card>
    </div>
  );
}
