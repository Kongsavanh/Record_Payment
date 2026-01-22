import { createClient } from '@supabase/supabase-js';

// Get environment variables from Vite's import.meta.env
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials are missing. Check your .env file or Vercel environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
