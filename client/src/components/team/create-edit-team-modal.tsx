
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

  const teamMembers = (teamData as any)?.members || [];

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

        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Team Logo Upload */}
            <div className="space-y-4">
              <div className="relative">
                <div className="w-48 h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden hover:bg-gray-50 transition-colors">
                  {logoPreview ? (
                    <img 
                      src={logoPreview} 
                      alt="Team logo preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <Camera className="w-16 h-16 mx-auto mb-2 text-gray-600" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    data-testid="team-logo-input"
                  />
                </div>
              </div>
            </div>
            
            {/* Team Form */}
            <div className="lg:col-span-2 space-y-4">

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Team Name */}
                <div className="space-y-2">
                  <Input
                    id="name"
                    placeholder="Team Name"
                    className="h-12 text-lg bg-gray-100 border-gray-200"
                    {...register("name")}
                    data-testid="team-name-input"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                {/* Game Type */}
                <div className="space-y-2">
                  <Select 
                    value={watch("gameType")} 
                    onValueChange={(value) => setValue("gameType", value)}
                  >
                    <SelectTrigger className="h-12 bg-gray-100 border-gray-200" data-testid="game-type-select">
                      <SelectValue placeholder="Game" />
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
              </form>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex gap-2">
                  <Button 
                    type="button"
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white h-10"
                    onClick={() => onAddPlayer(team.id)}
                  >
                    Add player
                  </Button>
                  <Button 
                    type="button"
                    className="flex-1 bg-red-400 hover:bg-red-500 text-white h-10"
                    onClick={() => setShowInvited(!showInvited)}
                  >
                    Invited
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Team Members Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Team Members</h3>

            {/* Team Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamMembers.length > 0 ? (
                teamMembers.map((member: any, index: number) => (
                  <div 
                    key={member.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 relative hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {member.user?.username?.charAt(0).toUpperCase() || 'P'}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm mb-1">
                          {member.user?.username || 'Player name'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {member.user?.phone || '+91 8344819111'}
                        </p>
                        <p className="text-xs text-gray-500">
                          ID: {member.user?.gameId || '15466DF'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-gray-100"
                        onClick={() => {/* Handle edit player */}}
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                      {member.role !== 'captain' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-red-50 text-red-500"
                          onClick={() => handleDeletePlayer(member.id, member.user?.username || 'Player')}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8 bg-gray-50 rounded-lg">
                  <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500 mb-4">No team members yet</p>
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

          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="px-8 py-2 text-gray-600 border-gray-300 hover:bg-gray-50 rounded-lg"
            data-testid="cancel-create-team"
          >
            Cancel
          </Button>
          <Button 
            className="px-8 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium"
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
