import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminSidebar from "@/components/admin/admin-sidebar";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Trophy, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  Play,
  Pause,
  Users,
  DollarSign,
  Calendar,
  MoreHorizontal,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const createTournamentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  game: z.string().min(1, "Game is required"),
  gameMode: z.string().min(1, "Game mode is required"),
  mapName: z.string().optional(),
  entryFee: z.string().min(0, "Entry fee must be positive"),
  prizePool: z.string().min(0, "Prize pool must be positive"),
  maxParticipants: z.number().min(2, "Must allow at least 2 participants"),
  startTime: z.string().min(1, "Start time is required"),
  registrationDeadline: z.string().optional(),
  rules: z.string().optional(),
});

type CreateTournamentForm = z.infer<typeof createTournamentSchema>;

export default function AdminTournaments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [gameFilter, setGameFilter] = useState("all");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const [page, setPage] = useState(1);

  const { data: tournaments, isLoading } = useQuery({
    queryKey: ["/api/admin/tournaments", { page, limit: 20 }],
    enabled: !!user?.isAdmin,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateTournamentForm>({
    resolver: zodResolver(createTournamentSchema),
    defaultValues: {
      maxParticipants: 100,
    },
  });

  const createTournamentMutation = useMutation({
    mutationFn: async (data: CreateTournamentForm) => {
      return await apiRequest("POST", "/api/tournaments", {
        ...data,
        entryFee: data.entryFee,
        prizePool: data.prizePool,
        maxParticipants: Number(data.maxParticipants),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tournaments"] });
      toast({
        title: "Success!",
        description: "Tournament created successfully.",
      });
      setCreateModalOpen(false);
      reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateTournamentStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiRequest("PATCH", `/api/admin/tournaments/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tournaments"] });
      toast({
        title: "Success!",
        description: "Tournament status updated.",
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

  const deleteTournamentMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/admin/tournaments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tournaments"] });
      toast({
        title: "Success!",
        description: "Tournament deleted successfully.",
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

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-destructive/20 text-destructive';
      case 'upcoming':
        return 'bg-primary/20 text-primary';
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'cancelled':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-accent/20 text-accent';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'live':
        return <Play className="w-3 h-3 mr-1" />;
      case 'upcoming':
        return <Calendar className="w-3 h-3 mr-1" />;
      case 'completed':
        return <CheckCircle className="w-3 h-3 mr-1" />;
      case 'cancelled':
        return <XCircle className="w-3 h-3 mr-1" />;
      default:
        return <AlertCircle className="w-3 h-3 mr-1" />;
    }
  };

  const filteredTournaments = tournaments?.filter((tournament: any) => {
    const matchesSearch = tournament.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tournament.game.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || tournament.status === statusFilter;
    const matchesGame = gameFilter === "all" || tournament.game.toLowerCase() === gameFilter;
    
    return matchesSearch && matchesStatus && matchesGame;
  }) || [];

  const onSubmit = (data: CreateTournamentForm) => {
    createTournamentMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <AdminSidebar />
        
        <main className="flex-1 ml-64">
          {/* Header */}
          <div className="bg-card border-b border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-primary" />
                  Tournament Management
                </h1>
                <p className="text-muted-foreground">
                  Create and manage tournaments, monitor participation, and control tournament lifecycle.
                </p>
              </div>
              <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button className="gradient-fire text-black font-bold" data-testid="create-tournament">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Tournament
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl" data-testid="create-tournament-modal">
                  <DialogHeader>
                    <DialogTitle>Create New Tournament</DialogTitle>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Tournament Title *</Label>
                        <Input
                          id="title"
                          {...register("title")}
                          placeholder="Enter tournament title"
                          data-testid="tournament-title"
                        />
                        {errors.title && (
                          <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="game">Game *</Label>
                        <Select onValueChange={(value) => setValue("game", value)}>
                          <SelectTrigger data-testid="game-select">
                            <SelectValue placeholder="Select game" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="BGMI">BGMI</SelectItem>
                            <SelectItem value="Free Fire">Free Fire</SelectItem>
                            <SelectItem value="COD Mobile">COD Mobile</SelectItem>
                            <SelectItem value="Valorant">Valorant</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.game && (
                          <p className="text-sm text-destructive mt-1">{errors.game.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="gameMode">Game Mode *</Label>
                        <Select onValueChange={(value) => setValue("gameMode", value)}>
                          <SelectTrigger data-testid="game-mode-select">
                            <SelectValue placeholder="Select mode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Solo">Solo</SelectItem>
                            <SelectItem value="Duo">Duo</SelectItem>
                            <SelectItem value="Squad">Squad</SelectItem>
                            <SelectItem value="Team">Team</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.gameMode && (
                          <p className="text-sm text-destructive mt-1">{errors.gameMode.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="mapName">Map (Optional)</Label>
                        <Input
                          id="mapName"
                          {...register("mapName")}
                          placeholder="e.g. Erangel, Bermuda"
                          data-testid="map-name"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="entryFee">Entry Fee (₹)</Label>
                        <Input
                          id="entryFee"
                          type="number"
                          min="0"
                          step="0.01"
                          {...register("entryFee")}
                          placeholder="0"
                          data-testid="entry-fee"
                        />
                        {errors.entryFee && (
                          <p className="text-sm text-destructive mt-1">{errors.entryFee.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="prizePool">Prize Pool (₹)</Label>
                        <Input
                          id="prizePool"
                          type="number"
                          min="0"
                          step="0.01"
                          {...register("prizePool")}
                          placeholder="0"
                          data-testid="prize-pool"
                        />
                        {errors.prizePool && (
                          <p className="text-sm text-destructive mt-1">{errors.prizePool.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="maxParticipants">Max Participants</Label>
                        <Input
                          id="maxParticipants"
                          type="number"
                          min="2"
                          {...register("maxParticipants", { valueAsNumber: true })}
                          placeholder="100"
                          data-testid="max-participants"
                        />
                        {errors.maxParticipants && (
                          <p className="text-sm text-destructive mt-1">{errors.maxParticipants.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startTime">Start Time *</Label>
                        <Input
                          id="startTime"
                          type="datetime-local"
                          {...register("startTime")}
                          data-testid="start-time"
                        />
                        {errors.startTime && (
                          <p className="text-sm text-destructive mt-1">{errors.startTime.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="registrationDeadline">Registration Deadline</Label>
                        <Input
                          id="registrationDeadline"
                          type="datetime-local"
                          {...register("registrationDeadline")}
                          data-testid="registration-deadline"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        {...register("description")}
                        placeholder="Tournament description and details"
                        data-testid="description"
                      />
                    </div>

                    <div>
                      <Label htmlFor="rules">Rules</Label>
                      <Textarea
                        id="rules"
                        {...register("rules")}
                        placeholder="Tournament rules and regulations"
                        data-testid="rules"
                      />
                    </div>

                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setCreateModalOpen(false)}
                        data-testid="cancel-create"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        className="gradient-fire text-black font-bold"
                        disabled={createTournamentMutation.isPending}
                        data-testid="submit-tournament"
                      >
                        {createTournamentMutation.isPending ? "Creating..." : "Create Tournament"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="p-6 border-b border-border">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-3 items-center">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    placeholder="Search tournaments..." 
                    className="pl-10 w-80"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="search-tournaments"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32" data-testid="status-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={gameFilter} onValueChange={setGameFilter}>
                  <SelectTrigger className="w-32" data-testid="game-filter">
                    <SelectValue />
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
              
              <div className="text-sm text-muted-foreground">
                Showing {filteredTournaments.length} of {tournaments?.length || 0} tournaments
              </div>
            </div>
          </div>

          {/* Tournaments Table */}
          <div className="p-6">
            <Card>
              <CardHeader>
                <CardTitle>Tournament List</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredTournaments.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tournament</TableHead>
                          <TableHead>Game</TableHead>
                          <TableHead>Participants</TableHead>
                          <TableHead>Prize Pool</TableHead>
                          <TableHead>Entry Fee</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Start Time</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTournaments.map((tournament: any, index: number) => (
                          <TableRow key={tournament.id || index} data-testid={`tournament-row-${index}`}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{tournament.title}</div>
                                <div className="text-sm text-muted-foreground">{tournament.gameMode}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{tournament.game}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <span>{tournament.currentParticipants}/{tournament.maxParticipants}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4 text-green-500" />
                                <span>₹{parseFloat(tournament.prizePool || '0').toLocaleString('en-IN')}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {parseFloat(tournament.entryFee || '0') === 0 ? (
                                <Badge className="bg-green-500/20 text-green-400">FREE</Badge>
                              ) : (
                                <span>₹{parseFloat(tournament.entryFee).toLocaleString('en-IN')}</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(tournament.status)}>
                                {getStatusIcon(tournament.status)}
                                {tournament.status.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {new Date(tournament.startTime).toLocaleDateString('en-IN')}
                                <br />
                                <span className="text-muted-foreground">
                                  {new Date(tournament.startTime).toLocaleTimeString('en-IN', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" data-testid={`view-tournament-${index}`}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline" data-testid={`edit-tournament-${index}`}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                {tournament.status === 'upcoming' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => updateTournamentStatusMutation.mutate({ 
                                      id: tournament.id, 
                                      status: 'live' 
                                    })}
                                    data-testid={`start-tournament-${index}`}
                                  >
                                    <Play className="w-4 h-4" />
                                  </Button>
                                )}
                                {tournament.status === 'live' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => updateTournamentStatusMutation.mutate({ 
                                      id: tournament.id, 
                                      status: 'completed' 
                                    })}
                                    data-testid={`end-tournament-${index}`}
                                  >
                                    <Pause className="w-4 h-4" />
                                  </Button>
                                )}
                                {tournament.status === 'upcoming' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      if (confirm("Are you sure you want to delete this tournament?")) {
                                        deleteTournamentMutation.mutate(tournament.id);
                                      }
                                    }}
                                    data-testid={`delete-tournament-${index}`}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No Tournaments Found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery || statusFilter !== "all" || gameFilter !== "all" 
                        ? "No tournaments match your current filters" 
                        : "Create your first tournament to get started"
                      }
                    </p>
                    {!searchQuery && statusFilter === "all" && gameFilter === "all" && (
                      <Button 
                        className="gradient-fire text-black font-bold"
                        onClick={() => setCreateModalOpen(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Tournament
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
