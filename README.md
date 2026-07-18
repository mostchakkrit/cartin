# Cartin 🛍️

E-commerce web application for fashion and accessories, built as a full-stack portfolio project.

**Live Demo → [cartin.vercel.app](https://cartin.vercel.app)**

---

## Features

### User
- Browse products with category filter, search, and sort
- Product detail with image gallery and size/color selection
- Shopping cart with quantity management
- Checkout with saved addresses and payment methods (auto-fill)
- Order tracking with 5-step status timeline
- Write and edit reviews (one per product)
- Manage saved shipping addresses (CRUD + default)
- Manage saved payment methods (CRUD + default)
- Profile management (name, phone, address)
- Contact form

### Admin
- Dashboard with sales stats (revenue, orders, users, products)
- Full CRUD for products and categories
- Category delete cascades to all related products, reviews, and cart items
- Emoji picker + cover image URL for category icons
- Order management with status updates (PENDING → CONFIRMED → SHIPPED → DELIVERED)
- User list

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL via [Neon](https://neon.tech) (serverless) |
| ORM | Prisma 7 with `@prisma/adapter-neon` |
| Auth | NextAuth.js v4 (JWT, CredentialsProvider) |
| State | Zustand |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database (free tier works)

### Installation

```bash
git clone https://github.com/mostchakkrit/cartin.git
cd cartin
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret-key"
```

Generate a secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### Database Setup

```bash
# Run migrations
npx prisma migrate dev

# Seed sample data (2 users, 6 categories, 16 products)
npx prisma db seed
```

Seed accounts:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@cartin.com` | `admin1234` |
| User | `user@cartin.com` | `user1234` |

### Run Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
cartin/
├── app/
│   ├── page.tsx              # Home — Hero, categories, featured products
│   ├── products/             # Listing & product detail + reviews
│   ├── cart/                 # Shopping cart
│   ├── checkout/             # Checkout with saved addresses/payments
│   ├── orders/               # Order history & 5-step tracker
│   ├── profile/              # User profile
│   ├── addresses/            # Saved shipping addresses
│   ├── payment-methods/      # Saved payment methods
│   ├── search/               # Search redirect
│   ├── contact/              # Contact form
│   ├── login/ register/      # Auth pages
│   ├── admin/                # Dashboard, products, categories, orders, users
│   └── api/                  # All API routes
├── components/
│   ├── Navbar.tsx            # Sticky nav, cart badge, user dropdown
│   ├── Footer.tsx
│   ├── ProductCard.tsx       # Image crossfade, slide-up cart button
│   ├── CategorySlider.tsx    # Horizontal scroll with arrow buttons
│   └── ThaiAddressSelect.tsx # Province/district/subdistrict selector
├── hooks/
│   └── useCart.ts            # Zustand cart store
├── lib/
│   ├── prisma.ts             # PrismaClient singleton (Neon adapter)
│   └── auth.ts               # NextAuth config
└── prisma/
    ├── schema.prisma
    └── seed.ts
```

---

## Database Schema

| Model | Key Fields |
|---|---|
| `User` | id, email, password (bcrypt), name, role (USER/ADMIN) |
| `Category` | id, name, slug, image (emoji), coverImage (URL) |
| `Product` | id, name, slug, price, comparePrice, images[], sizes[], colors[], stock, categoryId |
| `Cart` / `CartItem` | 1-to-1 with User; items have quantity, size, color |
| `Order` / `OrderItem` | status enum, shippingAddress (JSON), price snapshot per item |
| `Review` | rating 1-5, unique per (userId, productId) |
| `SavedAddress` | label, name, phone, full Thai address, isDefault |
| `SavedPaymentMethod` | type, accountName, accountNumber, isDefault |
| `ContactMessage` | name, email, message, optional userId |

---

## Key Commands

```bash
npm run dev          # Dev server
npm run build        # Production build (runs prisma generate first)
npx prisma db seed   # Seed sample data
npx prisma studio    # Prisma Studio GUI
```

---

## License

MIT
