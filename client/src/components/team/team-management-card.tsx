import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Trophy,
  Target,
  Calendar,
  UserPlus,
  Crown,
  Zap,
  Shield,
  User,
  TrendingUp,
  Award,
  Star,
  Flame,
} from "lucide-react";

interface TeamManagementCardProps {
  team: {
    id: string;
    name: string;
    tag?: string;
    logoUrl?: string;
    captainId: string;
    maxPlayers: number;
    gameType?: string;
    teamCode?: string;
    createdAt: string;
    stats?: {
      matches: number;
      winRate: number;
      kills: number;
      tournaments: number;
    };
  };
  onEdit: (team: any) => void;
  onDelete: (teamId: string) => void;
  onAddPlayer: (teamId: string) => void;
  onEditPlayer: (player: any, teamId: string) => void;
  onCopyCode: (teamCode: string) => void;
  isOwner: boolean;
}

export default function TeamManagementCard({
  team,
  onEdit,
  onDelete,
  onAddPlayer,
  onEditPlayer,
  onCopyCode,
  isOwner,
}: TeamManagementCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { toast } = useToast();

  const { data: teamData } = useQuery({
    queryKey: ["/api/teams", team.id],
  });

  const members = teamData?.members || [];
  const captain = members.find((m: any) => m.role === "captain");
  const stats = team.stats || {
    matches: 15,
    winRate: 73,
    kills: 1247,
    tournaments: 3,
  };

  const getGameTypeGradient = (gameType: string) => {
    switch (gameType?.toLowerCase()) {
      case "bgmi":
        return "bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700";
      case "free fire":
        return "bg-gradient-to-br from-orange-500 via-red-500 to-pink-600";
      case "cod mobile":
        return "bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700";
      case "valorant":
        return "bg-gradient-to-br from-red-500 via-pink-600 to-purple-700";
      case "pubg mobile":
        return "bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-700";
      default:
        return "bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700";
    }
  };

  const getGameTypeIcon = (gameType: string) => {
    switch (gameType?.toLowerCase()) {
      case "bgmi":
        return "🎮";
      case "free fire":
        return "🔥";
      case "cod mobile":
        return "⚡";
      case "valorant":
        return "🎯";
      case "pubg mobile":
        return "🏆";
      default:
        return "🎮";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role?.toLowerCase()) {
      case "captain":
        return <Crown className="w-3 h-3 text-yellow-400" />;
      case "igl":
        return <Target className="w-3 h-3 text-blue-400" />;
      case "fragger":
        return <Flame className="w-3 h-3 text-red-400" />;
      case "support":
        return <Shield className="w-3 h-3 text-green-400" />;
      default:
        return <User className="w-3 h-3 text-gray-400" />;
    }
  };

  const handleCopyTeamCode = () => {
    const code = team.teamCode || "DEMO123";
    navigator.clipboard.writeText(code);
    onCopyCode(code);
    toast({
      title: "Team Code Copied! ✨",
      description: "Share this code with players to join your team",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const getWinRateColor = (winRate: number) => {
    if (winRate >= 80) return "text-green-400";
    if (winRate >= 60) return "text-blue-400";
    if (winRate >= 40) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <Card
      className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700 hover:border-slate-600 transition-all duration-500 ease-out transform hover:scale-105 hover:shadow-2xl group overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`team-card-${team.id}`}
    >
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" />

      {/* Glow Effect */}
      <div
        className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${getGameTypeGradient(team.gameType || "bgmi")} blur-xl`}
      />

      <CardContent className="relative p-0">
        {/* Enhanced Header Section */}
        <div
          className={`relative px-5 py-5 ${getGameTypeGradient(team.gameType || "bgmi")}`}
        >
          {/* Dynamic Background Patterns */}
          <div className="absolute inset-0 bg-black/25" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-white/10 to-black/20" />
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          {/* Floating Elements */}
          <div className="absolute top-2 right-2 w-16 h-16 bg-white/5 rounded-full blur-xl" />
          <div className="absolute bottom-2 left-2 w-12 h-12 bg-white/5 rounded-full blur-lg" />

          <div className="relative space-y-4">
            {/* Top Row: Logo + Team Info + Actions */}
            <div className="flex items-center justify-between gap-4">
              {/* Left: Enhanced Logo Section */}
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  {/* Enhanced Team Logo */}
                  <div className="w-16 h-16 rounded-2xl bg-black/40 backdrop-blur-md flex items-center justify-center shadow-2xl border-2 border-white/30 group-hover:scale-105 group-hover:rotate-3 transition-all duration-500 relative overflow-hidden">
                    {/* Inner glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
                    {team.logoUrl ? (
                      <img
                        src={team.logoUrl}
                        alt={team.name}
                        className="w-10 h-10 rounded-xl object-cover relative z-10"
                      />
                    ) : (
                      <Users className="w-8 h-8 text-white relative z-10" />
                    )}
                  </div>

                  {/* Enhanced Rank Badge */}
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg border-2 border-white/50 group-hover:scale-110 transition-transform duration-300">
                    <Star className="w-3 h-3 text-yellow-900" />
                  </div>

                  {/* Status Indicator */}
                  <div className="absolute -bottom-1 -left-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-lg animate-pulse">
                    <div className="w-full h-full bg-green-400 rounded-full animate-ping opacity-75" />
                  </div>
                </div>

                {/* Enhanced Team Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3
                      className="font-bold text-xl text-white truncate group-hover:text-yellow-200 transition-colors duration-300 drop-shadow-lg"
                      data-testid={`team-name-${team.id}`}
                    >
                      {team.name}
                    </h3>
                  </div>

                  {/* Game Type & Level */}
                  <div className="flex items-center gap-2">
                    {team.gameType && (
                      <Badge className="bg-black/50 backdrop-blur-sm text-white border-white/20 text-sm px-3 py-1 font-medium hover:bg-black/60 transition-colors">
                        <span className="mr-1">
                          {getGameTypeIcon(team.gameType)}
                        </span>
                        {team.gameType}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Enhanced Actions */}
              {isOwner && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyTeamCode}
                    className="h-10 w-10 p-0 hover:bg-white/20 text-white border border-white/30 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-10 w-10 p-0 hover:bg-white/20 text-white border border-white/30 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        data-testid={`team-menu-${team.id}`}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-52 bg-slate-800/95 backdrop-blur-lg border-slate-600 shadow-2xl"
                    >
                      <DropdownMenuItem
                        onClick={() => onEdit(team)}
                        className="text-white hover:bg-slate-700/80"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Team
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onAddPlayer(team.id)}
                        className="text-white hover:bg-slate-700/80"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Player
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleCopyTeamCode}
                        className="text-white hover:bg-slate-700/80"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Join Code
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(team.id)}
                        className="text-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Team
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>

            {/* Bottom Row: Enhanced Members & Join Code */}
            <div className="flex items-center justify-between gap-3 w-full">
              {/* Enhanced Members Display */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {members.slice(0, 4).map((member: any, index: number) => (
                    <Avatar
                      key={member.id}
                      className="w-7 h-7 border-2 border-white/40 shadow-md hover:scale-110 transition-transform duration-200"
                    >
                      <AvatarImage src={member.user?.profileImageUrl} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-bold">
                        {member.user?.username?.charAt(0).toUpperCase() || "M"}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {members.length > 4 && (
                    <div className="w-7 h-7 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/40 shadow-md">
                      <span className="text-xs font-bold text-white">
                        +{members.length - 4}
                      </span>
                    </div>
                  )}
                  {members.length === 0 && (
                    <div className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border-2 border-white/40 shadow-md">
                      <Users className="w-3 h-3 text-white/60" />
                    </div>
                  )}
                </div>

                <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 text-xs px-2 py-0.5 font-bold">
                  {members.length}/{team.maxPlayers}
                </Badge>
              </div>
              {/* Enhanced Join Code */}
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopyTeamCode}
                className="h-6 px-2 rounded-md shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 text-white text-xs font-medium"
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy Code
              </Button>
            </div>
        
        {/* Enhanced Stats Section */}
        <div className="px-2 py-2 bg-slate-800/50 backdrop-blur-sm">
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/30 rounded-xl border border-blue-400/20 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
              <div className="text-lg font-bold text-blue-300 mb-1">
                {stats.matches}
              </div>
              <div className="text-xs text-blue-200 font-medium">Matches</div>
            </div>
            <div className="text-center p-2 bg-gradient-to-br from-green-500/20 to-green-600/30 rounded-xl border border-green-400/20 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
              <div
                className={`text-lg font-bold mb-1 ${getWinRateColor(stats.winRate)}`}
              >
                {stats.winRate}%
              </div>
              <div className="text-xs text-green-200 font-medium">Win Rate</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-red-500/20 to-red-600/30 rounded-xl border border-red-400/20 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
              <div className="text-lg font-bold text-red-300 mb-1">
                {(stats.kills / 1000).toFixed(1)}k
              </div>
              <div className="text-xs text-red-200 font-medium">Kills</div>
            </div>
            <div className="text-center p-2 bg-gradient-to-br from-yellow-500/20 to-yellow-600/30 rounded-xl border border-yellow-400/20 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
              <div className="text-lg font-bold text-yellow-300 mb-1">
                {stats.tournaments}
              </div>
              <div className="text-xs text-yellow-200 font-medium">Wins</div>
            </div>
          </div>
        </div>

        {/* Enhanced Team Members Section */}
        <div className="px-6 py-5 bg-slate-900/50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              Team Members
            </span>
            {members.length < team.maxPlayers && isOwner && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddPlayer(team.id)}
                className="h-8 px-3 text-xs bg-blue-500/20 border-blue-400/30 text-blue-300 hover:bg-blue-500/30 hover:border-blue-400/50"
              >
                <UserPlus className="w-3 h-3 mr-1" />
                Add
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Enhanced Member Avatars */}
            {members.slice(0, 6).map((member: any, index: number) => (
              <div key={member.id} className="relative group/member">
                <Avatar className="w-10 h-10 border-2 border-slate-600 hover:border-blue-400 shadow-lg transition-all duration-300 hover:scale-110">
                  <AvatarImage src={member.user?.profileImageUrl} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-bold">
                    {member.user?.username?.charAt(0).toUpperCase() || "M"}
                  </AvatarFallback>
                </Avatar>

                {/* Enhanced Role Icon */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-slate-800 rounded-full flex items-center justify-center shadow-lg border border-slate-600">
                  {getRoleIcon(member.role)}
                </div>

                {/* Enhanced Hover Card */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover/member:opacity-100 transition-all duration-300 bg-slate-800 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap z-20 border border-slate-600 shadow-xl">
                  <div className="font-semibold">
                    {member.user?.username || "Unknown"}
                  </div>
                  <div className="text-slate-300 capitalize">{member.role}</div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
                </div>
              </div>
            ))}

            {/* Enhanced Empty Slots */}
            {Array.from({
              length: Math.max(0, team.maxPlayers - members.length),
            })
              .slice(0, 6 - members.length)
              .map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="w-10 h-10 border-2 border-dashed border-slate-600 hover:border-blue-400 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-500/20 transition-all duration-300 hover:scale-110 group/empty"
                  onClick={() => onAddPlayer(team.id)}
                >
                  <UserPlus className="w-4 h-4 text-slate-400 group-hover/empty:text-blue-400" />
                </div>
              ))}

            {members.length > 6 && (
              <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center border border-slate-600 shadow-lg">
                <span className="text-xs font-bold text-white">
                  +{members.length - 6}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-t border-slate-700">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Calendar className="w-3 h-3" />
            Created {formatDate(team.createdAt)}
          </div>

          {stats.tournaments > 0 && (
            <div className="flex items-center gap-2 text-xs font-medium">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-300">
                {stats.tournaments} Tournament{stats.tournaments > 1 ? "s" : ""}{" "}
                Won
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
