
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminSidebar from "@/components/admin/admin-sidebar";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  DollarSign,
  Trophy,
  Calendar,
  Download,
  RefreshCw,
  Eye,
  Activity
} from "lucide-react";

export default function AdminAnalytics() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("7d");
  const [reportType, setReportType] = useState("overview");

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["/api/admin/analytics", { timeRange, reportType }],
    enabled: !!user?.isAdmin,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const mockChartData = [
    { name: 'Mon', users: 45, revenue: 2400, tournaments: 8 },
    { name: 'Tue', users: 52, revenue: 3200, tournaments: 12 },
    { name: 'Wed', users: 38, revenue: 1800, tournaments: 6 },
    { name: 'Thu', users: 65, revenue: 4200, tournaments: 15 },
    { name: 'Fri', users: 78, revenue: 5600, tournaments: 18 },
    { name: 'Sat', users: 95, revenue: 7200, tournaments: 22 },
    { name: 'Sun', users: 88, revenue: 6800, tournaments: 20 },
  ];

  const topGames = [
    { game: 'BGMI', users: 2340, revenue: 45600, growth: 12.5 },
    { game: 'Free Fire', users: 1890, revenue: 38200, growth: 8.3 },
    { game: 'COD Mobile', users: 1560, revenue: 32100, growth: -2.1 },
    { game: 'Valorant', users: 890, revenue: 18900, growth: 15.7 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <AdminSidebar />
        
        <main className="flex-1 ml-64">
          {/* Header */}
          <div className="bg-card border-b border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <BarChart3 className="w-8 h-8 text-primary" />
                  Analytics & Reports
                </h1>
                <p className="text-muted-foreground">
                  Track platform performance, user engagement, and financial metrics.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-32" data-testid="time-range-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1d">Last 24h</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" data-testid="export-report">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" data-testid="refresh-analytics">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <Tabs value={reportType} onValueChange={setReportType} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
                <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
                <TabsTrigger value="tournaments" data-testid="tab-tournaments">Tournaments</TabsTrigger>
                <TabsTrigger value="financial" data-testid="tab-financial">Financial</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card className="bg-primary/10 border-primary/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Daily Active Users</p>
                          <p className="text-3xl font-bold text-primary">1,234</p>
                          <div className="flex items-center gap-1 mt-1">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-green-500">+12.5%</span>
                          </div>
                        </div>
                        <Users className="w-8 h-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-500/10 border-green-500/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Daily Revenue</p>
                          <p className="text-3xl font-bold text-green-500">₹45,670</p>
                          <div className="flex items-center gap-1 mt-1">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-green-500">+8.3%</span>
                          </div>
                        </div>
                        <DollarSign className="w-8 h-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-accent/10 border-accent/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Active Tournaments</p>
                          <p className="text-3xl font-bold text-accent">18</p>
                          <div className="flex items-center gap-1 mt-1">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-green-500">+2</span>
                          </div>
                        </div>
                        <Trophy className="w-8 h-8 text-accent" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-yellow-500/10 border-yellow-500/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                          <p className="text-3xl font-bold text-yellow-500">3.4%</p>
                          <div className="flex items-center gap-1 mt-1">
                            <TrendingDown className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-red-500">-0.2%</span>
                          </div>
                        </div>
                        <Activity className="w-8 h-8 text-yellow-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>User Activity Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
                        <div className="text-center">
                          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground">Chart would render here</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Integration with charting library needed
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue Analytics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
                        <div className="text-center">
                          <TrendingUp className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground">Revenue chart would render here</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Daily/Weekly/Monthly revenue trends
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Top Games Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle>Game Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topGames.map((game, index) => (
                        <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-border">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 gradient-fire rounded-lg flex items-center justify-center text-black font-bold">
                              {game.game.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium">{game.game}</div>
                              <div className="text-sm text-muted-foreground">
                                {game.users.toLocaleString()} active players
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              ₹{game.revenue.toLocaleString('en-IN')}
                            </div>
                            <div className={`text-sm flex items-center gap-1 ${
                              game.growth > 0 ? 'text-green-500' : 'text-red-500'
                            }`}>
                              {game.growth > 0 ? (
                                <TrendingUp className="w-3 h-3" />
                              ) : (
                                <TrendingDown className="w-3 h-3" />
                              )}
                              {Math.abs(game.growth)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">User Analytics Dashboard</h3>
                      <p className="text-muted-foreground">
                        Detailed user engagement, retention, and demographic analytics.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tournaments Tab */}
              <TabsContent value="tournaments" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Tournament Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">Tournament Analytics</h3>
                      <p className="text-muted-foreground">
                        Tournament participation, completion rates, and performance metrics.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Financial Tab */}
              <TabsContent value="financial" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Reports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <DollarSign className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">Financial Dashboard</h3>
                      <p className="text-muted-foreground">
                        Revenue streams, profit margins, and financial forecasting.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
