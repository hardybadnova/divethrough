
import { createClient } from '@supabase/supabase-js';

// Use the actual Supabase URL and anon key
const supabaseUrl = 'https://kshozrdkansvgqfxvram.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzaG96cmRrYW5zdmdxZnh2cmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExOTU3MTIsImV4cCI6MjA1Njc3MTcxMn0.prJivme-LRY4ZCGsfocFnXqXtwcyT9cVak1S9MIgcSQ';

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Export to make debugging easier
if (typeof window !== 'undefined') {
  (window as any).supabase = supabase;
}
