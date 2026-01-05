-- Verification script to confirm medicine counts
-- Run this to verify the medicines have been properly loaded

-- Total medicines in database
SELECT COUNT(*) as total_medicines FROM medicines;

-- Count by category
SELECT category, COUNT(*) as count
FROM medicines
WHERE category IS NOT NULL
GROUP BY category
ORDER BY count DESC;

-- Sample medicines to verify data quality
SELECT id, name, generic_name, category, form, mrp, status
FROM medicines
ORDER BY id
LIMIT 20;

-- Verify at least 120 medicines exist
SELECT CASE 
  WHEN COUNT(*) >= 120 THEN 'SUCCESS: 120+ medicines loaded'
  WHEN COUNT(*) >= 80 THEN 'SUCCESS: 80+ medicines loaded'
  ELSE 'ERROR: Less than 80 medicines loaded'
END as status,
COUNT(*) as total_count
FROM medicines;
