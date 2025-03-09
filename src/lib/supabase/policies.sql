
-- SQL to grant public access to pools table
-- This should be run in the Supabase SQL editor
-- Enable read access to pools for all users (including anonymous)
CREATE POLICY "Allow public read access to pools" 
  ON public.pools 
  FOR SELECT 
  USING (true);

-- Enable read access to game_pools for authenticated users
CREATE POLICY "Allow authenticated read access to game_pools" 
  ON public.game_pools 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Enable insert/update access to game_pools for authenticated users
CREATE POLICY "Allow authenticated write access to game_pools" 
  ON public.game_pools 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update access to game_pools" 
  ON public.game_pools 
  FOR UPDATE 
  USING (auth.role() = 'authenticated');
