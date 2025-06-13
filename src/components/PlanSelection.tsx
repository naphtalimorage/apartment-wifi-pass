
import React from 'react';
import { Wifi, Clock, Star, ArrowRight } from 'lucide-react';
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
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
          <Wifi className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Welcome, {currentUser?.fullName}!
        </h2>
        <p className="text-muted-foreground">Choose your internet plan and get connected instantly</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
              plan.popular 
                ? 'border-primary shadow-lg ring-2 ring-primary/20' 
                : 'border-border hover:border-primary/50'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-3 py-1">
                  <Star className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-5 w-5 text-primary mr-2" />
                <CardTitle className="text-xl">{plan.name}</CardTitle>
              </div>
              <CardDescription className="text-muted-foreground">
                {plan.duration} of high-speed internet
              </CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold text-foreground">Ksh {plan.price}</span>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <div className="h-2 w-2 bg-primary rounded-full mr-3 flex-shrink-0"></div>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Button 
                onClick={() => onSelectPlan(plan)}
                className={`w-full h-12 text-lg ${
                  plan.popular 
                    ? 'bg-primary hover:bg-primary/90' 
                    : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                }`}
              >
                Choose Plan
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center">
        <div className="bg-accent/10 rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="font-semibold text-foreground mb-2">How it works</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold mb-2">1</div>
              <p>Select your preferred data plan</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold mb-2">2</div>
              <p>Pay securely via M-Pesa</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold mb-2">3</div>
              <p>Enjoy instant internet access</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanSelection;
