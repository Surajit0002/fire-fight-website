import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Users, Upload } from "lucide-react";

const createTeamSchema = z.object({
  name: z.string().min(1, "Team name is required").max(50, "Team name too long"),
  tag: z.string().min(2, "Tag must be at least 2 characters").max(8, "Tag too long").optional(),
  maxPlayers: z.number().min(2).max(6),
});

type CreateTeamForm = z.infer<typeof createTeamSchema>;

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateTeamModal({ isOpen, onClose }: CreateTeamModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [logoFile, setLogoFile] = useState<File | null>(null);

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
    },
  });

  const createTeamMutation = useMutation({
    mutationFn: async (data: CreateTeamForm) => {
      return await apiRequest("POST", "/api/teams", data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/user/teams"] });
      toast({
        title: "Success!",
        description: "Team created successfully!",
      });
      reset();
      setLogoFile(null);
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
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md" data-testid="create-team-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Users className="w-6 h-6" />
            Create Team
          </DialogTitle>
          <DialogDescription>
            Create a new team to participate in tournaments and matches.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Logo Upload */}
          <div className="space-y-2">
            <Label htmlFor="logo">Team Logo (Optional)</Label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 gradient-fire rounded-lg flex items-center justify-center">
                {logoFile ? (
                  <img 
                    src={URL.createObjectURL(logoFile)} 
                    alt="Logo preview" 
                    className="w-12 h-12 rounded object-cover"
                  />
                ) : (
                  <Upload className="w-6 h-6 text-black" />
                )}
              </div>
              <div className="flex-1">
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="cursor-pointer"
                  data-testid="team-logo-input"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG up to 2MB
                </p>
              </div>
            </div>
          </div>

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
              placeholder="e.g. FFA, TXN (optional)"
              maxLength={8}
              {...register("tag")}
              data-testid="team-tag-input"
            />
            {errors.tag && (
              <p className="text-sm text-destructive">{errors.tag.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Short identifier for your team (2-8 characters)
            </p>
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
            <p className="text-xs text-muted-foreground">
              Most tournaments require 4-player teams
            </p>
          </div>

          {/* Team Rules */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-medium mb-2">Team Rules</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• You will be the team captain</li>
              <li>• You can invite players to join your team</li>
              <li>• Team members can leave anytime</li>
              <li>• Only captain can disband the team</li>
              <li>• Team name must be appropriate</li>
            </ul>
          </div>
        </form>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            data-testid="cancel-create-team"
          >
            Cancel
          </Button>
          <Button 
            className="gradient-fire text-black font-bold hover:scale-105 transition-transform"
            onClick={handleSubmit(onSubmit)}
            disabled={createTeamMutation.isPending}
            data-testid="create-team-submit"
          >
            {createTeamMutation.isPending ? "Creating..." : "Create Team"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}