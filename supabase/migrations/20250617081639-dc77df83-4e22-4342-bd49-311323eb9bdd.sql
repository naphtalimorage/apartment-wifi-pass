
-- First, let's disable RLS on data_plans table temporarily to check if that's the issue
ALTER TABLE public.data_plans DISABLE ROW LEVEL SECURITY;

-- If data_plans should be publicly readable (which makes sense for a pricing table), 
-- we can either keep RLS disabled or create a simple policy that allows everyone to read

-- Option 1: Keep RLS disabled (recommended for public pricing data)
-- No additional SQL needed if you choose this option

-- Option 2: If you want to keep RLS enabled, create a simple read policy
-- ALTER TABLE public.data_plans ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow public read access to active data plans" 
--   ON public.data_plans 
--   FOR SELECT 
--   USING (is_active = true);

-- Let's also check if there are any problematic existing policies and drop them
DROP POLICY IF EXISTS "Users can view data plans" ON public.data_plans;
DROP POLICY IF EXISTS "Public can view active data plans" ON public.data_plans;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.data_plans;
