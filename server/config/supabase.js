import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://jcsandzigwvawvtcycwd.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn("⚠️ [FATAL WARNING] Missing SUPABASE_SERVICE_ROLE_KEY in server/.env");
  console.warn("⚠️ Falling back to Anonymous Key. Service queries might fail under Row-Level Security.");
}

// Named exports for architectural cleanliness
export const supabase = createClient(supabaseUrl, supabaseAnonKey || 'placeholder');
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
