
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Camera, 
  Crown,
  Target,
  Zap,
  Shield,
  User,
  X,
  UserPlus,
} from "lucide-react";

const addPlayerSchema = z.object({
  username: z.string().min(1, "Player name is required"),
  role: z.string().min(1, "Role is required"),
  gameId: z.string().min(1, "Game ID is required"),
  phone: z.string().min(10, "Valid phone number is required"),
});

type AddPlayerForm = z.infer<typeof addPlayerSchema>;

interface AddEditPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  player?: any;
  teamId: string | null;
  mode?: 'add' | 'edit' | 'invite';
}

export default function AddEditPlayerModal({ 
  isOpen, 
  onClose, 
  player, 
  teamId,
  mode = 'add'
}: AddEditPlayerModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  const isEditing = !!player;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddPlayerForm>({
    resolver: zodResolver(addPlayerSchema),
    defaultValues: {
      role: "player",
    },
  });

  useEffect(() => {
    if (isEditing && player) {
      setValue("username", player.user?.username || "");
      setValue("role", player.role || "player");
      setValue("gameId", player.user?.gameId || "");
      setValue("phone", player.user?.phone || "");
      setAvatarPreview(player.user?.profileImageUrl || "");
    } else {
      reset({
        role: "player",
      });
      setAvatarPreview("");
    }
  }, [isEditing, player, setValue, reset]);

  const addPlayerMutation = useMutation({
    mutationFn: async (data: AddPlayerForm) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value) formData.append(key, value.toString());
      });
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      if (isEditing) {
        return await apiRequest("PUT", `/api/teams/${teamId}/members/${player.id}`, formData);
      }
      return await apiRequest("POST", `/api/teams/${teamId}/members`, formData);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/teams", teamId] });
      await queryClient.invalidateQueries({ queryKey: ["/api/user/teams"] });
      toast({
        title: "Success!",
        description: isEditing ? "Player updated successfully!" : "Player added successfully!",
      });
      reset();
      setAvatarFile(null);
      setAvatarPreview("");
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

  const onSubmit = (data: AddPlayerForm) => {
    if (!teamId) {
      toast({
        title: "Error",
        description: "No team selected",
        variant: "destructive",
      });
      return;
    }
    addPlayerMutation.mutate(data);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Avatar must be less than 2MB",
          variant: "destructive",
        });
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const playerRoles = [
    { value: "player", label: "Player", icon: <User className="w-4 h-4" />, color: "text-gray-500" },
    { value: "captain", label: "Captain", icon: <Crown className="w-4 h-4" />, color: "text-yellow-500" },
    { value: "igl", label: "IGL (In-Game Leader)", icon: <Target className="w-4 h-4" />, color: "text-blue-500" },
    { value: "fragger", label: "Fragger", icon: <Zap className="w-4 h-4" />, color: "text-red-500" },
    { value: "support", label: "Support", icon: <Shield className="w-4 h-4" />, color: "text-green-500" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg" data-testid="add-edit-player-modal">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3 text-xl font-bold">
              <div className={`w-8 h-8 ${mode === 'invite' ? 'gradient-fire' : 'gradient-electric'} rounded-lg flex items-center justify-center`}>
                {mode === 'invite' ? (
                  <Upload className="w-5 h-5 text-black" />
                ) : (
                  <UserPlus className="w-5 h-5 text-black" />
                )}
              </div>
              {isEditing ? "Edit Player" : mode === 'invite' ? "Invite Player" : "Add Player"}
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

        <div className="px-6 py-6">
          {/* Player Avatar Upload */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 border-4 border-dashed border-gray-300 hover:border-blue-400 transition-colors flex items-center justify-center overflow-hidden cursor-pointer group">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Player avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <Camera className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors mb-1" />
                    <span className="text-xs text-gray-500 font-medium">Photo</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  data-testid="player-avatar-input"
                />
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {mode === 'invite' ? (
              /* Invite Mode - Email/Username Input */
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Upload className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">Send Invitation</span>
                  </div>
                  <p className="text-xs text-blue-600">
                    Enter the username or email of the player you want to invite to your team.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Username or Email</label>
                  <Input
                    placeholder="Enter username or email address"
                    className="h-12 text-base bg-white border-gray-200 focus:border-blue-500"
                    data-testid="invite-username-input"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Invitation Message (Optional)</label>
                  <textarea
                    placeholder="Add a personal message to your invitation..."
                    className="w-full h-20 p-3 text-sm bg-white border border-gray-200 rounded-md focus:border-blue-500 focus:outline-none resize-none"
                    data-testid="invite-message-input"
                  />
                </div>
              </div>
            ) : (
              /* Regular Add/Edit Mode */
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Player Name</label>
                <Input
                  placeholder="Enter player name"
                  className="h-12 text-base bg-white border-gray-200 focus:border-blue-500"
                  {...register("username")}
                  data-testid="player-username-input"
                />
                {errors.username && (
                  <p className="text-sm text-red-500">{errors.username.message}</p>
                )}
              </div>
            )}

            {mode !== 'invite' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Player Role */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Role</label>
                    <Select 
                      value={watch("role")} 
                      onValueChange={(value) => setValue("role", value)}
                    >
                      <SelectTrigger 
                        className="h-12 bg-white border-gray-200 focus:border-blue-500" 
                        data-testid="player-role-select"
                      >
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {playerRoles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            <div className="flex items-center gap-2">
                              <span className={role.color}>{role.icon}</span>
                              <span className="truncate">{role.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.role && (
                      <p className="text-sm text-red-500">{errors.role.message}</p>
                    )}
                  </div>
                  
                  {/* Game ID */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Game ID</label>
                    <Input
                      placeholder="Game ID"
                      className="h-12 text-base bg-white border-gray-200 focus:border-blue-500"
                      {...register("gameId")}
                      data-testid="player-game-id-input"
                    />
                    {errors.gameId && (
                      <p className="text-sm text-red-500">{errors.gameId.message}</p>
                    )}
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Phone Number</label>
                  <Input
                    type="tel"
                    placeholder="Enter phone number"
                    className="h-12 text-base bg-white border-gray-200 focus:border-blue-500"
                    {...register("phone")}
                    data-testid="player-phone-input"
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone.message}</p>
                  )}
                </div>
              </>
            )}

            {mode === 'invite' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Suggested Role</label>
                <Select 
                  value={watch("role")} 
                  onValueChange={(value) => setValue("role", value)}
                >
                  <SelectTrigger 
                    className="h-12 bg-white border-gray-200 focus:border-blue-500" 
                    data-testid="invite-role-select"
                  >
                    <SelectValue placeholder="Select suggested role" />
                  </SelectTrigger>
                  <SelectContent>
                    {playerRoles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex items-center gap-2">
                          <span className={role.color}>{role.icon}</span>
                          <span className="truncate">{role.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Role Description */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                {playerRoles.find(r => r.value === watch("role"))?.icon}
                <span className="font-medium text-sm">Role Description</span>
              </div>
              <p className="text-xs text-gray-600">
                {watch("role") === "captain" && "Team leader with full management rights"}
                {watch("role") === "igl" && "Strategic leader who makes in-game calls"}
                {watch("role") === "fragger" && "Aggressive player focused on eliminations"}
                {watch("role") === "support" && "Utility player who assists the team"}
                {watch("role") === "player" && "Regular team member"}
              </p>
            </div>
          </form>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-gray-50">
          <div className="flex gap-3 w-full">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1 h-12 font-medium"
              data-testid="cancel-add-player"
            >
              Cancel
            </Button>
            <Button 
              className={`flex-1 h-12 ${mode === 'invite' ? 'gradient-fire' : 'gradient-electric'} text-black font-bold hover:scale-105 transition-transform`}
              onClick={handleSubmit(onSubmit)}
              disabled={addPlayerMutation.isPending}
              data-testid="add-player-submit"
            >
              {addPlayerMutation.isPending ? 
                (isEditing ? "Saving..." : mode === 'invite' ? "Sending..." : "Adding...") : 
                (isEditing ? "Save Changes" : mode === 'invite' ? "Send Invitation" : "Add Player")
              }
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
