import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Clean up any potential surrounding quotes or whitespace from env vars
export const supabaseUrl = rawUrl.replace(/^['"]|['"]$/g, '').trim();
export const supabaseAnonKey = rawKey.replace(/^['"]|['"]$/g, '').trim();

// Verify if credentials are provided in environment variables
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
