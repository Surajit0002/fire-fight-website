
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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Upload, 
  Camera, 
  Crown,
  Target,
  Zap,
  Shield,
  User,
  X
} from "lucide-react";

const addPlayerSchema = z.object({
  username: z.string().min(1, "Full name is required"),
  role: z.string().min(1, "Role is required"),
  gameId: z.string().min(1, "Player ID is required"),
  phone: z.string().min(10, "Valid phone number is required"),
});

type AddPlayerForm = z.infer<typeof addPlayerSchema>;

interface AddEditPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  player?: any;
  teamId: string | null;
}

export default function AddEditPlayerModal({ 
  isOpen, 
  onClose, 
  player, 
  teamId 
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

  // Pre-fill form when editing
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

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "captain": return "Team leader with full management rights";
      case "igl": return "Strategic leader who makes in-game calls";
      case "fragger": return "Aggressive player focused on eliminations";
      case "support": return "Utility player who assists the team";
      default: return "Regular team member";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md" data-testid="add-edit-player-modal">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <User className="w-6 h-6" />
              {isEditing ? "Edit Player" : "Add Player"}
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
          {/* Avatar Upload */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-gray-300 transition-colors">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Avatar preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera className="w-12 h-12 text-gray-600" />
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
            {/* Full Name */}
            <div>
              <Input
                id="username"
                placeholder="Full Name"
                className="h-12 bg-gray-100 border-0 text-base"
                {...register("username")}
                data-testid="player-username-input"
              />
              {errors.username && (
                <p className="text-sm text-destructive mt-1">{errors.username.message}</p>
              )}
            </div>

            {/* Player Role and Player ID - Side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Select 
                  value={watch("role")} 
                  onValueChange={(value) => setValue("role", value)}
                >
                  <SelectTrigger className="h-12 bg-gray-100 border-0 text-base" data-testid="player-role-select">
                    <SelectValue placeholder="Player Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {playerRoles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex items-center gap-2">
                          <span className={role.color}>{role.icon}</span>
                          {role.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-destructive mt-1">{errors.role.message}</p>
                )}
              </div>
              
              <div>
                <Input
                  id="gameId"
                  placeholder="Player ID"
                  className="h-12 bg-gray-100 border-0 text-base"
                  {...register("gameId")}
                  data-testid="player-game-id-input"
                />
                {errors.gameId && (
                  <p className="text-sm text-destructive mt-1">{errors.gameId.message}</p>
                )}
              </div>
            </div>

            {/* Player Phone */}
            <div>
              <Input
                id="phone"
                type="tel"
                placeholder="Player Phone"
                className="h-12 bg-gray-100 border-0 text-base"
                {...register("phone")}
                data-testid="player-phone-input"
              />
              {errors.phone && (
                <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
              )}
            </div>
          </form>

        </div>

        <DialogFooter className="gap-3 pt-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1 h-12 text-gray-600 border-gray-300 hover:bg-gray-50 rounded-lg"
            data-testid="cancel-add-player"
          >
            Cancel
          </Button>
          <Button 
            className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
            onClick={handleSubmit(onSubmit)}
            disabled={addPlayerMutation.isPending}
            data-testid="add-player-submit"
          >
            {addPlayerMutation.isPending ? 
              (isEditing ? "Saving..." : "Adding...") : 
              (isEditing ? "Save Changes" : "Add Player")
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
