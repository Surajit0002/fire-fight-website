import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminSidebar from "@/components/admin/admin-sidebar";
import StatsCard from "@/components/admin/stats-card";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Trophy, 
  DollarSign,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  Database
} from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats/dashboard"],
  });

  const { data: recentTournaments, isLoading: tournamentsLoading } = useQuery({
    queryKey: ["/api/admin/tournaments", { limit: 5 }],
    enabled: !!user?.isAdmin,
  });

  const { data: pendingWithdrawals, isLoading: withdrawalsLoading } = useQuery({
    queryKey: ["/api/admin/withdrawals/pending"],
    enabled: !!user?.isAdmin,
  });

  const { data: recentTransactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/admin/transactions", { limit: 10 }],
    enabled: !!user?.isAdmin,
  });

  const seedDatabaseMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/seed-database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to seed database");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Database seeded with sample tournaments and data",
      });
      queryClient.invalidateQueries();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to seed database",
        variant: "destructive",
      });
    },
  });

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      toast({
        title: "Unauthorized",
        description: "You don't have admin access.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [user, authLoading, navigate, toast]);

  if (authLoading || statsLoading || tournamentsLoading || withdrawalsLoading || transactionsLoading) {
    return <LoadingSpinner />;
  }

  if (!user?.isAdmin) {
    return null;
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'withdrawal':
        return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default:
        return <DollarSign className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <AdminSidebar />

        <main className="flex-1 ml-64">
          {/* Header */}
          <div className="bg-card border-b border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gradient">Admin Dashboard</h1>
                <p className="text-muted-foreground">
                  Welcome back, {user.username}! Here's what's happening on FireFight Arena.
                </p>
              </div>
              <Badge className="bg-green-500/20 text-green-400 px-3 py-1">
                <Activity className="w-3 h-3 mr-1" />
                System Online
              </Badge>
            </div>
          </div>

          {/* Stats Overview */}
          <section className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="Total Users"
                value={dashboardStats?.totalUsers?.toLocaleString() || '0'}
                icon={<Users className="w-6 h-6" />}
                trend="+12%"
                trendUp={true}
                color="primary"
              />
              <StatsCard
                title="Total Tournaments"
                value={dashboardStats?.totalTournaments?.toLocaleString() || '0'}
                icon={<Trophy className="w-6 h-6" />}
                trend="+8%"
                trendUp={true}
                color="accent"
              />
              <StatsCard
                title="Total Revenue"
                value={`₹${dashboardStats?.totalRevenue?.toLocaleString() || '0'}`}
                icon={<DollarSign className="w-6 h-6" />}
                trend="+15%"
                trendUp={true}
                color="green"
              />
              <StatsCard
                title="Live Tournaments"
                value={dashboardStats?.liveTournaments?.toLocaleString() || '0'}
                icon={<Activity className="w-6 h-6" />}
                trend="Active Now"
                color="destructive"
              />
            </div>

            {/* Quick Actions & Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                    System Alerts & Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pendingWithdrawals && pendingWithdrawals.length > 0 && (
                    <div className="flex items-center justify-between p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-yellow-500" />
                        <div>
                          <div className="font-medium">Pending Withdrawals</div>
                          <div className="text-sm text-muted-foreground">
                            {pendingWithdrawals.length} withdrawals need approval
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" data-testid="review-withdrawals">
                        Review
                      </Button>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <div className="font-medium">System Health</div>
                        <div className="text-sm text-muted-foreground">
                          All services operational
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400">
                      Healthy
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Trophy className="w-5 h-5 text-blue-500" />
                      <div>
                        <div className="font-medium">Active Tournaments</div>
                        <div className="text-sm text-muted-foreground">
                          {dashboardStats?.liveTournaments || 0} tournaments running
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" data-testid="manage-tournaments">
                      Manage
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start gradient-fire text-black font-medium" data-testid="create-tournament">
                    <Trophy className="w-4 h-4 mr-2" />
                    Create Tournament
                  </Button>
                  <Button variant="outline" className="w-full justify-start" data-testid="manage-users">
                    <Users className="w-4 h-4 mr-2" />
                    Manage Users
                  </Button>
                  <Button variant="outline" className="w-full justify-start" data-testid="financial-reports">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Financial Reports
                  </Button>
                  <Button variant="outline" className="w-full justify-start" data-testid="system-settings">
                    <Activity className="w-4 h-4 mr-2" />
                    System Settings
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Tournaments</CardTitle>
                    <Button 
                      variant="outline" 
                      onClick={() => seedDatabaseMutation.mutate()}
                      disabled={seedDatabaseMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      <Database className="w-4 h-4" />
                      {seedDatabaseMutation.isPending ? "Seeding..." : "Seed Database"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {recentTournaments && recentTournaments.length > 0 ? (
                    <div className="space-y-3" data-testid="recent-tournaments">
                      {recentTournaments.slice(0, 5).map((tournament: any, index: number) => (
                        <div key={tournament.id || index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <div>
                            <div className="font-medium">{tournament.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {tournament.game} • {tournament.currentParticipants}/{tournament.maxParticipants} players
                            </div>
                          </div>
                          <Badge 
                            className={
                              tournament.status === 'live' ? 'bg-destructive/20 text-destructive' :
                              tournament.status === 'upcoming' ? 'bg-primary/20 text-primary' :
                              'bg-muted text-muted-foreground'
                            }
                          >
                            {tournament.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No recent tournaments
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  {recentTransactions && recentTransactions.length > 0 ? (
                    <div className="space-y-3" data-testid="recent-transactions">
                      {recentTransactions.slice(0, 8).map((transaction: any, index: number) => (
                        <div key={transaction.id || index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <div className="flex items-center gap-3">
                            {getTransactionIcon(transaction.type)}
                            <div>
                              <div className="font-medium text-sm">
                                {transaction.type === 'deposit' ? 'Deposit' : 
                                 transaction.type === 'withdrawal' ? 'Withdrawal' : 
                                 transaction.type}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(transaction.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              ₹{parseFloat(transaction.amount).toLocaleString('en-IN')}
                            </div>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(transaction.status)}
                              <span className="text-xs text-muted-foreground">
                                {transaction.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No recent transactions
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}