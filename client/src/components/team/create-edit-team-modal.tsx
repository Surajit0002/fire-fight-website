
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
  Send,
  Crown,
  Target,
  Zap,
  Shield,
  X,
  User,
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-2xl max-h-[85vh] overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"
        data-testid="create-edit-team-modal"
      >
        {/* Header */}
        <DialogHeader className="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white -mx-6 -mt-6 mb-6">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3 text-xl font-bold">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              {isEditing ? "Edit Team" : "Create Team"}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-6 space-y-6">
          {/* Team Info Section */}
          <div className="flex gap-6">
            {/* Left: Team Logo */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden cursor-pointer group hover:scale-105 transition-transform">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Team logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="w-8 h-8 text-white" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    data-testid="team-logo-input"
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1 text-center">Logo</p>
              </div>
            </div>

            {/* Right: Team Details */}
            <div className="flex-1 space-y-4">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Input
                      placeholder="Team Name"
                      className="h-10 bg-white border-2 border-blue-200 focus:border-blue-500 rounded-lg"
                      {...register("name")}
                      data-testid="team-name-input"
                    />
                    {errors.name && (
                      <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <Input
                      placeholder="Tag (Optional)"
                      className="h-10 bg-white border-2 border-purple-200 focus:border-purple-500 rounded-lg"
                      {...register("tag")}
                      data-testid="team-tag-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Select
                    value={watch("gameType")}
                    onValueChange={(value) => setValue("gameType", value)}
                  >
                    <SelectTrigger
                      className="h-10 bg-white border-2 border-green-200 focus:border-green-500 rounded-lg"
                      data-testid="game-type-select"
                    >
                      <SelectValue placeholder="Game Type" />
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

                  <Select
                    value={watch("maxPlayers")?.toString()}
                    onValueChange={(value) => setValue("maxPlayers", parseInt(value))}
                  >
                    <SelectTrigger className="h-10 bg-white border-2 border-orange-200 focus:border-orange-500 rounded-lg">
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
              </form>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={() => onAddPlayer(team?.id || "new")}
              className="flex-1 h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Player
            </Button>
            <Button
              type="button"
              className="flex-1 h-12 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              <Send className="w-4 h-4 mr-2" />
              Invite Player
            </Button>
          </div>

          {/* Team Members Section */}
          <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Team Members</h3>
              <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                {teamMembers.length}/{watch("maxPlayers") || 4}
              </Badge>
            </div>

            {teamMembers.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {teamMembers.map((member: any, index: number) => (
                  <div
                    key={member.id}
                    className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm mb-2">
                        {member.user?.username?.charAt(0).toUpperCase() || "P"}
                      </div>
                      <div className="w-full">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <p className="font-medium text-xs truncate text-gray-800">
                            {member.user?.username || "Player"}
                          </p>
                          {getRoleIcon(member.role)}
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {member.user?.gameId || "ID123"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Add Member Slots */}
                {Array.from({ length: (watch("maxPlayers") || 4) - teamMembers.length }).map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    onClick={() => onAddPlayer(team?.id || "new")}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-3 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group"
                  >
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="w-10 h-10 rounded-full bg-gray-200 group-hover:bg-blue-200 flex items-center justify-center mb-2 transition-colors">
                        <UserPlus className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      </div>
                      <p className="text-xs text-gray-500 group-hover:text-blue-600 transition-colors">
                        Add Player
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
                <p className="text-gray-600 text-sm mb-2">No members yet</p>
                <p className="text-gray-500 text-xs">Add players to build your team</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t bg-gray-50 -mx-6 -mb-6 mt-6">
          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12 font-medium border-2 border-gray-300 hover:bg-gray-100 rounded-lg"
              data-testid="cancel-create-team"
            >
              Cancel
            </Button>
            <Button
              className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all"
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
