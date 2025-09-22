import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminSidebar from "@/components/admin/admin-sidebar";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  Search, 
  Filter,
  Edit,
  Ban,
  Shield,
  Eye,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Wallet,
  UserCheck,
  UserX,
  Clock,
  Download
} from "lucide-react";

export default function AdminUsers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [kycFilter, setKycFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [adjustmentAmount, setAdjustmentAmount] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [adjustmentType, setAdjustmentType] = useState<"credit" | "debit">("credit");
  const [page, setPage] = useState(1);

  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/admin/users", { page, limit: 50 }],
    enabled: !!user?.isAdmin,
  });

  const banUserMutation = useMutation({
    mutationFn: async ({ userId, banned }: { userId: string; banned: boolean }) => {
      return await apiRequest("PATCH", `/api/admin/users/${userId}`, { isBanned: banned });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success!",
        description: "User status updated successfully.",
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

  const updateKYCStatusMutation = useMutation({
    mutationFn: async ({ userId, status, notes }: { userId: string; status: string; notes?: string }) => {
      return await apiRequest("PATCH", `/api/admin/users/${userId}/kyc`, { status, notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success!",
        description: "KYC status updated successfully.",
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

  const adjustWalletMutation = useMutation({
    mutationFn: async (data: {
      userId: string;
      type: "credit" | "debit";
      amount: string;
      reason: string;
    }) => {
      return await apiRequest("POST", "/api/admin/wallet/adjust", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success!",
        description: "Wallet adjusted successfully.",
      });
      setWalletModalOpen(false);
      setAdjustmentAmount("");
      setAdjustmentReason("");
      setSelectedUser(null);
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

  const getKYCStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-3 h-3 mr-1" />;
      case 'pending':
        return <Clock className="w-3 h-3 mr-1" />;
      case 'rejected':
        return <XCircle className="w-3 h-3 mr-1" />;
      default:
        return <AlertCircle className="w-3 h-3 mr-1" />;
    }
  };

  const filteredUsers = users?.filter((userItem: any) => {
    const matchesSearch = userItem.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         userItem.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         userItem.gameId?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && !userItem.isBanned) ||
                         (statusFilter === "banned" && userItem.isBanned);
    const matchesKYC = kycFilter === "all" || userItem.kycStatus === kycFilter;
    
    return matchesSearch && matchesStatus && matchesKYC;
  }) || [];

  const handleWalletAdjustment = () => {
    if (!selectedUser || !adjustmentAmount || !adjustmentReason) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    adjustWalletMutation.mutate({
      userId: selectedUser.id,
      type: adjustmentType,
      amount: adjustmentAmount,
      reason: adjustmentReason,
    });
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
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <Users className="w-8 h-8 text-primary" />
                  User Management
                </h1>
                <p className="text-muted-foreground">
                  Manage user accounts, KYC verification, wallet balances, and user permissions.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" data-testid="export-users">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="p-6 border-b border-border">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-3 items-center">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    placeholder="Search users..." 
                    className="pl-10 w-80"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="search-users"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32" data-testid="status-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={kycFilter} onValueChange={setKycFilter}>
                  <SelectTrigger className="w-32" data-testid="kyc-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All KYC</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Showing {filteredUsers.length} of {users?.length || 0} users
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="p-6">
            <Card>
              <CardHeader>
                <CardTitle>User List</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredUsers.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Game ID</TableHead>
                          <TableHead>Wallet Balance</TableHead>
                          <TableHead>KYC Status</TableHead>
                          <TableHead>Account Status</TableHead>
                          <TableHead>Joined Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((userItem: any, index: number) => (
                          <TableRow key={userItem.id || index} data-testid={`user-row-${index}`}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={userItem.profileImageUrl} />
                                  <AvatarFallback>
                                    {userItem.username?.charAt(0).toUpperCase() || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{userItem.username || 'Unknown'}</div>
                                  <div className="text-sm text-muted-foreground">{userItem.email}</div>
                                  {userItem.isAdmin && (
                                    <Badge className="mt-1 bg-purple-500/20 text-purple-400">
                                      <Shield className="w-3 h-3 mr-1" />
                                      Admin
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {userItem.gameId || (
                                  <span className="text-muted-foreground">Not set</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Wallet className="w-4 h-4 text-green-500" />
                                <span>₹{parseFloat(userItem.walletBalance || '0').toLocaleString('en-IN')}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getKYCStatusColor(userItem.kycStatus || 'pending')}>
                                {getKYCStatusIcon(userItem.kycStatus || 'pending')}
                                {(userItem.kycStatus || 'pending').toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {userItem.isBanned ? (
                                <Badge className="bg-red-500/20 text-red-400">
                                  <UserX className="w-3 h-3 mr-1" />
                                  BANNED
                                </Badge>
                              ) : (
                                <Badge className="bg-green-500/20 text-green-400">
                                  <UserCheck className="w-3 h-3 mr-1" />
                                  ACTIVE
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {new Date(userItem.createdAt).toLocaleDateString('en-IN')}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" data-testid={`view-user-${index}`}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                                
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedUser(userItem);
                                    setWalletModalOpen(true);
                                  }}
                                  data-testid={`adjust-wallet-${index}`}
                                >
                                  <DollarSign className="w-4 h-4" />
                                </Button>

                                {userItem.kycStatus === 'pending' && (
                                  <>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => updateKYCStatusMutation.mutate({
                                        userId: userItem.id,
                                        status: 'verified'
                                      })}
                                      data-testid={`approve-kyc-${index}`}
                                    >
                                      <CheckCircle className="w-4 h-4 text-green-500" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => updateKYCStatusMutation.mutate({
                                        userId: userItem.id,
                                        status: 'rejected'
                                      })}
                                      data-testid={`reject-kyc-${index}`}
                                    >
                                      <XCircle className="w-4 h-4 text-red-500" />
                                    </Button>
                                  </>
                                )}

                                {!userItem.isAdmin && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => banUserMutation.mutate({
                                      userId: userItem.id,
                                      banned: !userItem.isBanned
                                    })}
                                    data-testid={`ban-user-${index}`}
                                  >
                                    {userItem.isBanned ? (
                                      <UserCheck className="w-4 h-4 text-green-500" />
                                    ) : (
                                      <Ban className="w-4 h-4 text-red-500" />
                                    )}
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No Users Found</h3>
                    <p className="text-muted-foreground">
                      {searchQuery || statusFilter !== "all" || kycFilter !== "all" 
                        ? "No users match your current filters" 
                        : "No users have registered yet"
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Wallet Adjustment Modal */}
      <Dialog open={walletModalOpen} onOpenChange={setWalletModalOpen}>
        <DialogContent className="max-w-md" data-testid="wallet-adjustment-modal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Adjust Wallet Balance
            </DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedUser.profileImageUrl} />
                    <AvatarFallback>
                      {selectedUser.username?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{selectedUser.username}</div>
                    <div className="text-sm text-muted-foreground">
                      Current Balance: ₹{parseFloat(selectedUser.walletBalance || '0').toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="adjustmentType">Adjustment Type</Label>
                <Select value={adjustmentType} onValueChange={(value: "credit" | "debit") => setAdjustmentType(value)}>
                  <SelectTrigger data-testid="adjustment-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit">Credit (Add)</SelectItem>
                    <SelectItem value="debit">Debit (Subtract)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={adjustmentAmount}
                  onChange={(e) => setAdjustmentAmount(e.target.value)}
                  placeholder="Enter amount"
                  data-testid="adjustment-amount"
                />
              </div>

              <div>
                <Label htmlFor="reason">Reason *</Label>
                <Textarea
                  id="reason"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  placeholder="Enter reason for adjustment"
                  data-testid="adjustment-reason"
                />
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium text-sm">Important</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  This action will be logged for audit purposes. Please provide a clear reason for the adjustment.
                </p>
              </div>

              <DialogFooter className="gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setWalletModalOpen(false)}
                  data-testid="cancel-adjustment"
                >
                  Cancel
                </Button>
                <Button 
                  className="gradient-fire text-black font-bold"
                  onClick={handleWalletAdjustment}
                  disabled={adjustWalletMutation.isPending || !adjustmentAmount || !adjustmentReason}
                  data-testid="confirm-adjustment"
                >
                  {adjustWalletMutation.isPending ? "Processing..." : "Adjust Wallet"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
