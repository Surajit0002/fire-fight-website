import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminSidebar from "@/components/admin/admin-sidebar";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Wallet, 
  Search, 
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Download,
  Eye,
  RefreshCw,
  CreditCard,
  Ban
} from "lucide-react";

export default function AdminWallets() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [page, setPage] = useState(1);

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/admin/transactions", { page, limit: 50 }],
    enabled: !!user?.isAdmin,
  });

  const { data: pendingWithdrawals, isLoading: withdrawalsLoading } = useQuery({
    queryKey: ["/api/admin/withdrawals/pending"],
    enabled: !!user?.isAdmin,
  });

  const { data: walletStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/wallet/stats"],
    enabled: !!user?.isAdmin,
  });

  const approveWithdrawalMutation = useMutation({
    mutationFn: async ({ transactionId, approved }: { transactionId: string; approved: boolean }) => {
      return await apiRequest("POST", `/api/admin/withdrawals/${transactionId}/${approved ? 'approve' : 'reject'}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/transactions"] });
      toast({
        title: "Success!",
        description: "Withdrawal request processed successfully.",
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

  if (transactionsLoading || withdrawalsLoading || statsLoading) {
    return <LoadingSpinner />;
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'withdrawal':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'tournament_entry':
        return <TrendingDown className="w-4 h-4 text-orange-500" />;
      case 'prize_payout':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'refund':
        return <TrendingUp className="w-4 h-4 text-blue-500" />;
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
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'failed':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatTransactionType = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'Deposit';
      case 'withdrawal':
        return 'Withdrawal';
      case 'tournament_entry':
        return 'Tournament Entry';
      case 'prize_payout':
        return 'Prize Payout';
      case 'refund':
        return 'Refund';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const filteredTransactions = transactions?.filter((transaction: any) => {
    const matchesSearch = transaction.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.userId?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || transaction.type === typeFilter;
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  }) || [];

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
                  <Wallet className="w-8 h-8 text-primary" />
                  Wallet Management
                </h1>
                <p className="text-muted-foreground">
                  Monitor transactions, approve withdrawals, and manage platform finances.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" data-testid="export-transactions">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" data-testid="refresh-data">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="p-6 border-b border-border">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-green-500/10 border-green-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Deposits</p>
                      <p className="text-3xl font-bold text-green-500" data-testid="total-deposits">
                        ₹{(walletStats?.totalDeposits || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-red-500/10 border-red-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Withdrawals</p>
                      <p className="text-3xl font-bold text-red-500" data-testid="total-withdrawals">
                        ₹{(walletStats?.totalWithdrawals || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <TrendingDown className="w-8 h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-yellow-500/10 border-yellow-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pending Withdrawals</p>
                      <p className="text-3xl font-bold text-yellow-500" data-testid="pending-withdrawals">
                        {pendingWithdrawals?.length || 0}
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-primary/10 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Platform Revenue</p>
                      <p className="text-3xl font-bold text-primary" data-testid="platform-revenue">
                        ₹{(walletStats?.platformRevenue || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Content Tabs */}
          <div className="p-6">
            <Tabs defaultValue="transactions" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="transactions" data-testid="tab-transactions">All Transactions</TabsTrigger>
                <TabsTrigger value="withdrawals" data-testid="tab-withdrawals">
                  Pending Withdrawals
                  {pendingWithdrawals && pendingWithdrawals.length > 0 && (
                    <Badge className="ml-2 bg-yellow-500/20 text-yellow-400">
                      {pendingWithdrawals.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="reconciliation" data-testid="tab-reconciliation">Reconciliation</TabsTrigger>
              </TabsList>

              {/* All Transactions Tab */}
              <TabsContent value="transactions" className="space-y-6">
                {/* Filters */}
                <div className="flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex flex-wrap gap-3 items-center">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                      <Input 
                        placeholder="Search transactions..." 
                        className="pl-10 w-80"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        data-testid="search-transactions"
                      />
                    </div>
                    
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-40" data-testid="type-filter">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="deposit">Deposits</SelectItem>
                        <SelectItem value="withdrawal">Withdrawals</SelectItem>
                        <SelectItem value="tournament_entry">Entries</SelectItem>
                        <SelectItem value="prize_payout">Payouts</SelectItem>
                        <SelectItem value="refund">Refunds</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32" data-testid="status-filter">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    Showing {filteredTransactions.length} of {transactions?.length || 0} transactions
                  </div>
                </div>

                {/* Transactions Table */}
                <Card>
                  <CardContent className="p-0">
                    {filteredTransactions.length > 0 ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Transaction</TableHead>
                              <TableHead>User</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredTransactions.map((transaction: any, index: number) => (
                              <TableRow key={transaction.id || index} data-testid={`transaction-row-${index}`}>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    {getTransactionIcon(transaction.type)}
                                    <div>
                                      <div className="font-medium">{formatTransactionType(transaction.type)}</div>
                                      <div className="text-sm text-muted-foreground">
                                        {transaction.description || 'No description'}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Avatar className="w-8 h-8">
                                      <AvatarImage src={transaction.user?.profileImageUrl} />
                                      <AvatarFallback>
                                        {transaction.user?.username?.charAt(0).toUpperCase() || 'U'}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="text-sm font-medium">
                                        {transaction.user?.username || 'Unknown'}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {transaction.userId}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className={`font-semibold ${
                                    ['deposit', 'prize_payout', 'refund'].includes(transaction.type) 
                                      ? 'text-green-500' 
                                      : 'text-red-500'
                                  }`}>
                                    {['deposit', 'prize_payout', 'refund'].includes(transaction.type) ? '+' : '-'}
                                    ₹{parseFloat(transaction.amount).toLocaleString('en-IN')}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge className={getStatusColor(transaction.status)}>
                                    {getStatusIcon(transaction.status)}
                                    {transaction.status.toUpperCase()}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    {new Date(transaction.createdAt).toLocaleDateString('en-IN')}
                                    <br />
                                    <span className="text-muted-foreground">
                                      {new Date(transaction.createdAt).toLocaleTimeString('en-IN', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedTransaction(transaction);
                                      setDetailsModalOpen(true);
                                    }}
                                    data-testid={`view-transaction-${index}`}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">No Transactions Found</h3>
                        <p className="text-muted-foreground">
                          {searchQuery || typeFilter !== "all" || statusFilter !== "all" 
                            ? "No transactions match your current filters" 
                            : "No transactions recorded yet"
                          }
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Pending Withdrawals Tab */}
              <TabsContent value="withdrawals" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-yellow-500" />
                      Pending Withdrawal Requests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {pendingWithdrawals && pendingWithdrawals.length > 0 ? (
                      <div className="space-y-4" data-testid="pending-withdrawals-list">
                        {pendingWithdrawals.map((withdrawal: any, index: number) => (
                          <div 
                            key={withdrawal.id || index} 
                            className="flex items-center justify-between p-4 rounded-lg border border-border bg-yellow-500/5"
                            data-testid={`withdrawal-${index}`}
                          >
                            <div className="flex items-center gap-4">
                              <Avatar>
                                <AvatarImage src={withdrawal.user?.profileImageUrl} />
                                <AvatarFallback>
                                  {withdrawal.user?.username?.charAt(0).toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{withdrawal.user?.username || 'Unknown'}</div>
                                <div className="text-sm text-muted-foreground">
                                  {withdrawal.user?.email}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Requested: {new Date(withdrawal.createdAt).toLocaleString('en-IN')}
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-center">
                              <div className="text-2xl font-bold text-red-500">
                                ₹{parseFloat(withdrawal.amount).toLocaleString('en-IN')}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Withdrawal Amount
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button 
                                size="sm" 
                                className="bg-green-500 hover:bg-green-600 text-white"
                                onClick={() => approveWithdrawalMutation.mutate({
                                  transactionId: withdrawal.id,
                                  approved: true
                                })}
                                disabled={approveWithdrawalMutation.isPending}
                                data-testid={`approve-withdrawal-${index}`}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => approveWithdrawalMutation.mutate({
                                  transactionId: withdrawal.id,
                                  approved: false
                                })}
                                disabled={approveWithdrawalMutation.isPending}
                                data-testid={`reject-withdrawal-${index}`}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                        <h3 className="text-lg font-semibold mb-2">No Pending Withdrawals</h3>
                        <p className="text-muted-foreground">
                          All withdrawal requests have been processed.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reconciliation Tab */}
              <TabsContent value="reconciliation" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Gateway Reconciliation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <CreditCard className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">Reconciliation Tools</h3>
                      <p className="text-muted-foreground mb-4">
                        Reconciliation features will be available soon for matching platform transactions with payment gateway records.
                      </p>
                      <Button variant="outline">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Manual Sync
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Transaction Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-2xl" data-testid="transaction-details-modal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Transaction Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Transaction ID</Label>
                  <div className="text-sm font-mono bg-muted/30 p-2 rounded">
                    {selectedTransaction.id}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <div className="text-sm">
                    {formatTransactionType(selectedTransaction.type)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Amount</Label>
                  <div className={`text-lg font-bold ${
                    ['deposit', 'prize_payout', 'refund'].includes(selectedTransaction.type) 
                      ? 'text-green-500' 
                      : 'text-red-500'
                  }`}>
                    {['deposit', 'prize_payout', 'refund'].includes(selectedTransaction.type) ? '+' : '-'}
                    ₹{parseFloat(selectedTransaction.amount).toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge className={getStatusColor(selectedTransaction.status)}>
                    {selectedTransaction.status.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Description</Label>
                <div className="text-sm">
                  {selectedTransaction.description || 'No description provided'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Created At</Label>
                  <div className="text-sm">
                    {new Date(selectedTransaction.createdAt).toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Payment Intent ID</Label>
                  <div className="text-sm font-mono">
                    {selectedTransaction.stripePaymentIntentId || 'N/A'}
                  </div>
                </div>
              </div>

              {selectedTransaction.adminId && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                  <Label className="text-sm font-medium">Admin Action</Label>
                  <div className="text-sm">
                    <div>Admin: {selectedTransaction.adminId}</div>
                    <div>Reason: {selectedTransaction.adminReason}</div>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setDetailsModalOpen(false)}
                  data-testid="close-details"
                >
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
