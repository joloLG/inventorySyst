// UI Management Module
class UIManager {
    constructor() {
        this.currentView = 'dashboard';
        this.modal = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupModal();
    }

    setupEventListeners() {
        // Navigation buttons
        document.getElementById('dashboard-btn').addEventListener('click', () => this.showView('dashboard'));
        document.getElementById('categories-btn').addEventListener('click', () => this.showView('categories'));
        document.getElementById('classes-btn').addEventListener('click', () => this.showView('classes'));
        document.getElementById('items-btn').addEventListener('click', () => this.showView('items'));
        document.getElementById('admin-btn').addEventListener('click', () => this.showView('admin'));

        // Add buttons
        document.getElementById('add-category-btn').addEventListener('click', () => this.showCategoryModal());
        document.getElementById('add-class-btn').addEventListener('click', () => this.showClassModal());
        document.getElementById('add-item-btn').addEventListener('click', () => this.showItemModal());

        // Admin tabs
        document.querySelectorAll('.admin-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchAdminTab(e.target.dataset.adminTab));
        });
    }

    setupModal() {
        this.modal = document.getElementById('modal');
        const closeBtn = document.querySelector('.close');
        
        closeBtn.addEventListener('click', () => this.closeModal());
        
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
    }

    async initialize() {
        await this.loadDashboard();
        this.showView('dashboard');
    }

    showView(viewName) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`${viewName}-btn`).classList.add('active');

        // Update views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        document.getElementById(`${viewName}-view`).classList.add('active');

        this.currentView = viewName;

        // Load data for the view
        this.loadViewData(viewName);
    }

    async loadViewData(viewName) {
        try {
            switch (viewName) {
                case 'dashboard':
                    await this.loadDashboard();
                    break;
                case 'categories':
                    await this.loadCategories();
                    break;
                case 'classes':
                    await this.loadClasses();
                    break;
                case 'items':
                    await this.loadItems();
                    break;
                case 'admin':
                    await this.loadAdminData();
                    break;
            }
        } catch (error) {
            this.showError(error.message);
        }
    }

    async loadDashboard() {
        const stats = await databaseManager.getDashboardStats();
        
        document.getElementById('total-categories').textContent = stats.totalCategories;
        document.getElementById('total-classes').textContent = stats.totalClasses;
        document.getElementById('total-items').textContent = stats.totalItems;

        const recentItemsList = document.getElementById('recent-items-list');
        if (stats.recentItems.length > 0) {
            recentItemsList.innerHTML = stats.recentItems.map(item => `
                <div class="recent-item">
                    <strong>${item.name}</strong> - ${item.classes?.categories?.name || 'N/A'} / ${item.classes?.name || 'N/A'}
                    <br><small>Quantity: ${item.quantity || 0} | Added: ${new Date(item.created_at).toLocaleDateString()}</small>
                </div>
            `).join('');
        } else {
            recentItemsList.innerHTML = '<p class="empty-state">No items yet</p>';
        }
    }

    async loadCategories() {
        const categories = await databaseManager.getCategories();
        const categoriesList = document.getElementById('categories-list');
        
        if (categories.length > 0) {
            categoriesList.innerHTML = categories.map(category => `
                <div class="category-card">
                    <div class="card-info">
                        <h3>${category.name}</h3>
                        <p>${category.description || 'No description'}</p>
                        <small>Created: ${new Date(category.created_at).toLocaleDateString()}</small>
                    </div>
                    <div class="card-actions">
                        <button class="btn-secondary" onclick="uiManager.showCategoryModal('${category.id}')">Edit</button>
                        <button class="btn-danger" onclick="uiManager.deleteCategory('${category.id}')">Delete</button>
                    </div>
                </div>
            `).join('');
        } else {
            categoriesList.innerHTML = '<div class="empty-state"><h3>No categories</h3><p>Create your first category to get started</p></div>';
        }
    }

    async loadClasses() {
        const classes = await databaseManager.getClasses();
        const classesList = document.getElementById('classes-list');
        
        if (classes.length > 0) {
            classesList.innerHTML = classes.map(cls => `
                <div class="class-card">
                    <div class="card-info">
                        <h3>${cls.name}</h3>
                        <p>${cls.description || 'No description'}</p>
                        <small>Category: ${cls.categories?.name || 'N/A'} | Created: ${new Date(cls.created_at).toLocaleDateString()}</small>
                    </div>
                    <div class="card-actions">
                        <button class="btn-secondary" onclick="uiManager.showClassModal('${cls.id}')">Edit</button>
                        <button class="btn-danger" onclick="uiManager.deleteClass('${cls.id}')">Delete</button>
                    </div>
                </div>
            `).join('');
        } else {
            classesList.innerHTML = '<div class="empty-state"><h3>No classes</h3><p>Create your first class to organize your items</p></div>';
        }
    }

    async loadItems() {
        const items = await databaseManager.getItems();
        const itemsList = document.getElementById('items-list');
        
        if (items.length > 0) {
            itemsList.innerHTML = items.map(item => `
                <div class="item-card">
                    <div class="card-info">
                        <h3>${item.name}</h3>
                        <p>${item.description || 'No description'}</p>
                        <small>
                            ${item.sku ? `SKU: ${item.sku} | ` : ''}
                            Category: ${item.classes?.categories?.name || 'N/A'} / ${item.classes?.name || 'N/A'}
                            ${item.quantity !== undefined ? ` | Quantity: ${item.quantity}` : ''}
                            ${item.price ? ` | Price: $${item.price}` : ''}
                            | Created: ${new Date(item.created_at).toLocaleDateString()}
                        </small>
                    </div>
                    <div class="card-actions">
                        <button class="btn-secondary" onclick="uiManager.showItemModal('${item.id}')">Edit</button>
                        <button class="btn-danger" onclick="uiManager.deleteItem('${item.id}')">Delete</button>
                    </div>
                </div>
            `).join('');
        } else {
            itemsList.innerHTML = '<div class="empty-state"><h3>No items</h3><p>Add your first item to start tracking inventory</p></div>';
        }
    }

    async loadAdminData() {
        await this.loadAdminSummary();
    }

    async loadAdminSummary() {
        const summaries = await databaseManager.getGlobalInventorySummary();
        const summaryContainer = document.getElementById('inventory-summary');
        
        if (summaries.length > 0) {
            summaryContainer.innerHTML = summaries.map(summary => `
                <div class="user-summary-card">
                    <h4>${summary.user.name} (${summary.user.email})</h4>
                    <div class="user-stats">
                        <div class="user-stat">
                            <p>${summary.stats.totalCategories}</p>
                            <span>Categories</span>
                        </div>
                        <div class="user-stat">
                            <p>${summary.stats.totalClasses}</p>
                            <span>Classes</span>
                        </div>
                        <div class="user-stat">
                            <p>${summary.stats.totalItems}</p>
                            <span>Items</span>
                        </div>
                    </div>
                    <button class="btn-secondary" onclick="uiManager.showUserDetails('${summary.user.id}')">View Details</button>
                </div>
            `).join('');
        } else {
            summaryContainer.innerHTML = '<p class="empty-state">No users found</p>';
        }
    }

    async showUserDetails(userId) {
        const summary = await databaseManager.getUserInventorySummary(userId);
        const detailsContainer = document.getElementById('user-details');
        
        detailsContainer.innerHTML = `
            <div class="user-summary-card">
                <h4>${summary.user.name} (${summary.user.email})</h4>
                <p>Role: ${summary.user.role}</p>
                <p>Member since: ${new Date(summary.user.created_at).toLocaleDateString()}</p>
                
                <h5>Categories (${summary.categories.length})</h5>
                ${summary.categories.length > 0 ? 
                    summary.categories.map(cat => `<p>• ${cat.name}</p>`).join('') : 
                    '<p>No categories</p>'
                }
                
                <h5>Classes (${summary.classes.length})</h5>
                ${summary.classes.length > 0 ? 
                    summary.classes.map(cls => `<p>• ${cls.name} (${cls.categories?.name || 'N/A'})</p>`).join('') : 
                    '<p>No classes</p>'
                }
                
                <h5>Items (${summary.items.length})</h5>
                ${summary.items.length > 0 ? 
                    summary.items.map(item => `<p>• ${item.name} - ${item.classes?.categories?.name || 'N/A'} / ${item.classes?.name || 'N/A'} ${item.quantity ? `(Qty: ${item.quantity})` : ''}</p>`).join('') : 
                    '<p>No items</p>'
                }
            </div>
        `;
        
        this.switchAdminTab('details');
    }

    switchAdminTab(tabName) {
        document.querySelectorAll('.admin-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-admin-tab="${tabName}"]`).classList.add('active');

        document.querySelectorAll('.admin-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`admin-${tabName}`).classList.add('active');
    }

    // Modal Methods
    showModal(title, content) {
        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = `
            <h3>${title}</h3>
            ${content}
        `;
        this.modal.classList.remove('hidden');
    }

    closeModal() {
        this.modal.classList.add('hidden');
    }

    async showCategoryModal(categoryId = null) {
        const isEdit = categoryId !== null;
        let category = null;

        if (isEdit) {
            const categories = await databaseManager.getCategories();
            category = categories.find(c => c.id === categoryId);
        }

        const content = `
            <form id="category-form" class="modal-form">
                <div class="form-group">
                    <label for="category-name">Category Name *</label>
                    <input type="text" id="category-name" value="${category?.name || ''}" required>
                </div>
                <div class="form-group">
                    <label for="category-description">Description</label>
                    <textarea id="category-description" rows="3">${category?.description || ''}</textarea>
                </div>
                <div class="modal-actions">
                    <button type="button" onclick="uiManager.closeModal()">Cancel</button>
                    <button type="submit" class="btn-primary">${isEdit ? 'Update' : 'Create'}</button>
                </div>
            </form>
        `;

        this.showModal(`${isEdit ? 'Edit' : 'Add'} Category`, content);

        // Setup form submission
        document.getElementById('category-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveCategory(categoryId);
        });
    }

    async showClassModal(classId = null) {
        const isEdit = classId !== null;
        let classData = null;
        const categories = await databaseManager.getCategories();

        if (isEdit) {
            const classes = await databaseManager.getClasses();
            classData = classes.find(c => c.id === classId);
        }

        const content = `
            <form id="class-form" class="modal-form">
                <div class="form-group">
                    <label for="class-name">Class Name *</label>
                    <input type="text" id="class-name" value="${classData?.name || ''}" required>
                </div>
                <div class="form-group">
                    <label for="class-category">Category *</label>
                    <select id="class-category" required>
                        <option value="">Select a category</option>
                        ${categories.map(cat => `
                            <option value="${cat.id}" ${classData?.category_id === cat.id ? 'selected' : ''}>
                                ${cat.name}
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="class-description">Description</label>
                    <textarea id="class-description" rows="3">${classData?.description || ''}</textarea>
                </div>
                <div class="modal-actions">
                    <button type="button" onclick="uiManager.closeModal()">Cancel</button>
                    <button type="submit" class="btn-primary">${isEdit ? 'Update' : 'Create'}</button>
                </div>
            </form>
        `;

        this.showModal(`${isEdit ? 'Edit' : 'Add'} Class`, content);

        // Setup form submission
        document.getElementById('class-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveClass(classId);
        });
    }

    async showItemModal(itemId = null) {
        const isEdit = itemId !== null;
        let item = null;
        const classes = await databaseManager.getClasses();

        if (isEdit) {
            const items = await databaseManager.getItems();
            item = items.find(i => i.id === itemId);
        }

        const content = `
            <form id="item-form" class="modal-form">
                <div class="form-group">
                    <label for="item-name">Item Name *</label>
                    <input type="text" id="item-name" value="${item?.name || ''}" required>
                </div>
                <div class="form-group">
                    <label for="item-class">Class *</label>
                    <select id="item-class" required>
                        <option value="">Select a class</option>
                        ${classes.map(cls => `
                            <option value="${cls.id}" ${item?.class_id === cls.id ? 'selected' : ''}>
                                ${cls.name} (${cls.categories?.name || 'N/A'})
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="item-sku">SKU</label>
                    <input type="text" id="item-sku" value="${item?.sku || ''}">
                </div>
                <div class="form-group">
                    <label for="item-quantity">Quantity</label>
                    <input type="number" id="item-quantity" value="${item?.quantity || 0}" min="0">
                </div>
                <div class="form-group">
                    <label for="item-price">Price</label>
                    <input type="number" id="item-price" value="${item?.price || ''}" step="0.01" min="0">
                </div>
                <div class="form-group">
                    <label for="item-description">Description</label>
                    <textarea id="item-description" rows="3">${item?.description || ''}</textarea>
                </div>
                <div class="modal-actions">
                    <button type="button" onclick="uiManager.closeModal()">Cancel</button>
                    <button type="submit" class="btn-primary">${isEdit ? 'Update' : 'Create'}</button>
                </div>
            </form>
        `;

        this.showModal(`${isEdit ? 'Edit' : 'Add'} Item`, content);

        // Setup form submission
        document.getElementById('item-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveItem(itemId);
        });
    }

    // Save Methods
    async saveCategory(categoryId = null) {
        const name = document.getElementById('category-name').value;
        const description = document.getElementById('category-description').value;

        try {
            if (categoryId) {
                await databaseManager.updateCategory(categoryId, { name, description });
                this.showSuccess('Category updated successfully!');
            } else {
                await databaseManager.createCategory({ name, description });
                this.showSuccess('Category created successfully!');
            }

            this.closeModal();
            await this.loadCategories();
        } catch (error) {
            this.showError(error.message);
        }
    }

    async saveClass(classId = null) {
        const name = document.getElementById('class-name').value;
        const categoryId = document.getElementById('class-category').value;
        const description = document.getElementById('class-description').value;

        try {
            if (classId) {
                await databaseManager.updateClass(classId, { name, category_id: categoryId, description });
                this.showSuccess('Class updated successfully!');
            } else {
                await databaseManager.createClass({ name, category_id: categoryId, description });
                this.showSuccess('Class created successfully!');
            }

            this.closeModal();
            await this.loadClasses();
        } catch (error) {
            this.showError(error.message);
        }
    }

    async saveItem(itemId = null) {
        const name = document.getElementById('item-name').value;
        const classId = document.getElementById('item-class').value;
        const sku = document.getElementById('item-sku').value;
        const quantity = parseInt(document.getElementById('item-quantity').value) || 0;
        const price = parseFloat(document.getElementById('item-price').value) || null;
        const description = document.getElementById('item-description').value;

        try {
            if (itemId) {
                await databaseManager.updateItem(itemId, { 
                    name, 
                    class_id: classId, 
                    sku, 
                    quantity, 
                    price, 
                    description 
                });
                this.showSuccess('Item updated successfully!');
            } else {
                await databaseManager.createItem({ 
                    name, 
                    class_id: classId, 
                    sku, 
                    quantity, 
                    price, 
                    description 
                });
                this.showSuccess('Item created successfully!');
            }

            this.closeModal();
            await this.loadItems();
        } catch (error) {
            this.showError(error.message);
        }
    }

    // Delete Methods
    async deleteCategory(categoryId) {
        if (!confirm('Are you sure you want to delete this category? This will also delete all associated classes and items.')) {
            return;
        }

        try {
            await databaseManager.deleteCategory(categoryId);
            this.showSuccess('Category deleted successfully!');
            await this.loadCategories();
        } catch (error) {
            this.showError(error.message);
        }
    }

    async deleteClass(classId) {
        if (!confirm('Are you sure you want to delete this class? This will also delete all associated items.')) {
            return;
        }

        try {
            await databaseManager.deleteClass(classId);
            this.showSuccess('Class deleted successfully!');
            await this.loadClasses();
        } catch (error) {
            this.showError(error.message);
        }
    }

    async deleteItem(itemId) {
        if (!confirm('Are you sure you want to delete this item?')) {
            return;
        }

        try {
            await databaseManager.deleteItem(itemId);
            this.showSuccess('Item deleted successfully!');
            await this.loadItems();
        } catch (error) {
            this.showError(error.message);
        }
    }

    // Notification Methods
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            z-index: 10000;
            ${type === 'success' ? 'background: #27ae60;' : 'background: #e74c3c;'}
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}

// Initialize UI Manager
const uiManager = new UIManager();

// Make it globally available
window.uiManager = uiManager;
