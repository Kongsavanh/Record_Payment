import { createClient } from '@supabase/supabase-js';

// Safe way to access environment variables in different environments
const getEnv = (name: string): string | undefined => {
  try {
    // Check Vite/ESM environment
    const metaEnv = (import.meta as any).env;
    if (metaEnv && metaEnv[name]) return metaEnv[name];
    
    // Check Node/CommonJS/Injected environment
    if (typeof process !== 'undefined' && process.env && process.env[name]) {
      return process.env[name];
    }
  } catch (e) {
    // Ignore errors
  }
  return undefined;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
  console.error(
    "Supabase configuration is missing! \n" +
    "Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment."
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
