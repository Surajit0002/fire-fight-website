import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Users, Key, AlertCircle } from "lucide-react";

const joinTeamSchema = z.object({
  teamCode: z.string().min(6, "Team code must be at least 6 characters").max(12, "Team code too long"),
});

type JoinTeamForm = z.infer<typeof joinTeamSchema>;

interface JoinTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (teamCode: string) => void;
  isLoading: boolean;
}

export default function JoinTeamModal({ 
  isOpen, 
  onClose, 
  onJoin, 
  isLoading 
}: JoinTeamModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<JoinTeamForm>({
    resolver: zodResolver(joinTeamSchema),
  });

  const onSubmit = (data: JoinTeamForm) => {
    onJoin(data.teamCode.toUpperCase());
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const teamCode = watch("teamCode");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md" data-testid="join-team-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <UserPlus className="w-6 h-6" />
            Join Team
          </DialogTitle>
          <DialogDescription>
              Enter the team invitation code to join an existing team.
            </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Hero Section */}
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Join an Existing Team</h3>
            <p className="text-sm text-muted-foreground">
              Enter the team code shared by your team captain to join their squad
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Team Code Input */}
            <div className="space-y-2">
              <Label htmlFor="teamCode">Team Code *</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="teamCode"
                  placeholder="Enter team code (e.g., ABC123)"
                  className="pl-10 font-mono uppercase"
                  {...register("teamCode")}
                  onChange={(e) => {
                    e.target.value = e.target.value.toUpperCase();
                    register("teamCode").onChange(e);
                  }}
                  data-testid="team-code-input"
                />
              </div>
              {errors.teamCode && (
                <p className="text-sm text-destructive">{errors.teamCode.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Team codes are usually 6-8 characters long
              </p>
            </div>

            {/* Team Code Preview */}
            {teamCode && teamCode.length >= 6 && (
              <div className="bg-muted/50 rounded-lg p-3 border-l-4 border-primary">
                <div className="flex items-center gap-2 mb-1">
                  <Key className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Team Code</span>
                </div>
                <p className="font-mono text-lg font-bold tracking-wider">{teamCode}</p>
              </div>
            )}

            {/* Join Guidelines */}
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-sm text-blue-700 dark:text-blue-300 mb-1">
                    Before Joining
                  </h4>
                  <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                    <li>• Make sure you have the correct team code</li>
                    <li>• Ensure your profile information is complete</li>
                    <li>• Check that you meet the team's requirements</li>
                    <li>• You can only be in one team per game type</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* How to Get Team Code */}
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-medium mb-2 text-sm">How to Get a Team Code?</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Ask your team captain to share the team code</li>
                <li>• Team codes are found in the team settings</li>
                <li>• Codes are automatically generated when teams are created</li>
                <li>• If you don't have a code, ask to be invited directly</li>
              </ul>
            </div>
          </form>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={handleClose}
            data-testid="cancel-join-team"
          >
            Cancel
          </Button>
          <Button 
            className="gradient-electric text-black font-bold hover:scale-105 transition-transform"
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading || !teamCode || teamCode.length < 6}
            data-testid="join-team-submit"
          >
            {isLoading ? "Joining..." : "Join Team"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}