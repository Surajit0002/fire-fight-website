
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Users, 
  Crown, 
  MoreVertical, 
  Edit,
  Eye,
  Trash2,
  UserPlus,
  Copy,
  Trophy,
  Target,
  Zap,
  Calendar,
  Star
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
  isOwner 
}: TeamManagementCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const { data: teamMembers } = useQuery({
    queryKey: ["/api/teams", team.id],
  });

  const members = teamMembers?.members || [];
  const captain = members.find((m: any) => m.role === 'captain');
  const stats = team.stats || { matches: 0, winRate: 0, kills: 0, tournaments: 0 };

  const getGameTypeColor = (gameType: string) => {
    switch (gameType?.toLowerCase()) {
      case 'bgmi': return 'bg-blue-500';
      case 'free fire': return 'bg-orange-500';
      case 'cod mobile': return 'bg-green-500';
      default: return 'bg-purple-500';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'captain': return 'bg-yellow-500 text-black';
      case 'igl': return 'bg-blue-500 text-white';
      case 'fragger': return 'bg-red-500 text-white';
      case 'support': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <Card 
      className={`
        bg-gradient-to-br from-card to-card/50 border-border 
        hover:border-primary/50 transition-all duration-300 group relative overflow-hidden
        ${isHovered ? 'shadow-2xl shadow-primary/20 scale-105' : 'shadow-lg'}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`team-card-${team.id}`}
    >
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-destructive/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Team Logo with Glow */}
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent p-1">
                <div className="w-full h-full rounded-full bg-card flex items-center justify-center overflow-hidden">
                  {team.logoUrl ? (
                    <img src={team.logoUrl} alt={team.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <Users className="w-6 h-6 text-primary" />
                  )}
                </div>
              </div>
              {isOwner && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Crown className="w-3 h-3 text-black" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-foreground" data-testid={`team-name-${team.id}`}>
                  {team.name}
                </h3>
                {team.tag && (
                  <Badge variant="secondary" className="text-xs" data-testid={`team-tag-${team.id}`}>
                    {team.tag}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {team.gameType && (
                  <Badge className={`${getGameTypeColor(team.gameType)} text-white text-xs`}>
                    {team.gameType}
                  </Badge>
                )}
                {team.teamCode && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs bg-muted hover:bg-muted/80"
                    onClick={() => onCopyCode(team.teamCode!)}
                    data-testid={`copy-code-${team.id}`}
                  >
                    <span className="mr-1">{team.teamCode}</span>
                    <Copy className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* Options Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" data-testid={`team-menu-${team.id}`}>
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(team)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Team
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              {isOwner && (
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={() => onDelete(team.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Team
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10">
        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <Tooltip>
            <TooltipTrigger>
              <div className="bg-muted/50 rounded-lg p-2 text-center hover:bg-muted/70 transition-colors">
                <div className="text-lg font-bold text-primary">{stats.matches}</div>
                <div className="text-xs text-muted-foreground">Matches</div>
              </div>
            </TooltipTrigger>
            <TooltipContent>Total matches played</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger>
              <div className="bg-muted/50 rounded-lg p-2 text-center hover:bg-muted/70 transition-colors">
                <div className="text-lg font-bold text-green-500">{stats.winRate}%</div>
                <div className="text-xs text-muted-foreground">Win Rate</div>
                <Progress value={stats.winRate} className="h-1 mt-1" />
              </div>
            </TooltipTrigger>
            <TooltipContent>Team win percentage</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger>
              <div className="bg-muted/50 rounded-lg p-2 text-center hover:bg-muted/70 transition-colors">
                <div className="text-lg font-bold text-red-500">{stats.kills}</div>
                <div className="text-xs text-muted-foreground">Kills</div>
              </div>
            </TooltipTrigger>
            <TooltipContent>Total team kills</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger>
              <div className="bg-muted/50 rounded-lg p-2 text-center hover:bg-muted/70 transition-colors">
                <div className="text-lg font-bold text-yellow-500">{stats.tournaments}</div>
                <div className="text-xs text-muted-foreground">Trophies</div>
              </div>
            </TooltipTrigger>
            <TooltipContent>Tournaments won</TooltipContent>
          </Tooltip>
        </div>

        {/* Team Members */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Team Members</span>
            <span className="text-xs text-muted-foreground">
              {members.length}/{team.maxPlayers} players
            </span>
          </div>
          
          {/* Member Avatars */}
          <div className="flex items-center gap-2">
            {members.slice(0, 5).map((member: any, index: number) => (
              <Tooltip key={member.id}>
                <TooltipTrigger>
                  <div className="relative">
                    <Avatar 
                      className={`w-10 h-10 border-2 border-card ${
                        member.role === 'captain' ? 'ring-2 ring-yellow-500' : ''
                      }`}
                    >
                      <AvatarImage src={member.user?.profileImageUrl} />
                      <AvatarFallback>
                        {member.user?.username?.charAt(0).toUpperCase() || 'M'}
                      </AvatarFallback>
                    </Avatar>
                    {member.role && (
                      <div className={`absolute -bottom-1 -right-1 px-1 py-0.5 rounded-full text-xs font-bold ${getRoleBadgeColor(member.role)}`}>
                        {member.role === 'captain' ? <Crown className="w-2 h-2" /> : 
                         member.role === 'igl' ? <Target className="w-2 h-2" /> :
                         member.role === 'fragger' ? <Zap className="w-2 h-2" /> :
                         <Star className="w-2 h-2" />}
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div>
                    <p className="font-medium">{member.user?.username || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
            
            {members.length > 5 && (
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                <span className="text-xs font-medium">+{members.length - 5}</span>
              </div>
            )}
            
            {/* Add Player Button */}
            {members.length < team.maxPlayers && isOwner && (
              <Button
                variant="outline"
                size="sm"
                className="w-10 h-10 rounded-full p-0 border-dashed border-2 hover:border-primary"
                onClick={() => onAddPlayer(team.id)}
                data-testid={`add-player-${team.id}`}
              >
                <UserPlus className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          {/* No Members State */}
          {members.length === 0 && (
            <div className="text-center py-4">
              <Users className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">No members yet</p>
              {isOwner && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onAddPlayer(team.id)}
                >
                  <UserPlus className="w-4 h-4 mr-1" />
                  Add Players
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            Created {new Date(team.createdAt).toLocaleDateString('en-IN')}
          </div>
          
          {stats.tournaments > 0 && (
            <div className="flex items-center gap-1 text-xs text-yellow-500">
              <Trophy className="w-3 h-3" />
              {stats.tournaments} Wins
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
