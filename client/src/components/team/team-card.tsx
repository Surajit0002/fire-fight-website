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
  LogOut 
} from "lucide-react";

interface TeamCardProps {
  team: {
    id: string;
    name: string;
    tag?: string;
    logoUrl?: string;
    captainId: string;
    maxPlayers: number;
    createdAt: string;
  };
  isOwner: boolean;
}

export default function TeamCard({ team, isOwner }: TeamCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: teamMembers } = useQuery({
    queryKey: ["/api/teams", team.id],
  });

  const members = teamMembers?.members || [];
  const captain = members.find((m: any) => m.role === 'captain');

  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-colors group" data-testid={`team-card-${team.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 gradient-fire rounded-lg flex items-center justify-center">
              {team.logoUrl ? (
                <img src={team.logoUrl} alt={team.name} className="w-8 h-8 rounded" />
              ) : (
                <Users className="w-6 h-6 text-black" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg" data-testid={`team-name-${team.id}`}>
                {team.name}
              </CardTitle>
              {team.tag && (
                <Badge variant="secondary" className="mt-1" data-testid={`team-tag-${team.id}`}>
                  {team.tag}
                </Badge>
              )}
            </div>
          </div>
          
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" data-testid={`team-menu-${team.id}`}>
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Team
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite Members
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Delete Team
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Team Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary" data-testid={`member-count-${team.id}`}>
              {members.length}
            </div>
            <div className="text-sm text-muted-foreground">Members</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent" data-testid={`max-members-${team.id}`}>
              {team.maxPlayers}
            </div>
            <div className="text-sm text-muted-foreground">Max Size</div>
          </div>
        </div>

        {/* Team Members */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Team Members</span>
            <span className="text-xs text-muted-foreground">
              {members.length}/{team.maxPlayers} slots filled
            </span>
          </div>
          
          <div className="space-y-2">
            {members.slice(0, 3).map((member: any, index: number) => (
              <div 
                key={member.id} 
                className="flex items-center gap-3 p-2 rounded-lg bg-muted/30"
                data-testid={`member-${team.id}-${index}`}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={member.user?.profileImageUrl} />
                  <AvatarFallback>
                    {member.user?.username?.charAt(0).toUpperCase() || 'M'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {member.user?.username || 'Unknown'}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    {member.role === 'captain' && <Crown className="w-3 h-3" />}
                    {member.role}
                  </div>
                </div>
              </div>
            ))}
            
            {members.length > 3 && (
              <div className="text-center py-2">
                <span className="text-xs text-muted-foreground">
                  +{members.length - 3} more members
                </span>
              </div>
            )}
            
            {members.length === 0 && (
              <div className="text-center py-4">
                <Users className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No members yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <Button 
            variant="outline" 
            className="flex-1" 
            size="sm"
            data-testid={`view-team-${team.id}`}
          >
            View Details
          </Button>
          {members.length < team.maxPlayers && isOwner && (
            <Button 
              className="flex-1 gradient-electric text-black font-medium" 
              size="sm"
              data-testid={`invite-members-${team.id}`}
            >
              <UserPlus className="w-4 h-4 mr-1" />
              Invite
            </Button>
          )}
        </div>

        {/* Team Created */}
        <div className="text-xs text-muted-foreground mt-3 text-center">
          Created {new Date(team.createdAt).toLocaleDateString('en-IN')}
        </div>
      </CardContent>
    </Card>
  );
}
