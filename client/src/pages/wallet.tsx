
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import MobileHeader from "@/components/layout/mobile-header";
import MobileNav from "@/components/layout/mobile-nav";
import Footer from "@/components/layout/footer";
import PaymentModal from "@/components/wallet/payment-modal";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Wallet, 
  Plus, 
  Download, 
  TrendingUp, 
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Search,
  Filter,
  AlertTriangle,
  Info,
  Trophy,
  CreditCard,
  Eye,
  EyeOff,
  RefreshCw,
  Banknote
} from "lucide-react";

export default function WalletPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Modal states
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  
  // UI states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showBalance, setShowBalance] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawReason, setWithdrawReason] = useState("");

  // Queries with error handling
  const { data: walletBalance, isLoading: balanceLoading, error: balanceError, refetch: refetchBalance } = useQuery({
    queryKey: ["/api/wallet/balance"],
    enabled: !!user,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const { data: transactions, isLoading: transactionsLoading, error: transactionsError, refetch: refetchTransactions } = useQuery({
    queryKey: ["/api/wallet/transactions"],
    enabled: !!user,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Enhanced withdrawal mutation with better error handling
  const withdrawMutation = useMutation({
    mutationFn: async (data: { amount: number; reason?: string }) => {
      if (data.amount < 10) {
        throw new Error("Minimum withdrawal amount is ₹10");
      }
      if (data.amount > parseFloat(walletBalance?.balance || "0")) {
        throw new Error("Insufficient balance for withdrawal");
      }
      
      const response = await apiRequest("POST", "/api/wallet/withdraw", data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/balance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/transactions"] });
      setShowWithdrawModal(false);
      setWithdrawAmount("");
      setWithdrawReason("");
      toast({
        title: "Withdrawal Requested",
        description: "Your withdrawal request has been submitted for processing.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Withdrawal Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Data processing
  const balance = parseFloat(walletBalance?.balance || '0');
  const allTransactions = transactions || [];
  
  // Enhanced filtering
  const filteredTransactions = allTransactions.filter((transaction: any) => {
    const matchesSearch = !searchQuery || 
      transaction.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === "all" || transaction.type === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  // Calculate statistics dynamically
  const stats = {
    totalDeposits: allTransactions
      .filter(t => t.type === 'deposit' && t.status === 'completed')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0),
    totalWithdrawals: allTransactions
      .filter(t => t.type === 'withdrawal' && t.status === 'completed')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0),
    totalWinnings: allTransactions
      .filter(t => t.type === 'prize_payout' && t.status === 'completed')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0),
    pendingTransactions: allTransactions.filter(t => t.status === 'pending').length,
    thisMonthTransactions: allTransactions.filter(t => {
      const transactionDate = new Date(t.createdAt);
      const currentMonth = new Date().getMonth();
      return transactionDate.getMonth() === currentMonth;
    }).length
  };

  // Helper functions
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'withdrawal':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'tournament_entry':
        return <TrendingDown className="w-4 h-4 text-orange-500" />;
      case 'prize_payout':
        return <Trophy className="w-4 h-4 text-yellow-500" />;
      case 'refund':
        return <RefreshCw className="w-4 h-4 text-blue-500" />;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
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

  const handleRefresh = () => {
    refetchBalance();
    refetchTransactions();
    toast({
      title: "Refreshed",
      description: "Wallet data has been updated",
    });
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount < 10) {
      toast({
        title: "Invalid Amount",
        description: "Minimum withdrawal amount is ₹10",
        variant: "destructive",
      });
      return;
    }
    
    withdrawMutation.mutate({ amount, reason: withdrawReason });
  };

  // Loading state
  if (balanceLoading || transactionsLoading) {
    return <LoadingSpinner />;
  }

  // Error state with retry options
  if (balanceError || transactionsError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Unable to Load Wallet</h2>
            <p className="text-muted-foreground mb-4">
              There was an error loading your wallet data. Please try again.
            </p>
            <Button onClick={handleRefresh} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MobileHeader />
      
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-br from-primary/10 via-accent/5 to-destructive/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-black mb-4">
              <span className="text-gradient">WALLET</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Manage your funds, track transactions, and handle payouts
            </p>
          </div>
        </div>
      </section>

      {/* Wallet Dashboard */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Balance Card with Enhanced Features */}
          <Card className="mb-8 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 gradient-fire rounded-full flex items-center justify-center">
                    <Wallet className="w-8 h-8 text-black" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold mb-2">Current Balance</h2>
                    <div className="flex items-center gap-2">
                      <div className={`text-4xl font-black text-gradient ${!showBalance ? 'blur-sm' : ''}`} data-testid="wallet-balance">
                        ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowBalance(!showBalance)}
                        className="ml-2"
                      >
                        {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  className="h-10 w-10 p-0"
                  data-testid="refresh-wallet"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-4 justify-center">
                <Button 
                  className="gradient-fire text-black font-bold hover:scale-105 transition-transform"
                  onClick={() => setShowAddFundsModal(true)}
                  data-testid="add-funds-button"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Funds
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowWithdrawModal(true)}
                  disabled={balance < 10}
                  data-testid="withdraw-button"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Withdraw
                </Button>
              </div>

              {/* Quick Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/50">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">This Month</div>
                  <div className="text-lg font-bold">{stats.thisMonthTransactions}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Pending</div>
                  <div className="text-lg font-bold text-yellow-500">{stats.pendingTransactions}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Total Wins</div>
                  <div className="text-lg font-bold text-green-500">₹{stats.totalWinnings.toLocaleString('en-IN')}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Net Flow</div>
                  <div className={`text-lg font-bold ${(stats.totalDeposits + stats.totalWinnings - stats.totalWithdrawals) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ₹{(stats.totalDeposits + stats.totalWinnings - stats.totalWithdrawals).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-card border-border hover:border-green-500/50 transition-colors">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold text-green-500" data-testid="total-deposits">
                  ₹{stats.totalDeposits.toLocaleString('en-IN')}
                </div>
                <div className="text-sm text-muted-foreground">Total Deposits</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-red-500/50 transition-colors">
              <CardContent className="p-6 text-center">
                <TrendingDown className="w-8 h-8 mx-auto mb-2 text-red-500" />
                <div className="text-2xl font-bold text-red-500" data-testid="total-withdrawals">
                  ₹{stats.totalWithdrawals.toLocaleString('en-IN')}
                </div>
                <div className="text-sm text-muted-foreground">Total Withdrawals</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-yellow-500/50 transition-colors">
              <CardContent className="p-6 text-center">
                <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                <div className="text-2xl font-bold text-yellow-500" data-testid="total-winnings">
                  ₹{stats.totalWinnings.toLocaleString('en-IN')}
                </div>
                <div className="text-sm text-muted-foreground">Total Winnings</div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Transaction History */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Transaction History
                </CardTitle>
                
                {/* Search and Filter Controls */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                      data-testid="search-transactions"
                    />
                  </div>
                  
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="px-3 py-2 border border-border rounded-md bg-background"
                    data-testid="filter-transactions"
                  >
                    <option value="all">All Types</option>
                    <option value="deposit">Deposits</option>
                    <option value="withdrawal">Withdrawals</option>
                    <option value="tournament_entry">Entries</option>
                    <option value="prize_payout">Winnings</option>
                    <option value="refund">Refunds</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="all" data-testid="filter-all">All ({filteredTransactions.length})</TabsTrigger>
                  <TabsTrigger value="deposit" data-testid="filter-deposits">
                    Deposits ({allTransactions.filter(t => t.type === 'deposit').length})
                  </TabsTrigger>
                  <TabsTrigger value="withdrawal" data-testid="filter-withdrawals">
                    Withdrawals ({allTransactions.filter(t => t.type === 'withdrawal').length})
                  </TabsTrigger>
                  <TabsTrigger value="tournament_entry" data-testid="filter-entries">
                    Entries ({allTransactions.filter(t => t.type === 'tournament_entry').length})
                  </TabsTrigger>
                  <TabsTrigger value="prize_payout" data-testid="filter-winnings">
                    Winnings ({allTransactions.filter(t => t.type === 'prize_payout').length})
                  </TabsTrigger>
                  <TabsTrigger value="refund" data-testid="filter-refunds">
                    Refunds ({allTransactions.filter(t => t.type === 'refund').length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="space-y-4 mt-6">
                  {filteredTransactions.length > 0 ? (
                    <div className="space-y-3" data-testid="transaction-list">
                      {filteredTransactions.map((transaction: any, index: number) => (
                        <div 
                          key={transaction.id || index} 
                          className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border hover:bg-muted/50 transition-colors"
                          data-testid={`transaction-${index}`}
                        >
                          <div className="flex items-center gap-4">
                            {getTransactionIcon(transaction.type)}
                            <div className="flex-1">
                              <div className="font-medium flex items-center gap-2">
                                {formatTransactionType(transaction.type)}
                                {transaction.status === 'pending' && (
                                  <Badge variant="outline" className="text-xs">
                                    Processing
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {transaction.description || 'No description'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(transaction.createdAt).toLocaleString('en-IN')}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className={`text-lg font-semibold ${
                              ['deposit', 'prize_payout', 'refund'].includes(transaction.type) 
                                ? 'text-green-500' 
                                : 'text-red-500'
                            }`}>
                              {['deposit', 'prize_payout', 'refund'].includes(transaction.type) ? '+' : '-'}
                              ₹{parseFloat(transaction.amount).toLocaleString('en-IN')}
                            </div>
                            <div className="flex items-center gap-1 justify-end mt-1">
                              {getStatusIcon(transaction.status)}
                              <Badge className={`${getStatusColor(transaction.status)} text-xs border`}>
                                {transaction.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12" data-testid="no-transactions">
                      <Banknote className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">
                        {searchQuery || selectedFilter !== 'all' ? 'No Matching Transactions' : 'No Transactions Yet'}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {searchQuery || selectedFilter !== 'all' 
                          ? 'Try adjusting your search or filter criteria'
                          : 'Start by adding funds to your wallet'
                        }
                      </p>
                      {!searchQuery && selectedFilter === 'all' && (
                        <Button 
                          className="gradient-fire text-black font-bold"
                          onClick={() => setShowAddFundsModal(true)}
                        >
                          Add Funds
                        </Button>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Enhanced Wallet Info */}
          <Card className="mt-8 bg-card/50 border-border">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Wallet Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-medium mb-2 text-green-600">Adding Funds</h4>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Minimum deposit: ₹10</li>
                    <li>• Maximum deposit: ₹50,000 per day</li>
                    <li>• Instant credit via UPI/Cards</li>
                    <li>• Safe and secure payments</li>
                    <li>• 24/7 customer support</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-blue-600">Withdrawals</h4>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Minimum withdrawal: ₹10</li>
                    <li>• Processing time: 1-3 business days</li>
                    <li>• KYC verification required</li>
                    <li>• Direct bank transfer</li>
                    <li>• No hidden charges</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
      <MobileNav />

      {/* Enhanced Add Funds Modal */}
      <PaymentModal 
        isOpen={showAddFundsModal}
        onClose={() => setShowAddFundsModal(false)}
        type="deposit"
      />

      {/* Enhanced Withdraw Modal */}
      <Dialog open={showWithdrawModal} onOpenChange={setShowWithdrawModal}>
        <DialogContent className="max-w-md" data-testid="withdraw-modal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Withdraw Funds
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="text-sm text-muted-foreground mb-1">Available Balance</div>
              <div className="text-lg font-bold">₹{balance.toLocaleString('en-IN')}</div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="withdraw-amount">Amount to Withdraw</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₹</span>
                <Input
                  id="withdraw-amount"
                  type="number"
                  min="10"
                  max={balance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="pl-8"
                  placeholder="Enter amount"
                  data-testid="withdraw-amount-input"
                />
              </div>
              <div className="text-xs text-muted-foreground">
                Minimum: ₹10 • Maximum: ₹{balance.toLocaleString('en-IN')}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="withdraw-reason">Reason (Optional)</Label>
              <Input
                id="withdraw-reason"
                value={withdrawReason}
                onChange={(e) => setWithdrawReason(e.target.value)}
                placeholder="Purpose of withdrawal"
                data-testid="withdraw-reason-input"
              />
            </div>

            {parseFloat(withdrawAmount) > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium text-sm">Processing Time</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Withdrawals typically take 1-3 business days to process and reach your bank account.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowWithdrawModal(false)}
              data-testid="cancel-withdraw"
            >
              Cancel
            </Button>
            <Button 
              className="gradient-fire text-black font-bold"
              onClick={handleWithdraw}
              disabled={withdrawMutation.isPending || !withdrawAmount || parseFloat(withdrawAmount) < 10}
              data-testid="confirm-withdraw"
            >
              {withdrawMutation.isPending ? "Processing..." : "Withdraw Funds"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
