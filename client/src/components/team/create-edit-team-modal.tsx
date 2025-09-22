
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Users,
  Camera,
  UserPlus,
  Edit3,
  Trash2,
  Crown,
  Target,
  Zap,
  Shield,
  X,
  User,
  Upload,
  Copy,
  Trophy,
} from "lucide-react";

const createTeamSchema = z.object({
  name: z
    .string()
    .min(1, "Team name is required")
    .max(50, "Team name too long"),
  tag: z
    .string()
    .min(2, "Tag must be at least 2 characters")
    .max(8, "Tag too long")
    .optional(),
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
  onAddPlayer,
}: CreateEditTeamModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");

  const isEditing = !!team;

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
        await queryClient.invalidateQueries({
          queryKey: ["/api/teams", team.id],
        });
      }
      toast({
        title: "Success!",
        description: isEditing
          ? "Team updated successfully!"
          : "Team created successfully!",
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
      return await apiRequest(
        "DELETE",
        `/api/teams/${team.id}/members/${playerId}`,
      );
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
      case "captain":
        return <Crown className="w-3 h-3 text-yellow-500" />;
      case "igl":
        return <Target className="w-3 h-3 text-blue-500" />;
      case "fragger":
        return <Zap className="w-3 h-3 text-red-500" />;
      case "support":
        return <Shield className="w-3 h-3 text-green-500" />;
      default:
        return <User className="w-3 h-3 text-gray-500" />;
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
    if (
      confirm(
        `Are you sure you want to remove ${playerName}? This action cannot be undone.`,
      )
    ) {
      deletePlayerMutation.mutate(playerId);
    }
  };

  const copyTeamCode = () => {
    const code = team?.teamCode || "TEMP123";
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied!",
      description: "Team code copied to clipboard",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-hidden"
        data-testid="create-edit-team-modal"
      >
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
              <div className="w-8 h-8 gradient-fire rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-black" />
              </div>
              {isEditing ? "Edit Team" : "Create Team"}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {/* Top Section */}
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Team Logo Upload */}
              <div className="lg:col-span-3">
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 border-4 border-dashed border-gray-300 hover:border-blue-400 transition-colors flex items-center justify-center overflow-hidden cursor-pointer group">
                      {logoPreview ? (
                        <img
                          src={logoPreview}
                          alt="Team logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center">
                          <Camera className="w-10 h-10 mx-auto mb-2 text-gray-400 group-hover:text-blue-500 transition-colors" />
                          <span className="text-xs text-gray-500 font-medium">Upload Logo</span>
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
                  <p className="text-xs text-gray-500 mt-2">Click to upload team logo</p>
                </div>
              </div>

              {/* Right: Team Info */}
              <div className="lg:col-span-9">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Team Name */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Team Name</label>
                      <Input
                        placeholder="Enter team name"
                        className="h-12 text-base bg-white border-gray-200 focus:border-blue-500"
                        {...register("name")}
                        data-testid="team-name-input"
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500">{errors.name.message}</p>
                      )}
                    </div>

                    {/* Team Tag */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Team Tag (Optional)</label>
                      <Input
                        placeholder="e.g. FFA, TXN"
                        maxLength={8}
                        className="h-12 text-base bg-white border-gray-200 focus:border-blue-500"
                        {...register("tag")}
                        data-testid="team-tag-input"
                      />
                      {errors.tag && (
                        <p className="text-sm text-red-500">{errors.tag.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Game Type */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Game Type</label>
                      <Select
                        value={watch("gameType")}
                        onValueChange={(value) => setValue("gameType", value)}
                      >
                        <SelectTrigger
                          className="h-12 bg-white border-gray-200 focus:border-blue-500"
                          data-testid="game-type-select"
                        >
                          <SelectValue placeholder="Select game" />
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
                      <label className="text-sm font-medium text-gray-700">Max Players</label>
                      <Select
                        value={watch("maxPlayers")?.toString()}
                        onValueChange={(value) => setValue("maxPlayers", parseInt(value))}
                      >
                        <SelectTrigger className="h-12 bg-white border-gray-200 focus:border-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[2, 3, 4, 5, 6].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} Players
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Team Code Display and Invite Section (for editing) */}
                  {isEditing && team?.teamCode && (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Team Join Code</label>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-2xl font-bold text-blue-600">{team.teamCode}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={copyTeamCode}
                              className="h-8 w-8 p-0"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => onAddPlayer(team.id)}
                            className="flex items-center gap-2"
                          >
                            <UserPlus className="w-4 h-4" />
                            Add Player
                          </Button>
                        </div>
                      </div>
                      
                      {/* Invite Players Section */}
                      <div className="border-t pt-4">
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Invite Players</label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter username or email to invite"
                            className="flex-1 h-10 text-sm bg-white border-gray-200 focus:border-blue-500"
                            data-testid="invite-player-input"
                          />
                          <Button
                            type="button"
                            className="gradient-electric text-black font-medium px-4 py-2 h-10"
                            data-testid="send-invite-button"
                          >
                            <Upload className="w-4 h-4 mr-1" />
                            Send Invite
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Players will receive an invitation to join your team
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Invite Section for New Teams */}
                  {!isEditing && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <UserPlus className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">Ready to Invite Players?</span>
                      </div>
                      <p className="text-xs text-blue-600 mb-3">
                        Create your team first, then you can add players and send invitations.
                      </p>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Prepare invite list (username/email)"
                          className="flex-1 h-9 text-sm bg-white border-blue-200 focus:border-blue-500"
                          disabled
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled
                          className="h-9 px-3 text-xs"
                        >
                          <UserPlus className="w-3 h-3 mr-1" />
                          Invite
                        </Button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>

          {/* Middle Section: Team Members Preview */}
          {isEditing && teamMembers.length > 0 && (
            <div className="px-6 pb-6">
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Team Members</h3>
                  <Badge variant="secondary" className="text-xs">
                    {teamMembers.length}/{watch("maxPlayers") || 4} members
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {teamMembers.map((member: any, index: number) => (
                    <div
                      key={member.id}
                      className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                          {member.user?.username?.charAt(0).toUpperCase() || "P"}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm truncate">
                              {member.user?.username || "Player name"}
                            </p>
                            {getRoleIcon(member.role)}
                          </div>
                          <p className="text-xs text-gray-500 truncate">
                            ID: {member.user?.gameId || "15466DF"}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {member.user?.phone || "+91 8344819111"}
                          </p>
                        </div>

                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-gray-100"
                            onClick={() => {
                              /* Handle edit player */
                            }}
                          >
                            <Edit3 className="w-3 h-3" />
                          </Button>
                          {member.role !== "captain" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-red-50 text-red-500"
                              onClick={() =>
                                handleDeletePlayer(
                                  member.id,
                                  member.user?.username || "Player",
                                )
                              }
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add Player Options */}
                  {teamMembers.length < (watch("maxPlayers") || 4) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Add Player Manually */}
                      <div
                        onClick={() => onAddPlayer(team?.id)}
                        className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group"
                      >
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center mb-2 transition-colors">
                            <UserPlus className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                          </div>
                          <p className="text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-colors">
                            Add Player
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Create new member</p>
                        </div>
                      </div>
                      
                      {/* Quick Invite */}
                      <div className="border-2 border-dashed border-green-300 rounded-xl p-4 hover:border-green-400 hover:bg-green-50 transition-all cursor-pointer group">
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <div className="w-12 h-12 rounded-full bg-green-100 group-hover:bg-green-200 flex items-center justify-center mb-2 transition-colors">
                            <Upload className="w-6 h-6 text-green-500 group-hover:text-green-600 transition-colors" />
                          </div>
                          <p className="text-sm font-medium text-green-600 group-hover:text-green-700 transition-colors">
                            Send Invite
                          </p>
                          <p className="text-xs text-green-500 mt-1">Invite existing user</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Empty State for New Teams */}
          {!isEditing && (
            <div className="px-6 pb-6">
              <div className="border-t pt-6">
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to build your team!</h3>
                  <p className="text-gray-500 text-sm mb-6">
                    Create your team first, then add members to start competing.
                  </p>
                  
                  {/* Feature Preview Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-md mx-auto">
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <UserPlus className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                      <p className="text-xs font-medium text-blue-700">Add Players</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <Upload className="w-6 h-6 text-green-500 mx-auto mb-1" />
                      <p className="text-xs font-medium text-green-700">Send Invites</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                      <Trophy className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                      <p className="text-xs font-medium text-purple-700">Compete</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Section: Action Buttons */}
        <DialogFooter className="px-6 py-4 border-t bg-gray-50">
          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12 font-medium"
              data-testid="cancel-create-team"
            >
              Cancel
            </Button>
            <Button
              className="flex-1 h-12 gradient-fire text-black font-bold hover:scale-105 transition-transform"
              onClick={handleSubmit(onSubmit)}
              disabled={createTeamMutation.isPending}
              data-testid="create-team-submit"
            >
              {createTeamMutation.isPending
                ? isEditing
                  ? "Saving..."
                  : "Creating..."
                : isEditing
                  ? "Save Changes"
                  : "Create Team"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
