import { createClient } from '@supabase/supabase-js';

// Helper to get client only if keys exist
export const getSupabase = () => {
    const supabaseUrl = localStorage.getItem('easeNotes_supabaseUrl');
    const supabaseKey = localStorage.getItem('easeNotes_supabaseKey');

    if (supabaseUrl && supabaseKey) {
        return createClient(supabaseUrl, supabaseKey);
    }
    return null;
};
