# Inventory Management System

A comprehensive inventory management system built with HTML, CSS, and JavaScript, powered by Supabase for database and authentication.

## Features

### User Features
- **Email Authentication**: Secure login and registration system
- **Category Management**: Create and organize inventory categories
- **Class Management**: Create classes within categories for better organization
- **Item Management**: Add, edit, and delete items with details like SKU, quantity, and price
- **Dashboard**: Overview of inventory statistics and recent items

### Admin Features
- **User Management**: View all registered users
- **Inventory Summary**: See inventory statistics for all users
- **User Details**: View detailed inventory information for specific users

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Supabase (Database & Authentication)
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth (Email-based)

## Environment Variables & Configuration

The inventory system supports multiple configuration methods for different deployment scenarios:

### 🔧 **Configuration Methods**

#### 1. **Quick Setup (Recommended for beginners)**
Open `config-setup.html` in your browser and enter your Supabase credentials.

#### 2. **Environment Variables**
Create a `.env` file (copy from `.env.example`):
```bash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
APP_NAME=Inventory Management System
NODE_ENV=development
```

#### 3. **Browser localStorage**
```javascript
// In browser console:
localStorage.setItem('inventory_config', JSON.stringify({
    supabase: {
        url: 'https://your-project-id.supabase.co',
        anonKey: 'your-anon-key'
    }
}));
```

#### 4. **Window Environment**
```javascript
// In HTML before loading scripts:
window.env = {
    SUPABASE_URL: 'https://your-project-id.supabase.co',
    SUPABASE_ANON_KEY: 'your-anon-key'
};
```

### 🛡️ **Security Best Practices**

- **Never commit** actual credentials to version control
- Use **environment variables** in production
- Keep **service role keys** secure and never expose in frontend
- Use **HTTPS** for all Supabase connections
- Implement **Row Level Security** (included in SQL setup)

### 🌍 **Deployment Examples**

#### **Vercel/Netlify**
Set environment variables in dashboard:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `NODE_ENV=production`

#### **Docker**
```dockerfile
ENV SUPABASE_URL=https://your-project.supabase.co
ENV SUPABASE_ANON_KEY=your-anon-key
```

#### **Node.js Server**
```javascript
require('dotenv').config();
const express = require('express');
const app = express();

// Set window.env for frontend
app.get('/config.js', (req, res) => {
    res.send(`window.env = ${JSON.stringify(process.env)}`);
});
```

## Setup Instructions

### 1. Prerequisites
- Node.js (optional, for local development)
- A Supabase account and project

### 2. Supabase Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Create Database Tables**
   Run the following SQL in your Supabase SQL Editor:

```sql
-- Users table (extends auth.users)
CREATE TABLE public.users (
    id uuid REFERENCES auth.users(id) PRIMARY KEY,
    name text NOT NULL,
    role text NOT NULL DEFAULT 'user',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Categories table
CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Classes table
CREATE TABLE public.classes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    category_id uuid REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Items table
CREATE TABLE public.items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    sku text,
    quantity integer DEFAULT 0,
    price numeric(10,2),
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can only see their own data, admins can see all
CREATE POLICY "Users can view own data" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING ( EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Users can manage own categories" ON public.categories
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all categories" ON public.categories
    FOR ALL USING ( EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Users can manage own classes" ON public.classes
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all classes" ON public.classes
    FOR ALL USING ( EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Users can manage own items" ON public.items
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all items" ON public.items
    FOR ALL USING ( EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    ));

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, name, role)
    VALUES (new.id, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'role');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_categories_user_id ON public.categories(user_id);
CREATE INDEX idx_classes_user_id ON public.classes(user_id);
CREATE INDEX idx_classes_category_id ON public.classes(category_id);
CREATE INDEX idx_items_user_id ON public.items(user_id);
CREATE INDEX idx_items_class_id ON public.items(class_id);
```

3. **Configure Authentication**
   - In Supabase Dashboard, go to Authentication > Settings
   - Enable email authentication
   - Configure your site URL for redirects

### 3. Application Setup

1. **Update Configuration**
   - Open `js/config.js`
   - Replace `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` with your actual Supabase credentials

2. **Run the Application**
   - Simply open `index.html` in a web browser
   - Or use a local server for development:
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js (if you have http-server installed)
     npx http-server
     ```

### 4. First User Setup

1. Register the first user with role "admin"
2. This admin user will be able to see all user inventory data
3. Regular users can only see their own inventory

## Usage

### For Regular Users
1. **Register/Login**: Create an account or login with existing credentials
2. **Create Categories**: Start by creating categories to organize your inventory
3. **Create Classes**: Within each category, create classes for further organization
4. **Add Items**: Add items to specific classes with details like SKU, quantity, and price
5. **View Dashboard**: Monitor your inventory statistics and recent items

### For Admin Users
1. **Access Admin Panel**: Admin users see an additional "Admin" button in navigation
2. **View Summary**: See inventory statistics for all users
3. **View Details**: Click "View Details" to see complete inventory information for specific users

## File Structure

```
inventory-system/
├── index.html              # Main application file
├── css/
│   └── styles.css          # Application styles
├── js/
│   ├── config.js           # Configuration and Supabase setup
│   ├── auth.js             # Authentication logic
│   ├── database.js         # Database operations
│   ├── ui.js               # User interface management
│   └── app.js              # Main application entry point
└── README.md               # This file
```

## Security Features

- **Row Level Security**: Users can only access their own data
- **Admin Access Control**: Admin users can view all data but regular users cannot
- **Input Validation**: Form validation on both client and server side
- **Secure Authentication**: Uses Supabase's secure authentication system

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For issues and questions:
1. Check the troubleshooting section below
2. Create an issue on the repository
3. Contact the development team

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Ensure Supabase URL and keys are correctly configured
   - Check that email authentication is enabled in Supabase

2. **Database Errors**
   - Verify all database tables and policies are created
   - Check RLS policies are correctly configured

3. **Permission Errors**
   - Ensure user roles are set correctly
   - Verify admin users have proper permissions

4. **UI Not Loading**
   - Check browser console for JavaScript errors
   - Ensure all files are in correct locations

### Debug Mode

To enable debug mode, open browser console and look for:
- Authentication status
- Database query results
- Error messages and stack traces
