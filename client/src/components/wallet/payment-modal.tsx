import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CreditCard, Wallet, Shield, CheckCircle } from "lucide-react";

// Make Stripe optional
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'deposit' | 'tournament';
  amount?: number;
  tournamentId?: string;
}

function PaymentForm({ amount, onSuccess, onError }: { 
  amount: number; 
  onSuccess: () => void; 
  onError: (error: string) => void; 
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
    });

    setIsProcessing(false);

    if (error) {
      onError(error.message || "Payment failed");
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button 
        type="submit" 
        className="w-full gradient-fire text-black font-bold"
        disabled={!stripe || isProcessing}
        data-testid="confirm-payment"
      >
        {isProcessing ? "Processing..." : `Pay ₹${amount.toLocaleString('en-IN')}`}
      </Button>
    </form>
  );
}

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  type, 
  amount: initialAmount = 0,
  tournamentId 
}: PaymentModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState(initialAmount || 100);
  const [clientSecret, setClientSecret] = useState("");
  const [step, setStep] = useState<'amount' | 'payment' | 'success'>('amount');

  // Check if Stripe is available
  const isStripeAvailable = !!stripePromise;

  const quickAmounts = [100, 250, 500, 1000, 2500, 5000];

  const createPaymentMutation = useMutation({
    mutationFn: async (paymentAmount: number) => {
      const response = await apiRequest("POST", "/api/create-payment-intent", {
        amount: paymentAmount,
        description: type === 'deposit' ? "Wallet top-up" : `Tournament entry - ${tournamentId}`,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
      setStep('payment');
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleProceedToPayment = () => {
    if (!isStripeAvailable) {
      toast({
        title: "Payment Not Available",
        description: "Payment processing is currently not configured",
        variant: "destructive",
      });
      return;
    }
    if (amount < 10) {
      toast({
        title: "Invalid Amount",
        description: "Minimum amount is ₹10",
        variant: "destructive",
      });
      return;
    }
    if (amount > 50000) {
      toast({
        title: "Invalid Amount",
        description: "Maximum amount is ₹50,000",
        variant: "destructive",
      });
      return;
    }
    createPaymentMutation.mutate(amount);
  };

  const handlePaymentSuccess = () => {
    setStep('success');
    queryClient.invalidateQueries({ queryKey: ["/api/wallet/balance"] });
    queryClient.invalidateQueries({ queryKey: ["/api/wallet/transactions"] });
    toast({
      title: "Payment Successful!",
      description: `₹${amount.toLocaleString('en-IN')} has been added to your wallet.`,
    });
    
    // Auto close after 3 seconds
    setTimeout(() => {
      onClose();
      setStep('amount');
      setClientSecret("");
    }, 3000);
  };

  const handlePaymentError = (error: string) => {
    toast({
      title: "Payment Failed",
      description: error,
      variant: "destructive",
    });
    setStep('amount');
    setClientSecret("");
  };

  const resetModal = () => {
    setStep('amount');
    setClientSecret("");
    setAmount(initialAmount || 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        resetModal();
      }
    }}>
      <DialogContent className="max-w-md" data-testid="payment-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            {type === 'deposit' ? (
              <>
                <Wallet className="w-6 h-6" />
                Add Funds
              </>
            ) : (
              <>
                <CreditCard className="w-6 h-6" />
                Tournament Payment
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {step === 'amount' && (
          <div className="space-y-6">
            {/* Amount Selection */}
            <div className="space-y-4">
              <Label htmlFor="amount">Amount to Add</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₹</span>
                <Input
                  id="amount"
                  type="number"
                  min="10"
                  max="50000"
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                  className="pl-8"
                  placeholder="Enter amount"
                  data-testid="amount-input"
                />
              </div>
              
              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-3 gap-2">
                {quickAmounts.map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    variant={amount === quickAmount ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAmount(quickAmount)}
                    data-testid={`quick-amount-${quickAmount}`}
                  >
                    ₹{quickAmount}
                  </Button>
                ))}
              </div>
              
              <div className="text-xs text-muted-foreground">
                Minimum: ₹10 • Maximum: ₹50,000
              </div>
            </div>

            {/* Payment Summary */}
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Amount</span>
                    <span data-testid="summary-amount">₹{amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Processing Fee</span>
                    <span className="text-green-500">FREE</span>
                  </div>
                  <div className="border-t border-border pt-3">
                    <div className="flex items-center justify-between font-semibold">
                      <span>Total</span>
                      <span data-testid="summary-total">₹{amount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Info */}
            <div className="bg-muted/30 rounded-lg p-4 flex items-center gap-3">
              <Shield className="w-5 h-5 text-green-500" />
              <div className="text-sm">
                <div className="font-medium">
                  {isStripeAvailable ? "100% Secure Payment" : "Payment Unavailable"}
                </div>
                <div className="text-muted-foreground">
                  {isStripeAvailable ? "Protected by Stripe encryption" : "Payment processing not configured"}
                </div>
              </div>
            </div>

            {/* Action Button */}
            <Button 
              className="w-full gradient-fire text-black font-bold hover:scale-105 transition-transform"
              onClick={handleProceedToPayment}
              disabled={!isStripeAvailable || amount < 10 || amount > 50000 || createPaymentMutation.isPending}
              data-testid="proceed-to-payment"
            >
              {!isStripeAvailable ? "Payment Not Available" :
               createPaymentMutation.isPending ? "Preparing..." : "Proceed to Payment"}
            </Button>
          </div>
        )}

        {step === 'payment' && clientSecret && stripePromise && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gradient mb-2">₹{amount.toLocaleString('en-IN')}</div>
              <div className="text-muted-foreground">Amount to be added</div>
            </div>

            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm 
                amount={amount}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </Elements>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setStep('amount')}
              data-testid="back-to-amount"
            >
              Back
            </Button>
          </div>
        )}

        {step === 'success' && (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 gradient-fire rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-black" />
            </div>
            
            <div>
              <h3 className="text-2xl font-bold mb-2">Payment Successful!</h3>
              <p className="text-muted-foreground">
                ₹{amount.toLocaleString('en-IN')} has been added to your wallet.
              </p>
            </div>

            <Badge className="bg-green-500/20 text-green-400">
              Transaction Completed
            </Badge>

            <div className="text-sm text-muted-foreground">
              This window will close automatically...
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
