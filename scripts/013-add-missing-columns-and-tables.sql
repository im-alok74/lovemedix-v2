-- Add missing columns to distributor_profiles for multi-level hierarchy
ALTER TABLE distributor_profiles ADD COLUMN IF NOT EXISTS parent_distributor_id INTEGER REFERENCES distributor_profiles(id) ON DELETE SET NULL;
ALTER TABLE distributor_profiles ADD COLUMN IF NOT EXISTS hierarchy_level INTEGER DEFAULT 1;

-- Create medicine_categories table
CREATE TABLE IF NOT EXISTS medicine_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(255),
  display_order INTEGER DEFAULT 0,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create distributor_inventory table for distributor stock management
CREATE TABLE IF NOT EXISTS distributor_inventory (
  id SERIAL PRIMARY KEY,
  distributor_id INTEGER REFERENCES distributor_profiles(id) ON DELETE CASCADE,
  medicine_id INTEGER REFERENCES medicines(id) ON DELETE CASCADE,
  stock_quantity INTEGER DEFAULT 0,
  unit_price DECIMAL(10, 2) NOT NULL,
  batch_number VARCHAR(100),
  expiry_date DATE,
  reorder_level INTEGER DEFAULT 50,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(distributor_id, medicine_id, batch_number)
);

-- Create policy_pages table for Privacy Policy, Terms of Service, etc.
CREATE TABLE IF NOT EXISTS policy_pages (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create admin_settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(255) UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type VARCHAR(50) DEFAULT 'string',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update medicines table to include category_id instead of just category string
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES medicine_categories(id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_distributor_parent ON distributor_profiles(parent_distributor_id);
CREATE INDEX IF NOT EXISTS idx_distributor_hierarchy ON distributor_profiles(hierarchy_level);
CREATE INDEX IF NOT EXISTS idx_distributor_inventory ON distributor_inventory(distributor_id);
CREATE INDEX IF NOT EXISTS idx_medicine_categories ON medicine_categories(name);
CREATE INDEX IF NOT EXISTS idx_policy_pages ON policy_pages(slug);
