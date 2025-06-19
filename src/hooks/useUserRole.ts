
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'admin' | 'user' | null;

export const useUserRole = (user: User | null) => {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setUserRole(null);
        return;
      }

      setLoading(true);
      try {
        console.log('Fetching user role for:', user.id);
        
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
          // If no role found, default to 'user'
          setUserRole('user');
        } else {
          console.log('User role fetched:', data.role);
          setUserRole(data.role);
        }
      } catch (error) {
        console.error('Failed to fetch user role:', error);
        setUserRole('user');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  const isAdmin = userRole === 'admin';
  const isUser = userRole === 'user';

  return {
    userRole,
    isAdmin,
    isUser,
    loading
  };
};
