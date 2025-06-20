
import React from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useDataPlans } from '@/hooks/useDataPlans';
import { useUserRole } from '@/hooks/useUserRole';
import { useSessionManager } from '@/hooks/useSessionManager';
import WifiHeader from './WifiHeader';
import WifiMainContent from './WifiMainContent';
import WifiFooter from './WifiFooter';

interface Plan {
  id: string;
  name: string;
  duration: string;
  price: number;
  features: string[];
  popular?: boolean;
}

const WifiManager = () => {
  const { user, session, loading, signOut } = useAuth();
  const { userRole, isAdmin, loading: roleLoading } = useUserRole(user);
  const { data: plans = [], isLoading: plansLoading } = useDataPlans();
  const {
    currentView,
    setCurrentView,
    selectedPlan,
    setSelectedPlan,
    checkingSession,
  } = useSessionManager(user, session, isAdmin);

  // Convert database plans to component format
  const formattedPlans: Plan[] = plans.map(plan => ({
    id: plan.id,
    name: plan.name,
    duration: `${plan.duration_hours} ${plan.duration_hours === 1 ? 'hour' : plan.duration_hours < 24 ? 'hours' : plan.duration_hours === 24 ? 'day' : 'days'}`,
    price: plan.price_ksh,
    features: plan.features || [],
    popular: plan.popular || false
  }));

  const handleAdminAccess = () => {
    if (isAdmin) {
      setCurrentView('admin');
    } else {
      // Non-admin users cannot access admin panel
      console.log('Access denied: User is not an admin');
    }
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
  };

  const handleAdminBack = () => {
    setCurrentView(user ? 'plans' : 'auth');
  };

  const handlePaymentBack = () => {
    setCurrentView('plans');
  };

  const handleRenewPlan = () => {
    setCurrentView('plans');
  };

  if (loading || roleLoading || checkingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">
            {loading ? 'Loading...' : roleLoading ? 'Checking permissions...' : 'Checking session...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <WifiHeader 
        user={user}
        isAdmin={isAdmin}
        userRole={userRole}
        onAdminAccess={handleAdminAccess}
        onLogout={handleLogout}
      />

      <main className="container mx-auto px-4 py-8">
        <WifiMainContent 
          currentView={currentView}
          user={user}
          selectedPlan={selectedPlan}
          formattedPlans={formattedPlans}
          plansLoading={plansLoading}
          onSelectPlan={handlePlanSelect}
          onPaymentSuccess={handlePaymentSuccess}
          onRenewPlan={handleRenewPlan}
          onAdminBack={handleAdminBack}
          onPaymentBack={handlePaymentBack}
        />
      </main>

      <WifiFooter />
    </div>
  );
};

export default WifiManager;
