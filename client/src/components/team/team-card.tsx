
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Crown, 
  MoreVertical, 
  Settings, 
  UserPlus, 
  LogOut,
  Copy,
  Trophy,
  Target,
  TrendingUp,
  Calendar,
} from "lucide-react";

interface TeamCardProps {
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
    };
  };
  isOwner: boolean;
}

export default function TeamCard({ team, isOwner }: TeamCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isHovered, setIsHovered] = useState(false);

  const { data: teamMembers } = useQuery({
    queryKey: ["/api/teams", team.id],
  });

  const members = teamMembers?.members || [];
  const captain = members.find((m: any) => m.role === 'captain');
  const stats = team.stats || { matches: 12, winRate: 67, kills: 856 };

  const handleCopyTeamCode = () => {
    const code = team.teamCode || "DEMO123";
    navigator.clipboard.writeText(code);
    toast({
      title: "Team Code Copied!",
      description: "Share this code with players to join",
    });
  };

  const getGameTypeColor = (gameType: string) => {
    switch (gameType?.toLowerCase()) {
      case 'bgmi': return 'bg-blue-500';
      case 'free fire': return 'bg-orange-500';
      case 'cod mobile': return 'bg-green-500';
      case 'valorant': return 'bg-red-500';
      default: return 'bg-purple-500';
    }
  };

  return (
    <Card 
      className="bg-white shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-blue-300 group overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`team-card-${team.id}`}
    >
      <CardHeader className="pb-3 bg-gradient-to-br from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Team Logo */}
            <div className="w-12 h-12 gradient-fire rounded-xl flex items-center justify-center shadow-md">
              {team.logoUrl ? (
                <img src={team.logoUrl} alt={team.name} className="w-8 h-8 rounded-lg object-cover" />
              ) : (
                <Users className="w-6 h-6 text-black" />
              )}
            </div>
            
            {/* Team Info */}
            <div>
              <CardTitle className="text-lg font-bold text-gray-900" data-testid={`team-name-${team.id}`}>
                {team.name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                {team.tag && (
                  <Badge variant="secondary" className="text-xs" data-testid={`team-tag-${team.id}`}>
                    [{team.tag}]
                  </Badge>
                )}
                {team.gameType && (
                  <Badge className={`${getGameTypeColor(team.gameType)} text-white text-xs px-2 py-1`}>
                    {team.gameType}
                  </Badge>
                )}
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
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  data-testid={`team-menu-${team.id}`}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Team
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite Members
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyTeamCode}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Join Code
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Delete Team
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Team Join Code */}
        {isHovered && team.teamCode && (
          <div className="mt-3 p-2 bg-white/70 rounded-lg backdrop-blur-sm border">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-gray-600">Join Code</span>
                <div className="font-mono text-sm font-bold text-gray-900">{team.teamCode}</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyTeamCode}
                className="h-6 w-6 p-0"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {/* Team Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-2 bg-blue-50 rounded-lg">
            <div className="text-xl font-bold text-blue-600" data-testid={`member-count-${team.id}`}>
              {members.length}
            </div>
            <div className="text-xs text-blue-800 font-medium">Members</div>
          </div>
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <div className="text-xl font-bold text-green-600">
              {stats.winRate}%
            </div>
            <div className="text-xs text-green-800 font-medium">Win Rate</div>
          </div>
          <div className="text-center p-2 bg-red-50 rounded-lg">
            <div className="text-xl font-bold text-red-600">
              {Math.floor(stats.kills / 100) / 10}k
            </div>
            <div className="text-xs text-red-800 font-medium">Kills</div>
          </div>
        </div>

        {/* Performance Indicator */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Team Performance</span>
            <TrendingUp className={`w-4 h-4 ${stats.winRate > 50 ? 'text-green-500' : 'text-red-500'}`} />
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${stats.winRate > 70 ? 'bg-green-500' : stats.winRate > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${Math.min(stats.winRate, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Team Members Preview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Team Members</span>
            <span className="text-xs text-muted-foreground">
              {members.length}/{team.maxPlayers} slots
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Member Avatars */}
            {members.slice(0, 4).map((member: any, index: number) => (
              <div key={member.id} className="relative group">
                <Avatar className="w-8 h-8 border-2 border-white shadow-sm">
                  <AvatarImage src={member.user?.profileImageUrl} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-semibold">
                    {member.user?.username?.charAt(0).toUpperCase() || 'M'}
                  </AvatarFallback>
                </Avatar>
                
                {/* Captain Crown */}
                {member.role === 'captain' && (
                  <Crown className="absolute -top-1 -right-1 w-3 h-3 text-yellow-500" />
                )}

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                  {member.user?.username || 'Unknown'} ({member.role})
                </div>
              </div>
            ))}
            
            {/* More Members Indicator */}
            {members.length > 4 && (
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-xs font-semibold text-gray-600">+{members.length - 4}</span>
              </div>
            )}

            {/* Empty Slots */}
            {members.length < team.maxPlayers && (
              <div className="w-8 h-8 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center">
                <UserPlus className="w-3 h-3 text-gray-400" />
              </div>
            )}
          </div>
            
          {/* No Members State */}
          {members.length === 0 && (
            <div className="text-center py-4 bg-gray-50 rounded-lg">
              <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500 mb-2">No members yet</p>
              <Badge variant="outline" className="text-xs">Ready to recruit!</Badge>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <Button 
            variant="outline" 
            className="flex-1" 
            size="sm"
            data-testid={`view-team-${team.id}`}
          >
            <Trophy className="w-3 h-3 mr-1" />
            View Details
          </Button>
          {members.length < team.maxPlayers && isOwner && (
            <Button 
              className="flex-1 gradient-electric text-black font-medium" 
              size="sm"
              data-testid={`invite-members-${team.id}`}
            >
              <UserPlus className="w-3 h-3 mr-1" />
              Invite
            </Button>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            Created {new Date(team.createdAt).toLocaleDateString('en-IN')}
          </div>
          
          <div className="flex items-center gap-1 text-xs text-blue-600">
            <Target className="w-3 h-3" />
            Active Team
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
