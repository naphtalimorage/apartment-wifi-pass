
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDataPlans = () => {
  return useQuery({
    queryKey: ['data-plans'],
    queryFn: async () => {
      console.log('Fetching data plans...');
      
      const { data, error } = await supabase
        .from('data_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_ksh', { ascending: true });

      if (error) {
        console.error('Error fetching data plans:', error);
        throw new Error(`Failed to fetch data plans: ${error.message}`);
      }

      console.log('Data plans fetched successfully:', data);
      return data || [];
    },
    retry: 3,
    retryDelay: 1000,
  });
};
