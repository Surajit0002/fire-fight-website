
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
  Calendar,
  UserPlus,
  Crown,
  Plus,
} from "lucide-react";

interface CompactTeamCardProps {
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
  onCopyCode: (teamCode: string) => void;
  isOwner: boolean;
  gradientIndex?: number;
}

export default function CompactTeamCard({
  team,
  onEdit,
  onDelete,
  onAddPlayer,
  onCopyCode,
  isOwner,
  gradientIndex = 0,
}: CompactTeamCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { toast } = useToast();

  const { data: teamData } = useQuery({
    queryKey: ["/api/teams", team.id],
  });

  const members = teamData?.members || [];
  const stats = team.stats || {
    matches: 25,
    winRate: 76,
    kills: 1900,
    tournaments: 5,
  };

  // Dynamic gradient themes based on game type
  const getGameGradient = (gameType: string) => {
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
        return "bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800";
    }
  };

  const getGameIcon = (gameType: string) => {
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

  return (
    <Card
      className={`relative ${getGameGradient(team.gameType || "bgmi")} text-white overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 group border-0`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`compact-team-card-${team.id}`}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent" />

      <CardContent className="relative p-4 space-y-4">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Team Logo with Status */}
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-black/30 backdrop-blur-sm flex items-center justify-center shadow-xl border-2 border-white/20">
                {team.logoUrl ? (
                  <img
                    src={team.logoUrl}
                    alt={team.name}
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                ) : (
                  <Users className="w-6 h-6 text-white" />
                )}
              </div>
              {/* Online Status */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg">
                <div className="w-full h-full bg-green-400 rounded-full animate-ping opacity-75" />
              </div>
            </div>

            {/* Team Info */}
            <div className="flex-1">
              <h3 className="font-bold text-lg text-white truncate" data-testid={`team-name-${team.id}`}>
                {team.name}
              </h3>
              <div className="flex items-center gap-2">
                <Badge className="bg-black/30 backdrop-blur-sm text-white border-white/20 text-xs">
                  <span className="mr-1">{getGameIcon(team.gameType || "bgmi")}</span>
                  {team.gameType || "BGMI"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm rounded-lg"
                  data-testid={`team-menu-${team.id}`}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-slate-800/95 backdrop-blur-lg border-slate-600">
                <DropdownMenuItem onClick={() => onEdit(team)} className="text-white hover:bg-slate-700/80">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Team
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAddPlayer(team.id)} className="text-white hover:bg-slate-700/80">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Player
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyTeamCode} className="text-white hover:bg-slate-700/80">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Code
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(team.id)} className="text-red-400 hover:bg-red-500/20">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Team
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Team Code Display */}
        <div className="flex items-center justify-between bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-white/80 text-sm">{members.length}/{team.maxPlayers}</span>
            <div className="w-1 h-1 bg-white/40 rounded-full" />
            <span className="text-white font-mono text-sm">{team.teamCode || "DEMO123"}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyTeamCode}
            className="h-6 px-2 text-white hover:bg-white/10 text-xs"
          >
            <Copy className="w-3 h-3 mr-1" />
            Copy Code
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center p-2 bg-black/20 backdrop-blur-sm rounded-lg border border-white/10">
            <div className="text-lg font-bold text-white">{stats.matches}</div>
            <div className="text-xs text-white/70">Matches</div>
          </div>
          <div className="text-center p-2 bg-black/20 backdrop-blur-sm rounded-lg border border-white/10">
            <div className="text-lg font-bold text-white">{stats.winRate}%</div>
            <div className="text-xs text-white/70">Win Rate</div>
          </div>
          <div className="text-center p-2 bg-black/20 backdrop-blur-sm rounded-lg border border-white/10">
            <div className="text-lg font-bold text-white">{(stats.kills / 1000).toFixed(1)}k</div>
            <div className="text-xs text-white/70">Kills</div>
          </div>
          <div className="text-center p-2 bg-black/20 backdrop-blur-sm rounded-lg border border-white/10">
            <div className="text-lg font-bold text-white">{stats.tournaments}</div>
            <div className="text-xs text-white/70">Wins</div>
          </div>
        </div>

        {/* Team Members Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white/90 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Team Members
            </span>
            {members.length < team.maxPlayers && isOwner && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAddPlayer(team.id)}
                className="h-6 px-2 text-white hover:bg-white/10 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add
              </Button>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Member Avatars */}
            {members.slice(0, 5).map((member: any, index: number) => (
              <div key={member.id} className="relative group">
                <Avatar className="w-8 h-8 border-2 border-white/30 shadow-md hover:scale-110 transition-transform duration-200">
                  <AvatarImage src={member.user?.profileImageUrl} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-bold">
                    {member.user?.username?.charAt(0).toUpperCase() || "M"}
                  </AvatarFallback>
                </Avatar>
                {/* Captain Crown */}
                {member.role === "captain" && (
                  <Crown className="absolute -top-1 -right-1 w-3 h-3 text-yellow-400" />
                )}
              </div>
            ))}

            {/* Empty Slots */}
            {Array.from({ length: Math.max(0, team.maxPlayers - members.length) })
              .slice(0, 5 - members.length)
              .map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="w-8 h-8 border-2 border-dashed border-white/30 rounded-full flex items-center justify-center cursor-pointer hover:border-white/50 transition-colors"
                  onClick={() => onAddPlayer(team.id)}
                >
                  <Plus className="w-3 h-3 text-white/50" />
                </div>
              ))}

            {members.length > 5 && (
              <div className="w-8 h-8 bg-black/30 rounded-full flex items-center justify-center border border-white/20">
                <span className="text-xs font-bold text-white">+{members.length - 5}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-white/60 pt-2 border-t border-white/10">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Created {formatDate(team.createdAt)}
          </div>
          {stats.tournaments > 0 && (
            <div className="flex items-center gap-1">
              <Trophy className="w-3 h-3 text-yellow-400" />
              <span className="text-yellow-300">{stats.tournaments} Wins</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
