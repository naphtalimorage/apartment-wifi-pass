
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDataPlans = () => {
  return useQuery({
    queryKey: ['data-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('data_plans')
        .select('*')
        .order('price_ksh', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    },
  });
};
