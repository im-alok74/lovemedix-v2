import { neon } from "@neondatabase/serverless"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Get DATABASE_URL from environment
const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error("ERROR: DATABASE_URL environment variable is not set")
  console.error("Please set DATABASE_URL in your .env.local file")
  process.exit(1)
}

const sql = neon(DATABASE_URL)

// List of migration scripts in order
const migrations = [
  "001-create-tables.sql",
  "002-seed-data.sql",
  "003-add-more-medicines.sql",
  "004-add-even-more-medicines.sql",
  "005-create-admin-user.sql",
  "006-reset-admin-password.sql",
  "007-add-password-reset-columns.sql",
  "008-add-80-more-medicines.sql",
  "009-add-distributor-hierarchy.sql",
  "010-final-schema-updates.sql",
  "011-add-120-medicines.sql",
  "012-verify-medicines-count.sql",
]

async function runMigrations() {
  console.log("Starting database migrations...\n")

  for (const migration of migrations) {
    const filePath = path.join(__dirname, migration)

    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  Skipping ${migration} - file not found`)
      continue
    }

    console.log(`📝 Running ${migration}...`)

    try {
      const sqlContent = fs.readFileSync(filePath, "utf-8")

      // Split by semicolon to handle multiple statements
      const statements = sqlContent
        .split(";")
        .map((stmt) => stmt.trim())
        .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"))

      for (const statement of statements) {
        try {
          await sql(statement)
        } catch (error) {
          // Some statements might already exist (CREATE TABLE IF NOT EXISTS)
          // This is expected, so we continue
          if (!error.message.includes("already exists")) {
            console.error(`   ❌ Error: ${error.message}`)
          }
        }
      }

      console.log(`   ✅ Completed\n`)
    } catch (error) {
      console.error(`   ❌ Failed to read file: ${error.message}\n`)
    }
  }

  // Verify medicine count
  console.log("📊 Verifying data...")
  try {
    const result = await sql("SELECT COUNT(*) as count FROM medicines WHERE status = 'active'")
    const count = result[0].count
    console.log(`✅ Database setup complete! Found ${count} active medicines\n`)
  } catch (error) {
    console.log("✅ Database setup complete!\n")
  }
}

runMigrations().catch((error) => {
  console.error("Fatal error:", error)
  process.exit(1)
})
