import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import PlayerRankCard from "@/components/leaderboard/player-rank-card";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Trophy, 
  Crown, 
  Medal,
  Star,
  TrendingUp,
  Calendar,
  Filter
} from "lucide-react";

export default function Leaderboard() {
  const [timeFilter, setTimeFilter] = useState("all-time");
  const [gameFilter, setGameFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");

  const { data: winners, isLoading: winnersLoading } = useQuery({
    queryKey: ["/api/leaderboard/winners"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats/dashboard"],
  });

  if (winnersLoading || statsLoading) {
    return <LoadingSpinner />;
  }

  // Mock leaderboard data based on winners - in real app this would come from a leaderboard API
  const topPlayers = winners?.slice(0, 50).map((winner: any, index: number) => ({
    id: winner.winnerId || `player-${index}`,
    username: winner.winnerTeamId ? `Team ${index + 1}` : `Player ${index + 1}`,
    rank: index + 1,
    points: Math.max(1000 - (index * 20), 100),
    wins: Math.floor(Math.random() * 20) + 1,
    totalEarnings: parseFloat(winner.prizePool || '0'),
    gamesPlayed: Math.floor(Math.random() * 50) + 10,
    winRate: Math.floor(Math.random() * 40) + 60,
    game: winner.game,
    profileImageUrl: null,
    isTeam: !!winner.winnerTeamId,
    badge: index < 3 ? ['crown', 'medal', 'star'][index] : null,
  })) || [];

  const podiumPlayers = topPlayers.slice(0, 3);
  const otherPlayers = topPlayers.slice(3);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-br from-primary/10 via-accent/5 to-destructive/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-black mb-4">
              <span className="text-gradient">LEADERBOARD</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Rankings of the best players and teams in the FireFight Arena
            </p>
          </div>

          {/* Platform Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary" data-testid="total-players">
                {stats?.totalUsers?.toLocaleString('en-IN') || '0'}
              </div>
              <div className="text-sm text-muted-foreground">Total Players</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent" data-testid="tournaments-completed">
                {stats?.totalTournaments || '0'}
              </div>
              <div className="text-sm text-muted-foreground">Tournaments</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-destructive" data-testid="total-prize-distributed">
                ₹{stats?.totalPrizePool?.toLocaleString('en-IN') || '0'}
              </div>
              <div className="text-sm text-muted-foreground">Prize Distributed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500" data-testid="active-competitions">
                {stats?.liveTournaments || '0'}
              </div>
              <div className="text-sm text-muted-foreground">Live Now</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-card/50 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-32" data-testid="time-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-time">All Time</SelectItem>
                  <SelectItem value="monthly">This Month</SelectItem>
                  <SelectItem value="weekly">This Week</SelectItem>
                  <SelectItem value="daily">Today</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={gameFilter} onValueChange={setGameFilter}>
                <SelectTrigger className="w-32" data-testid="game-filter">
                  <SelectValue placeholder="All Games" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Games</SelectItem>
                  <SelectItem value="bgmi">BGMI</SelectItem>
                  <SelectItem value="free fire">Free Fire</SelectItem>
                  <SelectItem value="cod mobile">COD Mobile</SelectItem>
                  <SelectItem value="valorant">Valorant</SelectItem>
                </SelectContent>
              </Select>

              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger className="w-32" data-testid="region-filter">
                  <SelectValue placeholder="All Regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="india">India</SelectItem>
                  <SelectItem value="asia">Asia</SelectItem>
                  <SelectItem value="global">Global</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Badge variant="secondary" className="font-mono">
              Last updated: {new Date().toLocaleDateString('en-IN')}
            </Badge>
          </div>
        </div>
      </section>

      {/* Podium Section */}
      {podiumPlayers.length >= 3 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 flex items-center justify-center gap-3">
              <Crown className="w-8 h-8 text-primary" />
              Hall of Champions
            </h2>

            {/* Podium Display */}
            <div className="relative max-w-4xl mx-auto mb-16">
              <div className="grid grid-cols-3 gap-8 items-end">
                {/* 2nd Place */}
                <div className="text-center" data-testid="second-place">
                  <div className="relative mb-4">
                    <div className="w-24 h-24 gradient-electric rounded-full flex items-center justify-center mx-auto text-3xl font-black text-black mb-4">
                      2
                    </div>
                    <div className="bg-card rounded-lg p-4 border border-border">
                      <div className="font-bold text-lg">{podiumPlayers[1]?.username}</div>
                      <div className="text-accent font-semibold">
                        {podiumPlayers[1]?.points.toLocaleString()} pts
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ₹{podiumPlayers[1]?.totalEarnings.toLocaleString('en-IN')} won
                      </div>
                    </div>
                  </div>
                </div>

                {/* 1st Place */}
                <div className="text-center relative z-10" data-testid="first-place">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Crown className="w-8 h-8 text-primary animate-float" />
                  </div>
                  <div className="relative mb-4">
                    <div className="w-32 h-32 gradient-fire rounded-full flex items-center justify-center mx-auto text-4xl font-black text-black mb-4 animate-glow">
                      1
                    </div>
                    <div className="bg-card rounded-lg p-6 border-2 border-primary/50">
                      <div className="font-bold text-xl">{podiumPlayers[0]?.username}</div>
                      <div className="text-primary font-bold text-lg">
                        {podiumPlayers[0]?.points.toLocaleString()} pts
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ₹{podiumPlayers[0]?.totalEarnings.toLocaleString('en-IN')} won
                      </div>
                      <Badge className="mt-2 bg-primary/20 text-primary">
                        Champion
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="text-center" data-testid="third-place">
                  <div className="relative mb-4">
                    <div className="w-20 h-20 gradient-victory rounded-full flex items-center justify-center mx-auto text-2xl font-black text-black mb-4">
                      3
                    </div>
                    <div className="bg-card rounded-lg p-4 border border-border">
                      <div className="font-bold text-lg">{podiumPlayers[2]?.username}</div>
                      <div className="text-green-500 font-semibold">
                        {podiumPlayers[2]?.points.toLocaleString()} pts
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ₹{podiumPlayers[2]?.totalEarnings.toLocaleString('en-IN')} won
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Full Rankings */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="players" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
              <TabsTrigger value="players" data-testid="tab-players">Players</TabsTrigger>
              <TabsTrigger value="teams" data-testid="tab-teams">Teams</TabsTrigger>
            </TabsList>
            
            <TabsContent value="players" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Top Players</h2>
                <span className="text-muted-foreground">
                  Showing {Math.min(otherPlayers.length, 50)} of {topPlayers.length}
                </span>
              </div>

              {otherPlayers.length > 0 ? (
                <div className="space-y-3" data-testid="players-ranking">
                  {otherPlayers.slice(0, 50).map((player: any, index: number) => (
                    <PlayerRankCard key={player.id} player={player} />
                  ))}
                </div>
              ) : (
                <Card className="bg-card/50 border-dashed border-2 border-border">
                  <CardContent className="p-12 text-center">
                    <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No Rankings Yet</h3>
                    <p className="text-muted-foreground">
                      Complete tournaments to appear on the leaderboard!
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="teams" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Top Teams</h2>
                <span className="text-muted-foreground">
                  Team rankings coming soon
                </span>
              </div>

              <Card className="bg-card/50 border-dashed border-2 border-border">
                <CardContent className="p-12 text-center">
                  <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">Team Rankings</h3>
                  <p className="text-muted-foreground mb-4">
                    Team leaderboards will be available after more team tournaments are completed.
                  </p>
                  <Button variant="outline">
                    View Team Tournaments
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Achievement Categories */}
      <section className="py-12 bg-card/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-8">Achievement Categories</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-card border-border hover:border-primary/50 transition-colors">
              <CardHeader className="text-center">
                <div className="w-12 h-12 gradient-fire rounded-lg flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-6 h-6 text-black" />
                </div>
                <CardTitle>Most Wins</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {podiumPlayers[0]?.wins || 0}
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  {podiumPlayers[0]?.username || 'No data'}
                </div>
                <Badge variant="secondary">All Games</Badge>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-accent/50 transition-colors">
              <CardHeader className="text-center">
                <div className="w-12 h-12 gradient-electric rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Star className="w-6 h-6 text-black" />
                </div>
                <CardTitle>Highest Earnings</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-2xl font-bold text-accent mb-1">
                  ₹{podiumPlayers[0]?.totalEarnings.toLocaleString('en-IN') || '0'}
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  {podiumPlayers[0]?.username || 'No data'}
                </div>
                <Badge variant="secondary">Total Prize</Badge>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-destructive/50 transition-colors">
              <CardHeader className="text-center">
                <div className="w-12 h-12 gradient-victory rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Medal className="w-6 h-6 text-black" />
                </div>
                <CardTitle>Best Win Rate</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-2xl font-bold text-green-500 mb-1">
                  {Math.max(...topPlayers.slice(0, 10).map(p => p.winRate))}%
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  Top Performer
                </div>
                <Badge variant="secondary">10+ Games</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
