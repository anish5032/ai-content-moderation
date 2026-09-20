import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type { Database } from './supabase.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export function getSupabaseConfigError(): string {
  return 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart the Vite dev server.';
}

export function getSupabaseClient(): SupabaseClient<Database> {
  if (!isSupabaseConfigured) {
    throw new Error(getSupabaseConfigError());
  }

  return createClient<Database>(supabaseUrl as string, supabaseAnonKey as string);
}

export const supabase = isSupabaseConfigured ? getSupabaseClient() : null;