
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
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
  AlertCircle,
  Clock,
  Target,
  Zap,
  Shield,
  Calendar,
  MapPin,
  Gamepad2,
  ChevronRight,
  Star,
  CheckCircle2,
  User,
  Crown
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
  const [activeStep, setActiveStep] = useState(1);

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

  const getGameBackground = (game: string) => {
    const backgrounds = {
      'free fire': 'linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ff4757 100%)',
      'bgmi': 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #5b73c4 100%)',
      'pubg mobile': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #ff9472 100%)',
      'cod mobile': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 50%, #d299c2 100%)',
      'valorant': 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #feca57 100%)'
    };
    return backgrounds[game.toLowerCase()] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  };

  const canJoinAsTeam = tournament?.gameMode?.toLowerCase().includes('team') || 
                       tournament?.gameMode?.toLowerCase().includes('squad');

  // Calculate prize distribution
  const totalPrize = parseFloat(tournament.prizePool);
  const rank1Prize = Math.floor(totalPrize * 0.5);
  const rank2Prize = Math.floor(totalPrize * 0.3);
  const rank3Prize = Math.floor(totalPrize * 0.2);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const steps = [
    { id: 1, title: 'Tournament Info', icon: Trophy },
    { id: 2, title: 'Team Selection', icon: Users },
    { id: 3, title: 'Payment', icon: CreditCard }
  ];

  useEffect(() => {
    if (entryFee === 0) {
      setActiveStep(2);
    }
  }, [entryFee]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900/95 border-gray-700 text-white" data-testid="join-modal">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-3 text-2xl md:text-3xl font-black">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: getGameBackground(tournament.game) }}
            >
              <Trophy className="w-6 h-6 text-white" />
            </div>
            Join Tournament
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Get ready to compete in {tournament.title} and win amazing prizes!
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps - Mobile Responsive */}
        <div className="flex justify-center mb-6 px-4">
          <div className="flex items-center space-x-2 md:space-x-4 overflow-x-auto">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full border-2 transition-all duration-300
                  ${activeStep >= step.id 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : 'bg-gray-700 border-gray-600 text-gray-400'
                  }
                `}>
                  {activeStep > step.id ? (
                    <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" />
                  ) : (
                    <step.icon className="w-4 h-4 md:w-5 md:h-5" />
                  )}
                </div>
                <span className="hidden md:block text-xs ml-2 text-gray-300">{step.title}</span>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-gray-500 mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {/* Tournament Hero Card */}
          <Card className="relative overflow-hidden bg-gray-800/50 border-gray-700">
            <div 
              className="absolute inset-0 opacity-20"
              style={{ background: getGameBackground(tournament.game) }}
            />
            <CardContent className="relative p-4 md:p-6">
              {/* Mobile-First Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Tournament Info - Full width on mobile */}
                <div className="md:col-span-2 space-y-3">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge className="bg-red-500 text-white text-xs font-bold px-2 py-1">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></span>
                      LIVE
                    </Badge>
                    <Badge variant="secondary" className="text-xs">{tournament.game}</Badge>
                    <Badge variant="outline" className="text-xs">{tournament.gameMode}</Badge>
                  </div>
                  
                  <h3 className="text-xl md:text-2xl font-black text-white mb-2" data-testid="modal-tournament-title">
                    🔥 {tournament.title}
                  </h3>

                  {/* Quick Stats Grid - Mobile Responsive */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="bg-gray-700/50 rounded-lg p-2 text-center">
                      <div className="text-green-400 font-bold text-lg" data-testid="modal-prize-pool">
                        ₹{parseFloat(tournament.prizePool).toLocaleString('en-IN')}
                      </div>
                      <div className="text-xs text-gray-400">Prize Pool</div>
                    </div>
                    
                    <div className="bg-gray-700/50 rounded-lg p-2 text-center">
                      <div className="text-blue-400 font-bold text-lg" data-testid="modal-participants">
                        {tournament.currentParticipants}/{tournament.maxParticipants}
                      </div>
                      <div className="text-xs text-gray-400">Players</div>
                    </div>
                    
                    <div className="bg-gray-700/50 rounded-lg p-2 text-center">
                      <div className="text-yellow-400 font-bold text-lg" data-testid="modal-entry-fee">
                        {entryFee === 0 ? 'FREE' : `₹${entryFee.toLocaleString('en-IN')}`}
                      </div>
                      <div className="text-xs text-gray-400">Entry Fee</div>
                    </div>
                    
                    <div className="bg-gray-700/50 rounded-lg p-2 text-center">
                      <div className="text-red-400 font-bold text-lg" data-testid="modal-start-time">
                        {formatDateTime(tournament.startTime)}
                      </div>
                      <div className="text-xs text-gray-400">Start Time</div>
                    </div>
                  </div>
                </div>

                {/* Prize Distribution - Stacked on mobile */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">🏆 Prize Distribution</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 rounded-lg p-2 border border-yellow-500/20">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-yellow-400" />
                        <span className="text-xs font-medium">1st</span>
                      </div>
                      <span className="text-yellow-400 font-bold text-sm">
                        ₹{rank1Prize.toLocaleString('en-IN')}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between bg-gradient-to-r from-gray-400/10 to-gray-500/10 rounded-lg p-2 border border-gray-400/20">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-gray-400" />
                        <span className="text-xs font-medium">2nd</span>
                      </div>
                      <span className="text-gray-300 font-bold text-sm">
                        ₹{rank2Prize.toLocaleString('en-IN')}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between bg-gradient-to-r from-orange-600/10 to-orange-700/10 rounded-lg p-2 border border-orange-600/20">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-orange-400" />
                        <span className="text-xs font-medium">3rd</span>
                      </div>
                      <span className="text-orange-400 font-bold text-sm">
                        ₹{rank3Prize.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step Content */}
          {activeStep === 1 && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Tournament Details
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-4">
                    <h5 className="font-medium mb-3 flex items-center gap-2">
                      <Gamepad2 className="w-4 h-4" />
                      Game Information
                    </h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Game:</span>
                        <span>{tournament.game}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Mode:</span>
                        <span>{tournament.gameMode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Platform:</span>
                        <span>Mobile</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-4">
                    <h5 className="font-medium mb-3 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Tournament Rules
                    </h5>
                    <ul className="text-xs text-gray-300 space-y-1">
                      <li>• Fair play and no cheating</li>
                      <li>• Screenshots required for verification</li>
                      <li>• Join room code on time</li>
                      <li>• Follow tournament format</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Team Selection Step */}
          {activeStep === 2 && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Choose Participation Type
              </h4>
              
              <RadioGroup 
                value={participationType} 
                onValueChange={(value) => setParticipationType(value as 'solo' | 'team')}
                data-testid="participation-type"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className={`cursor-pointer transition-all duration-300 ${
                    participationType === 'solo' 
                      ? 'bg-blue-500/20 border-blue-500' 
                      : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="solo" id="solo" />
                        <Label htmlFor="solo" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-3">
                            <User className="w-6 h-6 text-blue-400" />
                            <div>
                              <div className="font-medium">Solo Entry</div>
                              <div className="text-xs text-gray-400">Join as individual player</div>
                            </div>
                          </div>
                        </Label>
                      </div>
                    </CardContent>
                  </Card>

                  {canJoinAsTeam && (
                    <Card className={`cursor-pointer transition-all duration-300 ${
                      participationType === 'team' 
                        ? 'bg-green-500/20 border-green-500' 
                        : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="team" id="team" />
                          <Label htmlFor="team" className="flex-1 cursor-pointer">
                            <div className="flex items-center gap-3">
                              <Users className="w-6 h-6 text-green-400" />
                              <div>
                                <div className="font-medium">Team Entry</div>
                                <div className="text-xs text-gray-400">Join with your team</div>
                              </div>
                            </div>
                          </Label>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </RadioGroup>

              {/* Team Selection */}
              {participationType === 'team' && canJoinAsTeam && (
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-4">
                    <h5 className="font-medium mb-3">Select Your Team</h5>
                    {userTeams && userTeams.length > 0 ? (
                      <RadioGroup 
                        value={selectedTeamId} 
                        onValueChange={setSelectedTeamId}
                        data-testid="team-selection"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {userTeams.map((team: any) => (
                            <div key={team.id} className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
                              <RadioGroupItem value={team.id} id={team.id} />
                              <Label htmlFor={team.id} className="flex items-center gap-3 cursor-pointer flex-1">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                  {team.tag.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-medium">{team.name}</div>
                                  <div className="text-xs text-gray-400">Tag: {team.tag}</div>
                                </div>
                              </Label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                    ) : (
                      <div className="text-center py-6 bg-gray-700/30 rounded-lg">
                        <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-gray-400 mb-3">You don't have any teams yet.</p>
                        <Button variant="outline" size="sm" onClick={() => window.open('/teams', '_blank')}>
                          Create Team First
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Payment Step */}
          {activeStep === 3 && entryFee > 0 && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-green-400" />
                Payment Details
              </h4>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Entry Fee</span>
                      <span className="font-bold" data-testid="payment-entry-fee">₹{entryFee.toLocaleString('en-IN')}</span>
                    </div>

                    <Separator className="bg-gray-600" />

                    <div className="flex items-center justify-between text-lg font-bold">
                      <span>Total Amount</span>
                      <span className="text-green-400" data-testid="payment-total">₹{entryFee.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Wallet className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium">Wallet Balance</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold">₹{currentBalance.toLocaleString('en-IN')}</span>
                        {!hasEnoughBalance && (
                          <Badge variant="destructive" className="ml-auto">
                            Insufficient Balance
                          </Badge>
                        )}
                      </div>
                    </div>

                    {!hasEnoughBalance && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h6 className="font-medium text-red-400 mb-1">Insufficient Funds</h6>
                          <p className="text-sm text-red-300">
                            You need ₹{(entryFee - currentBalance).toLocaleString('en-IN')} more to join this tournament.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Terms and Conditions */}
          <Card className="bg-gray-800/30 border-gray-600">
            <CardContent className="p-4">
              <h5 className="font-medium mb-2 text-sm">Terms & Conditions</h5>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Follow all tournament rules and regulations</li>
                <li>• Submit required screenshots for verification</li>
                <li>• Entry fees are non-refundable after registration</li>
                <li>• Tournament organizer's decisions are final</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="gap-3 pt-4">
          <div className="flex flex-col-reverse md:flex-row gap-3 w-full">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1 md:flex-initial"
              data-testid="cancel-join"
            >
              Cancel
            </Button>

            {activeStep < 3 && (entryFee === 0 || activeStep < 2) ? (
              <Button 
                className="flex-1 md:flex-initial bg-blue-600 hover:bg-blue-700 text-white font-bold"
                onClick={() => setActiveStep(activeStep + 1)}
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : entryFee > 0 && !hasEnoughBalance ? (
              <Button 
                variant="secondary" 
                onClick={() => window.open('/wallet', '_blank')}
                className="flex-1 md:flex-initial"
                data-testid="add-funds"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Add Funds
              </Button>
            ) : (
              <Button 
                className={`flex-1 md:flex-initial ${getGradientClass(tournament.game)} text-black font-bold hover:scale-105 transition-transform`}
                onClick={handleJoin}
                disabled={isLoading || (participationType === 'team' && !selectedTeamId)}
                data-testid="confirm-join"
              >
                {isLoading ? 'Joining...' : 
                 entryFee === 0 ? '🎮 Join Free Tournament' : 
                 `💳 Pay ₹${entryFee.toLocaleString('en-IN')} & Join`}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
