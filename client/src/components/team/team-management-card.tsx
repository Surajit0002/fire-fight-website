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

  const getGameTypeColor = (gameType: string) => {
    switch (gameType?.toLowerCase()) {
      case "bgmi":
        return "bg-blue-500";
      case "free fire":
        return "bg-orange-500";
      case "cod mobile":
        return "bg-green-500";
      case "valorant":
        return "bg-red-500";
      case "pubg mobile":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role?.toLowerCase()) {
      case "captain":
        return <Crown className="w-3 h-3 text-yellow-500" />;
      case "igl":
        return <Target className="w-3 h-3 text-blue-500" />;
      case "fragger":
        return <Zap className="w-3 h-3 text-red-500" />;
      case "support":
        return <Shield className="w-3 h-3 text-green-500" />;
      default:
        return <User className="w-3 h-3 text-gray-500" />;
    }
  };

  const handleCopyTeamCode = () => {
    const code = team.teamCode || "DEMO123";
    navigator.clipboard.writeText(code);
    onCopyCode(code);
    toast({
      title: "Team Code Copied!",
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
      className="bg-white shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-gray-300 group overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`team-card-${team.id}`}
    >
      <CardContent className="p-0">
        {/* Header Section */}
        <div className="relative p-6 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              {/* Team Logo */}
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                {team.logoUrl ? (
                  <img
                    src={team.logoUrl}
                    alt={team.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <Users className="w-8 h-8 text-white" />
                )}
              </div>

              {/* Team Info */}
              <div>
                <h3
                  className="font-bold text-xl text-gray-900 mb-1"
                  data-testid={`team-name-${team.id}`}
                >
                  {team.name}
                </h3>
                <div className="flex items-center gap-2">
                  {team.gameType && (
                    <Badge
                      className={`${getGameTypeColor(team.gameType)} text-white text-xs px-2 py-1`}
                    >
                      {team.gameType}
                    </Badge>
                  )}
                  <span className="text-sm text-gray-500">
                    {members.length}/{team.maxPlayers} members
                  </span>
                </div>
              </div>
            </div>
            {/* Team Join Code */}
            <div className="bg-white/70 rounded-lg p-3 backdrop-blur-sm">
              <div className=" flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Join Code
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg font-bold text-gray-900">
                      {team.teamCode || "DEMO123"}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyTeamCode}
                      className="h-6 w-6 p-0 hover:bg-gray-200"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
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
                  className="h-8 w-8 p-0 hover:bg-white/50"
                  data-testid={`team-menu-${team.id}`}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onEdit(team)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Team
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAddPlayer(team.id)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Player
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyTeamCode}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Join Code
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(team.id)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Team
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Stats Section */}
        <div className="px-6 py-4 bg-white">
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">
                {stats.matches}
              </div>
              <div className="text-xs text-blue-800 font-medium">Matches</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">
                {stats.winRate}%
              </div>
              <div className="text-xs text-green-800 font-medium">Win Rate</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-lg font-bold text-red-600">
                {(stats.kills / 1000).toFixed(1)}k
              </div>
              <div className="text-xs text-red-800 font-medium">Kills</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-lg font-bold text-yellow-600">
                {stats.tournaments}
              </div>
              <div className="text-xs text-yellow-800 font-medium">Wins</div>
            </div>
          </div>
        </div>

        {/* Team Members Section */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700">
              Team Members
            </span>
            {members.length < team.maxPlayers && isOwner && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddPlayer(team.id)}
                className="h-7 px-2 text-xs"
              >
                <UserPlus className="w-3 h-3 mr-1" />
                Add
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Member Avatars */}
            {members.slice(0, 6).map((member: any, index: number) => (
              <div key={member.id} className="relative group">
                <Avatar className="w-8 h-8 border-2 border-white shadow-sm">
                  <AvatarImage src={member.user?.profileImageUrl} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-semibold">
                    {member.user?.username?.charAt(0).toUpperCase() || "M"}
                  </AvatarFallback>
                </Avatar>

                {/* Role Icon */}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                  {getRoleIcon(member.role)}
                </div>

                {/* Hover Card */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                  {member.user?.username || "Unknown"} ({member.role})
                </div>
              </div>
            ))}

            {/* Empty Slots */}
            {Array.from({
              length: Math.max(0, team.maxPlayers - members.length),
            })
              .slice(0, 6 - members.length)
              .map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="w-8 h-8 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors"
                  onClick={() => onAddPlayer(team.id)}
                >
                  <UserPlus className="w-3 h-3 text-gray-400" />
                </div>
              ))}

            {members.length > 6 && (
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-xs font-semibold text-gray-600">
                  +{members.length - 6}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-100">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            Created {formatDate(team.createdAt)}
          </div>

          {stats.tournaments > 0 && (
            <div className="flex items-center gap-1 text-xs text-yellow-600">
              <Trophy className="w-3 h-3" />
              {stats.tournaments} Tournament{stats.tournaments > 1 ? "s" : ""}{" "}
              Won
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
