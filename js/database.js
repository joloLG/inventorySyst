// Database Operations Module
class DatabaseManager {
    constructor() {
        this.supabase = supabase;
    }

    // Category Operations
    async getCategories(userId = null) {
        let query = this.supabase.from(TABLES.categories).select('*');
        
        if (userId && !authManager.isAdmin()) {
            query = query.eq('user_id', userId);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
    }

    async createCategory(categoryData) {
        const { data, error } = await this.supabase
            .from(TABLES.categories)
            .insert({
                ...categoryData,
                user_id: authManager.getCurrentUser().id,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateCategory(categoryId, updateData) {
        const { data, error } = await this.supabase
            .from(TABLES.categories)
            .update({
                ...updateData,
                updated_at: new Date().toISOString()
            })
            .eq('id', categoryId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteCategory(categoryId) {
        const { error } = await this.supabase
            .from(TABLES.categories)
            .eq('id', categoryId)
            .delete();

        if (error) throw error;
    }

    // Class Operations
    async getClasses(userId = null, categoryId = null) {
        let query = this.supabase.from(TABLES.classes).select(`
            *,
            categories(name)
        `);
        
        if (userId && !authManager.isAdmin()) {
            query = query.eq('user_id', userId);
        }
        
        if (categoryId) {
            query = query.eq('category_id', categoryId);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
    }

    async createClass(classData) {
        const { data, error } = await this.supabase
            .from(TABLES.classes)
            .insert({
                ...classData,
                user_id: authManager.getCurrentUser().id,
                created_at: new Date().toISOString()
            })
            .select(`
                *,
                categories(name)
            `)
            .single();

        if (error) throw error;
        return data;
    }

    async updateClass(classId, updateData) {
        const { data, error } = await this.supabase
            .from(TABLES.classes)
            .update({
                ...updateData,
                updated_at: new Date().toISOString()
            })
            .eq('id', classId)
            .select(`
                *,
                categories(name)
            `)
            .single();

        if (error) throw error;
        return data;
    }

    async deleteClass(classId) {
        const { error } = await this.supabase
            .from(TABLES.classes)
            .eq('id', classId)
            .delete();

        if (error) throw error;
    }

    // Item Operations
    async getItems(userId = null, classId = null) {
        let query = this.supabase.from(TABLES.items).select(`
            *,
            classes(name, categories(name))
        `);
        
        if (userId && !authManager.isAdmin()) {
            query = query.eq('user_id', userId);
        }
        
        if (classId) {
            query = query.eq('class_id', classId);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
    }

    async createItem(itemData) {
        const { data, error } = await this.supabase
            .from(TABLES.items)
            .insert({
                ...itemData,
                user_id: authManager.getCurrentUser().id,
                created_at: new Date().toISOString()
            })
            .select(`
                *,
                classes(name, categories(name))
            `)
            .single();

        if (error) throw error;
        return data;
    }

    async updateItem(itemId, updateData) {
        const { data, error } = await this.supabase
            .from(TABLES.items)
            .update({
                ...updateData,
                updated_at: new Date().toISOString()
            })
            .eq('id', itemId)
            .select(`
                *,
                classes(name, categories(name))
            `)
            .single();

        if (error) throw error;
        return data;
    }

    async deleteItem(itemId) {
        const { error } = await this.supabase
            .from(TABLES.items)
            .eq('id', itemId)
            .delete();

        if (error) throw error;
    }

    // Dashboard Statistics
    async getDashboardStats(userId = null) {
        const userIdToUse = userId || authManager.getCurrentUser().id;
        
        try {
            const [categories, classes, items] = await Promise.all([
                this.getCategories(userIdToUse),
                this.getClasses(userIdToUse),
                this.getItems(userIdToUse)
            ]);

            return {
                totalCategories: categories.length,
                totalClasses: classes.length,
                totalItems: items.length,
                recentItems: items.slice(0, 5)
            };
        } catch (error) {
            throw error;
        }
    }

    // Admin Operations
    async getAllUsers() {
        if (!authManager.isAdmin()) {
            throw new Error('Admin access required');
        }

        const { data, error } = await this.supabase
            .from(TABLES.users)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    async getUserInventorySummary(userId) {
        if (!authManager.isAdmin()) {
            throw new Error('Admin access required');
        }

        try {
            const [user, categories, classes, items] = await Promise.all([
                this.supabase.from(TABLES.users).select('*').eq('id', userId).single(),
                this.getCategories(userId),
                this.getClasses(userId),
                this.getItems(userId)
            ]);

            return {
                user: user.data,
                categories,
                classes,
                items,
                stats: {
                    totalCategories: categories.length,
                    totalClasses: classes.length,
                    totalItems: items.length
                }
            };
        } catch (error) {
            throw error;
        }
    }

    async getGlobalInventorySummary() {
        if (!authManager.isAdmin()) {
            throw new Error('Admin access required');
        }

        try {
            const users = await this.getAllUsers();
            const summaries = [];

            for (const user of users) {
                const summary = await this.getUserInventorySummary(user.id);
                summaries.push(summary);
            }

            return summaries;
        } catch (error) {
            throw error;
        }
    }

    // Utility Methods
    async validateUnique(tableName, field, value, excludeId = null) {
        let query = this.supabase
            .from(tableName)
            .select('id')
            .eq(field, value)
            .eq('user_id', authManager.getCurrentUser().id);

        if (excludeId) {
            query = query.neq('id', excludeId);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data.length === 0;
    }

    async searchItems(searchTerm, userId = null) {
        let query = this.supabase.from(TABLES.items).select(`
            *,
            classes(name, categories(name))
        `);

        if (userId && !authManager.isAdmin()) {
            query = query.eq('user_id', userId);
        }

        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%`);

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }
}

// Initialize Database Manager
const databaseManager = new DatabaseManager();

// Make it globally available
window.databaseManager = databaseManager;
