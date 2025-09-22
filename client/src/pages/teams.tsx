
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import TeamManagementCard from "@/components/team/team-management-card";
import CreateEditTeamModal from "@/components/team/create-edit-team-modal";
import AddEditPlayerModal from "@/components/team/add-edit-player-modal";
import JoinTeamModal from "@/components/team/join-team-modal";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Users, Plus, UserPlus, Trophy, Target, Zap, Crown } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function Teams() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Modal states
  const [showCreateEditModal, setShowCreateEditModal] = useState(false);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [showJoinTeamModal, setShowJoinTeamModal] = useState(false);
  
  // Edit states
  const [editingTeam, setEditingTeam] = useState(null);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [currentTeamId, setCurrentTeamId] = useState(null);

  const { data: userTeams, isLoading } = useQuery({
    queryKey: ["/api/user/teams"],
    enabled: !!user,
  });

  // Team operations
  const deleteTeamMutation = useMutation({
    mutationFn: async (teamId: string) => {
      return await apiRequest("DELETE", `/api/teams/${teamId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/teams"] });
      toast({
        title: "Success!",
        description: "Team deleted successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const joinTeamMutation = useMutation({
    mutationFn: async (teamCode: string) => {
      return await apiRequest("POST", "/api/teams/join", { teamCode });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/teams"] });
      setShowJoinTeamModal(false);
      toast({
        title: "Success!",
        description: "Joined team successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Modal handlers
  const handleCreateTeam = () => {
    setEditingTeam(null);
    setShowCreateEditModal(true);
  };

  const handleEditTeam = (team: any) => {
    setEditingTeam(team);
    setShowCreateEditModal(true);
  };

  const handleDeleteTeam = (teamId: string) => {
    if (confirm("Are you sure you want to delete this team? This action cannot be undone.")) {
      deleteTeamMutation.mutate(teamId);
    }
  };

  const handleAddPlayer = (teamId: string) => {
    setCurrentTeamId(teamId);
    setEditingPlayer(null);
    setShowAddPlayerModal(true);
  };

  const handleEditPlayer = (player: any, teamId: string) => {
    setCurrentTeamId(teamId);
    setEditingPlayer(player);
    setShowAddPlayerModal(true);
  };

  const handleJoinTeam = (teamCode: string) => {
    joinTeamMutation.mutate(teamCode);
  };

  const copyTeamCode = (teamCode: string) => {
    navigator.clipboard.writeText(teamCode);
    toast({
      title: "Copied!",
      description: "Team code copied to clipboard",
    });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-br from-primary/10 via-accent/5 to-destructive/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-black mb-4">
              <span className="text-gradient">TEAM MANAGEMENT</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Create, manage, and lead your esports squad to victory
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="gradient-fire text-black font-bold hover:scale-105 transition-transform px-8 py-3"
              onClick={handleCreateTeam}
              data-testid="create-team-button"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Team
            </Button>
            <Button 
              variant="outline" 
              className="border-primary text-primary hover:bg-primary hover:text-black font-bold px-8 py-3"
              onClick={() => setShowJoinTeamModal(true)}
              data-testid="join-team-button"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Join Team
            </Button>
          </div>
        </div>
      </section>

      {/* Teams Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* My Teams */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <Crown className="w-8 h-8 text-primary" />
                My Teams
              </h2>
              <div className="text-sm text-muted-foreground">
                {userTeams?.length || 0} teams created
              </div>
            </div>

            {userTeams && userTeams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="user-teams-grid">
                {userTeams.map((team: any) => (
                  <TeamManagementCard 
                    key={team.id} 
                    team={team}
                    onEdit={handleEditTeam}
                    onDelete={handleDeleteTeam}
                    onAddPlayer={handleAddPlayer}
                    onEditPlayer={handleEditPlayer}
                    onCopyCode={copyTeamCode}
                    isOwner={true}
                  />
                ))}
              </div>
            ) : (
              <Card className="bg-card/50 border-dashed border-2 border-border">
                <CardContent className="p-12 text-center">
                  <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No Teams Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Create your first team and start building your esports legacy
                  </p>
                  <Button 
                    className="gradient-fire text-black font-bold"
                    onClick={handleCreateTeam}
                    data-testid="create-first-team"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Team
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Team Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="bg-card border-border hover:border-primary/50 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 gradient-fire rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-lg font-bold mb-2">Tournament Ready</h3>
                <p className="text-sm text-muted-foreground">
                  Organize your squad for competitive tournaments and leagues
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-accent/50 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 gradient-electric rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-lg font-bold mb-2">Performance Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Track team stats, win rates, and individual player performance
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-destructive/50 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 gradient-victory rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-lg font-bold mb-2">Advanced Management</h3>
                <p className="text-sm text-muted-foreground">
                  Assign roles, manage roster, and coordinate team strategies
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Team Guidelines */}
          <Card className="bg-card/50 border-border">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Team Management Guidelines</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2 text-primary">Team Creation</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Choose a unique and appropriate team name</li>
                    <li>• Upload a team logo for better recognition</li>
                    <li>• Set the correct game type for your team</li>
                    <li>• Invite skilled players to join your roster</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-accent">Player Management</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Assign appropriate roles to team members</li>
                    <li>• Keep player information up to date</li>
                    <li>• Monitor team performance and stats</li>
                    <li>• Maintain good team communication</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />

      {/* Modals */}
      <CreateEditTeamModal 
        isOpen={showCreateEditModal}
        onClose={() => setShowCreateEditModal(false)}
        team={editingTeam}
        onAddPlayer={(teamId) => handleAddPlayer(teamId)}
      />

      <AddEditPlayerModal 
        isOpen={showAddPlayerModal}
        onClose={() => setShowAddPlayerModal(false)}
        player={editingPlayer}
        teamId={currentTeamId}
      />

      <JoinTeamModal 
        isOpen={showJoinTeamModal}
        onClose={() => setShowJoinTeamModal(false)}
        onJoin={handleJoinTeam}
        isLoading={joinTeamMutation.isPending}
      />
    </div>
  );
}
