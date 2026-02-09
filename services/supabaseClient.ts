
import { createClient } from '@supabase/supabase-js';

// Use safe limits or placeholders to prevent crash if env vars are missing
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hmbyicviwrrayhztzkch.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtYnlpY3Zpd3JyYXloenR6a2NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NDc3ODUsImV4cCI6MjA4NjAyMzc4NX0.DW_nfBi41LsnJvQqUOpDlWh6FrN-QdnMsBKOdVhE5Sg';

// if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
//   console.warn('Using hardcoded Supabase credentials.');
// }

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
