
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
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent p-1">
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="Avatar preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
              </div>
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                <Upload className="w-6 h-6 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  data-testid="player-avatar-input"
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Click to upload avatar<br />
              <span className="text-xs">(PNG, JPG up to 2MB)</span>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="username">Full Name *</Label>
              <Input
                id="username"
                placeholder="Enter player's full name"
                {...register("username")}
                data-testid="player-username-input"
              />
              {errors.username && (
                <p className="text-sm text-destructive">{errors.username.message}</p>
              )}
            </div>

            {/* Player Role */}
            <div className="space-y-2">
              <Label>Player Role *</Label>
              <Select 
                value={watch("role")} 
                onValueChange={(value) => setValue("role", value)}
              >
                <SelectTrigger data-testid="player-role-select">
                  <SelectValue />
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
              {watch("role") && (
                <p className="text-xs text-muted-foreground">
                  {getRoleDescription(watch("role"))}
                </p>
              )}
            </div>

            {/* Player ID */}
            <div className="space-y-2">
              <Label htmlFor="gameId">Player ID *</Label>
              <Input
                id="gameId"
                placeholder="Enter game player ID"
                {...register("gameId")}
                data-testid="player-game-id-input"
              />
              {errors.gameId && (
                <p className="text-sm text-destructive">{errors.gameId.message}</p>
              )}
            </div>

            {/* Player Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter player's phone number"
                {...register("phone")}
                data-testid="player-phone-input"
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>
          </form>

          {/* Player Guidelines */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-medium mb-2 text-sm">Player Guidelines</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• All information should be accurate and up-to-date</li>
              <li>• Player ID must match their in-game identity</li>
              <li>• Role assignments affect tournament eligibility</li>
              <li>• Players must follow team and community rules</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="text-gray-600 border-gray-300 hover:bg-gray-50"
            data-testid="cancel-add-player"
          >
            Cancel
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8"
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
