
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminSidebar from "@/components/admin/admin-sidebar";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Settings, 
  Globe, 
  Shield, 
  DollarSign,
  Bell,
  Database,
  Mail,
  Palette,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff
} from "lucide-react";

export default function AdminSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/admin/settings"],
    enabled: !!user?.isAdmin,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PUT", "/api/admin/settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({
        title: "Success!",
        description: "Settings updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const testEmailMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/admin/test-email");
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Test email sent successfully.",
      });
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
                  <Settings className="w-8 h-8 text-primary" />
                  Platform Settings
                </h1>
                <p className="text-muted-foreground">
                  Configure platform settings, integrations, and administrative options.
                </p>
              </div>
              <Badge className="bg-green-500/20 text-green-400">
                <CheckCircle className="w-3 h-3 mr-1" />
                All Systems Operational
              </Badge>
            </div>
          </div>

          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="general" data-testid="tab-general">General</TabsTrigger>
                <TabsTrigger value="payment" data-testid="tab-payment">Payment</TabsTrigger>
                <TabsTrigger value="email" data-testid="tab-email">Email</TabsTrigger>
                <TabsTrigger value="security" data-testid="tab-security">Security</TabsTrigger>
                <TabsTrigger value="api" data-testid="tab-api">API</TabsTrigger>
                <TabsTrigger value="maintenance" data-testid="tab-maintenance">Maintenance</TabsTrigger>
              </TabsList>

              {/* General Settings */}
              <TabsContent value="general" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Platform Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="platform-name">Platform Name</Label>
                        <Input
                          id="platform-name"
                          defaultValue="FireFight Arena"
                          data-testid="platform-name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="platform-url">Platform URL</Label>
                        <Input
                          id="platform-url"
                          defaultValue="https://firefightarena.com"
                          data-testid="platform-url"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="platform-description">Platform Description</Label>
                      <Textarea
                        id="platform-description"
                        defaultValue="India's premier gaming tournament platform for competitive esports."
                        data-testid="platform-description"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="support-email">Support Email</Label>
                        <Input
                          id="support-email"
                          type="email"
                          defaultValue="support@firefightarena.com"
                          data-testid="support-email"
                        />
                      </div>
                      <div>
                        <Label htmlFor="contact-phone">Contact Phone</Label>
                        <Input
                          id="contact-phone"
                          defaultValue="+91 9876543210"
                          data-testid="contact-phone"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                      <div>
                        <div className="font-medium">Registration Open</div>
                        <div className="text-sm text-muted-foreground">Allow new user registrations</div>
                      </div>
                      <Switch defaultChecked data-testid="registration-open" />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                      <div>
                        <div className="font-medium">Maintenance Mode</div>
                        <div className="text-sm text-muted-foreground">Enable maintenance mode</div>
                      </div>
                      <Switch data-testid="maintenance-mode" />
                    </div>

                    <Button 
                      className="gradient-fire text-black font-bold"
                      onClick={() => updateSettingsMutation.mutate({ tab: 'general' })}
                      disabled={updateSettingsMutation.isPending}
                      data-testid="save-general"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {updateSettingsMutation.isPending ? "Saving..." : "Save General Settings"}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Payment Settings */}
              <TabsContent value="payment" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Payment Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="stripe-public-key">Stripe Public Key</Label>
                        <div className="relative">
                          <Input
                            id="stripe-public-key"
                            type={showApiKeys ? "text" : "password"}
                            defaultValue="pk_test_..."
                            data-testid="stripe-public-key"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2"
                            onClick={() => setShowApiKeys(!showApiKeys)}
                          >
                            {showApiKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="stripe-secret-key">Stripe Secret Key</Label>
                        <Input
                          id="stripe-secret-key"
                          type={showApiKeys ? "text" : "password"}
                          defaultValue="sk_test_..."
                          data-testid="stripe-secret-key"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="platform-fee">Platform Fee (%)</Label>
                        <Input
                          id="platform-fee"
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          defaultValue="5.0"
                          data-testid="platform-fee"
                        />
                      </div>
                      <div>
                        <Label htmlFor="min-withdrawal">Min Withdrawal (₹)</Label>
                        <Input
                          id="min-withdrawal"
                          type="number"
                          min="0"
                          defaultValue="100"
                          data-testid="min-withdrawal"
                        />
                      </div>
                      <div>
                        <Label htmlFor="max-withdrawal">Max Withdrawal (₹)</Label>
                        <Input
                          id="max-withdrawal"
                          type="number"
                          min="0"
                          defaultValue="50000"
                          data-testid="max-withdrawal"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                      <div>
                        <div className="font-medium">Auto Payouts</div>
                        <div className="text-sm text-muted-foreground">Automatically process verified withdrawals</div>
                      </div>
                      <Switch data-testid="auto-payouts" />
                    </div>

                    <Button 
                      className="gradient-fire text-black font-bold"
                      onClick={() => updateSettingsMutation.mutate({ tab: 'payment' })}
                      disabled={updateSettingsMutation.isPending}
                      data-testid="save-payment"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {updateSettingsMutation.isPending ? "Saving..." : "Save Payment Settings"}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Email Settings */}
              <TabsContent value="email" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="w-5 h-5" />
                      Email Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="smtp-host">SMTP Host</Label>
                        <Input
                          id="smtp-host"
                          defaultValue="smtp.gmail.com"
                          data-testid="smtp-host"
                        />
                      </div>
                      <div>
                        <Label htmlFor="smtp-port">SMTP Port</Label>
                        <Input
                          id="smtp-port"
                          type="number"
                          defaultValue="587"
                          data-testid="smtp-port"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="smtp-username">SMTP Username</Label>
                        <Input
                          id="smtp-username"
                          defaultValue="noreply@firefightarena.com"
                          data-testid="smtp-username"
                        />
                      </div>
                      <div>
                        <Label htmlFor="smtp-password">SMTP Password</Label>
                        <Input
                          id="smtp-password"
                          type="password"
                          defaultValue="••••••••"
                          data-testid="smtp-password"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                      <div>
                        <div className="font-medium">Email Notifications</div>
                        <div className="text-sm text-muted-foreground">Send automated email notifications</div>
                      </div>
                      <Switch defaultChecked data-testid="email-notifications" />
                    </div>

                    <div className="flex items-center gap-4">
                      <Button 
                        className="gradient-fire text-black font-bold"
                        onClick={() => updateSettingsMutation.mutate({ tab: 'email' })}
                        disabled={updateSettingsMutation.isPending}
                        data-testid="save-email"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {updateSettingsMutation.isPending ? "Saving..." : "Save Email Settings"}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => testEmailMutation.mutate()}
                        disabled={testEmailMutation.isPending}
                        data-testid="test-email"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        {testEmailMutation.isPending ? "Sending..." : "Send Test Email"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Settings */}
              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Security Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                        <Input
                          id="session-timeout"
                          type="number"
                          min="5"
                          max="1440"
                          defaultValue="60"
                          data-testid="session-timeout"
                        />
                      </div>
                      <div>
                        <Label htmlFor="max-login-attempts">Max Login Attempts</Label>
                        <Input
                          id="max-login-attempts"
                          type="number"
                          min="3"
                          max="10"
                          defaultValue="5"
                          data-testid="max-login-attempts"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                        <div>
                          <div className="font-medium">Two-Factor Authentication</div>
                          <div className="text-sm text-muted-foreground">Require 2FA for admin accounts</div>
                        </div>
                        <Switch defaultChecked data-testid="require-2fa" />
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                        <div>
                          <div className="font-medium">Rate Limiting</div>
                          <div className="text-sm text-muted-foreground">Enable API rate limiting</div>
                        </div>
                        <Switch defaultChecked data-testid="rate-limiting" />
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                        <div>
                          <div className="font-medium">IP Whitelist</div>
                          <div className="text-sm text-muted-foreground">Restrict admin access to specific IPs</div>
                        </div>
                        <Switch data-testid="ip-whitelist" />
                      </div>
                    </div>

                    <Button 
                      className="gradient-fire text-black font-bold"
                      onClick={() => updateSettingsMutation.mutate({ tab: 'security' })}
                      disabled={updateSettingsMutation.isPending}
                      data-testid="save-security"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {updateSettingsMutation.isPending ? "Saving..." : "Save Security Settings"}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* API Settings */}
              <TabsContent value="api" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>API Configuration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Database className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">API Management</h3>
                      <p className="text-muted-foreground">
                        API keys, webhooks, and external integrations configuration.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Maintenance Settings */}
              <TabsContent value="maintenance" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>System Maintenance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                        <span className="font-medium">Maintenance Tools</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Use these tools carefully. Some operations may affect platform performance.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button variant="outline" data-testid="clear-cache">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Clear Cache
                        </Button>
                        <Button variant="outline" data-testid="backup-database">
                          <Database className="w-4 h-4 mr-2" />
                          Backup Database
                        </Button>
                        <Button variant="outline" data-testid="optimize-database">
                          <Database className="w-4 h-4 mr-2" />
                          Optimize Database
                        </Button>
                        <Button variant="outline" data-testid="system-health">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          System Health Check
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="backup-frequency">Backup Frequency</Label>
                        <Select defaultValue="daily">
                          <SelectTrigger data-testid="backup-frequency">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hourly">Hourly</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="log-retention">Log Retention (days)</Label>
                        <Input
                          id="log-retention"
                          type="number"
                          min="7"
                          max="365"
                          defaultValue="30"
                          data-testid="log-retention"
                        />
                      </div>
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
