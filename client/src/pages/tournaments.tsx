import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Tournament } from "@shared/schema";
import Header from "@/components/layout/header";
import MobileHeader from "@/components/layout/mobile-header";
import MobileNav from "@/components/layout/mobile-nav";
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
  const [allTournaments, setAllTournaments] = useState<Tournament[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const { data: tournaments = [], isLoading } = useQuery<Tournament[]>({
    queryKey: ["/api/tournaments", { page, limit: 20 }],
  });

  useEffect(() => {
    if (tournaments.length > 0) {
      if (page === 1) {
        setAllTournaments(tournaments);
      } else {
        setAllTournaments(prev => [...prev, ...tournaments]);
      }
    }
  }, [tournaments, page]);

  const { data: featuredTournaments = [] } = useQuery<Tournament[]>({
    queryKey: ["/api/tournaments/featured"],
  });

  const filteredTournaments = allTournaments.filter((tournament: Tournament) => {
    const matchesSearch = tournament.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tournament.game.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGame = selectedGame === "all" || tournament.game.toLowerCase() === selectedGame;
    const matchesStatus = selectedStatus === "all" || tournament.status === selectedStatus;
    const matchesEntryFee = entryFeeFilter === "all" || 
                           (entryFeeFilter === "free" && parseFloat(tournament.entryFee) === 0) ||
                           (entryFeeFilter === "paid" && parseFloat(tournament.entryFee) > 0);
    
    return matchesSearch && matchesGame && matchesStatus && matchesEntryFee;
  });

  const sortedTournaments = [...filteredTournaments].sort((a, b) => {
    switch (sortBy) {
      case "prize":
        return parseFloat(b.prizePool) - parseFloat(a.prizePool);
      case "startTime":
        return new Date(a.startTime || 0).getTime() - new Date(b.startTime || 0).getTime();
      case "popular":
        return (b.currentParticipants || 0) - (a.currentParticipants || 0);
      default:
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MobileHeader />
      
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
      <section className="bg-card/50 py-4 border-y border-border sticky top-16 z-40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Filter Row */}
          <div className="flex items-center justify-between gap-4">
            {/* Left - Advanced Filters Button */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAdvancedFilters(true)}
              className="flex items-center gap-2 h-10 px-4 border-2 hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
              data-testid="button-advanced-filters"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {(selectedGame !== "all" || selectedStatus !== "all" || entryFeeFilter !== "all") && (
                <Badge className="ml-1 bg-primary text-primary-foreground text-xs h-5 w-5 p-0 flex items-center justify-center">
                  {[selectedGame !== "all", selectedStatus !== "all", entryFeeFilter !== "all"].filter(Boolean).length}
                </Badge>
              )}
            </Button>

            {/* Center - Search Input */}
            <div className="relative flex-1 max-w-md">
              <Input 
                type="text" 
                placeholder="Search tournaments..." 
                className="pl-10 h-10 border-2 focus:border-primary/50 transition-all duration-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-tournaments"
              />
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
                  onClick={() => setSearchQuery("")}
                >
                  ×
                </Button>
              )}
            </div>

            {/* Right - Sort Dropdown */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 h-10 border-2 focus:border-primary/50" data-testid="select-sort">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="rounded-lg border-2 shadow-xl">
                <SelectItem value="newest">🆕 Newest</SelectItem>
                <SelectItem value="prize">💰 Prize Pool</SelectItem>
                <SelectItem value="startTime">⏰ Start Time</SelectItem>
                <SelectItem value="popular">🔥 Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Pills */}
          {(searchQuery || selectedGame !== "all" || selectedStatus !== "all" || entryFeeFilter !== "all") && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border/50">
              <span className="text-xs text-muted-foreground mr-1 flex items-center">
                <Filter className="w-3 h-3 mr-1" />
                Active:
              </span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1 text-xs" data-testid="filter-search-badge">
                  🔍 "{searchQuery}"
                  <button onClick={() => setSearchQuery("")} className="ml-1 hover:text-destructive text-xs">×</button>
                </Badge>
              )}
              {selectedGame !== "all" && (
                <Badge variant="secondary" className="gap-1 text-xs" data-testid="filter-game-badge">
                  🎮 {selectedGame.toUpperCase()}
                  <button onClick={() => setSelectedGame("all")} className="ml-1 hover:text-destructive text-xs">×</button>
                </Badge>
              )}
              {selectedStatus !== "all" && (
                <Badge variant="secondary" className="gap-1 text-xs" data-testid="filter-status-badge">
                  📊 {selectedStatus}
                  <button onClick={() => setSelectedStatus("all")} className="ml-1 hover:text-destructive text-xs">×</button>
                </Badge>
              )}
              {entryFeeFilter !== "all" && (
                <Badge variant="secondary" className="gap-1 text-xs" data-testid="filter-entry-badge">
                  💵 {entryFeeFilter}
                  <button onClick={() => setEntryFeeFilter("all")} className="ml-1 hover:text-destructive text-xs">×</button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-6 px-2 text-muted-foreground hover:text-destructive"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedGame("all");
                  setSelectedStatus("all");
                  setEntryFeeFilter("all");
                }}
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Advanced Filters Modal */}
      {showAdvancedFilters && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAdvancedFilters(false)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 px-6 py-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Filter className="w-5 h-5 text-primary" />
                  Advanced Filters
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvancedFilters(false)}
                  className="h-8 w-8 p-0 hover:bg-muted"
                >
                  ×
                </Button>
              </div>
            </div>

            {/* Filters Content */}
            <div className="p-6 space-y-6">
              {/* Game Type Filter */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  🎮 Game Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "all", label: "All Games", icon: "🎯" },
                    { value: "bgmi", label: "BGMI", icon: "🎮" },
                    { value: "free fire", label: "Free Fire", icon: "🔥" },
                    { value: "cod mobile", label: "COD Mobile", icon: "⚡" },
                    { value: "valorant", label: "Valorant", icon: "🎯" },
                    { value: "pubg mobile", label: "PUBG Mobile", icon: "🏆" }
                  ].map((game) => (
                    <Button
                      key={game.value}
                      variant={selectedGame === game.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedGame(game.value)}
                      className="justify-start text-xs h-9"
                    >
                      <span className="mr-2">{game.icon}</span>
                      {game.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Tournament Status */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  📊 Tournament Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "all", label: "All Status", icon: "📋" },
                    { value: "upcoming", label: "Upcoming", icon: "⏳" },
                    { value: "live", label: "Live Now", icon: "🔴" },
                    { value: "completed", label: "Completed", icon: "✅" }
                  ].map((status) => (
                    <Button
                      key={status.value}
                      variant={selectedStatus === status.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedStatus(status.value)}
                      className="justify-start text-xs h-9"
                    >
                      <span className="mr-2">{status.icon}</span>
                      {status.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Entry Fee Filter */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  💰 Entry Fee
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { value: "all", label: "All Tournaments", icon: "💼" },
                    { value: "free", label: "Free Entry Only", icon: "🆓" },
                    { value: "paid", label: "Cash Prizes Only", icon: "💵" }
                  ].map((fee) => (
                    <Button
                      key={fee.value}
                      variant={entryFeeFilter === fee.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setEntryFeeFilter(fee.value)}
                      className="justify-start text-xs h-9"
                    >
                      <span className="mr-2">{fee.icon}</span>
                      {fee.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border bg-muted/20">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedGame("all");
                    setSelectedStatus("all");
                    setEntryFeeFilter("all");
                  }}
                  className="flex-1"
                >
                  Reset All
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowAdvancedFilters(false)}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Featured Tournaments */}
      {featuredTournaments.length > 0 && (
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
      <MobileNav />
    </div>
  );
}
