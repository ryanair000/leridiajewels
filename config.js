// Supabase Configuration
const SUPABASE_URL = 'https://flannloidfpzzcbndiiu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_VqjcsQRa0hDUXaGcfMrS-A_gxDBZC-n';

// Initialize Supabase Client
let supabase = null;

function initSupabase() {
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase initialized successfully');
        return true;
    }
    console.error('Supabase library not loaded');
    return false;
}

// Export for use in app
window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
window.initSupabase = initSupabase;
window.getSupabase = () => supabase;
