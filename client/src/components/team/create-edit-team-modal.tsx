
import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  Upload, 
  Camera, 
  UserPlus, 
  Mail, 
  Edit3, 
  Trash2,
  Crown,
  Target,
  Zap,
  Shield,
  X,
  User
} from "lucide-react";

const createTeamSchema = z.object({
  name: z.string().min(1, "Team name is required").max(50, "Team name too long"),
  tag: z.string().min(2, "Tag must be at least 2 characters").max(8, "Tag too long").optional(),
  gameType: z.string().min(1, "Game type is required"),
  maxPlayers: z.number().min(2).max(6),
});

type CreateTeamForm = z.infer<typeof createTeamSchema>;

interface CreateEditTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  team?: any;
  onAddPlayer: (teamId: string) => void;
}

export default function CreateEditTeamModal({ 
  isOpen, 
  onClose, 
  team, 
  onAddPlayer 
}: CreateEditTeamModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [showInvited, setShowInvited] = useState(false);

  const isEditing = !!team;

  // Get team members if editing
  const { data: teamData } = useQuery({
    queryKey: ["/api/teams", team?.id],
    enabled: isEditing && !!team?.id,
  });

  const teamMembers = teamData?.members || [];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateTeamForm>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      maxPlayers: 4,
      gameType: "BGMI",
    },
  });

  // Pre-fill form when editing
  useEffect(() => {
    if (isEditing && team) {
      setValue("name", team.name);
      setValue("tag", team.tag || "");
      setValue("gameType", team.gameType || "BGMI");
      setValue("maxPlayers", team.maxPlayers || 4);
      setLogoPreview(team.logoUrl || "");
    }
  }, [isEditing, team, setValue]);

  const createTeamMutation = useMutation({
    mutationFn: async (data: CreateTeamForm) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });
      if (logoFile) {
        formData.append("logo", logoFile);
      }

      if (isEditing) {
        return await apiRequest("PUT", `/api/teams/${team.id}`, formData);
      }
      return await apiRequest("POST", "/api/teams", formData);
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["/api/user/teams"] });
      if (isEditing) {
        await queryClient.invalidateQueries({ queryKey: ["/api/teams", team.id] });
      }
      toast({
        title: "Success!",
        description: isEditing ? "Team updated successfully!" : "Team created successfully!",
      });
      reset();
      setLogoFile(null);
      setLogoPreview("");
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deletePlayerMutation = useMutation({
    mutationFn: async (playerId: string) => {
      return await apiRequest("DELETE", `/api/teams/${team.id}/members/${playerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams", team.id] });
      toast({
        title: "Success!",
        description: "Player removed from team",
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

  const onSubmit = (data: CreateTeamForm) => {
    createTeamMutation.mutate(data);
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Logo must be less than 2MB",
          variant: "destructive",
        });
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'captain': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'igl': return <Target className="w-4 h-4 text-blue-500" />;
      case 'fragger': return <Zap className="w-4 h-4 text-red-500" />;
      case 'support': return <Shield className="w-4 h-4 text-green-500" />;
      default: return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const gameTypes = [
    { value: "BGMI", label: "BGMI", icon: "🎮" },
    { value: "Free Fire", label: "Free Fire", icon: "🔥" },
    { value: "COD Mobile", label: "COD Mobile", icon: "⚡" },
    { value: "Valorant", label: "Valorant", icon: "🎯" },
    { value: "PUBG Mobile", label: "PUBG Mobile", icon: "🏆" },
  ];

  const handleDeletePlayer = (playerId: string, playerName: string) => {
    if (confirm(`Are you sure you want to remove ${playerName}? This action cannot be undone.`)) {
      deletePlayerMutation.mutate(playerId);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" data-testid="create-edit-team-modal">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Users className="w-6 h-6" />
              {isEditing ? "Edit Team" : "Create Team"}
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Team Form */}
          <div className="space-y-6">
            {/* Team Logo Upload */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent p-1">
                  <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                    {logoPreview ? (
                      <img 
                        src={logoPreview} 
                        alt="Team logo preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="w-10 h-10 text-muted-foreground" />
                    )}
                  </div>
                </div>
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                  <Upload className="w-6 h-6 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    data-testid="team-logo-input"
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Click to upload team logo<br />
                <span className="text-xs">(PNG, JPG up to 2MB)</span>
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Team Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Team Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter team name"
                  {...register("name")}
                  data-testid="team-name-input"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              {/* Team Tag */}
              <div className="space-y-2">
                <Label htmlFor="tag">Team Tag</Label>
                <Input
                  id="tag"
                  placeholder="e.g. FFA, TXN"
                  maxLength={8}
                  {...register("tag")}
                  data-testid="team-tag-input"
                />
                {errors.tag && (
                  <p className="text-sm text-destructive">{errors.tag.message}</p>
                )}
              </div>

              {/* Game Type */}
              <div className="space-y-2">
                <Label>Game Type *</Label>
                <Select 
                  value={watch("gameType")} 
                  onValueChange={(value) => setValue("gameType", value)}
                >
                  <SelectTrigger data-testid="game-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {gameTypes.map((game) => (
                      <SelectItem key={game.value} value={game.value}>
                        <div className="flex items-center gap-2">
                          <span>{game.icon}</span>
                          {game.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Max Players */}
              <div className="space-y-2">
                <Label>Maximum Players</Label>
                <Select 
                  value={watch("maxPlayers")?.toString()} 
                  onValueChange={(value) => setValue("maxPlayers", parseInt(value))}
                >
                  <SelectTrigger data-testid="max-players-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 Players</SelectItem>
                    <SelectItem value="3">3 Players</SelectItem>
                    <SelectItem value="4">4 Players (Recommended)</SelectItem>
                    <SelectItem value="5">5 Players</SelectItem>
                    <SelectItem value="6">6 Players</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </form>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-2">
                <Button 
                  type="button"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => onAddPlayer(team.id)}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Player
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowInvited(!showInvited)}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Invited ({0})
                </Button>
              </div>
            )}
          </div>

          {/* Right Column - Team Members */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Team Members</h3>
              <Badge variant="secondary">
                {teamMembers.length}/{watch("maxPlayers") || 4}
              </Badge>
            </div>

            {/* Team Members Grid */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {teamMembers.length > 0 ? (
                teamMembers.map((member: any) => (
                  <div 
                    key={member.id}
                    className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={member.user?.profileImageUrl} />
                        <AvatarFallback>
                          {member.user?.username?.charAt(0).toUpperCase() || 'M'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium truncate">
                            {member.user?.username || 'Unknown'}
                          </p>
                          {getRoleIcon(member.role)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {member.user?.phone || 'No phone'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ID: {member.user?.gameId || 'No Game ID'}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => {/* Handle edit player */}}
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                        {member.role !== 'captain' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeletePlayer(member.id, member.user?.username || 'Player')}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 bg-muted/30 rounded-lg">
                  <Users className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">No team members yet</p>
                  {isEditing && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onAddPlayer(team.id)}
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      Add First Player
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Team Guidelines */}
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-medium mb-2 text-sm">Team Guidelines</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Team captain has full management rights</li>
                <li>• Players can be assigned specific roles</li>
                <li>• Team code is auto-generated for invites</li>
                <li>• All members must follow community rules</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="text-gray-600 border-gray-300 hover:bg-gray-50"
            data-testid="cancel-create-team"
          >
            Cancel
          </Button>
          <Button 
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-8"
            onClick={handleSubmit(onSubmit)}
            disabled={createTeamMutation.isPending}
            data-testid="create-team-submit"
          >
            {createTeamMutation.isPending ? 
              (isEditing ? "Saving..." : "Creating...") : 
              (isEditing ? "Save Changes" : "Create Team")
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
