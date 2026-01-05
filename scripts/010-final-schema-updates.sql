-- Add missing columns if they don't exist
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS verified_by INTEGER REFERENCES users(id);
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create an index for prescription lookups
CREATE INDEX IF NOT EXISTS idx_prescriptions_customer ON prescriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON prescriptions(status);

-- Add updated_at to important tables if missing
ALTER TABLE pharmacy_profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE distributor_profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to pharmacy_profiles
DROP TRIGGER IF EXISTS update_pharmacy_profiles_updated_at ON pharmacy_profiles;
CREATE TRIGGER update_pharmacy_profiles_updated_at
  BEFORE UPDATE ON pharmacy_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to distributor_profiles
DROP TRIGGER IF EXISTS update_distributor_profiles_updated_at ON distributor_profiles;
CREATE TRIGGER update_distributor_profiles_updated_at
  BEFORE UPDATE ON distributor_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
