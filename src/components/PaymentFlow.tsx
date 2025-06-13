
import React, { useState, useEffect } from 'react';
import { CreditCard, Wifi, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface Plan {
  id: string;
  name: string;
  duration: string;
  price: number;
  features: string[];
}

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
}

interface PaymentFlowProps {
  plan: Plan;
  user: User | null;
  onPaymentSuccess: () => void;
  onBack: () => void;
}

const PaymentFlow: React.FC<PaymentFlowProps> = ({ plan, user, onPaymentSuccess, onBack }) => {
  const [paymentStep, setPaymentStep] = useState<'confirm' | 'processing' | 'success'>('confirm');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [progress, setProgress] = useState(0);

  const initiatePayment = () => {
    setPaymentStep('processing');
    setProgress(0);

    // Simulate M-Pesa STK Push process
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            setPaymentStep('success');
            setTimeout(() => {
              onPaymentSuccess();
            }, 2000);
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      <div className="text-center mb-8">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          ← Back to Plans
        </Button>
        <h2 className="text-3xl font-bold text-foreground mb-2">Complete Your Purchase</h2>
        <p className="text-muted-foreground">Secure payment powered by M-Pesa</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Plan Summary */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wifi className="h-5 w-5 mr-2" />
              Plan Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">{plan.name} Plan</span>
              <Badge variant="outline">
                <Timer className="h-3 w-3 mr-1" />
                {plan.duration}
              </Badge>
            </div>
            
            <div className="space-y-2">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full mr-2"></div>
                  {feature}
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Amount</span>
                <span className="text-primary">Ksh {plan.price}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              M-Pesa Payment
            </CardTitle>
            <CardDescription>
              Pay securely using your M-Pesa mobile money
            </CardDescription>
          </CardHeader>
          <CardContent>
            {paymentStep === 'confirm' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="phone">M-Pesa Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+254 700 000 000"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the phone number registered with your M-Pesa account
                  </p>
                </div>
                
                <div className="bg-mpesa/10 border border-mpesa/20 rounded-lg p-4">
                  <h4 className="font-medium text-mpesa mb-2">Payment Instructions:</h4>
                  <ol className="text-sm text-muted-foreground space-y-1">
                    <li>1. Click "Pay with M-Pesa" below</li>
                    <li>2. You'll receive an STK push on your phone</li>
                    <li>3. Enter your M-Pesa PIN to complete payment</li>
                    <li>4. You'll get instant internet access</li>
                  </ol>
                </div>
                
                <Button 
                  onClick={initiatePayment} 
                  className="w-full h-12 text-lg bg-mpesa hover:bg-mpesa/90"
                  disabled={!phoneNumber}
                >
                  Pay Ksh {plan.price} with M-Pesa
                </Button>
              </div>
            )}

            {paymentStep === 'processing' && (
              <div className="text-center space-y-6">
                <div className="relative">
                  <div className="w-16 h-16 bg-mpesa/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="h-8 w-8 text-mpesa animate-pulse" />
                  </div>
                  <div className="absolute inset-0 w-16 h-16 border-4 border-mpesa/30 rounded-full animate-pulse-ring mx-auto"></div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Processing Payment...</h3>
                  <p className="text-muted-foreground">
                    Please check your phone for the M-Pesa payment request
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Enter your M-Pesa PIN to complete the transaction
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Progress value={progress} className="w-full" />
                  <p className="text-xs text-muted-foreground">
                    {progress < 100 ? 'Waiting for payment confirmation...' : 'Payment confirmed!'}
                  </p>
                </div>
              </div>
            )}

            {paymentStep === 'success' && (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto">
                  <Wifi className="h-8 w-8 text-success" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-success">Payment Successful!</h3>
                  <p className="text-muted-foreground">
                    Your {plan.name} plan is now active
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Redirecting to your dashboard...
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentFlow;
