# Database Setup Guide

## Prerequisites

- Node.js and npm/pnpm installed
- DATABASE_URL environment variable configured in `.env.local`

## Quick Start

The database setup process runs all migration scripts automatically in the correct order.

### Step 1: Ensure Environment Variable is Set

Your `.env.local` file should contain:
```
DATABASE_URL=postgresql://neondb_owner:npg_KugMTsrUe15m@ep-jolly-firefly-ahyc5e2n-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### Step 2: Run the Setup Script

```bash
npm run setup-db
```

Or with pnpm:
```bash
pnpm setup-db
```

### What Gets Created

The setup script runs migrations in this order:

1. **001-create-tables.sql** - Creates all database tables
   - users, customer_profiles, pharmacy_profiles
   - medicines, orders, prescriptions
   - And more...

2. **002-004, 008, 011-seed-data.sql** - Seeds 120+ medicines with:
   - Real medicine names and details
   - Proper categories and manufacturers
   - Pricing and stock information

3. **005-006-create-admin-user.sql** - Creates admin account
   - Email: `speeclo@gmail.com`
   - Password: `Admin@123`

4. **007-add-password-reset-columns.sql** - Password recovery support

5. **009-010-distributor-hierarchy.sql** - Distributor system
   - Multi-level distributor support
   - Supply chain management

## Verifying Setup

After running the setup, you should see:
- ✅ All migration files executed
- ✅ 120+ medicines loaded
- ✅ Admin account created
- ✅ All tables properly configured

## Troubleshooting

### "DATABASE_URL environment variable is not set"
Make sure your `.env.local` file exists in the project root with the DATABASE_URL.

### "Connection refused"
Check that:
1. DATABASE_URL is correct
2. Neon database cluster is running
3. Network connectivity is available

### "Table already exists"
This is normal - the `IF NOT EXISTS` clauses handle this. The script will skip and continue.

## Manual Migration

If you need to run a specific migration:

```bash
psql "$DATABASE_URL" < scripts/001-create-tables.sql
```

## Next Steps

After database setup:
1. Start the development server: `npm run dev`
2. Open http://localhost:3000
3. Login as admin: speeclo@gmail.com / Admin@123
4. View 120+ medicines on the medicines page

## Additional Commands

Add these to your `package.json` scripts section if not already present:

```json
{
  "scripts": {
    "setup-db": "node scripts/setup-db.js"
  }
}
