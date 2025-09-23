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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Users,
  Camera,
  UserPlus,
  Send,
  Crown,
  Target,
  Zap,
  Shield,
  X,
  User,
  Gamepad2,
  Hash,
  Star,
} from "lucide-react";

const createTeamSchema = z.object({
  name: z
    .string()
    .min(1, "Team name is required")
    .max(50, "Team name too long"),
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
        title: "Success! 🎉",
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

  const getRoleBadgeColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case "captain":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "igl":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "fragger":
        return "bg-red-100 text-red-700 border-red-300";
      case "support":
        return "bg-green-100 text-green-700 border-green-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const gameTypes = [
    {
      value: "BGMI",
      label: "BGMI",
      icon: "🎮",
      color: "from-blue-500 to-indigo-600",
    },
    {
      value: "Free Fire",
      label: "Free Fire",
      icon: "🔥",
      color: "from-orange-500 to-red-600",
    },
    {
      value: "COD Mobile",
      label: "COD Mobile",
      icon: "⚡",
      color: "from-green-500 to-emerald-600",
    },
    {
      value: "Valorant",
      label: "Valorant",
      icon: "🎯",
      color: "from-red-500 to-pink-600",
    },
    {
      value: "PUBG Mobile",
      label: "PUBG Mobile",
      icon: "🏆",
      color: "from-purple-500 to-indigo-600",
    },
  ];

  const selectedGame = gameTypes.find(
    (game) => game.value === watch("gameType"),
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-lg max-h-[85vh] overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-0 shadow-2xl flex flex-col"
        data-testid="create-edit-team-modal"
      >
        {/* Enhanced Header */}
        <DialogHeader
          className={`px-4 py-4 bg-gradient-to-r ${selectedGame?.color || "from-blue-600 to-purple-600"} text-white -mx-6 -mt-6 mb-0 relative overflow-hidden`}
        >
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10" />

          <div className="flex items-center justify-between relative z-10">
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold">
                  {isEditing ? "Edit Team" : "Create Team"}
                </div>
                <div className="text-xs text-white/80 font-normal">
                  {isEditing
                    ? "Update your team information"
                    : "Build your esports squad"}
                </div>
              </div>
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-3 flex-1 overflow-y-auto">
          {/* Team Setup Section */}
          <div className="bg-white rounded-xl p-3 shadow-lg border border-gray-200">
            <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-blue-500" />
              Team Information
            </h3>

            <div className="space-y-4">
              {/* Team Logo - Centered */}
              <div className="flex justify-center">
                <div className="relative group">
                  <div
                    className={`w-20 h-20 rounded-xl bg-gradient-to-br ${selectedGame?.color || "from-blue-500 to-purple-600"} border-2 border-white shadow-lg flex items-center justify-center overflow-hidden cursor-pointer group-hover:scale-105 transition-all duration-300`}
                  >
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Team logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <Camera className="w-6 h-6 text-white mb-1" />
                        <span className="text-xs font-medium text-white">
                          Logo
                        </span>
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
                  {/* Upload Indicator */}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                    <Camera className="w-3 h-3 text-white" />
                  </div>
                </div>
              </div>

              {/* Team Details Form */}
              <div className="space-y-3">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                  {/* Team Name */}
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                      <Hash className="w-3 h-3 text-gray-500" />
                      Team Name
                    </label>
                    <Input
                      placeholder="Enter your team name"
                      className="h-10 bg-gray-50 border border-gray-200 focus:border-blue-400 focus:bg-white rounded-lg text-sm"
                      {...register("name")}
                      data-testid="team-name-input"
                    />
                    {errors.name && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <X className="w-3 h-3" />
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Game Type */}
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                        <Gamepad2 className="w-3 h-3 text-gray-500" />
                        Game Type
                      </label>
                      <Select
                        value={watch("gameType")}
                        onValueChange={(value) => setValue("gameType", value)}
                      >
                        <SelectTrigger
                          className="h-10 bg-gray-50 border border-gray-200 focus:border-blue-400 rounded-lg text-sm"
                          data-testid="game-type-select"
                        >
                          <SelectValue placeholder="Select game" />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg border shadow-xl">
                          {gameTypes.map((game) => (
                            <SelectItem
                              key={game.value}
                              value={game.value}
                              className="rounded-md"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-base">{game.icon}</span>
                                <span className="font-medium text-sm">
                                  {game.label}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Max Players */}
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                        <Users className="w-3 h-3 text-gray-500" />
                        Team Size
                      </label>
                      <Select
                        value={watch("maxPlayers")?.toString()}
                        onValueChange={(value) =>
                          setValue("maxPlayers", parseInt(value))
                        }
                      >
                        <SelectTrigger className="h-10 bg-gray-50 border border-gray-200 focus:border-blue-400 rounded-lg text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg border shadow-xl">
                          {[2, 3, 4, 5, 6].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              <div className="flex items-center gap-2">
                                <Users className="w-3 h-3" />
                                <span className="text-sm">{num} Players</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              onClick={() => onAddPlayer(team?.id || "new")}
              className="h-10 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-sm"
            >
              <UserPlus className="w-4 h-4 mr-1" />
              Add Player
            </Button>
            <Button
              type="button"
              className="h-10 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-sm"
            >
              <Send className="w-4 h-4 mr-1" />
              Invite Player
            </Button>
          </div>

          {/* Enhanced Team Members Preview - Compact Grid */}
          <div className="bg-white rounded-xl p-3 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                Team Members
              </h3>
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-300 px-2 py-0.5 text-xs"
              >
                {teamMembers.length}/{watch("maxPlayers") || 4}
              </Badge>
            </div>

            {teamMembers.length > 0 ? (
              <div className="space-y-2">
                {/* Current Team Members */}
                {teamMembers.slice(0, 3).map((member: any, index: number) => (
                  <div
                    key={member.id}
                    className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-2 border border-gray-200 hover:shadow-sm transition-all duration-300"
                  >
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Avatar className="w-8 h-8 border border-white shadow-sm">
                          <AvatarImage src={member.user?.profileImageUrl} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-xs">
                            {member.user?.username?.charAt(0).toUpperCase() ||
                              "M"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200">
                          {getRoleIcon(member.role)}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-800 truncate text-sm">
                          {member.user?.username || "Player"}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`text-xs px-1.5 py-0 ${getRoleBadgeColor(member.role)}`}
                          >
                            {member.role?.charAt(0).toUpperCase() +
                              member.role?.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add more members button if slots available */}
                {teamMembers.length < (watch("maxPlayers") || 4) && (
                  <div
                    onClick={() => onAddPlayer(team?.id || "new")}
                    className="border border-dashed border-gray-300 rounded-lg p-2 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 cursor-pointer group flex items-center justify-center min-h-[48px]"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-200 group-hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors">
                        <UserPlus className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                      </div>
                      <p className="text-xs text-gray-500 group-hover:text-blue-600 font-medium">
                        Add Player
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
                <h4 className="font-medium text-gray-800 mb-1 text-sm">
                  No members yet
                </h4>
                <p className="text-gray-500 text-xs mb-3 max-w-xs mx-auto">
                  Start building your team by adding players
                </p>
                <Button
                  onClick={() => onAddPlayer(team?.id || "new")}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg h-8 text-xs"
                >
                  <UserPlus className="w-3 h-3 mr-1" />
                  Add First Player
                </Button>
              </div>
            )}

            {/* Show more indicator if there are more than 3 members */}
            {teamMembers.length > 3 && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-2 text-center border border-blue-200">
                <p className="text-xs text-blue-700 font-medium">
                  +{teamMembers.length - 3} more members
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Footer with Visible Buttons */}
        <DialogFooter className="px-6 py-4 bg-white border-t border-gray-200 -mx-6 -mb-6 mt-auto flex-shrink-0">
          <div className="flex gap-3 w-full">
            {/* Cancel Button */}
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12 font-semibold border-2 border-gray-300 hover:border-red-400 bg-white hover:bg-red-50 text-gray-700 hover:text-red-600 rounded-xl transition-all duration-300"
              data-testid="cancel-create-team"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>

            {/* Create/Save Button */}
            <Button
              className={`flex-1 h-12 bg-gradient-to-r ${selectedGame?.color || "from-blue-600 to-purple-600"} hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-75`}
              onClick={handleSubmit(onSubmit)}
              disabled={createTeamMutation.isPending}
              data-testid="create-team-submit"
            >
              {createTeamMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isEditing ? "Saving..." : "Creating..."}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <Crown className="w-4 h-4" />
                  ) : (
                    <Users className="w-4 h-4" />
                  )}
                  {isEditing ? "Save Changes" : "Create Team"}
                </div>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
