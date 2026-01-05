# LoveMedix - Medicine Delivery Platform

A comprehensive healthcare platform for medicine delivery with admin dashboard, pharmacy management, distributor network, and prescription handling.

## Features

### For Customers
- Browse and search medicines
- Upload prescriptions for verification
- Place orders from verified pharmacies
- Track orders and delivery
- View prescription history

### For Pharmacies
- Inventory management
- Access verified prescriptions for order fulfillment
- Manage orders and deliveries
- Track sales and revenue
- Multi-pharmacy support

### For Distributors
- Multi-level distributor hierarchy
- Inventory management and distribution
- B2B orders to pharmacies
- Supply chain tracking

### For Admins
- Comprehensive dashboard with analytics
- Medicine catalog management (add/edit/delete)
- Pharmacy registration and verification
- Distributor network management
- Prescription verification workflow
- Order tracking and reporting
- Stock and inventory monitoring
- User management

## Technology Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Neon)
- **Authentication**: Custom session-based with bcrypt
- **Charts**: Recharts for analytics

## Quick Start

1. **Clone and Install**
   ```bash
   git clone <repo>
   cd lovemedix
   npm install
   ```

2. **Setup Database**
   - Create PostgreSQL database
   - Run migration scripts from `/scripts` folder
   - Configure `DATABASE_URL` environment variable

3. **Start Development**
   ```bash
   npm run dev
   ```

4. **Admin Login**
   - Email: `speeclo@gmail.com`
   - Access: `/admin`

## Project Structure

```
app/
├── admin/              # Admin dashboard and management
├── pharmacy/           # Pharmacy portal
├── distributor/        # Distributor dashboard
├── prescriptions/      # Customer prescriptions
├── api/               # API endpoints
└── ...

components/
├── admin/             # Admin components
├── ui/                # UI components (shadcn)
└── ...

lib/
├── auth.ts            # Authentication logic
├── db.ts              # Database connection
└── utils.ts           # Utilities

scripts/
└── *.sql              # Database migrations
```

## Key Pages

- `/` - Home/browsing
- `/admin` - Admin dashboard
- `/admin/medicines` - Medicine management
- `/admin/pharmacies` - Pharmacy management
- `/admin/distributors` - Distributor management
- `/admin/prescriptions` - Prescription verification
- `/admin/stock` - Stock management
- `/admin/orders` - Order management
- `/pharmacy/dashboard` - Pharmacy dashboard
- `/pharmacy/prescriptions` - Access to verified prescriptions
- `/pharmacy/inventory` - Inventory management
- `/prescriptions` - Customer prescriptions
- `/upload-prescription` - Upload prescription

## Database Schema

- **users** - All user accounts (customer, pharmacy, distributor, admin)
- **pharmacy_profiles** - Pharmacy registration data
- **distributor_profiles** - Distributor information with hierarchy
- **medicines** - Medicine catalog
- **pharmacy_inventory** - Pharmacy stock levels
- **distributor_inventory** - Distributor stock levels
- **prescriptions** - Customer prescriptions (with verification status)
- **orders** - Customer orders
- **sessions** - User sessions

## Security Features

- Password hashing with bcrypt
- Secure session management
- HTTP-only cookies
- Role-based access control
- Input validation and sanitization

## Deployment

See `DEPLOYMENT_GUIDE.md` for detailed deployment instructions.

## License

Proprietary - LoveMedix Platform
