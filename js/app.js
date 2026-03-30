// Main Application Entry Point
class InventoryApp {
    constructor() {
        this.version = '1.0.0';
        this.name = 'Inventory Management System';
        this.init();
    }

    async init() {
        try {
            console.log(`${this.name} v${this.version} starting...`);
            
            // Wait for auth to be ready
            await this.waitForAuth();
            
            console.log('Application initialized successfully');
        } catch (error) {
            console.error('Application initialization failed:', error);
            this.showFatalError(error.message);
        }
    }

    async waitForAuth() {
        return new Promise((resolve) => {
            const checkAuth = () => {
                if (window.authManager && window.authManager.currentUser !== undefined) {
                    console.log('Authentication system ready');
                    resolve();
                } else {
                    setTimeout(checkAuth, 100);
                }
            };
            checkAuth();
        });
    }

    showFatalError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 99999;
            ">
                <div style="
                    background: white;
                    padding: 30px;
                    border-radius: 10px;
                    max-width: 500px;
                    text-align: center;
                ">
                    <h2 style="color: #e74c3c; margin-bottom: 15px;">Application Error</h2>
                    <p style="margin-bottom: 20px;">${message}</p>
                    <button onclick="location.reload()" style="
                        background: #3498db;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                    ">Reload Application</button>
                </div>
            </div>
        `;
        document.body.appendChild(errorDiv);
    }

    // Utility methods
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString();
    }

    formatDateTime(dateString) {
        return new Date(dateString).toLocaleString();
    }

    // Global error handler
    handleGlobalError(error, context = '') {
        console.error(`Global error in ${context}:`, error);
        
        if (uiManager) {
            uiManager.showError(`An error occurred: ${error.message}`);
        } else {
            alert(`An error occurred: ${error.message}`);
        }
    }
}

// Initialize the application when DOM is ready
function initializeInventoryApp() {
    if (!window.inventoryApp) {
        window.inventoryApp = new InventoryApp();
    }
    return window.inventoryApp;
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeInventoryApp);
} else {
    initializeInventoryApp();
}

// Global error handling
window.addEventListener('error', (event) => {
    if (window.inventoryApp) {
        window.inventoryApp.handleGlobalError(event.error, 'Global');
    }
});

window.addEventListener('unhandledrejection', (event) => {
    if (window.inventoryApp) {
        window.inventoryApp.handleGlobalError(event.reason, 'Promise Rejection');
    }
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InventoryApp;
}
