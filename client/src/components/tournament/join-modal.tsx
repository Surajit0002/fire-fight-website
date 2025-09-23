import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Trophy, 
  Users, 
  CreditCard, 
  Wallet,
  DollarSign,
  AlertCircle
} from "lucide-react";

interface JoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: any;
  onJoin: (data: { teamId?: string }) => void;
  isLoading: boolean;
}

export default function JoinModal({ 
  isOpen, 
  onClose, 
  tournament, 
  onJoin, 
  isLoading 
}: JoinModalProps) {
  const { user } = useAuth();
  const [participationType, setParticipationType] = useState<'solo' | 'team'>('solo');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');

  const { data: userTeams } = useQuery({
    queryKey: ["/api/user/teams"],
    enabled: isOpen && !!user,
  });

  const { data: walletBalance } = useQuery({
    queryKey: ["/api/wallet/balance"],
    enabled: isOpen && !!user,
  });

  const entryFee = parseFloat(tournament?.entryFee || '0');
  const currentBalance = parseFloat(walletBalance?.balance || '0');
  const hasEnoughBalance = currentBalance >= entryFee;

  const handleJoin = () => {
    const joinData = participationType === 'team' ? { teamId: selectedTeamId } : {};
    onJoin(joinData);
  };

  const getGradientClass = (game: string) => {
    switch (game.toLowerCase()) {
      case 'bgmi':
        return 'gradient-fire';
      case 'free fire':
        return 'gradient-electric';
      case 'cod mobile':
        return 'gradient-victory';
      default:
        return 'gradient-fire';
    }
  };

  const canJoinAsTeam = tournament?.gameMode?.toLowerCase().includes('team') || 
                       tournament?.gameMode?.toLowerCase().includes('squad');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl" data-testid="join-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Trophy className="w-6 h-6" />
            Join Tournament
          </DialogTitle>
          <DialogDescription>
              Select your team and confirm your participation in this tournament.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tournament Summary */}
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" data-testid="modal-tournament-title">
                  {tournament.title}
                </h3>
                <Badge variant="secondary">{tournament.game}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Entry Fee</span>
                  <span className="font-semibold" data-testid="modal-entry-fee">
                    {entryFee === 0 ? 'FREE' : `₹${entryFee.toLocaleString('en-IN')}`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Prize Pool</span>
                  <span className="font-semibold" data-testid="modal-prize-pool">
                    ₹{parseFloat(tournament.prizePool).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Participants</span>
                  <span data-testid="modal-participants">
                    {tournament.currentParticipants}/{tournament.maxParticipants}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Start Time</span>
                  <span data-testid="modal-start-time">
                    {new Date(tournament.startTime).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Participation Type */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Participation Type</h4>
            <RadioGroup 
              value={participationType} 
              onValueChange={(value) => setParticipationType(value as 'solo' | 'team')}
              data-testid="participation-type"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="solo" id="solo" />
                <Label htmlFor="solo" className="flex items-center gap-2 cursor-pointer">
                  <Users className="w-4 h-4" />
                  Solo Entry
                </Label>
              </div>

              {canJoinAsTeam && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="team" id="team" />
                  <Label htmlFor="team" className="flex items-center gap-2 cursor-pointer">
                    <Users className="w-4 h-4" />
                    Team Entry
                  </Label>
                </div>
              )}
            </RadioGroup>

            {/* Team Selection */}
            {participationType === 'team' && canJoinAsTeam && (
              <Card className="border-border">
                <CardContent className="p-4">
                  <h5 className="font-medium mb-3">Select Team</h5>
                  {userTeams && userTeams.length > 0 ? (
                    <RadioGroup 
                      value={selectedTeamId} 
                      onValueChange={setSelectedTeamId}
                      data-testid="team-selection"
                    >
                      {userTeams.map((team: any) => (
                        <div key={team.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={team.id} id={team.id} />
                          <Label htmlFor={team.id} className="flex items-center gap-2 cursor-pointer">
                            <Badge variant="outline">{team.tag}</Badge>
                            {team.name}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground mb-2">You don't have any teams yet.</p>
                      <Button variant="outline" size="sm" onClick={() => window.open('/teams', '_blank')}>
                        Create Team
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Payment Summary */}
          {entryFee > 0 && (
            <Card className="border-border">
              <CardContent className="p-4">
                <h5 className="font-medium mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Payment Summary
                </h5>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Entry Fee</span>
                    <span data-testid="payment-entry-fee">₹{entryFee.toLocaleString('en-IN')}</span>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between font-semibold">
                    <span>Total Amount</span>
                    <span data-testid="payment-total">₹{entryFee.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Wallet className="w-4 h-4" />
                    <span>Wallet Balance: ₹{currentBalance.toLocaleString('en-IN')}</span>
                    {!hasEnoughBalance && (
                      <Badge variant="destructive" className="ml-auto">
                        Insufficient Balance
                      </Badge>
                    )}
                  </div>

                  {!hasEnoughBalance && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-destructive" />
                      <span className="text-sm text-destructive">
                        You need ₹{(entryFee - currentBalance).toLocaleString('en-IN')} more to join this tournament.
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Terms and Conditions */}
          <div className="text-xs text-muted-foreground">
            <p>By joining this tournament, you agree to:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Follow all tournament rules and regulations</li>
              <li>Submit required screenshots for verification</li>
              <li>Accept the tournament organizer's final decisions</li>
              {entryFee > 0 && <li>Entry fees are non-refundable after registration closes</li>}
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} data-testid="cancel-join">
            Cancel
          </Button>

          {entryFee > 0 && !hasEnoughBalance ? (
            <Button 
              variant="secondary" 
              onClick={() => window.open('/wallet', '_blank')}
              data-testid="add-funds"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Add Funds
            </Button>
          ) : (
            <Button 
              className={`${getGradientClass(tournament.game)} text-black font-bold hover:scale-105 transition-transform`}
              onClick={handleJoin}
              disabled={isLoading || (participationType === 'team' && !selectedTeamId)}
              data-testid="confirm-join"
            >
              {isLoading ? 'Joining...' : 
               entryFee === 0 ? 'Join Free' : 
               `Pay ₹${entryFee.toLocaleString('en-IN')} & Join`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}