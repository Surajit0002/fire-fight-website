import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import TeamCard from "@/components/team/team-card";
import CreateTeamModal from "@/components/team/create-team-modal";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Users, Plus, Crown, UserPlus } from "lucide-react";

export default function Teams() {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: userTeams, isLoading } = useQuery({
    queryKey: ["/api/user/teams"],
    enabled: !!user,
  });

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
              <span className="text-gradient">TEAMS</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Create your squad and dominate tournaments together
            </p>
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
              <Button 
                className="gradient-fire text-black font-bold hover:scale-105 transition-transform"
                onClick={() => setShowCreateModal(true)}
                data-testid="create-team-button"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Team
              </Button>
            </div>

            {userTeams && userTeams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="user-teams-grid">
                {userTeams.map((team: any) => (
                  <TeamCard key={team.id} team={team} isOwner={true} />
                ))}
              </div>
            ) : (
              <Card className="bg-card/50 border-dashed border-2 border-border">
                <CardContent className="p-12 text-center">
                  <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No Teams Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Create your first team to compete in team tournaments
                  </p>
                  <Button 
                    className="gradient-fire text-black font-bold"
                    onClick={() => setShowCreateModal(true)}
                    data-testid="create-first-team"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Team
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Team Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="bg-card border-border hover:border-primary/50 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 gradient-fire rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-lg font-bold mb-2">Squad Tournaments</h3>
                <p className="text-sm text-muted-foreground">
                  Participate in exclusive team-based tournaments with your squad
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-accent/50 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 gradient-electric rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-lg font-bold mb-2">Team Management</h3>
                <p className="text-sm text-muted-foreground">
                  Manage your roster, assign roles, and coordinate strategies
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-destructive/50 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 gradient-victory rounded-lg flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-lg font-bold mb-2">Invite Friends</h3>
                <p className="text-sm text-muted-foreground">
                  Invite your friends to join your team and compete together
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Team Requirements */}
          <Card className="bg-card/50 border-border">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Team Requirements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">BGMI Teams</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Maximum 4 players per team</li>
                    <li>• One captain required</li>
                    <li>• Valid BGMI IDs for all members</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Free Fire Teams</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Maximum 4 players per team</li>
                    <li>• Team name and tag required</li>
                    <li>• Valid Free Fire IDs for all members</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />

      {/* Create Team Modal */}
      <CreateTeamModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
