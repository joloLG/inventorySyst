// Supabase Configuration
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Initialize Supabase (only if not already initialized by config manager)
if (!window.supabase) {
    window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Get supabase instance (prefer config manager if available)
const supabase = window.configManager ? window.configManager.supabase : window.supabase;

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
