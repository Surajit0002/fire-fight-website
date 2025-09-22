import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import PaymentModal from "@/components/wallet/payment-modal";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  Wallet, 
  Plus, 
  Download, 
  TrendingUp, 
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign
} from "lucide-react";

export default function WalletPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);

  const { data: walletBalance, isLoading: balanceLoading } = useQuery({
    queryKey: ["/api/wallet/balance"],
    enabled: !!user,
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/wallet/transactions"],
    enabled: !!user,
  });

  const withdrawMutation = useMutation({
    mutationFn: async (amount: number) => {
      const response = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/balance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/transactions"] });
      toast({
        title: "Withdrawal Requested",
        description: "Your withdrawal request has been submitted for processing.",
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

  if (balanceLoading || transactionsLoading) {
    return <LoadingSpinner />;
  }

  const balance = parseFloat(walletBalance?.balance || '0');
  const recentTransactions = transactions?.slice(0, 10) || [];

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
        return <Clock className="w-4 h-4 text-muted-foreground" />;
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
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

      {/* Wallet Overview */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Balance Card */}
          <Card className="mb-8 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 gradient-fire rounded-full flex items-center justify-center">
                  <Wallet className="w-8 h-8 text-black" />
                </div>
              </div>
              <h2 className="text-2xl font-semibold mb-2">Current Balance</h2>
              <div className="text-5xl font-black text-gradient mb-6" data-testid="wallet-balance">
                ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              
              <div className="flex gap-4 justify-center">
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
                  onClick={() => {
                    if (balance < 10) {
                      toast({
                        title: "Minimum Withdrawal",
                        description: "Minimum withdrawal amount is ₹10",
                        variant: "destructive",
                      });
                      return;
                    }
                    // For demo, withdraw ₹100 or current balance if less
                    const withdrawAmount = Math.min(100, balance);
                    withdrawMutation.mutate(withdrawAmount);
                  }}
                  disabled={balance < 10 || withdrawMutation.isPending}
                  data-testid="withdraw-button"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {withdrawMutation.isPending ? "Processing..." : "Withdraw"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold text-green-500" data-testid="total-deposits">
                  ₹{recentTransactions
                    .filter(t => t.type === 'deposit' && t.status === 'completed')
                    .reduce((sum, t) => sum + parseFloat(t.amount), 0)
                    .toLocaleString('en-IN')}
                </div>
                <div className="text-sm text-muted-foreground">Total Deposits</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <TrendingDown className="w-8 h-8 mx-auto mb-2 text-red-500" />
                <div className="text-2xl font-bold text-red-500" data-testid="total-withdrawals">
                  ₹{recentTransactions
                    .filter(t => t.type === 'withdrawal' && t.status === 'completed')
                    .reduce((sum, t) => sum + parseFloat(t.amount), 0)
                    .toLocaleString('en-IN')}
                </div>
                <div className="text-sm text-muted-foreground">Total Withdrawals</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <Trophy className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold text-primary" data-testid="total-winnings">
                  ₹{recentTransactions
                    .filter(t => t.type === 'prize_payout' && t.status === 'completed')
                    .reduce((sum, t) => sum + parseFloat(t.amount), 0)
                    .toLocaleString('en-IN')}
                </div>
                <div className="text-sm text-muted-foreground">Total Winnings</div>
              </CardContent>
            </Card>
          </div>

          {/* Transaction History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all" data-testid="filter-all">All</TabsTrigger>
                  <TabsTrigger value="deposit" data-testid="filter-deposits">Deposits</TabsTrigger>
                  <TabsTrigger value="withdrawal" data-testid="filter-withdrawals">Withdrawals</TabsTrigger>
                  <TabsTrigger value="tournament_entry" data-testid="filter-entries">Entries</TabsTrigger>
                  <TabsTrigger value="prize_payout" data-testid="filter-winnings">Winnings</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="space-y-4">
                  {recentTransactions.length > 0 ? (
                    <div className="space-y-3" data-testid="transaction-list">
                      {recentTransactions.map((transaction: any, index: number) => (
                        <div 
                          key={transaction.id || index} 
                          className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border"
                          data-testid={`transaction-${index}`}
                        >
                          <div className="flex items-center gap-3">
                            {getTransactionIcon(transaction.type)}
                            <div>
                              <div className="font-medium">
                                {formatTransactionType(transaction.type)}
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
                            <div className="flex items-center gap-1 justify-end">
                              {getStatusIcon(transaction.status)}
                              <Badge className={`${getStatusColor(transaction.status)} text-xs`}>
                                {transaction.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12" data-testid="no-transactions">
                      <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No Transactions Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Start by adding funds to your wallet
                      </p>
                      <Button 
                        className="gradient-fire text-black font-bold"
                        onClick={() => setShowAddFundsModal(true)}
                      >
                        Add Funds
                      </Button>
                    </div>
                  )}
                </TabsContent>

                {/* Individual transaction type tabs */}
                {['deposit', 'withdrawal', 'tournament_entry', 'prize_payout'].map((type) => (
                  <TabsContent key={type} value={type} className="space-y-4">
                    <div className="space-y-3">
                      {recentTransactions
                        .filter((t: any) => t.type === type)
                        .map((transaction: any, index: number) => (
                          <div 
                            key={transaction.id || index} 
                            className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border"
                          >
                            <div className="flex items-center gap-3">
                              {getTransactionIcon(transaction.type)}
                              <div>
                                <div className="font-medium">
                                  {formatTransactionType(transaction.type)}
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
                              <div className="flex items-center gap-1 justify-end">
                                {getStatusIcon(transaction.status)}
                                <Badge className={`${getStatusColor(transaction.status)} text-xs`}>
                                  {transaction.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* Wallet Info */}
          <Card className="mt-8 bg-card/50 border-border">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Wallet Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Adding Funds</h4>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Minimum deposit: ₹10</li>
                    <li>• Maximum deposit: ₹50,000 per day</li>
                    <li>• Instant credit via UPI/Cards</li>
                    <li>• Safe and secure payments</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Withdrawals</h4>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Minimum withdrawal: ₹10</li>
                    <li>• Processing time: 1-3 business days</li>
                    <li>• KYC verification required</li>
                    <li>• Direct bank transfer</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />

      {/* Add Funds Modal */}
      <PaymentModal 
        isOpen={showAddFundsModal}
        onClose={() => setShowAddFundsModal(false)}
        type="deposit"
      />
    </div>
  );
}
