// Authentication Module
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkSession();
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Login form
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Register form
        document.getElementById('register-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // Logout button
        document.getElementById('logout-btn').addEventListener('click', () => this.handleLogout());
    }

    switchTab(tab) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // Update forms
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        document.getElementById(`${tab}-form`).classList.add('active');

        // Clear messages
        this.clearMessage();
    }

    async handleLogin() {
        if (!supabase) {
            this.showMessage('Authentication system not available', 'error');
            return;
        }
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            this.showLoading('login-form');
            
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            // Get user profile
            await this.getUserProfile(data.user.id);
            
            this.showMessage('Login successful!', 'success');
            setTimeout(() => this.showMainApp(), 1000);

        } catch (error) {
            this.showMessage(error.message, 'error');
        } finally {
            this.hideLoading('login-form');
        }
    }

    async handleRegister() {
        if (!supabase) {
            this.showMessage('Authentication system not available', 'error');
            return;
        }
        
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const name = document.getElementById('register-name').value;
        const role = document.getElementById('register-role').value;

        try {
            this.showLoading('register-form');

            // Register user
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name,
                        role
                    }
                }
            });

            if (error) throw error;

            // Create user profile
            await this.createUserProfile(data.user.id, name, role);

            this.showMessage('Registration successful! Please check your email to verify.', 'success');
            
            // Switch to login tab
            setTimeout(() => this.switchTab('login'), 2000);

        } catch (error) {
            this.showMessage(error.message, 'error');
        } finally {
            this.hideLoading('register-form');
        }
    }

    async createUserProfile(userId, name, role) {
        const { error } = await supabase
            .from(TABLES.users)
            .insert({
                id: userId,
                name,
                role,
                created_at: new Date().toISOString()
            });

        if (error) throw error;
    }

    async getUserProfile(userId) {
        const { data, error } = await supabase
            .from(TABLES.users)
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;

        this.currentUser = data;
        return data;
    }

    async handleLogout() {
        if (!supabase) {
            this.showMessage('Authentication system not available', 'error');
            return;
        }
        
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            this.currentUser = null;
            this.showAuthSection();
            this.clearMessage();

        } catch (error) {
            this.showMessage(error.message, 'error');
        }
    }

    async checkSession() {
        try {
            if (!supabase) {
                console.error('Supabase client not initialized');
                this.showAuthSection();
                return;
            }
            
            const { data: { session } } = await supabase.auth.getSession();
            
            if (session) {
                await this.getUserProfile(session.user.id);
                this.showMainApp();
            } else {
                this.showAuthSection();
            }
        } catch (error) {
            console.error('Session check error:', error);
            this.showAuthSection();
        }
    }

    showMainApp() {
        document.getElementById('auth-section').classList.add('hidden');
        document.getElementById('main-section').classList.remove('hidden');

        // Show admin button if user is admin
        if (this.currentUser && this.currentUser.role === ROLES.ADMIN) {
            document.getElementById('admin-btn').classList.remove('hidden');
        }

        // Initialize UI
        if (window.uiManager) {
            window.uiManager.initialize();
        }
    }

    showAuthSection() {
        document.getElementById('auth-section').classList.remove('hidden');
        document.getElementById('main-section').classList.add('hidden');
    }

    showMessage(message, type) {
        const messageEl = document.getElementById('auth-message');
        messageEl.textContent = message;
        messageEl.className = `message ${type}`;
    }

    clearMessage() {
        const messageEl = document.getElementById('auth-message');
        messageEl.textContent = '';
        messageEl.className = 'message';
    }

    showLoading(formId) {
        const form = document.getElementById(formId);
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<span class="loading"></span> Processing...';
        submitBtn.disabled = true;
    }

    hideLoading(formId) {
        const form = document.getElementById(formId);
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.innerHTML = formId === 'login-form' ? 'Login' : 'Register';
        submitBtn.disabled = false;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isAdmin() {
        return this.currentUser && this.currentUser.role === ROLES.ADMIN;
    }
}

// Initialize Auth Manager
const authManager = new AuthManager();

// Make it globally available
window.authManager = authManager;
