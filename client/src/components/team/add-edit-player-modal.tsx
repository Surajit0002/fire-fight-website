
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
  Upload,
  Gamepad2,
  Phone,
  AtSign,
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
        title: "Success! ✨",
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
    { value: "player", label: "Player", icon: <User className="w-4 h-4" />, color: "text-slate-500", bgColor: "bg-slate-100" },
    { value: "captain", label: "Captain", icon: <Crown className="w-4 h-4" />, color: "text-yellow-600", bgColor: "bg-yellow-100" },
    { value: "igl", label: "IGL", icon: <Target className="w-4 h-4" />, color: "text-blue-600", bgColor: "bg-blue-100" },
    { value: "fragger", label: "Fragger", icon: <Zap className="w-4 h-4" />, color: "text-red-600", bgColor: "bg-red-100" },
    { value: "support", label: "Support", icon: <Shield className="w-4 h-4" />, color: "text-green-600", bgColor: "bg-green-100" },
  ];

  const getModalGradient = (mode: string) => {
    switch (mode) {
      case 'invite':
        return "bg-gradient-to-br from-orange-50 via-pink-50 to-red-50";
      case 'edit':
        return "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50";
      default:
        return "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50";
    }
  };

  const getHeaderGradient = (mode: string) => {
    switch (mode) {
      case 'invite':
        return "bg-gradient-to-r from-orange-500 to-red-600";
      case 'edit':
        return "bg-gradient-to-r from-blue-500 to-purple-600";
      default:
        return "bg-gradient-to-r from-green-500 to-emerald-600";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className={`w-[95vw] max-w-2xl max-h-[95vh] overflow-y-auto ${getModalGradient(mode)} border-0 shadow-2xl`}
        data-testid="add-edit-player-modal"
      >
        {/* Enhanced Header */}
        <DialogHeader className={`px-6 py-5 ${getHeaderGradient(mode)} text-white -mx-6 -mt-6 mb-0 relative overflow-hidden`}>
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
          
          <div className="flex items-center justify-between relative z-10">
            <DialogTitle className="flex items-center gap-3 text-xl font-bold">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                {mode === 'invite' ? (
                  <Upload className="w-5 h-5 text-white" />
                ) : (
                  <UserPlus className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <div className="text-xl font-bold">
                  {isEditing ? "Edit Player" : mode === 'invite' ? "Invite Player" : "Add Player"}
                </div>
                <div className="text-sm text-white/80 font-normal">
                  {mode === 'invite' ? "Send invitation to join team" : "Add new team member"}
                </div>
              </div>
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-8 w-8 p-0 text-white hover:bg-white/20 rounded-lg"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-6 py-6 space-y-6">
          {/* Enhanced Avatar Upload */}
          <div className="flex justify-center">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-white to-gray-100 border-4 border-white shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center overflow-hidden cursor-pointer group-hover:scale-105">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Player avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <Camera className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors mb-1" />
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
              {/* Upload indicator */}
              <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <Camera className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {mode === 'invite' ? (
              /* Invite Mode */
              <div className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Upload className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-semibold text-orange-700">Send Team Invitation</span>
                  </div>
                  <p className="text-xs text-orange-600">
                    Enter the username or email of the player you want to invite.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <AtSign className="w-4 h-4 text-gray-500" />
                    Username or Email
                  </label>
                  <Input
                    placeholder="Enter username or email address"
                    className="h-12 text-base bg-white border-2 border-gray-200 focus:border-orange-400 rounded-xl shadow-sm"
                    data-testid="invite-username-input"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Personal Message (Optional)</label>
                  <textarea
                    placeholder="Add a personal message to your invitation..."
                    className="w-full h-20 p-3 text-sm bg-white border-2 border-gray-200 focus:border-orange-400 rounded-xl shadow-sm resize-none"
                    data-testid="invite-message-input"
                  />
                </div>
              </div>
            ) : (
              /* Regular Add/Edit Mode */
              <>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    Player Name
                  </label>
                  <Input
                    placeholder="Enter player name"
                    className="h-12 text-base bg-white border-2 border-gray-200 focus:border-green-400 rounded-xl shadow-sm"
                    {...register("username")}
                    data-testid="player-username-input"
                  />
                  {errors.username && (
                    <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                      <X className="w-3 h-3" />
                      {errors.username.message}
                    </p>
                  )}
                </div>

                {/* Role and Game ID in one row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Crown className="w-4 h-4 text-gray-500" />
                      Role
                    </label>
                    <Select 
                      value={watch("role")} 
                      onValueChange={(value) => setValue("role", value)}
                    >
                      <SelectTrigger 
                        className="h-12 bg-white border-2 border-gray-200 focus:border-green-400 rounded-xl shadow-sm" 
                        data-testid="player-role-select"
                      >
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-2 shadow-xl">
                        {playerRoles.map((role) => (
                          <SelectItem key={role.value} value={role.value} className="rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`w-6 h-6 ${role.bgColor} rounded-lg flex items-center justify-center`}>
                                <span className={role.color}>{role.icon}</span>
                              </div>
                              <span className="font-medium">{role.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.role && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <X className="w-3 h-3" />
                        {errors.role.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Gamepad2 className="w-4 h-4 text-gray-500" />
                      Game ID
                    </label>
                    <Input
                      placeholder="Game ID"
                      className="h-12 text-base bg-white border-2 border-gray-200 focus:border-green-400 rounded-xl shadow-sm"
                      {...register("gameId")}
                      data-testid="player-game-id-input"
                    />
                    {errors.gameId && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <X className="w-3 h-3" />
                        {errors.gameId.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    placeholder="Enter phone number"
                    className="h-12 text-base bg-white border-2 border-gray-200 focus:border-green-400 rounded-xl shadow-sm"
                    {...register("phone")}
                    data-testid="player-phone-input"
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <X className="w-3 h-3" />
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </>
            )}
          </form>
        </div>

        {/* Enhanced Footer */}
        <DialogFooter className="px-6 py-5 bg-gray-50 border-t border-gray-100 -mx-6 -mb-6 mt-0">
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1 h-12 font-semibold border-2 hover:bg-gray-100 rounded-xl"
              data-testid="cancel-add-player"
            >
              Cancel
            </Button>
            <Button 
              className={`flex-1 h-12 ${
                mode === 'invite' 
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700' 
                  : mode === 'edit'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
              } text-white font-bold hover:scale-105 transition-all duration-200 rounded-xl shadow-lg`}
              onClick={handleSubmit(onSubmit)}
              disabled={addPlayerMutation.isPending}
              data-testid="add-player-submit"
            >
              {addPlayerMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isEditing ? "Saving..." : mode === 'invite' ? "Sending..." : "Adding..."}
                </div>
              ) : (
                isEditing ? "Save Changes" : mode === 'invite' ? "Send Invitation" : "Add Player"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
