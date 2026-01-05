-- Add parent distributor support for multi-level distributor management
ALTER TABLE distributor_profiles ADD COLUMN IF NOT EXISTS parent_distributor_id INTEGER REFERENCES distributor_profiles(id) ON DELETE SET NULL;
ALTER TABLE distributor_profiles ADD COLUMN IF NOT EXISTS hierarchy_level INTEGER DEFAULT 1;

-- Create distributor inventory table
CREATE TABLE IF NOT EXISTS distributor_inventory (
  id SERIAL PRIMARY KEY,
  distributor_id INTEGER REFERENCES distributor_profiles(id) ON DELETE CASCADE,
  medicine_id INTEGER REFERENCES medicines(id) ON DELETE CASCADE,
  stock_quantity INTEGER DEFAULT 0,
  cost_price DECIMAL(10, 2) NOT NULL,
  selling_price DECIMAL(10, 2) NOT NULL,
  batch_number VARCHAR(100),
  expiry_date DATE,
  warehouse_location VARCHAR(255),
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(distributor_id, medicine_id, batch_number)
);

-- Create distributor orders table for B2B orders to pharmacies
CREATE TABLE IF NOT EXISTS distributor_orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  from_distributor_id INTEGER REFERENCES distributor_profiles(id) ON DELETE CASCADE,
  to_distributor_or_pharmacy_id INTEGER,
  is_pharmacy_order BOOLEAN DEFAULT true,
  order_status VARCHAR(20) DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  subtotal DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  delivery_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create distributor order items table
CREATE TABLE IF NOT EXISTS distributor_order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES distributor_orders(id) ON DELETE CASCADE,
  medicine_id INTEGER REFERENCES medicines(id),
  quantity INTEGER NOT NULL,
  cost_price DECIMAL(10, 2) NOT NULL,
  selling_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_distributor_inventory_distributor ON distributor_inventory(distributor_id);
CREATE INDEX IF NOT EXISTS idx_distributor_orders_from ON distributor_orders(from_distributor_id);
CREATE INDEX IF NOT EXISTS idx_distributor_profiles_parent ON distributor_profiles(parent_distributor_id);
