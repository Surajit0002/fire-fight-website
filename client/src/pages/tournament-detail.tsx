import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import JoinModal from "@/components/tournament/join-modal";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  Trophy, 
  Users, 
  Clock, 
  MapPin, 
  Calendar,
  DollarSign,
  Shield,
  Play,
  MessageCircle,
  Eye,
  Copy
} from "lucide-react";

export default function TournamentDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showJoinModal, setShowJoinModal] = useState(false);

  const { data: tournament, isLoading } = useQuery({
    queryKey: ["/api/tournaments", id],
    enabled: !!id,
  });

  const { data: participants } = useQuery({
    queryKey: ["/api/tournaments", id, "participants"],
    enabled: !!id,
  });

  const { data: matches } = useQuery({
    queryKey: ["/api/tournaments", id, "matches"],
    enabled: !!id,
  });

  const joinMutation = useMutation({
    mutationFn: async (data: { teamId?: string }) => {
      const response = await fetch(`/api/tournaments/${id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", id, "participants"] });
      toast({
        title: "Success!",
        description: "Successfully joined the tournament.",
      });
      setShowJoinModal(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const copyRoomCode = () => {
    if (tournament?.roomCode) {
      navigator.clipboard.writeText(tournament.roomCode);
      toast({
        title: "Copied!",
        description: "Room code copied to clipboard.",
      });
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Tournament Not Found</h1>
            <p className="text-muted-foreground">The tournament you're looking for doesn't exist.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGradientClass = (game: string) => {
    switch (game.toLowerCase()) {
      case 'bgmi':
        return 'gradient-fire';
      case 'free fire':
        return 'gradient-electric';
      case 'cod mobile':
        return 'gradient-victory';
      default:
        return 'gradient-fire';
    }
  };

  const isUserJoined = participants?.some((p: any) => p.userId === user?.id);
  const canJoin = tournament.status === 'upcoming' && 
                 tournament.currentParticipants < tournament.maxParticipants &&
                 !isUserJoined;

  const slotsLeft = tournament.maxParticipants - tournament.currentParticipants;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Tournament Header */}
      <section className="relative py-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-destructive/10"></div>
        {tournament.imageUrl && (
          <div className="absolute inset-0 opacity-20">
            <img 
              src={tournament.imageUrl} 
              alt={tournament.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Tournament Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-4 mb-4">
                <Badge className={`${getStatusColor(tournament.status)} font-medium`} data-testid="tournament-status">
                  {tournament.status === 'live' && (
                    <span className="w-2 h-2 bg-current rounded-full animate-pulse mr-2"></span>
                  )}
                  {tournament.status.toUpperCase()}
                </Badge>
                <Badge variant="secondary">{tournament.game}</Badge>
                <Badge variant="outline">{tournament.gameMode}</Badge>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-black mb-4" data-testid="tournament-title">
                {tournament.title}
              </h1>
              
              <p className="text-xl text-muted-foreground mb-6" data-testid="tournament-description">
                {tournament.description || `Join the ultimate ${tournament.game} tournament and compete for amazing prizes!`}
              </p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className={`text-3xl font-bold bg-clip-text text-transparent ${getGradientClass(tournament.game)}`} data-testid="prize-pool">
                    ₹{parseFloat(tournament.prizePool).toLocaleString('en-IN')}
                  </div>
                  <div className="text-sm text-muted-foreground">Prize Pool</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground" data-testid="participants-count">
                    {tournament.currentParticipants}/{tournament.maxParticipants}
                  </div>
                  <div className="text-sm text-muted-foreground">Participants</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent" data-testid="entry-fee">
                    {parseFloat(tournament.entryFee) === 0 ? 'FREE' : `₹${parseFloat(tournament.entryFee).toLocaleString('en-IN')}`}
                  </div>
                  <div className="text-sm text-muted-foreground">Entry Fee</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary" data-testid="slots-left">
                    {slotsLeft}
                  </div>
                  <div className="text-sm text-muted-foreground">Slots Left</div>
                </div>
              </div>
            </div>

            {/* Join Card */}
            <div className="lg:col-span-1">
              <Card className="glass-effect border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Tournament Entry
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Start Time</span>
                      <div className="text-right">
                        <div className="font-mono text-sm" data-testid="start-time">
                          {formatDateTime(tournament.startTime)}
                        </div>
                      </div>
                    </div>
                    
                    {tournament.mapName && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Map</span>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span data-testid="map-name">{tournament.mapName}</span>
                        </div>
                      </div>
                    )}

                    {tournament.isRoomCodeRevealed && tournament.roomCode && (
                      <div className="bg-muted/30 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Room Code</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={copyRoomCode}
                            data-testid="copy-room-code"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="font-mono text-lg font-bold" data-testid="room-code">
                          {tournament.roomCode}
                        </div>
                      </div>
                    )}

                    {tournament.streamUrl && (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => window.open(tournament.streamUrl, '_blank')}
                        data-testid="watch-stream"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Watch Live Stream
                      </Button>
                    )}

                    {canJoin && (
                      <Button 
                        className={`w-full font-bold ${getGradientClass(tournament.game)} text-black hover:scale-105 transition-transform`}
                        onClick={() => setShowJoinModal(true)}
                        data-testid="join-tournament"
                      >
                        {parseFloat(tournament.entryFee) === 0 ? 'Join Free' : 'Join Tournament'}
                      </Button>
                    )}

                    {isUserJoined && (
                      <Badge className="w-full justify-center bg-accent/20 text-accent" data-testid="joined-badge">
                        ✓ You're registered!
                      </Badge>
                    )}

                    {tournament.status === 'completed' && (
                      <Button variant="secondary" className="w-full" disabled data-testid="completed-button">
                        Tournament Completed
                      </Button>
                    )}

                    {slotsLeft === 0 && !isUserJoined && tournament.status === 'upcoming' && (
                      <Button variant="destructive" className="w-full" disabled data-testid="full-button">
                        Tournament Full
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Tournament Details */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="participants" data-testid="tab-participants">Participants</TabsTrigger>
              <TabsTrigger value="rules" data-testid="tab-rules">Rules</TabsTrigger>
              <TabsTrigger value="matches" data-testid="tab-matches">Matches</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tournament Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tournament Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Game</span>
                      <span data-testid="detail-game">{tournament.game}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Mode</span>
                      <span data-testid="detail-mode">{tournament.gameMode}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Max Players</span>
                      <span data-testid="detail-max-players">{tournament.maxParticipants}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Registration Deadline</span>
                      <span data-testid="detail-deadline">
                        {tournament.registrationDeadline ? 
                          formatDateTime(tournament.registrationDeadline) : 
                          'Until start time'
                        }
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Prize Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Prize Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {tournament.prizeDistribution ? (
                      <div className="space-y-3">
                        {tournament.prizeDistribution.map((prize: any, index: number) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                              {prize.position === 1 ? '🥇 1st Place' : 
                               prize.position === 2 ? '🥈 2nd Place' :
                               prize.position === 3 ? '🥉 3rd Place' :
                               `${prize.position}th Place`}
                            </span>
                            <span className="font-semibold" data-testid={`prize-${prize.position}`}>
                              ₹{parseFloat(prize.amount).toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <Trophy className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground">Prize distribution will be announced soon</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="participants" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Registered Participants ({participants?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {participants && participants.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {participants.map((participant: any, index: number) => (
                        <div 
                          key={participant.id} 
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                          data-testid={`participant-${index}`}
                        >
                          <Avatar>
                            <AvatarImage src={participant.user?.profileImageUrl} />
                            <AvatarFallback>
                              {participant.user?.username?.charAt(0).toUpperCase() || 'P'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{participant.user?.username || 'Anonymous'}</div>
                            <div className="text-sm text-muted-foreground">
                              {participant.team ? `Team: ${participant.team.name}` : 'Solo'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No participants yet. Be the first to join!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rules" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Tournament Rules
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-invert max-w-none" data-testid="tournament-rules">
                    {tournament.rules ? (
                      <div className="whitespace-pre-wrap">{tournament.rules}</div>
                    ) : (
                      <div className="space-y-4">
                        <h3>General Rules</h3>
                        <ul>
                          <li>All participants must join the room code at the scheduled time</li>
                          <li>Late entries will not be accepted</li>
                          <li>Any form of cheating or hacking will result in immediate disqualification</li>
                          <li>Screenshots of results must be submitted for verification</li>
                          <li>Tournament organizers' decisions are final</li>
                        </ul>
                        
                        <h3>Game Specific Rules</h3>
                        <ul>
                          <li>Play according to {tournament.gameMode} format</li>
                          {tournament.mapName && <li>Map: {tournament.mapName}</li>}
                          <li>Use of external software or modifications is strictly prohibited</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="matches" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Matches
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {matches && matches.length > 0 ? (
                    <div className="space-y-4">
                      {matches.map((match: any) => (
                        <div 
                          key={match.id} 
                          className="border border-border rounded-lg p-4"
                          data-testid={`match-${match.id}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">Match {match.matchNumber}</h4>
                            <Badge variant={match.status === 'live' ? 'destructive' : 'secondary'}>
                              {match.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {match.startTime && `Start: ${formatDateTime(match.startTime)}`}
                          </div>
                          {match.results && (
                            <div className="mt-2 text-sm">
                              <strong>Results available</strong>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {tournament.status === 'upcoming' ? 
                          'Match schedule will be available after registration closes' :
                          'No matches scheduled yet'
                        }
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />

      {/* Join Modal */}
      <JoinModal 
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        tournament={tournament}
        onJoin={(data) => joinMutation.mutate(data)}
        isLoading={joinMutation.isPending}
      />
    </div>
  );
}
