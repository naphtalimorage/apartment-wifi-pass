
import React, { useState, useEffect } from 'react';
import { Wifi, Users, CreditCard, Timer, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import AuthForm from './AuthForm';
import PlanSelection from './PlanSelection';
import PaymentFlow from './PaymentFlow';
import UserDashboard from './UserDashboard';
import AdminPanel from './AdminPanel';

type UserStatus = 'guest' | 'authenticated' | 'active' | 'admin';
type CurrentView = 'auth' | 'plans' | 'payment' | 'dashboard' | 'admin';

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  currentPlan?: {
    type: string;
    duration: string;
    price: number;
    expiresAt: Date;
  };
}

interface Plan {
  id: string;
  name: string;
  duration: string;
  price: number;
  features: string[];
  popular?: boolean;
}

const WifiManager = () => {
  const [userStatus, setUserStatus] = useState<UserStatus>('guest');
  const [currentView, setCurrentView] = useState<CurrentView>('auth');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const { toast } = useToast();

  const plans: Plan[] = [
    {
      id: '2hours',
      name: '2 Hours',
      duration: '2 hours',
      price: 10,
      features: ['High-speed internet', 'All websites & apps', 'Basic support']
    },
    {
      id: '1day',
      name: '1 Day',
      duration: '24 hours',
      price: 20,
      features: ['High-speed internet', 'All websites & apps', 'Priority support', 'No daily limits'],
      popular: true
    },
    {
      id: '1week',
      name: '1 Week',
      duration: '7 days',
      price: 150,
      features: ['High-speed internet', 'All websites & apps', 'Premium support', 'Unlimited usage', 'Best value']
    }
  ];

  // Simulate admin login (in real app, this would be proper authentication)
  const handleAdminAccess = () => {
    setUserStatus('admin');
    setCurrentView('admin');
  };

  const handleLogin = (email: string, password: string) => {
    // Simulate login - in real app, this would validate against your database
    const mockUser: User = {
      id: '1',
      fullName: 'John Doe',
      email: email,
      phone: '+254700000000'
    };
    
    setCurrentUser(mockUser);
    setUserStatus('authenticated');
    setCurrentView('plans');
    
    toast({
      title: "Welcome back!",
      description: "You've successfully logged in.",
    });
  };

  const handleRegister = (userData: any) => {
    // Simulate registration - in real app, this would save to your database
    const newUser: User = {
      id: Date.now().toString(),
      fullName: userData.fullName,
      email: userData.email,
      phone: userData.phone
    };
    
    setCurrentUser(newUser);
    setUserStatus('authenticated');
    setCurrentView('plans');
    
    toast({
      title: "Account created!",
      description: "Welcome to our WiFi network. Choose a plan to get started.",
    });
  };

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    setCurrentView('payment');
  };

  const handlePaymentSuccess = () => {
    if (selectedPlan && currentUser) {
      const expiresAt = new Date();
      if (selectedPlan.id === '2hours') {
        expiresAt.setHours(expiresAt.getHours() + 2);
      } else if (selectedPlan.id === '1day') {
        expiresAt.setDate(expiresAt.getDate() + 1);
      } else if (selectedPlan.id === '1week') {
        expiresAt.setDate(expiresAt.getDate() + 7);
      }

      const updatedUser = {
        ...currentUser,
        currentPlan: {
          type: selectedPlan.name,
          duration: selectedPlan.duration,
          price: selectedPlan.price,
          expiresAt
        }
      };

      setCurrentUser(updatedUser);
      setUserStatus('active');
      setCurrentView('dashboard');

      toast({
        title: "Payment successful!",
        description: `Your ${selectedPlan.name} plan is now active. Enjoy your internet access!`,
      });
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserStatus('guest');
    setCurrentView('auth');
    setSelectedPlan(null);
    
    toast({
      title: "Logged out",
      description: "You've been logged out successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary rounded-lg">
                <Wifi className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">ApartmentWiFi</h1>
                <p className="text-sm text-muted-foreground">Premium Internet Access</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {userStatus !== 'guest' && (
                <Badge variant="outline" className="hidden sm:flex">
                  {userStatus === 'admin' ? 'Admin' : userStatus === 'active' ? 'Connected' : 'Authenticated'}
                </Badge>
              )}
              
              {userStatus === 'guest' && (
                <Button variant="ghost" size="sm" onClick={handleAdminAccess}>
                  Admin
                </Button>
              )}
              
              {userStatus !== 'guest' && userStatus !== 'admin' && (
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {currentView === 'auth' && (
          <AuthForm 
            onLogin={handleLogin}
            onRegister={handleRegister}
          />
        )}

        {currentView === 'plans' && (
          <PlanSelection 
            plans={plans}
            onSelectPlan={handlePlanSelect}
            currentUser={currentUser}
          />
        )}

        {currentView === 'payment' && selectedPlan && (
          <PaymentFlow 
            plan={selectedPlan}
            user={currentUser}
            onPaymentSuccess={handlePaymentSuccess}
            onBack={() => setCurrentView('plans')}
          />
        )}

        {currentView === 'dashboard' && currentUser && (
          <UserDashboard 
            user={currentUser}
            onRenewPlan={() => setCurrentView('plans')}
          />
        )}

        {currentView === 'admin' && (
          <AdminPanel 
            onBack={() => {
              setUserStatus('guest');
              setCurrentView('auth');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-sm border-t mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © 2024 ApartmentWiFi. High-speed internet for everyone.
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <span>Support: +254 700 000 000</span>
              <span>Email: support@apartmentwifi.com</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WifiManager;
