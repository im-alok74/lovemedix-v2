# LoveMedix Platform - Deployment Guide

## Overview
LoveMedix is a complete healthcare medicine delivery platform with admin dashboard, pharmacy management, distributor system, and prescription handling.

## Prerequisites
- Node.js 18+
- PostgreSQL database (Neon recommended)
- Git

## Environment Variables
Set these in your Vercel project:

```
DATABASE_URL=postgresql://user:password@host/database
NODE_ENV=production
```

## Database Setup

1. **Run Migration Scripts** (in order):
   - `scripts/001-create-tables.sql` - Creates all tables
   - `scripts/009-add-distributor-hierarchy.sql` - Adds distributor features
   - `scripts/010-final-schema-updates.sql` - Final optimizations

2. **Create Admin User**:
   - The admin account is already set in `scripts/005-create-admin-user.sql`
   - Email: `speeclo@gmail.com`
   - You can update the password hash in the script if needed

3. **Seed Medicines** (optional):
   - Run `scripts/002-seed-data.sql` and subsequent medicine scripts

## Application Structure

### Admin Panel (`/admin`)
- **Dashboard**: Platform analytics and KPIs
- **Medicines**: Add, edit, delete medicines
- **Pharmacies**: Verify and manage pharmacy registrations
- **Distributors**: Multi-level distributor management
- **Stock Management**: Monitor inventory across network
- **Prescriptions**: Review and verify customer prescriptions
- **Orders**: Track all platform orders
- **Users**: Manage user accounts

### Pharmacy Portal (`/pharmacy`)
- **Dashboard**: Order statistics and revenue
- **Prescriptions**: Access verified customer prescriptions
- **Inventory**: Manage medicine stock
- **Orders**: Process customer orders

### Customer Portal (`/`)
- **Browse Medicines**: Search and view medicine catalog
- **Upload Prescriptions**: Upload and track prescriptions
- **Place Orders**: Order from verified pharmacies
- **My Orders**: Track order status
- **My Prescriptions**: View uploaded prescriptions

### Distributor Portal (`/distributor`)
- **Inventory**: Manage stock for distribution
- **Orders**: B2B orders from pharmacies
- **Network**: Manage sub-distributors

## Key Features

1. **Multi-Role System**
   - Admin: Platform management and analytics
   - Pharmacy: Medicine inventory and order fulfillment
   - Distributor: Stock supply and B2B operations
   - Customer: Medicine ordering and prescriptions

2. **Prescription Management**
   - Customer uploads prescription image/PDF
   - Admin verifies prescriptions
   - Pharmacies access verified prescriptions
   - Prevents unauthorized medicine sales

3. **Supply Chain**
   - Multi-level distributor hierarchy
   - Distributor inventory management
   - Pharmacy stock tracking
   - Low stock and expiry alerts

4. **Analytics & Reporting**
   - Revenue tracking
   - Order metrics
   - User statistics
   - Stock monitoring

## Deployment Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Database Migrations**
   - Use your database client to run SQL scripts in order
   - Or connect your Neon database to Vercel

3. **Deploy to Vercel**
   ```bash
   vercel deploy
   ```

4. **Access the Application**
   - Admin: `yourdomain.com/admin`
   - Sign in with: `speeclo@gmail.com` and your admin password

## Security Notes

- All passwords are bcrypt hashed
- Session tokens stored in secure HTTP-only cookies
- Admin routes protected with role-based access control
- Row-level data access by user type

## Support

For issues or questions, check the codebase for inline documentation or contact support.

## License

This project is proprietary and built for LoveMedix.
