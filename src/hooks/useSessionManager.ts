
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
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

export const useSessionManager = (user: User | null, session: Session | null) => {
  const [currentView, setCurrentView] = useState<CurrentView>('auth');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingSession, setCheckingSession] = useState(false);

  useEffect(() => {
    const checkUserSession = async () => {
      if (user && !isAdmin) {
        setCheckingSession(true);
        console.log('Checking for active session for user:', user.id);
        
        try {
          const { data, error } = await supabase.functions.invoke('get-user-session', {
            headers: {
              Authorization: `Bearer ${session?.access_token}`,
            },
          });

          console.log('Session check response:', data);

          if (error) {
            console.error('Error checking session:', error);
            // If session check fails, default to showing plans
            setCurrentView('plans');
          } else if (data?.hasActiveSession) {
            setCurrentView('dashboard');
          } else {
            setCurrentView('plans');
          }
        } catch (error) {
          console.error('Failed to check session:', error);
          // If session check fails completely, default to showing plans
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
  }, [user, session, isAdmin]);

  return {
    currentView,
    setCurrentView,
    selectedPlan,
    setSelectedPlan,
    isAdmin,
    setIsAdmin,
    checkingSession,
  };
};
