import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import KYCForm from "@/components/profile/kyc-form";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  User, 
  Settings, 
  Shield, 
  Bell,
  Lock,
  Edit,
  Camera,
  CheckCircle,
  AlertCircle,
  XCircle,
  Copy,
  Gift
} from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [showKYCForm, setShowKYCForm] = useState(false);

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    enabled: !!user,
  });

  const { data: walletBalance } = useQuery({
    queryKey: ["/api/wallet/balance"],
    enabled: !!user,
  });

  const { data: userStats } = useQuery({
    queryKey: ["/api/user/stats"],
    enabled: !!user,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PATCH", "/api/profile/update", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Success!",
        description: "Profile updated successfully.",
      });
      setEditMode(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const getKYCStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getKYCStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-500/20 text-green-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'rejected':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const copyReferralCode = () => {
    const referralCode = user?.id ? `FF${user.id.slice(-6).toUpperCase()}` : 'FFUSER';
    navigator.clipboard.writeText(referralCode);
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-br from-primary/10 via-accent/5 to-destructive/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-black mb-4">
              <span className="text-gradient">PROFILE</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Manage your account, settings, and gaming preferences
            </p>
          </div>
        </div>
      </section>

      {/* Profile Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="personal" data-testid="tab-personal">Personal</TabsTrigger>
              <TabsTrigger value="security" data-testid="tab-security">Security</TabsTrigger>
              <TabsTrigger value="notifications" data-testid="tab-notifications">Notifications</TabsTrigger>
              <TabsTrigger value="referrals" data-testid="tab-referrals">Referrals</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Profile Header */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="relative">
                      <Avatar className="w-32 h-32 border-4 border-primary/20">
                        <AvatarImage src={profileData?.profileImageUrl} alt={profileData?.username} />
                        <AvatarFallback className="text-4xl gradient-fire text-black font-bold">
                          {profileData?.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="sm"
                        className="absolute -bottom-2 -right-2 rounded-full gradient-fire text-black"
                        data-testid="change-avatar"
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="text-center md:text-left flex-1">
                      <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                        <h2 className="text-3xl font-bold" data-testid="profile-username">
                          {profileData?.username || 'Unknown User'}
                        </h2>
                        {profileData?.kycStatus === 'verified' && (
                          <Badge className="bg-green-500/20 text-green-400">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-muted-foreground">
                        <div data-testid="profile-email">{profileData?.email || 'No email'}</div>
                        <div>Member since {new Date(profileData?.createdAt || Date.now()).toLocaleDateString('en-IN')}</div>
                        <div>Game ID: {profileData?.gameId || 'Not set'}</div>
                      </div>

                      <div className="flex items-center gap-4 mt-4 justify-center md:justify-start">
                        <Button 
                          variant="outline"
                          onClick={() => setEditMode(true)}
                          data-testid="edit-profile"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Button>
                        {profileData?.kycStatus !== 'verified' && (
                          <Button
                            className="gradient-electric text-black font-medium"
                            onClick={() => setShowKYCForm(true)}
                            data-testid="verify-account"
                          >
                            <Shield className="w-4 h-4 mr-2" />
                            Verify Account
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-card border-border">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-primary mb-2" data-testid="wallet-balance-profile">
                      ₹{parseFloat(walletBalance?.balance || '0').toLocaleString('en-IN')}
                    </div>
                    <div className="text-sm text-muted-foreground">Wallet Balance</div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-accent mb-2" data-testid="tournaments-joined">
                      {userStats?.tournamentsJoined || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Tournaments Joined</div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-green-500 mb-2" data-testid="tournaments-won">
                      {userStats?.tournamentsWon || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Tournaments Won</div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-destructive mb-2" data-testid="total-earnings">
                      ₹{(userStats?.totalEarnings || 0).toLocaleString('en-IN')}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Earnings</div>
                  </CardContent>
                </Card>
              </div>

              {/* Account Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Account Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      {getKYCStatusIcon(profileData?.kycStatus || 'pending')}
                      <div>
                        <div className="font-medium">KYC Verification</div>
                        <div className="text-sm text-muted-foreground">Identity verification for withdrawals</div>
                      </div>
                    </div>
                    <Badge className={getKYCStatusColor(profileData?.kycStatus || 'pending')}>
                      {(profileData?.kycStatus || 'pending').toUpperCase()}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <div>
                        <div className="font-medium">Email Verified</div>
                        <div className="text-sm text-muted-foreground">Account email is confirmed</div>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400">
                      VERIFIED
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <div>
                        <div className="font-medium">Account Active</div>
                        <div className="text-sm text-muted-foreground">Full access to tournaments</div>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400">
                      ACTIVE
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Personal Information Tab */}
            <TabsContent value="personal" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        defaultValue={profileData?.firstName || ''}
                        disabled={!editMode}
                        data-testid="first-name-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        defaultValue={profileData?.lastName || ''}
                        disabled={!editMode}
                        data-testid="last-name-input"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={profileData?.email || ''}
                      disabled={!editMode}
                      data-testid="email-input"
                    />
                  </div>

                  <div>
                    <Label htmlFor="gameId">Primary Game ID</Label>
                    <Input
                      id="gameId"
                      defaultValue={profileData?.gameId || ''}
                      disabled={!editMode}
                      placeholder="Enter your main game ID"
                      data-testid="game-id-input"
                    />
                  </div>

                  <div>
                    <Label htmlFor="country">Country/Region</Label>
                    <Input
                      id="country"
                      defaultValue={profileData?.country || 'India'}
                      disabled={!editMode}
                      data-testid="country-input"
                    />
                  </div>

                  {editMode && (
                    <div className="flex gap-2">
                      <Button 
                        className="gradient-fire text-black font-bold"
                        onClick={() => updateProfileMutation.mutate({})}
                        disabled={updateProfileMutation.isPending}
                        data-testid="save-changes"
                      >
                        {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setEditMode(false)}
                        data-testid="cancel-edit"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                      <div>
                        <div className="font-medium">Change Password</div>
                        <div className="text-sm text-muted-foreground">Update your account password</div>
                      </div>
                      <Button variant="outline" data-testid="change-password">
                        Change Password
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                      <div>
                        <div className="font-medium">Two-Factor Authentication</div>
                        <div className="text-sm text-muted-foreground">Add extra security to your account</div>
                      </div>
                      <Button variant="outline" data-testid="enable-2fa">
                        Enable 2FA
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                      <div>
                        <div className="font-medium">Login Sessions</div>
                        <div className="text-sm text-muted-foreground">Manage active login sessions</div>
                      </div>
                      <Button variant="outline" data-testid="manage-sessions">
                        Manage Sessions
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                      <div>
                        <div className="font-medium">Tournament Updates</div>
                        <div className="text-sm text-muted-foreground">Get notified about tournament changes</div>
                      </div>
                      <Switch defaultChecked data-testid="tournament-notifications" />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                      <div>
                        <div className="font-medium">Match Results</div>
                        <div className="text-sm text-muted-foreground">Notifications about match outcomes</div>
                      </div>
                      <Switch defaultChecked data-testid="match-notifications" />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                      <div>
                        <div className="font-medium">Payment Updates</div>
                        <div className="text-sm text-muted-foreground">Wallet and transaction notifications</div>
                      </div>
                      <Switch defaultChecked data-testid="payment-notifications" />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                      <div>
                        <div className="font-medium">Marketing Messages</div>
                        <div className="text-sm text-muted-foreground">Promotional offers and updates</div>
                      </div>
                      <Switch data-testid="marketing-notifications" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Referrals Tab */}
            <TabsContent value="referrals" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5" />
                    Invite & Earn
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center p-6 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
                    <div className="w-16 h-16 gradient-fire rounded-full flex items-center justify-center mx-auto mb-4">
                      <Gift className="w-8 h-8 text-black" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Refer Friends & Earn</h3>
                    <p className="text-muted-foreground mb-4">
                      Invite your friends to join FireFight Arena and earn ₹50 for each successful referral!
                    </p>
                    
                    <div className="bg-muted/30 rounded-lg p-4 mb-4">
                      <Label className="text-sm">Your Referral Code</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Input 
                          value={user?.id ? `FF${user.id.slice(-6).toUpperCase()}` : 'FFUSER'}
                          readOnly
                          className="font-mono text-center"
                          data-testid="referral-code"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={copyReferralCode}
                          data-testid="copy-referral-code"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <Button className="gradient-fire text-black font-bold" data-testid="share-referral">
                      Share Referral Link
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-card border-border">
                      <CardContent className="p-6 text-center">
                        <div className="text-3xl font-bold text-primary mb-2" data-testid="total-referrals">
                          0
                        </div>
                        <div className="text-sm text-muted-foreground">Total Referrals</div>
                      </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                      <CardContent className="p-6 text-center">
                        <div className="text-3xl font-bold text-green-500 mb-2" data-testid="referral-earnings">
                          ₹0
                        </div>
                        <div className="text-sm text-muted-foreground">Referral Earnings</div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="bg-card/50 border-border">
                    <CardContent className="p-6">
                      <h4 className="font-semibold mb-4">How it works</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 gradient-fire rounded-full flex items-center justify-center text-black font-bold text-xs">1</div>
                          <span>Share your referral code with friends</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 gradient-electric rounded-full flex items-center justify-center text-black font-bold text-xs">2</div>
                          <span>They sign up and join their first tournament</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 gradient-victory rounded-full flex items-center justify-center text-black font-bold text-xs">3</div>
                          <span>You both earn ₹50 bonus in your wallets!</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />

      {/* KYC Form Modal */}
      <KYCForm 
        isOpen={showKYCForm}
        onClose={() => setShowKYCForm(false)}
      />
    </div>
  );
}
