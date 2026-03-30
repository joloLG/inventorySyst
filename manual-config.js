// Manual configuration script
// Run this in browser console to set up your configuration

const SUPABASE_CONFIG = {
    url: 'https://cdnmyzeqavoygcayacim.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkbm15emVxYXZveWdjYXlhY2ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NjkxNzIsImV4cCI6MjA5MDQ0NTE3Mn0.Tf1E0qqtZnEwD01D-bYVvE1HFN7A9ScxP25HamByf0U',
    serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkbm15emVxYXZveWdjYXlhY2ltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg2OTE3MiwiZXhwIjoyMDkwNDQ1MTcyfQ.rrsh87c38Urqm_72pew0n1cEcNNxKt7WW9756iv-j-g'
};

// Method 1: Set window.env (for config-env.js)
window.env = {
    SUPABASE_URL: SUPABASE_CONFIG.url,
    SUPABASE_ANON_KEY: SUPABASE_CONFIG.anonKey,
    SUPABASE_SERVICE_ROLE_KEY: SUPABASE_CONFIG.serviceRoleKey,
    APP_NAME: 'Inventory Management System',
    APP_VERSION: '1.0.0',
    NODE_ENV: 'development',
    ENABLE_ADMIN_PANEL: 'true',
    ENABLE_ITEM_IMAGES: 'false',
    ENABLE_EXPORT_FEATURE: 'false'
};

// Method 2: Set localStorage (backup method)
localStorage.setItem('inventory_config', JSON.stringify({
    supabase: {
        url: SUPABASE_CONFIG.url,
        anonKey: SUPABASE_CONFIG.anonKey,
        serviceRoleKey: SUPABASE_CONFIG.serviceRoleKey
    },
    app: {
        name: 'Inventory Management System',
        version: '1.0.0',
        environment: 'development'
    },
    features: {
        adminPanel: true,
        itemImages: false,
        exportFeature: false
    }
}));

// Method 3: Initialize Supabase directly
if (window.supabase) {
    window.supabaseClient = window.supabase.createClient(
        SUPABASE_CONFIG.url,
        SUPABASE_CONFIG.anonKey
    );
    console.log('✅ Supabase client initialized directly');
} else {
    console.error('❌ Supabase library not loaded');
}

// Method 4: Test the connection
async function testConnection() {
    try {
        const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/`, {
            headers: {
                'apikey': SUPABASE_CONFIG.anonKey,
                'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`
            }
        });
        
        if (response.ok) {
            console.log('✅ Connection test successful');
            return true;
        } else {
            console.error('❌ Connection test failed:', response.status, response.statusText);
            return false;
        }
    } catch (error) {
        console.error('❌ Connection test error:', error);
        return false;
    }
}

// Auto-test connection
testConnection().then(success => {
    if (success) {
        console.log('🎉 Configuration is ready! You can now use the inventory system.');
        console.log('💡 Try refreshing the main page or opening index.html');
    } else {
        console.log('❌ Configuration failed. Check your Supabase project status.');
    }
});

console.log('🔧 Manual configuration applied. Check console for results.');
