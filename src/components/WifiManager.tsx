
import React, { useState, useEffect } from 'react';
import { Wifi, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import AuthForm from './AuthForm';
import PlanSelection from './PlanSelection';
import PaymentFlow from './PaymentFlow';
import UserDashboard from './UserDashboard';
import AdminPanel from './AdminPanel';
import { useDataPlans } from '@/hooks/useDataPlans';
import { supabase } from '@/integrations/supabase/client';

type CurrentView = 'auth' | 'plans' | 'payment' | 'dashboard' | 'admin';

interface Plan {
  id: string;
  name: string;
  duration: string;
  price: number;
  features: string[];
  popular?: boolean;
}

const WifiManager = () => {
  const { user, loading, signOut } = useAuth();
  const { data: plans = [], isLoading: plansLoading } = useDataPlans();
  const [currentView, setCurrentView] = useState<CurrentView>('auth');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingSession, setCheckingSession] = useState(false);

  // Convert database plans to component format
  const formattedPlans: Plan[] = plans.map(plan => ({
    id: plan.id,
    name: plan.name,
    duration: `${plan.duration_hours} ${plan.duration_hours === 1 ? 'hour' : plan.duration_hours < 24 ? 'hours' : plan.duration_hours === 24 ? 'day' : 'days'}`,
    price: plan.price_ksh,
    features: plan.features || [],
    popular: plan.popular || false
  }));

  useEffect(() => {
    const checkUserSession = async () => {
      if (user && !isAdmin) {
        setCheckingSession(true);
        console.log('Checking for active session for user:', user.id);
        
        try {
          const { data, error } = await supabase.functions.invoke('get-user-session', {
            headers: {
              Authorization: `Bearer ${user.session?.access_token}`,
            },
          });

          console.log('Session check response:', data);

          if (error) {
            console.error('Error checking session:', error);
            setCurrentView('plans');
          } else if (data?.hasActiveSession) {
            setCurrentView('dashboard');
          } else {
            setCurrentView('plans');
          }
        } catch (error) {
          console.error('Failed to check session:', error);
          setCurrentView('plans');
        } finally {
          setCheckingSession(false);
        }
      } else if (user && isAdmin) {
        setCurrentView('admin');
      } else {
        setCurrentView('auth');
      }
    };

    checkUserSession();
  }, [user, isAdmin]);

  const handleAdminAccess = () => {
    setIsAdmin(true);
    setCurrentView('admin');
  };

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    setCurrentView('payment');
  };

  const handlePaymentSuccess = () => {
    setCurrentView('dashboard');
  };

  const handleLogout = async () => {
    await signOut();
    setCurrentView('auth');
    setSelectedPlan(null);
    setIsAdmin(false);
  };

  if (loading || checkingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">
            {loading ? 'Loading...' : 'Checking session...'}
          </p>
        </div>
      </div>
    );
  }

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
              {user && (
                <Badge variant="outline" className="hidden sm:flex">
                  {isAdmin ? 'Admin' : 'Authenticated'}
                </Badge>
              )}
              
              {!user && (
                <Button variant="ghost" size="sm" onClick={handleAdminAccess}>
                  Admin
                </Button>
              )}
              
              {user && !isAdmin && (
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
        {currentView === 'auth' && <AuthForm />}

        {currentView === 'plans' && user && (
          <>
            {plansLoading ? (
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading plans...</p>
              </div>
            ) : formattedPlans.length > 0 ? (
              <PlanSelection 
                plans={formattedPlans}
                onSelectPlan={handlePlanSelect}
                currentUser={{
                  id: user.id,
                  fullName: user.user_metadata?.full_name || user.email || 'User',
                  email: user.email || '',
                  phone: user.user_metadata?.phone_number || ''
                }}
              />
            ) : (
              <div className="text-center">
                <p className="text-muted-foreground">No plans available at the moment.</p>
              </div>
            )}
          </>
        )}

        {currentView === 'payment' && selectedPlan && user && (
          <PaymentFlow 
            plan={selectedPlan}
            user={{
              id: user.id,
              fullName: user.user_metadata?.full_name || user.email || 'User',
              email: user.email || '',
              phone: user.user_metadata?.phone_number || ''
            }}
            onPaymentSuccess={handlePaymentSuccess}
            onBack={() => setCurrentView('plans')}
          />
        )}

        {currentView === 'dashboard' && user && (
          <UserDashboard 
            user={{
              id: user.id,
              fullName: user.user_metadata?.full_name || user.email || 'User',
              email: user.email || '',
              phone: user.user_metadata?.phone_number || ''
            }}
            onRenewPlan={() => setCurrentView('plans')}
          />
        )}

        {currentView === 'admin' && (
          <AdminPanel 
            onBack={() => {
              setIsAdmin(false);
              setCurrentView(user ? 'plans' : 'auth');
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
