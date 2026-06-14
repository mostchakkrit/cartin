<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Cartin — Agent Guide

## Project overview

**Cartin** คือเว็บ e-commerce สำหรับเสื้อผ้าและเครื่องประดับ สร้างด้วย Next.js 16 (App Router) + TypeScript + PostgreSQL (Prisma 7) + NextAuth.js 4

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 |
| Database ORM | Prisma 7 (prisma-client-js) |
| Database | PostgreSQL |
| Auth | NextAuth.js v4 (Credentials provider, JWT) |
| State | Zustand (`hooks/useCart.ts`) |
| Toast | react-hot-toast |
| Icons | @heroicons/react v2 |

---

## Critical: Prisma 7 differences

Prisma 7 เปลี่ยนวิธีเชื่อมต่อ database ใหม่ทั้งหมด — ต่างจาก Prisma 5/6 มาก

### Schema — ห้ามใส่ `url`

```prisma
// CORRECT (Prisma 7)
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]  // ← ต้องมี
}

datasource db {
  provider = "postgresql"
  // ไม่มี url — Prisma 7 ลบออกแล้ว (error P1012 ถ้าใส่)
}
```

### Runtime — ต้องใช้ Driver Adapter เสมอ

`new PrismaClient()` เปล่าๆ ไม่ได้ — จะ error ทุกครั้ง  
ต้องส่ง `adapter` เข้าไป:

```ts
// lib/prisma.ts
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });
```

### `prisma.config.ts` — ใช้กับ CLI เท่านั้น

`prisma.config.ts` กำหนด URL สำหรับ CLI commands (`migrate`, `generate`, `db seed`) เท่านั้น — **ไม่ส่งผลต่อ runtime app**

### Seed — ต้องกำหนดใน `prisma.config.ts`

```ts
// prisma.config.ts
export default defineConfig({
  migrations: {
    seed: "tsx prisma/seed.ts",  // ← ระบุ seed command ที่นี่
  },
  datasource: { url: process.env["DATABASE_URL"] },
});
```

รัน seed ด้วย: `npx prisma db seed`  
(ห้ามรัน `ts-node prisma/seed.ts` ตรงๆ — จะหา URL ไม่เจอ)

After changing `schema.prisma` always run: `npx prisma generate`

---

## Critical: Next.js 16 differences

Next.js 16 uses the App Router exclusively. Check `node_modules/next/dist/docs/` before writing route handlers or middleware. Key points:

- Route handlers live at `app/api/**/route.ts` — export named `GET`, `POST`, `PUT`, `DELETE`
- `params` in dynamic routes are `Promise<{ id: string }>` in Next.js 15+ — await them if types complain
- `"use client"` is required on any component that uses hooks, browser APIs, or event handlers
- Server Components can call `prisma` directly — no `fetch` needed

---

## Environment variables

File: `.env` (never commit this)

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/cartin"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-in-production"
```

---

## Database setup

```bash
# First time
npx prisma migrate dev --name init

# Seed sample data (8 products, 6 categories, 1 admin, 1 user)
npm run db:seed

# Open Prisma Studio
npm run db:studio
```

Seed accounts:
- Admin: `admin@cartin.com` / `admin1234`
- User: `user@cartin.com` / `user1234`

---

## Project structure

```
cartin/
├── app/
│   ├── layout.tsx               # Root layout — wraps with <Providers> (SessionProvider + Toaster)
│   ├── page.tsx                 # Home: Hero, category grid, featured products (Server Component)
│   ├── providers.tsx            # Client-side providers
│   ├── products/
│   │   ├── page.tsx             # Product listing — client, fetch /api/products
│   │   └── [slug]/page.tsx      # Product detail + reviews — client
│   ├── cart/page.tsx            # Cart — client, uses useCart hook
│   ├── checkout/page.tsx        # Checkout form — client, POST /api/orders
│   ├── orders/
│   │   ├── page.tsx             # Order history — client
│   │   └── [id]/page.tsx        # Order detail + status tracker — client
│   ├── profile/page.tsx         # User profile edit — client
│   ├── search/page.tsx          # Search redirect page
│   ├── login/page.tsx           # Login form (signIn from next-auth/react)
│   ├── register/page.tsx        # Register form (POST /api/auth/register)
│   └── admin/
│       ├── page.tsx             # Dashboard: stats cards + recent orders
│       ├── products/page.tsx    # CRUD products (modal form + table)
│       ├── categories/page.tsx  # CRUD categories
│       ├── orders/page.tsx      # View all orders, update status inline
│       └── users/page.tsx       # View all users
├── app/api/
│   ├── auth/[...nextauth]/      # NextAuth handler
│   ├── auth/register/           # POST — create user (public)
│   ├── products/                # GET (public), POST (admin)
│   ├── products/[id]/           # GET (public), PUT/DELETE (admin)
│   ├── categories/              # GET (public), POST (admin)
│   ├── categories/[id]/         # PUT/DELETE (admin)
│   ├── cart/                    # GET, POST, DELETE — requires auth
│   ├── cart/[itemId]/           # PUT (update quantity) — requires auth
│   ├── orders/                  # GET, POST — requires auth
│   ├── orders/[id]/             # GET, PUT (status) — requires auth/admin
│   ├── reviews/                 # POST — requires auth
│   ├── users/profile/           # GET, PUT — requires auth
│   └── admin/
│       ├── stats/               # GET — admin only
│       └── users/               # GET — admin only
├── components/
│   ├── Navbar.tsx               # Sticky nav, cart badge, user menu dropdown
│   ├── Footer.tsx               # 4-column footer
│   └── ProductCard.tsx          # Card with add-to-cart button
├── hooks/
│   └── useCart.ts               # Zustand store: items, fetchCart, addToCart, updateQuantity, removeItem, clearCart
├── lib/
│   ├── prisma.ts                # Singleton PrismaClient
│   └── auth.ts                  # NextAuth authOptions (CredentialsProvider)
├── types/
│   └── next-auth.d.ts           # Session type augmentation (adds id, role)
├── prisma/
│   ├── schema.prisma            # Models: User, Category, Product, Cart, CartItem, Order, OrderItem, Review
│   └── seed.ts                  # Seed script
└── prisma.config.ts             # Prisma 7 config (datasource URL)
```

---

## Data models (summary)

| Model | Key fields |
|---|---|
| `User` | id, email, password (bcrypt), name, role (USER/ADMIN) |
| `Category` | id, name, slug, image (emoji) |
| `Product` | id, name, slug, price, comparePrice, images[], sizes[], colors[], stock, isActive, isFeatured |
| `Cart` | 1-to-1 with User, has many CartItems |
| `CartItem` | cartId, productId, quantity, size, color — unique on (cartId, productId, size, color) |
| `Order` | userId, status (PENDING→DELIVERED), paymentStatus, shippingAddress (JSON), total |
| `OrderItem` | orderId, productId, quantity, price (snapshot), size, color |
| `Review` | userId, productId, rating (1-5), comment — unique on (userId, productId) |

---

## Auth rules

- `session.user.role` is `"ADMIN"` or `"USER"`
- Admin-only routes check `session.user.role !== "ADMIN"` and return 401
- Client pages redirect to `/login` if `status === "unauthenticated"`
- Middleware is **not** used — auth is checked per-route with `getServerSession(authOptions)`

---

## Theme

Blue & white throughout:
- Primary: `blue-700` (#1d4ed8) — buttons, links, accents
- Dark: `blue-900` — footer, navbar
- Light: `blue-50` — section backgrounds, card highlights
- Text: `slate-800` — headings, `gray-500` — secondary
- Rounded corners: `rounded-xl` (cards), `rounded-2xl` (larger panels)

---

## Cart state

`useCart` (Zustand) lives in `hooks/useCart.ts`. It fetches from `/api/cart` and keeps `items`, `itemCount`, `total` in sync. Call `fetchCart()` on mount when user is authenticated. The Navbar reads `itemCount` for the badge.

---

## History tracking (บังคับทำทุกครั้ง)

**ทุกครั้งที่แก้ไขหรือเพิ่มอะไรในโปรเจคนี้ ต้องบันทึกลง `HISTORY.md` ด้วยเสมอ** ก่อน commit หรือก่อนสิ้นสุด session

### รูปแบบที่ต้องเพิ่มใน HISTORY.md

เพิ่ม session ใหม่ต่อท้ายไฟล์ในรูปแบบนี้:

```markdown
## Session N — YYYY-MM-DD

### สิ่งที่เปลี่ยนแปลง

- **[ประเภท]** คำอธิบายสั้นๆ ว่าทำอะไร
  - รายละเอียดเพิ่มเติม (ถ้ามี)

### ไฟล์ที่แก้ไข

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `path/to/file.ts` | เพิ่ม / แก้ไข / ลบ — อธิบายสั้นๆ |

### สิ่งที่ยังค้าง (ถ้ามี)

- [ ] งานที่ยังไม่เสร็จ
```

### ประเภทการเปลี่ยนแปลง (ใช้ label เหล่านี้)

| Label | ใช้เมื่อ |
|---|---|
| `[Feature]` | เพิ่มฟีเจอร์ใหม่ |
| `[Fix]` | แก้ bug |
| `[Schema]` | แก้ไข database schema |
| `[API]` | เพิ่ม/แก้ API route |
| `[UI]` | แก้ไข page หรือ component |
| `[Config]` | แก้ไข config, env, package.json |
| `[Refactor]` | ปรับโค้ดโดยไม่เปลี่ยน behavior |
| `[Docs]` | แก้ไข AGENTS.md, HISTORY.md หรือ docs อื่น |

### สิ่งที่ต้องระวัง

- ถ้าแก้ `schema.prisma` → บันทึกว่า model ไหนเปลี่ยนอะไร และ migration name คืออะไร
- ถ้าเพิ่ม API route → อัปเดตตาราง API ใน AGENTS.md ด้วย
- ถ้าเพิ่ม page ใหม่ → อัปเดตตาราง Pages ใน AGENTS.md ด้วย
- ถ้าเปลี่ยน business logic (เช่น free shipping threshold) → ระบุค่าเก่าและค่าใหม่ใน HISTORY.md

---

## Dev commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run db:push      # Push schema without migration (quick dev)
npm run db:migrate   # Create + apply migration
npm run db:seed      # Seed sample data
npm run db:studio    # Prisma Studio GUI
npx prisma generate  # Regenerate client after schema changes
```

---

## Common patterns

**Adding a new API route** — always check auth first:
```ts
const session = await getServerSession(authOptions);
if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
```

**Adding a new page** — use `"use client"` + redirect if not authenticated:
```ts
useEffect(() => {
  if (status === "unauthenticated") router.push("/login");
}, [status]);
```

**Adding a new Prisma model** — edit `schema.prisma`, then:
```bash
npx prisma migrate dev --name add_<model>
npx prisma generate
```

---

## Known constraints

- Free shipping threshold: ฿1,000 (hard-coded in `/api/orders/route.ts` and cart page)
- Shipping cost when below threshold: ฿50
- Product images are URL strings (no file upload) — use direct image URLs
- `slug` for products is auto-generated from name + timestamp on creation; edit via PUT is allowed
- Reviews are upserted — one review per user per product (update if already reviewed)
