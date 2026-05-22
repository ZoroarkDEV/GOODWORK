import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for backend operations using SERVICE_ROLE_KEY
// This client has elevated privileges and should only be used server-side.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL; // Using public URL for consistency, but service role key is key
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Supabase URL or Service Role Key is missing in environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);