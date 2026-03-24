// Supabase Configuration
// For Netlify: Set these in Site Settings > Environment Variables
// SUPABASE_URL and SUPABASE_ANON_KEY

// Supabase project credentials
// Netlify can inject these at runtime; local fallbacks keep the static app usable.
const SUPABASE_URL = window.ENV_SUPABASE_URL || 'https://tbmkrgqqhrjgznhqldiz.supabase.co';
const SUPABASE_ANON_KEY = window.ENV_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRibWtyZ3FxaHJqZ3puaHFsZGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjAwMDEsImV4cCI6MjA4ODk5NjAwMX0.oMTqSZ9ubGNEWyM6An-Y7M5fwB2V0WMz8HkmU38YmHU';

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
