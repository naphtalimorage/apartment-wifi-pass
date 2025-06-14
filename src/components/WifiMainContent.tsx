
import React from 'react';
import { Loader2 } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import AuthForm from './AuthForm';
import PlanSelection from './PlanSelection';
import PaymentFlow from './PaymentFlow';
import UserDashboard from './UserDashboard';
import AdminPanel from './AdminPanel';

type CurrentView = 'auth' | 'plans' | 'payment' | 'dashboard' | 'admin';

interface Plan {
  id: string;
  name: string;
  duration: string;
  price: number;
  features: string[];
  popular?: boolean;
}

interface WifiMainContentProps {
  currentView: CurrentView;
  user: User | null;
  selectedPlan: Plan | null;
  formattedPlans: Plan[];
  plansLoading: boolean;
  onSelectPlan: (plan: Plan) => void;
  onPaymentSuccess: () => void;
  onRenewPlan: () => void;
  onAdminBack: () => void;
  onPaymentBack: () => void;
}

const WifiMainContent = ({
  currentView,
  user,
  selectedPlan,
  formattedPlans,
  plansLoading,
  onSelectPlan,
  onPaymentSuccess,
  onRenewPlan,
  onAdminBack,
  onPaymentBack,
}: WifiMainContentProps) => {
  const userInfo = user ? {
    id: user.id,
    fullName: user.user_metadata?.full_name || user.email || 'User',
    email: user.email || '',
    phone: user.user_metadata?.phone_number || ''
  } : null;

  if (currentView === 'auth') {
    return <AuthForm />;
  }

  if (currentView === 'plans' && user) {
    if (plansLoading) {
      return (
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading plans...</p>
        </div>
      );
    }

    if (formattedPlans.length > 0) {
      return (
        <PlanSelection 
          plans={formattedPlans}
          onSelectPlan={onSelectPlan}
          currentUser={userInfo!}
        />
      );
    }

    return (
      <div className="text-center">
        <p className="text-muted-foreground">No plans available at the moment.</p>
      </div>
    );
  }

  if (currentView === 'payment' && selectedPlan && user) {
    return (
      <PaymentFlow 
        plan={selectedPlan}
        user={userInfo!}
        onPaymentSuccess={onPaymentSuccess}
        onBack={onPaymentBack}
      />
    );
  }

  if (currentView === 'dashboard' && user) {
    return (
      <UserDashboard 
        user={userInfo!}
        onRenewPlan={onRenewPlan}
      />
    );
  }

  if (currentView === 'admin') {
    return (
      <AdminPanel 
        onBack={onAdminBack}
      />
    );
  }

  return null;
};

export default WifiMainContent;
