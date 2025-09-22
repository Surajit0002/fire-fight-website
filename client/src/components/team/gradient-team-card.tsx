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
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  MoreVertical, 
  Edit,
  Eye,
  Trash2,
  Copy,
  Trophy,
  Target
} from "lucide-react";

interface GradientTeamCardProps {
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
      mvpAwards: number;
    };
  };
  onEdit: (team: any) => void;
  onDelete: (teamId: string) => void;
  onView: (teamId: string) => void;
  onCopyCode: (teamCode: string) => void;
  isOwner: boolean;
  gradientIndex?: number;
}

export default function GradientTeamCard({ 
  team, 
  onEdit, 
  onDelete,
  onView,
  onCopyCode, 
  isOwner,
  gradientIndex = 0
}: GradientTeamCardProps) {
  const { toast } = useToast();

  const { data: teamData } = useQuery({
    queryKey: ["/api/teams", team.id],
  });

  const members = (teamData as any)?.members || [];
  const stats = team.stats || { matches: 15, winRate: 19, kills: 1500, mvpAwards: 3 };

  // Gradient options
  const gradients = [
    "bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600",
    "bg-gradient-to-br from-green-400 via-green-500 to-green-600",
    "bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600",
    "bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600",
  ];

  const gradient = gradients[gradientIndex % gradients.length];

  const handleCopyTeamCode = () => {
    if (team.teamCode) {
      navigator.clipboard.writeText(team.teamCode);
      onCopyCode(team.teamCode);
      toast({
        title: "Team Code Copied!",
        description: "Team code has been copied to clipboard",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: '2-digit', 
      day: '2-digit', 
      year: 'numeric' 
    }) + ' || ' + date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <Card className={`${gradient} text-white overflow-hidden relative shadow-lg hover:shadow-xl transition-shadow`}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Team Logo */}
            <div className="w-12 h-12 bg-black/20 rounded-lg flex items-center justify-center">
              {team.logoUrl ? (
                <img src={team.logoUrl} alt={team.name} className="w-8 h-8 rounded object-cover" />
              ) : (
                <Users className="w-6 h-6 text-white" />
              )}
            </div>
            
            {/* Team Info */}
            <div>
              <h3 className="font-semibold text-lg text-white" data-testid={`team-name-${team.id}`}>
                {team.name}
              </h3>
              {team.gameType && (
                <Badge variant="secondary" className="bg-black/20 text-white border-0 text-xs">
                  {team.gameType}
                </Badge>
              )}
            </div>
          </div>

          {/* Dropdown Menu */}
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 text-white hover:bg-white/20"
                  data-testid={`team-menu-${team.id}`}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => onEdit(team)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onView(team.id)}>
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(team.id)} className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Team Code */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-2xl font-bold text-white">
            {team.teamCode || "45126582"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyTeamCode}
            className="h-6 w-6 p-0 text-white hover:bg-white/20"
          >
            <Copy className="w-4 h-4" />
          </Button>
          <span className="text-sm text-white/80">Team code</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-white/20 rounded-lg p-2 text-center">
            <div className="text-xl font-bold text-white">{stats.matches}</div>
            <div className="text-xs text-white/80">Matches</div>
          </div>
          <div className="bg-white/20 rounded-lg p-2 text-center">
            <div className="text-xl font-bold text-white">{stats.winRate}%</div>
            <div className="text-xs text-white/80">Win Rate</div>
          </div>
          <div className="bg-white/20 rounded-lg p-2 text-center">
            <div className="text-xl font-bold text-white">{(stats.kills / 1000).toFixed(1)}k</div>
            <div className="text-xs text-white/80">Kills</div>
          </div>
          <div className="bg-white/20 rounded-lg p-2 text-center">
            <div className="text-xl font-bold text-white">{stats.mvpAwards}</div>
            <div className="text-xs text-white/80">MVP Awards</div>
          </div>
        </div>

        {/* Team Members */}
        <div className="mb-3">
          <div className="text-sm text-white/80 mb-2">Team members</div>
          <div className="flex items-center gap-1">
            {members.slice(0, 4).map((member: any, index: number) => (
              <Avatar key={member.id} className="w-8 h-8 border-2 border-white/30">
                <AvatarImage src={member.user?.profileImageUrl} />
                <AvatarFallback className="bg-white/20 text-white text-xs">
                  {member.user?.username?.charAt(0).toUpperCase() || 'M'}
                </AvatarFallback>
              </Avatar>
            ))}
            {members.length === 0 && (
              <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center">
                <Users className="w-4 h-4 text-white/60" />
              </div>
            )}
            {members.length < team.maxPlayers && (
              <div className="w-8 h-8 rounded-full bg-black/30 flex items-center justify-center">
                <span className="text-xs text-white/60">+</span>
              </div>
            )}
          </div>
        </div>

        {/* Timestamp */}
        <div className="text-xs text-white/60 text-right">
          {formatDate(team.createdAt)}
        </div>
      </CardContent>
    </Card>
  );
}