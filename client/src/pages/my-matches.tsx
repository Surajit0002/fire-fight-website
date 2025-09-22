import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  Trophy, 
  Clock, 
  Users, 
  Target,
  Eye,
  Upload,
  FileImage,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  Flag
} from "lucide-react";

export default function MyMatches() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const { data: userTournaments, isLoading: tournamentsLoading } = useQuery({
    queryKey: ["/api/user/tournaments"],
    enabled: !!user,
  });

  const { data: walletTransactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/wallet/transactions", { limit: 20 }],
    enabled: !!user,
  });

  if (tournamentsLoading || transactionsLoading) {
    return <LoadingSpinner />;
  }

  // Separate tournaments by status
  const upcomingMatches = userTournaments?.filter((t: any) => t.tournament?.status === 'upcoming') || [];
  const ongoingMatches = userTournaments?.filter((t: any) => t.tournament?.status === 'live') || [];
  const completedMatches = userTournaments?.filter((t: any) => t.tournament?.status === 'completed') || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-destructive/20 text-destructive';
      case 'upcoming':
        return 'bg-primary/20 text-primary';
      case 'completed':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-accent/20 text-accent';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'failed':
        return 'bg-red-500/20 text-red-400';
      case 'refunded':
        return 'bg-blue-500/20 text-blue-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const MatchCard = ({ match, showActions = true }: { match: any; showActions?: boolean }) => {
    const tournament = match.tournament;
    if (!tournament) return null;

    return (
      <Card className="bg-card border-border hover:border-primary/30 transition-colors" data-testid={`match-card-${tournament.id}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 gradient-fire rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-black" />
              </div>
              <div>
                <h3 className="font-bold text-lg" data-testid={`tournament-title-${tournament.id}`}>
                  {tournament.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {tournament.game} • {tournament.gameMode}
                </p>
              </div>
            </div>
            <Badge className={getStatusColor(tournament.status)} data-testid={`status-${tournament.id}`}>
              {tournament.status === 'live' && (
                <span className="w-2 h-2 bg-current rounded-full animate-pulse mr-2"></span>
              )}
              {tournament.status.toUpperCase()}
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-xl font-bold text-primary" data-testid={`prize-pool-${tournament.id}`}>
                ₹{parseFloat(tournament.prizePool).toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-muted-foreground">Prize Pool</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold" data-testid={`entry-fee-${tournament.id}`}>
                {parseFloat(tournament.entryFee) === 0 ? 'FREE' : `₹${parseFloat(tournament.entryFee).toLocaleString('en-IN')}`}
              </div>
              <div className="text-xs text-muted-foreground">Entry Fee</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold" data-testid={`participants-${tournament.id}`}>
                {tournament.currentParticipants}/{tournament.maxParticipants}
              </div>
              <div className="text-xs text-muted-foreground">Players</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium" data-testid={`start-time-${tournament.id}`}>
                {formatDateTime(tournament.startTime)}
              </div>
              <div className="text-xs text-muted-foreground">Start Time</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className={getPaymentStatusColor(match.paymentStatus)} data-testid={`payment-${tournament.id}`}>
                {match.paymentStatus.toUpperCase()}
              </Badge>
              {match.registrationTime && (
                <span className="text-xs text-muted-foreground">
                  Joined {new Date(match.registrationTime).toLocaleDateString('en-IN')}
                </span>
              )}
            </div>
            
            {showActions && (
              <div className="flex items-center gap-2">
                {tournament.status === 'live' && tournament.isRoomCodeRevealed && tournament.roomCode && (
                  <Button size="sm" variant="outline" data-testid={`room-code-${tournament.id}`}>
                    <Target className="w-4 h-4 mr-1" />
                    Room Code
                  </Button>
                )}
                {tournament.status === 'completed' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setSelectedMatch(match);
                      setReportModalOpen(true);
                    }}
                    data-testid={`report-result-${tournament.id}`}
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    Report
                  </Button>
                )}
                <Button size="sm" variant="outline" data-testid={`view-details-${tournament.id}`}>
                  <Eye className="w-4 h-4 mr-1" />
                  Details
                </Button>
              </div>
            )}
          </div>

          {tournament.status === 'live' && tournament.roomCode && tournament.isRoomCodeRevealed && (
            <div className="mt-4 p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Room Code:</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(tournament.roomCode);
                    toast({ title: "Copied!", description: "Room code copied to clipboard." });
                  }}
                >
                  Copy
                </Button>
              </div>
              <div className="font-mono text-lg font-bold text-center">
                {tournament.roomCode}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-br from-primary/10 via-accent/5 to-destructive/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-black mb-4">
              <span className="text-gradient">MY MATCHES</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Track your tournament progress, view results, and manage your gaming history
            </p>
          </div>
        </div>
      </section>

      {/* Match Overview Stats */}
      <section className="py-8 bg-card/50 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary" data-testid="total-tournaments">
                {userTournaments?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Total Tournaments</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent" data-testid="upcoming-count">
                {upcomingMatches.length}
              </div>
              <div className="text-sm text-muted-foreground">Upcoming</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-destructive" data-testid="live-count">
                {ongoingMatches.length}
              </div>
              <div className="text-sm text-muted-foreground">Live Now</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500" data-testid="completed-count">
                {completedMatches.length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Matches Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
              <TabsTrigger value="all" data-testid="tab-all-matches">All</TabsTrigger>
              <TabsTrigger value="upcoming" data-testid="tab-upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="live" data-testid="tab-live">Live</TabsTrigger>
              <TabsTrigger value="completed" data-testid="tab-completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">All Matches</h2>
                <span className="text-muted-foreground">
                  {userTournaments?.length || 0} total matches
                </span>
              </div>

              {userTournaments && userTournaments.length > 0 ? (
                <div className="space-y-6" data-testid="all-matches-list">
                  {userTournaments.map((match: any) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              ) : (
                <Card className="bg-card/50 border-dashed border-2 border-border">
                  <CardContent className="p-12 text-center">
                    <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No Matches Yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Join your first tournament to see your match history here
                    </p>
                    <Button className="gradient-fire text-black font-bold">
                      Browse Tournaments
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Clock className="w-6 h-6 text-primary" />
                  Upcoming Matches
                </h2>
                <span className="text-muted-foreground">
                  {upcomingMatches.length} upcoming
                </span>
              </div>

              {upcomingMatches.length > 0 ? (
                <div className="space-y-6" data-testid="upcoming-matches-list">
                  {upcomingMatches.map((match: any) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              ) : (
                <Card className="bg-card/50 border-dashed border-2 border-border">
                  <CardContent className="p-12 text-center">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No Upcoming Matches</h3>
                    <p className="text-muted-foreground">
                      Join tournaments to see your upcoming matches
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="live" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <span className="w-3 h-3 bg-destructive rounded-full animate-pulse"></span>
                  Live Matches
                </h2>
                <span className="text-muted-foreground">
                  {ongoingMatches.length} live now
                </span>
              </div>

              {ongoingMatches.length > 0 ? (
                <div className="space-y-6" data-testid="live-matches-list">
                  {ongoingMatches.map((match: any) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              ) : (
                <Card className="bg-card/50 border-dashed border-2 border-border">
                  <CardContent className="p-12 text-center">
                    <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No Live Matches</h3>
                    <p className="text-muted-foreground">
                      You don't have any ongoing tournaments right now
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-green-500" />
                  Completed Matches
                </h2>
                <span className="text-muted-foreground">
                  {completedMatches.length} completed
                </span>
              </div>

              {completedMatches.length > 0 ? (
                <div className="space-y-6" data-testid="completed-matches-list">
                  {completedMatches.map((match: any) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              ) : (
                <Card className="bg-card/50 border-dashed border-2 border-border">
                  <CardContent className="p-12 text-center">
                    <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No Completed Matches</h3>
                    <p className="text-muted-foreground">
                      Your completed tournament history will appear here
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />

      {/* Match Report Modal */}
      <Dialog open={reportModalOpen} onOpenChange={setReportModalOpen}>
        <DialogContent className="max-w-md" data-testid="match-report-modal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="w-5 h-5" />
              Report Match Result
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedMatch && (
              <div className="bg-muted/30 rounded-lg p-3">
                <h4 className="font-medium">{selectedMatch.tournament?.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedMatch.tournament?.game} • {formatDateTime(selectedMatch.tournament?.startTime)}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="kills">Kills</Label>
                  <Input
                    id="kills"
                    type="number"
                    min="0"
                    placeholder="0"
                    data-testid="kills-input"
                  />
                </div>
                <div>
                  <Label htmlFor="placement">Placement</Label>
                  <Input
                    id="placement"
                    type="number"
                    min="1"
                    placeholder="1"
                    data-testid="placement-input"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="screenshot">Screenshot/Proof</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <FileImage className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload screenshot of your match result
                  </p>
                  <Button variant="outline" size="sm" data-testid="upload-screenshot">
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information about the match..."
                  data-testid="notes-input"
                />
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-yellow-500" />
                <span className="font-medium text-sm">Important</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Please ensure your screenshot clearly shows the match results. 
                False reporting may result in account penalties.
              </p>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setReportModalOpen(false)}
                data-testid="cancel-report"
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 gradient-fire text-black font-bold"
                data-testid="submit-report"
              >
                Submit Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
