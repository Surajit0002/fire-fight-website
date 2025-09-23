
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, Trophy, Clock, Gamepad2 } from "lucide-react";
import { Link } from "wouter";

interface TournamentCardProps {
  tournament: {
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
  };
  variant?: 'default' | 'wide' | 'compact' | 'large';
}

export default function TournamentCard({ tournament, variant = 'default' }: TournamentCardProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'live':
        return { color: 'bg-red-500', text: 'Live', dot: true };
      case 'upcoming':
        return { color: 'bg-blue-500', text: 'Starting Soon', dot: false };
      case 'completed':
        return { color: 'bg-gray-500', text: 'Completed', dot: false };
      default:
        return { color: 'bg-green-500', text: 'Open', dot: false };
    }
  };

  const getGameBackground = (game: string) => {
    const backgrounds = {
      'free fire': 'linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ff4757 100%)',
      'bgmi': 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #5b73c4 100%)',
      'pubg mobile': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #ff9472 100%)',
      'cod mobile': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 50%, #d299c2 100%)',
      'valorant': 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #feca57 100%)'
    };
    return backgrounds[game.toLowerCase()] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    if (num >= 100000) return `₹${(num / 100000).toFixed(0)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(0)}k`;
    return `₹${num}`;
  };

  const formatDateTime = (dateString: string | Date | null) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays}d ${diffHours % 24}h ${diffMinutes}m`;
    } else if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}m`;
    } else {
      return 'Starting now';
    }
  };

  const participants = tournament.currentParticipants || 0;
  const maxParticipants = tournament.maxParticipants;
  const slotsLeft = maxParticipants - participants;
  const fillPercentage = (participants / maxParticipants) * 100;
  const statusConfig = getStatusConfig(tournament.status);
  const gameBackground = getGameBackground(tournament.game);

  // Calculate prize distribution
  const totalPrize = parseFloat(tournament.prizePool);
  const rank1Prize = Math.floor(totalPrize * 0.5);
  const rank2Prize = Math.floor(totalPrize * 0.3);
  const rank3Prize = Math.floor(totalPrize * 0.2);

  // Get variant-specific classes
  const getVariantClasses = () => {
    switch (variant) {
      case 'wide':
        return {
          container: 'max-w-2xl w-full',
          layout: 'md:flex-row',
          imageHeight: 'md:h-full md:w-48',
          content: 'flex-1'
        };
      case 'compact':
        return {
          container: 'max-w-sm w-full',
          layout: 'flex-col',
          imageHeight: 'h-24',
          content: 'flex-1'
        };
      case 'large':
        return {
          container: 'max-w-3xl w-full',
          layout: 'md:flex-row',
          imageHeight: 'md:h-full md:w-64',
          content: 'flex-1'
        };
      default:
        return {
          container: 'max-w-md w-full',
          layout: 'flex-col',
          imageHeight: 'h-32',
          content: 'flex-1'
        };
    }
  };

  const variantClasses = getVariantClasses();

  if (variant === 'wide' || variant === 'large') {
    return (
      <Card className={`relative overflow-hidden bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl rounded-2xl ${variantClasses.container}`}>
        <div className={`flex ${variantClasses.layout} h-full`}>
          {/* Game Background Header */}
          <div 
            className={`relative ${variantClasses.imageHeight} overflow-hidden rounded-l-2xl md:rounded-l-2xl md:rounded-tr-none`}
            style={{ background: gameBackground }}
          >
            {/* Game Characters/Background Image */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/40">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white font-black text-2xl md:text-4xl opacity-20 transform rotate-12">
                  {tournament.game.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Live Status Badge */}
            <div className="absolute top-3 left-3">
              <Badge className={`${statusConfig.color} text-white text-xs font-bold px-3 py-1 rounded-full border-0`}>
                {statusConfig.dot && (
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></span>
                )}
                {statusConfig.text}
              </Badge>
            </div>

            {/* Game Title */}
            <div className="absolute bottom-3 left-3">
              <h3 className="text-white font-black text-sm md:text-lg drop-shadow-lg">
                {tournament.game.toUpperCase()}
              </h3>
            </div>
          </div>

          {/* Content Section */}
          <div className={`${variantClasses.content} p-4 space-y-3`}>
            {/* Tournament Title and Details */}
            <div>
              <h4 className="font-bold text-lg text-white mb-1 line-clamp-1">
                🔥 {tournament.title}
              </h4>
              <div className="flex items-center gap-3 text-sm text-gray-300 flex-wrap">
                <span className="flex items-center gap-1">
                  <Gamepad2 className="w-4 h-4" />
                  {tournament.game}
                </span>
                <span>⚔️ {tournament.gameMode || 'Squad'}</span>
                <span>📱 Mobile</span>
              </div>
            </div>

            {/* Prize Pool and Info in horizontal layout */}
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="text-xl md:text-2xl font-black text-green-400 mb-1">
                  {formatCurrency(tournament.prizePool)}
                </div>
                <div className="text-xs text-gray-400">Prize Pool</div>
              </div>

              {/* Tournament Info Pills */}
              <div className="flex gap-2 flex-wrap">
                <div className="bg-white/10 px-2 py-1 rounded-full text-xs text-white">
                  Team Size (4v4)
                </div>
                <div className="bg-white/10 px-2 py-1 rounded-full text-xs text-white">
                  Knockout
                </div>
              </div>
            </div>

            {/* Prize Distribution */}
            <div className="flex justify-between items-center py-2">
              <div className="text-center">
                <div className="text-sm md:text-lg font-bold text-red-400">
                  {formatCurrency(rank1Prize.toString())}
                </div>
                <div className="text-xs text-gray-400">Rank 1</div>
              </div>
              <div className="text-center">
                <div className="text-sm md:text-lg font-bold text-red-400">
                  {formatCurrency(rank2Prize.toString())}
                </div>
                <div className="text-xs text-gray-400">Rank 2</div>
              </div>
              <div className="text-center">
                <div className="text-sm md:text-lg font-bold text-red-400">
                  {formatCurrency(rank3Prize.toString())}
                </div>
                <div className="text-xs text-gray-400">Rank 3</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-green-400">+2 per kill</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div 
                  className="bg-red-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${fillPercentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>{participants} joined</span>
                <span>{slotsLeft} slots left</span>
              </div>
            </div>

            {/* Action Buttons and Start Time */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex gap-2 flex-1">
                <Link href={`/tournaments/${tournament.id}`} className="flex-1">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg py-2 transition-all duration-200"
                    size="sm"
                  >
                    💳 join ₹{parseFloat(tournament.entryFee) === 0 ? '0' : parseFloat(tournament.entryFee)}
                  </Button>
                </Link>
                <Link href={`/tournaments/${tournament.id}`}>
                  <Button 
                    variant="outline" 
                    className="bg-orange-500 hover:bg-orange-600 text-white border-orange-500 font-bold rounded-lg px-4 py-2 transition-all duration-200"
                    size="sm"
                  >
                    view more
                  </Button>
                </Link>
              </div>

              {/* Start Time */}
              <div className="text-xs text-gray-400 whitespace-nowrap">
                <Clock className="w-3 h-3 inline mr-1" />
                Starts in: {formatDateTime(tournament.startTime)}
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Default vertical layout for default and compact variants
  return (
    <Card className={`relative overflow-hidden bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl rounded-2xl ${variantClasses.container}`}>
      {/* Game Background Header */}
      <div 
        className={`relative ${variantClasses.imageHeight} overflow-hidden rounded-t-2xl`}
        style={{ background: gameBackground }}
      >
        {/* Game Characters/Background Image */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/40">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white font-black text-2xl md:text-4xl opacity-20 transform rotate-12">
              {tournament.game.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Live Status Badge */}
        <div className="absolute top-3 left-3">
          <Badge className={`${statusConfig.color} text-white text-xs font-bold px-3 py-1 rounded-full border-0`}>
            {statusConfig.dot && (
              <span className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></span>
            )}
            {statusConfig.text}
          </Badge>
        </div>

        {/* Game Title */}
        <div className="absolute bottom-3 left-3">
          <h3 className="text-white font-black text-lg drop-shadow-lg">
            {tournament.game.toUpperCase()}
          </h3>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-4">
        {/* Tournament Title and Details */}
        <div>
          <h4 className="font-bold text-lg text-white mb-1 line-clamp-1">
            🔥 {tournament.title}
          </h4>
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <span className="flex items-center gap-1">
              <Gamepad2 className="w-4 h-4" />
              {tournament.game}
            </span>
            <span>⚔️ {tournament.gameMode || 'Squad'}</span>
            <span>📱 Mobile</span>
          </div>
        </div>

        {/* Prize Pool Display */}
        <div className="text-center">
          <div className="text-2xl font-black text-green-400 mb-1">
            {formatCurrency(tournament.prizePool)}
          </div>
          <div className="text-xs text-gray-400">Prize Pool</div>
        </div>

        {variant !== 'compact' && (
          <>
            {/* Tournament Info Pills */}
            <div className="flex justify-center gap-2">
              <div className="bg-white/10 px-3 py-1 rounded-full text-xs text-white">
                Team Size (4v4)
              </div>
              <div className="bg-white/10 px-3 py-1 rounded-full text-xs text-white">
                Format: Knockout
              </div>
              <div className="bg-white/10 px-3 py-1 rounded-full text-xs text-white flex items-center gap-1">
                <Trophy className="w-3 h-3" />
                Winner Prizes
              </div>
            </div>

            {/* Prize Distribution */}
            <div className="flex justify-between items-center py-2">
              <div className="text-center">
                <div className="text-lg font-bold text-red-400">
                  {formatCurrency(rank1Prize.toString())}
                </div>
                <div className="text-xs text-gray-400">Rank 1</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-400">
                  {formatCurrency(rank2Prize.toString())}
                </div>
                <div className="text-xs text-gray-400">Rank 2</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-400">
                  {formatCurrency(rank3Prize.toString())}
                </div>
                <div className="text-xs text-gray-400">Rank 3</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-green-400">+2 per kill</div>
              </div>
            </div>
          </>
        )}

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div 
              className="bg-red-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${fillPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>{participants} joined</span>
            <span>{slotsLeft} slots left</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link href={`/tournaments/${tournament.id}`} className="flex-1">
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg py-2 transition-all duration-200"
              size="sm"
            >
              💳 join ₹{parseFloat(tournament.entryFee) === 0 ? '0' : parseFloat(tournament.entryFee)}
            </Button>
          </Link>
          <Link href={`/tournaments/${tournament.id}`}>
            <Button 
              variant="outline" 
              className="bg-orange-500 hover:bg-orange-600 text-white border-orange-500 font-bold rounded-lg px-4 py-2 transition-all duration-200"
              size="sm"
            >
              view more
            </Button>
          </Link>
        </div>

        {/* Start Time */}
        <div className="text-center text-xs text-gray-400">
          <Clock className="w-3 h-3 inline mr-1" />
          Starts in: {formatDateTime(tournament.startTime)}
        </div>
      </div>
    </Card>
  );
}
