// Supabase Configuration
const SUPABASE_URL = 'https://cdnmyzeqavoygcayacim.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkbm15emVxYXZveWdjYXlhY2ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NjkxNzIsImV4cCI6MjA5MDQ0NTE3Mn0.Tf1E0qqtZnEwD01D-bYVvE1HFN7A9ScxP25HamByf0U';

// Initialize Supabase
let supabase;

if (typeof window.supabase !== 'undefined') {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    console.error('Supabase library not loaded. Please check the script tag in index.html');
}

// App Configuration
const APP_CONFIG = {
    appName: 'Inventory Management System',
    version: '1.0.0',
    itemsPerPage: 10,
    maxImageSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif']
};

// Database Table Names
const TABLES = {
    users: 'users',
    categories: 'categories',
    classes: 'classes',
    items: 'items'
};

// User Roles
const ROLES = {
    USER: 'user',
    ADMIN: 'admin'
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        supabase,
        APP_CONFIG,
        TABLES,
        ROLES
    };
}
