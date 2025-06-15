
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserSession {
  id: string;
  user_id: string;
  plan_id: string;
  payment_id: string;
  end_time: string;
  is_active: boolean;
  mac_address: string;
  ip_address: string;
  data_used_mb: number;
  created_at: string;
  users: {
    full_name: string;
    email: string;
    phone_number: string;
  };
  data_plans: {
    name: string;
    duration_hours: number;
    price_ksh: number;
  };
  payments: {
    amount_ksh: number;
    mpesa_transaction_id: string;
  };
}

export const useAdminData = () => {
  const [activeSessions, setActiveSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch active sessions
  const fetchActiveSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select(`
          *,
          users!inner(full_name, email, phone_number),
          data_plans!inner(name, duration_hours, price_ksh),
          payments!user_sessions_payment_id_fkey(amount_ksh, mpesa_transaction_id)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActiveSessions(data || []);
    } catch (err) {
      console.error('Error fetching active sessions:', err);
      setError('Failed to fetch active sessions');
    }
  };

  // Manual blacklist user
  const blacklistUser = async (userId: string, macAddress: string) => {
    try {
      const { error } = await supabase.functions.invoke('manage-router-blacklist', {
        body: {
          action: 'blacklist',
          macAddress: macAddress,
          userId: userId
        }
      });

      if (error) throw error;

      // Deactivate user session
      await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('is_active', true);

      // Refresh data
      await fetchActiveSessions();
      return { success: true };
    } catch (err) {
      console.error('Error blacklisting user:', err);
      return { success: false, error: err.message };
    }
  };

  // Manual unblacklist user
  const unblacklistUser = async (userId: string, macAddress: string) => {
    try {
      const { error } = await supabase.functions.invoke('manage-router-blacklist', {
        body: {
          action: 'unblacklist',
          macAddress: macAddress,
          userId: userId
        }
      });

      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error('Error unblacklisting user:', err);
      return { success: false, error: err.message };
    }
  };

  // Monitor session manually
  const monitorSessions = async () => {
    try {
      const { error } = await supabase.functions.invoke('session-monitor');
      if (error) throw error;
      
      // Refresh data after monitoring
      await fetchActiveSessions();
      return { success: true };
    } catch (err) {
      console.error('Error monitoring sessions:', err);
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchActiveSessions();
      setLoading(false);
    };

    loadData();

    // Set up real-time subscriptions
    const sessionsChannel = supabase
      .channel('admin-sessions')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_sessions'
      }, () => {
        fetchActiveSessions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(sessionsChannel);
    };
  }, []);

  return {
    activeSessions,
    userDevices: [], // Temporarily empty until types are regenerated
    loading,
    error,
    blacklistUser,
    unblacklistUser,
    monitorSessions,
    refetch: fetchActiveSessions
  };
};
