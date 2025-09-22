import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import TournamentGrid from "@/components/tournament/tournament-grid";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, SlidersHorizontal } from "lucide-react";

export default function Tournaments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGame, setSelectedGame] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [entryFeeFilter, setEntryFeeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);

  const { data: tournaments, isLoading } = useQuery({
    queryKey: ["/api/tournaments", { page, limit: 20 }],
  });

  const { data: featuredTournaments } = useQuery({
    queryKey: ["/api/tournaments/featured"],
  });

  const filteredTournaments = tournaments?.filter((tournament: any) => {
    const matchesSearch = tournament.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tournament.game.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGame = selectedGame === "all" || tournament.game.toLowerCase() === selectedGame;
    const matchesStatus = selectedStatus === "all" || tournament.status === selectedStatus;
    const matchesEntryFee = entryFeeFilter === "all" || 
                           (entryFeeFilter === "free" && parseFloat(tournament.entryFee) === 0) ||
                           (entryFeeFilter === "paid" && parseFloat(tournament.entryFee) > 0);
    
    return matchesSearch && matchesGame && matchesStatus && matchesEntryFee;
  }) || [];

  const sortedTournaments = [...filteredTournaments].sort((a, b) => {
    switch (sortBy) {
      case "prize":
        return parseFloat(b.prizePool) - parseFloat(a.prizePool);
      case "startTime":
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      case "popular":
        return b.currentParticipants - a.currentParticipants;
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
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
              <span className="text-gradient">TOURNAMENTS</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Compete in premium gaming tournaments and win massive prizes
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="bg-card/50 py-8 border-y border-border sticky top-16 z-40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search and Filter Row */}
          <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative">
                <Input 
                  type="text" 
                  placeholder="Search tournaments..." 
                  className="pl-10 w-80"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-tournaments"
                />
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              </div>
              <Button variant="secondary" size="sm" data-testid="button-advanced-filters">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
            
            <div className="flex items-center gap-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40" data-testid="select-sort">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="prize">Prize Pool</SelectItem>
                  <SelectItem value="startTime">Start Time</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <Button 
              variant={selectedStatus === "all" ? "default" : "secondary"} 
              size="sm"
              onClick={() => setSelectedStatus("all")}
              data-testid="filter-all-status"
            >
              All
            </Button>
            <Button 
              variant={selectedStatus === "upcoming" ? "default" : "secondary"} 
              size="sm"
              onClick={() => setSelectedStatus("upcoming")}
              data-testid="filter-upcoming"
            >
              Upcoming
            </Button>
            <Button 
              variant={selectedStatus === "live" ? "default" : "secondary"} 
              size="sm"
              onClick={() => setSelectedStatus("live")}
              data-testid="filter-live"
            >
              <span className="w-2 h-2 bg-destructive rounded-full animate-pulse mr-2"></span>
              Live Now
            </Button>
            <Button 
              variant={entryFeeFilter === "free" ? "default" : "secondary"} 
              size="sm"
              onClick={() => setEntryFeeFilter("free")}
              data-testid="filter-free"
            >
              Free Entry
            </Button>
            <Button 
              variant={entryFeeFilter === "paid" ? "default" : "secondary"} 
              size="sm"
              onClick={() => setEntryFeeFilter("paid")}
              data-testid="filter-paid"
            >
              Cash Prizes
            </Button>
            
            <div className="ml-4 flex gap-2">
              <Select value={selectedGame} onValueChange={setSelectedGame}>
                <SelectTrigger className="w-32" data-testid="select-game">
                  <SelectValue placeholder="Game" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Games</SelectItem>
                  <SelectItem value="bgmi">BGMI</SelectItem>
                  <SelectItem value="free fire">Free Fire</SelectItem>
                  <SelectItem value="cod mobile">COD Mobile</SelectItem>
                  <SelectItem value="valorant">Valorant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          {(searchQuery || selectedGame !== "all" || selectedStatus !== "all" || entryFeeFilter !== "all") && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
              <span className="text-sm text-muted-foreground mr-2">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1" data-testid="filter-search-badge">
                  Search: {searchQuery}
                  <button onClick={() => setSearchQuery("")} className="ml-1 hover:text-destructive">×</button>
                </Badge>
              )}
              {selectedGame !== "all" && (
                <Badge variant="secondary" className="gap-1" data-testid="filter-game-badge">
                  Game: {selectedGame}
                  <button onClick={() => setSelectedGame("all")} className="ml-1 hover:text-destructive">×</button>
                </Badge>
              )}
              {selectedStatus !== "all" && (
                <Badge variant="secondary" className="gap-1" data-testid="filter-status-badge">
                  Status: {selectedStatus}
                  <button onClick={() => setSelectedStatus("all")} className="ml-1 hover:text-destructive">×</button>
                </Badge>
              )}
              {entryFeeFilter !== "all" && (
                <Badge variant="secondary" className="gap-1" data-testid="filter-entry-badge">
                  Entry: {entryFeeFilter}
                  <button onClick={() => setEntryFeeFilter("all")} className="ml-1 hover:text-destructive">×</button>
                </Badge>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Featured Tournaments */}
      {featuredTournaments && featuredTournaments.length > 0 && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-6">Featured Tournaments</h2>
            <TournamentGrid tournaments={featuredTournaments.slice(0, 4)} />
          </div>
        </section>
      )}

      {/* All Tournaments */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              All Tournaments 
              <span className="text-muted-foreground text-lg font-normal ml-2">
                ({sortedTournaments.length} found)
              </span>
            </h2>
          </div>

          <TournamentGrid tournaments={sortedTournaments} />

          {/* Load More */}
          {tournaments && tournaments.length >= 20 && (
            <div className="text-center mt-12">
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => setPage(page + 1)}
                data-testid="button-load-more"
              >
                Load More Tournaments
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
