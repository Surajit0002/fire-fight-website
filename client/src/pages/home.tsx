import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import MobileHeader from "@/components/layout/mobile-header";
import MobileNav from "@/components/layout/mobile-nav";
import Footer from "@/components/layout/footer";
import TournamentGrid from "@/components/tournament/tournament-grid";
import LiveMatchCard from "@/components/matches/live-match-card";
import ChampionCard from "@/components/winners/champion-card";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Filter, Users, CreditCard, BarChart2, Calendar, Zap } from "lucide-react";
import { Link } from "wouter";
import { useWebSocket } from "@/hooks/useWebSocket";

export default function Home() {
  const { data: featuredTournaments, isLoading: tournamentsLoading } = useQuery({
    queryKey: ["/api/tournaments/featured"],
  });

  const { data: liveMatches, isLoading: matchesLoading } = useQuery({
    queryKey: ["/api/matches/live"],
  });

  const { data: winners, isLoading: winnersLoading } = useQuery({
    queryKey: ["/api/leaderboard/winners"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats/dashboard"],
  });

  // WebSocket for real-time updates
  useWebSocket();

  if (tournamentsLoading || matchesLoading || winnersLoading || statsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MobileHeader />
      
      {/* Hero Section */}
      <section className="relative bg-background py-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-destructive/10"></div>
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl animate-float" style={{animationDelay: "-1s"}}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-black mb-6">
              <span className="text-gradient">FIRE</span>
              <span className="text-foreground">FIGHT</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Join the ultimate gaming battlefield. Compete in premium tournaments, win massive prizes, and dominate the leaderboards.
            </p>

            {/* Hero Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mb-12">
              <div className="text-center" data-testid="stat-players">
                <div className="text-3xl md:text-4xl font-bold text-primary">{stats?.totalUsers || 0}</div>
                <div className="text-sm text-muted-foreground">Active Players</div>
              </div>
              <div className="text-center" data-testid="stat-prizes">
                <div className="text-3xl md:text-4xl font-bold text-accent">₹{stats?.totalPrizePool || 0}</div>
                <div className="text-sm text-muted-foreground">Total Prizes</div>
              </div>
              <div className="text-center" data-testid="stat-tournaments">
                <div className="text-3xl md:text-4xl font-bold text-destructive">{stats?.liveTournaments || 0}</div>
                <div className="text-sm text-muted-foreground">Live Tournaments</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/tournaments">
                <Button 
                  size="lg" 
                  className="gradient-fire text-black font-bold text-lg hover:scale-105 transition-transform animate-glow"
                  data-testid="button-browse-tournaments"
                >
                  Browse Tournaments
                </Button>
              </Link>
              <Link href="/teams">
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="font-medium text-lg"
                  data-testid="button-create-team"
                >
                  Create Team
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Filters */}
      <section className="bg-card/50 py-8 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-3">
              <Button className="bg-primary text-primary-foreground" data-testid="filter-all">
                All Tournaments
              </Button>
              <Button variant="secondary" data-testid="filter-upcoming">
                Upcoming
              </Button>
              <Button variant="secondary" data-testid="filter-live">
                Live Now
              </Button>
              <Button variant="secondary" data-testid="filter-cash">
                Cash Prizes
              </Button>
              <Button variant="secondary" data-testid="filter-free">
                Free Entry
              </Button>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Input 
                  type="text" 
                  placeholder="Search tournaments..." 
                  className="pl-10"
                  data-testid="input-search"
                />
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              </div>
              <Button variant="secondary" size="sm" data-testid="button-filter">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tournaments */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Featured Tournaments</h2>
            <Link href="/tournaments">
              <Button variant="ghost" className="text-primary hover:text-primary/80" data-testid="link-view-all">
                View All →
              </Button>
            </Link>
          </div>

          <TournamentGrid tournaments={featuredTournaments || []} />
        </div>
      </section>

      {/* Live Matches */}
      {liveMatches && liveMatches.length > 0 && (
        <section className="bg-card/30 py-16 border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <span className="animate-pulse-glow w-3 h-3 bg-destructive rounded-full"></span>
                Live Matches
              </h2>
              <Link href="/tournaments">
                <Button variant="ghost" className="text-primary hover:text-primary/80" data-testid="link-view-live">
                  View All Live →
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {liveMatches.slice(0, 2).map((match: any) => (
                <LiveMatchCard key={match.id} match={match} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Winners */}
      {winners && winners.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <Zap className="w-8 h-8 text-primary" />
                Recent Champions
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {winners.slice(0, 3).map((winner: any, index: number) => (
                <ChampionCard key={winner.id || index} winner={winner} position={index + 1} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section className="bg-card/50 py-16 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Create Team */}
            <Link href="/teams">
              <Card className="bg-card border-border hover:border-primary/50 transition-colors group cursor-pointer">
                <CardContent className="p-6">
                  <div className="w-12 h-12 gradient-fire rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6 text-black" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Create Team</h3>
                  <p className="text-sm text-muted-foreground mb-4">Form your squad and dominate tournaments together.</p>
                  <Button variant="ghost" className="text-primary hover:text-primary/80 p-0" data-testid="link-create-team">
                    Create Now →
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Quick Join */}
            <Link href="/tournaments">
              <Card className="bg-card border-border hover:border-accent/50 transition-colors group cursor-pointer">
                <CardContent className="p-6">
                  <div className="w-12 h-12 gradient-electric rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Calendar className="w-6 h-6 text-black" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Quick Join</h3>
                  <p className="text-sm text-muted-foreground mb-4">Jump into the next available tournament instantly.</p>
                  <Button variant="ghost" className="text-accent hover:text-accent/80 p-0" data-testid="link-quick-join">
                    Find Match →
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Wallet */}
            <Link href="/wallet">
              <Card className="bg-card border-border hover:border-destructive/50 transition-colors group cursor-pointer">
                <CardContent className="p-6">
                  <div className="w-12 h-12 gradient-victory rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <CreditCard className="w-6 h-6 text-black" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Add Funds</h3>
                  <p className="text-sm text-muted-foreground mb-4">Top up your wallet for tournament entries.</p>
                  <Button variant="ghost" className="text-destructive hover:text-destructive/80 p-0" data-testid="link-add-funds">
                    Add Money →
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Leaderboard */}
            <Link href="/leaderboard">
              <Card className="bg-card border-border hover:border-primary/50 transition-colors group cursor-pointer">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <BarChart2 className="w-6 h-6 text-black" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Leaderboard</h3>
                  <p className="text-sm text-muted-foreground mb-4">Check your rank and climb to the top.</p>
                  <Button variant="ghost" className="text-primary hover:text-primary/80 p-0" data-testid="link-leaderboard">
                    View Rankings →
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <MobileNav />
    </div>
  );
}
