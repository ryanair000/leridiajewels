// Supabase Configuration
// For Netlify: Set these in Site Settings > Environment Variables
// SUPABASE_URL and SUPABASE_ANON_KEY

// Check for Netlify environment variables (injected at build) or use defaults for local dev
const SUPABASE_URL = window.ENV_SUPABASE_URL || 'https://tbmkrgqqhrjgznhqldiz.supabase.co';
const SUPABASE_ANON_KEY = window.ENV_SUPABASE_ANON_KEY || 'sb_publishable_8m4ugHn8BSDgkBtUrsUB-A_3pxPww0_';

// Initialize Supabase Client
let supabaseClient = null;

function initSupabase() {
    if (!SUPABASE_ANON_KEY) {
        console.error('Supabase key not configured. Cannot proceed.');
        alert('Database configuration error. Please check Supabase settings.');
        return false;
    }
    
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
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
window.getSupabase = () => supabaseClient;
