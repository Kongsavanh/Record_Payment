import { createClient } from '@supabase/supabase-js';

// Fix: Use process.env for environment variables to resolve TypeScript errors with import.meta.env
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// Check if variables are missing and log a clear error
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "ຄວາມຜິດພາດ: ບໍ່ພົບ Supabase Keys! \n" +
    "ກະລຸນາກວດສອບການຕັ້ງຄ່າ Environment Variables ໃນ Vercel ໃຫ້ຄົບຖ້ວນ."
  );
}

// Export the client (it will handle empty strings gracefully by throwing an error on the first call instead of crashing the load)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
