// Environment-aware Configuration Manager
class ConfigManager {
    constructor() {
        this.config = this.loadConfiguration();
        this.supabase = this.initializeSupabase();
    }

    loadConfiguration() {
        // Try to load from environment variables first (for Node.js/server environments)
        if (typeof process !== 'undefined' && process.env) {
            return this.loadFromEnvironment();
        }
        
        // For browser environments, try multiple sources
        return this.loadFromBrowser();
    }

    loadFromEnvironment() {
        return {
            supabase: {
                url: process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL',
                anonKey: process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY',
                serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
            },
            app: {
                name: process.env.APP_NAME || 'Inventory Management System',
                version: process.env.APP_VERSION || '1.0.0',
                apiUrl: process.env.API_URL || 'http://localhost:3000',
                environment: process.env.NODE_ENV || 'development'
            },
            features: {
                adminPanel: process.env.ENABLE_ADMIN_PANEL === 'true',
                itemImages: process.env.ENABLE_ITEM_IMAGES === 'true',
                exportFeature: process.env.ENABLE_EXPORT_FEATURE === 'true'
            }
        };
    }

    loadFromBrowser() {
        // Method 1: Check for window.env (set by build tools or server)
        if (window.env) {
            return {
                supabase: {
                    url: window.env.SUPABASE_URL || 'YOUR_SUPABASE_URL',
                    anonKey: window.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY',
                    serviceRoleKey: window.env.SUPABASE_SERVICE_ROLE_KEY || ''
                },
                app: {
                    name: window.env.APP_NAME || 'Inventory Management System',
                    version: window.env.APP_VERSION || '1.0.0',
                    apiUrl: window.env.API_URL || 'http://localhost:3000',
                    environment: window.env.NODE_ENV || 'development'
                },
                features: {
                    adminPanel: window.env.ENABLE_ADMIN_PANEL !== 'false',
                    itemImages: window.env.ENABLE_ITEM_IMAGES === 'true',
                    exportFeature: window.env.ENABLE_EXPORT_FEATURE === 'true'
                }
            };
        }

        // Method 2: Check for localStorage
        const storedConfig = localStorage.getItem('inventory_config');
        if (storedConfig) {
            try {
                const parsed = JSON.parse(storedConfig);
                return this.mergeWithDefaults(parsed);
            } catch (e) {
                console.warn('Invalid config in localStorage, using defaults');
            }
        }

        // Method 3: Use defaults (development mode)
        return this.getDevelopmentDefaults();
    }

    getDevelopmentDefaults() {
        return {
            supabase: {
                url: 'YOUR_SUPABASE_URL',
                anonKey: 'YOUR_SUPABASE_ANON_KEY',
                serviceRoleKey: ''
            },
            app: {
                name: 'Inventory Management System',
                version: '1.0.0',
                apiUrl: 'http://localhost:3000',
                environment: 'development'
            },
            features: {
                adminPanel: true,
                itemImages: false,
                exportFeature: false
            }
        };
    }

    mergeWithDefaults(userConfig) {
        const defaults = this.getDevelopmentDefaults();
        return {
            supabase: { ...defaults.supabase, ...userConfig.supabase },
            app: { ...defaults.app, ...userConfig.app },
            features: { ...defaults.features, ...userConfig.features }
        };
    }

    initializeSupabase() {
        if (!window.supabase) {
            console.error('Supabase client not loaded. Make sure the Supabase script is included.');
            return null;
        }

        if (this.isConfigurationValid()) {
            try {
                return window.supabase.createClient(
                    this.config.supabase.url,
                    this.config.supabase.anonKey
                );
            } catch (error) {
                console.error('Failed to initialize Supabase client:', error);
                return null;
            }
        }

        console.warn('Invalid Supabase configuration. Please set your credentials.');
        return null;
    }

    isConfigurationValid() {
        const { url, anonKey } = this.config.supabase;
        return url && 
               anonKey && 
               url !== 'YOUR_SUPABASE_URL' && 
               anonKey !== 'YOUR_SUPABASE_ANON_KEY';
    }

    // Configuration methods
    getSupabaseUrl() {
        return this.config.supabase.url;
    }

    getSupabaseAnonKey() {
        return this.config.supabase.anonKey;
    }

    getSupabaseServiceRoleKey() {
        return this.config.supabase.serviceRoleKey;
    }

    getAppConfig() {
        return this.config.app;
    }

    getFeatures() {
        return this.config.features;
    }

    isFeatureEnabled(feature) {
        return this.config.features[feature] === true;
    }

    // Runtime configuration updates (for browser)
    updateConfiguration(newConfig) {
        if (typeof localStorage !== 'undefined') {
            this.config = this.mergeWithDefaults(newConfig);
            localStorage.setItem('inventory_config', JSON.stringify(newConfig));
            
            // Reinitialize Supabase with new config
            this.supabase = this.initializeSupabase();
            
            return true;
        }
        return false;
    }

    // Validation
    validateConfiguration() {
        const issues = [];

        if (!this.isConfigurationValid()) {
            issues.push('Supabase URL and/or Anon Key are not properly configured');
        }

        if (!this.config.supabase.url.startsWith('https://')) {
            issues.push('Supabase URL should use HTTPS');
        }

        if (this.config.supabase.anonKey.length < 100) {
            issues.push('Supabase Anon Key appears to be invalid (too short)');
        }

        return {
            isValid: issues.length === 0,
            issues
        };
    }

    // Development helper
    showConfigurationHelp() {
        const validation = this.validateConfiguration();
        
        if (!validation.isValid) {
            console.group('Configuration Issues:');
            validation.issues.forEach(issue => console.error('•', issue));
            console.groupEnd();
            
            console.info('To fix configuration issues:');
            console.info('1. Create a Supabase project at https://supabase.com');
            console.info('2. Copy your project URL and anon key');
            console.info('3. Update your configuration using one of these methods:');
            console.info('   - Set window.env before loading the app');
            console.info('   - Use localStorage.setItem("inventory_config", JSON.stringify({...}))');
            console.info('   - Update the config file directly for development');
        }
        
        return validation;
    }
}

// Global configuration instance
const configManager = new ConfigManager();

// Make it globally available
window.configManager = configManager;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConfigManager;
}
