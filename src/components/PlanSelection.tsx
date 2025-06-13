
import React from 'react';
import { Wifi, Timer, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Plan {
  id: string;
  name: string;
  duration: string;
  price: number;
  features: string[];
  popular?: boolean;
}

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
}

interface PlanSelectionProps {
  plans: Plan[];
  onSelectPlan: (plan: Plan) => void;
  currentUser: User | null;
}

const PlanSelection: React.FC<PlanSelectionProps> = ({ plans, onSelectPlan, currentUser }) => {
  return (
    <div className="max-w-6xl mx-auto animate-fade-in-up">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
          <Wifi className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Welcome, {currentUser?.fullName}
        </h2>
        <p className="text-muted-foreground text-lg">Choose your internet access plan</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative transition-all duration-300 hover:shadow-xl hover:scale-105 ${
              plan.popular 
                ? 'border-primary shadow-lg ring-2 ring-primary/20' 
                : 'border-border hover:border-primary/50'
            }`}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-white">
                Most Popular
              </Badge>
            )}
            
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
              <CardDescription className="text-lg">
                <Timer className="inline h-4 w-4 mr-1" />
                {plan.duration}
              </CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-primary">Ksh {plan.price}</span>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-accent rounded-full mr-3 flex-shrink-0"></div>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Button 
                onClick={() => onSelectPlan(plan)}
                className="w-full h-12 text-lg"
                variant={plan.popular ? "default" : "outline"}
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Select Plan
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border">
        <h3 className="font-semibold text-lg mb-4">What you get with every plan:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Wifi className="h-4 w-4 mr-2 text-primary" />
            High-speed fiber internet
          </div>
          <div className="flex items-center">
            <Timer className="h-4 w-4 mr-2 text-primary" />
            Instant activation
          </div>
          <div className="flex items-center">
            <CreditCard className="h-4 w-4 mr-2 text-primary" />
            Secure M-Pesa payments
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2 text-primary" />
            24/7 support
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanSelection;
