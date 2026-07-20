# Cartin — ประวัติการพัฒนา

## Session 1 — 2026-06-13

### สิ่งที่สร้างในเซสชันนี้

สร้างโปรเจค **cartin** ตั้งแต่ต้นจนเสร็จสมบูรณ์ในครั้งเดียว

---

### 1. ตั้งค่าโปรเจค

- สร้าง Next.js 16 (App Router, TypeScript) ด้วย `create-next-app`
- ติดตั้ง dependencies: `prisma`, `@prisma/client`, `next-auth`, `bcryptjs`, `zustand`, `react-hot-toast`, `@heroicons/react`, `clsx`, `ts-node`, `dotenv`
- Init Prisma 7 → ได้ `prisma.config.ts` + `prisma/schema.prisma`
- แก้ `schema.prisma` ให้ใช้ `prisma-client-js` และ **ไม่มี `url` ใน datasource** (Prisma 7 ใช้ `prisma.config.ts` แทน)
- รัน `npx prisma generate` สำเร็จ

---

### 2. Database Schema (`prisma/schema.prisma`)

สร้าง 8 models:

| Model | หน้าที่ |
|---|---|
| `User` | ผู้ใช้ — role USER/ADMIN, password bcrypt |
| `Category` | หมวดหมู่สินค้า — slug unique |
| `Product` | สินค้า — images[], sizes[], colors[], stock, isFeatured |
| `Cart` | ตะกร้า — 1-to-1 กับ User |
| `CartItem` | รายการในตะกร้า — unique (cartId, productId, size, color) |
| `Order` | คำสั่งซื้อ — shippingAddress JSON, status enum |
| `OrderItem` | รายการในออเดอร์ — snapshot ราคา ณ เวลาซื้อ |
| `Review` | รีวิว — unique (userId, productId), upsert |

Enums: `Role`, `OrderStatus`, `PaymentStatus`

---

### 3. Authentication (`lib/auth.ts`)

- NextAuth.js v4 — CredentialsProvider
- Verify password ด้วย `bcrypt.compare`
- JWT strategy — เก็บ `id` และ `role` ใน token และ session
- Custom sign-in page: `/login`
- Type augmentation: `types/next-auth.d.ts` (เพิ่ม `id`, `role` ใน Session)

---

### 4. API Routes (`app/api/`)

| Route | Method | Auth | หน้าที่ |
|---|---|---|---|
| `/api/auth/[...nextauth]` | GET/POST | — | NextAuth handler |
| `/api/auth/register` | POST | — | สมัครสมาชิก |
| `/api/products` | GET | — | ลิสสินค้า (page, limit, category, search, sort, featured) |
| `/api/products` | POST | Admin | เพิ่มสินค้า |
| `/api/products/[id]` | GET | — | รายละเอียดสินค้า + reviews |
| `/api/products/[id]` | PUT/DELETE | Admin | แก้ไข/ลบสินค้า |
| `/api/categories` | GET | — | ลิสหมวดหมู่ |
| `/api/categories` | POST | Admin | เพิ่มหมวดหมู่ |
| `/api/categories/[id]` | PUT/DELETE | Admin | แก้ไข/ลบหมวดหมู่ |
| `/api/cart` | GET | User | ดูตะกร้า (auto-create ถ้าไม่มี) |
| `/api/cart` | POST | User | เพิ่มสินค้าลงตะกร้า |
| `/api/cart` | DELETE | User | ลบรายการ หรือ ล้างตะกร้า |
| `/api/cart/[itemId]` | PUT | User | แก้จำนวน (quantity ≤ 0 = ลบ) |
| `/api/orders` | GET | User/Admin | ดูออเดอร์ (user เห็นของตัวเอง, admin เห็นทั้งหมด) |
| `/api/orders` | POST | User | สร้างออเดอร์จากตะกร้า + clear cart |
| `/api/orders/[id]` | GET | User/Admin | รายละเอียดออเดอร์ |
| `/api/orders/[id]` | PUT | Admin | อัปเดต status/paymentStatus |
| `/api/reviews` | POST | User | เขียนรีวิว (upsert) |
| `/api/users/profile` | GET/PUT | User | ดู/แก้ไขโปรไฟล์ |
| `/api/admin/stats` | GET | Admin | ยอดรวม users, products, orders, revenue |
| `/api/admin/users` | GET | Admin | ลิสผู้ใช้ทั้งหมด |

---

### 5. Pages และ Components

**Components:**
- `components/Navbar.tsx` — sticky, cart badge (จาก Zustand), user dropdown menu, mobile menu
- `components/Footer.tsx` — 4-column footer สีน้ำเงินเข้ม
- `components/ProductCard.tsx` — รูป, ชื่อ, ราคา, discount badge, add-to-cart button

**Pages:**

| Page | Type | หน้าที่ |
|---|---|---|
| `/` | Server Component | Hero banner, category grid, featured products, promo banner |
| `/products` | Client | ลิสสินค้า, ฟิลเตอร์ (category, sort), search, pagination |
| `/products/[slug]` | Client | รายละเอียด, เลือก size/color/qty, add-to-cart, รีวิว |
| `/cart` | Client | ตะกร้า, +/- จำนวน, ลบ, สรุปราคา, free shipping indicator |
| `/checkout` | Client | ฟอร์มที่อยู่, วิธีชำระ, หมายเหตุ, สรุปก่อนยืนยัน |
| `/orders` | Client | ประวัติออเดอร์ทั้งหมด พร้อม status badge |
| `/orders/[id]` | Client | รายละเอียดออเดอร์ + step tracker (5 ขั้น) |
| `/profile` | Client | แก้ไขชื่อ, เบอร์, ที่อยู่ |
| `/search` | Client | search box → redirect ไป /products?search=... |
| `/login` | Client | ฟอร์ม login (NextAuth signIn) |
| `/register` | Client | ฟอร์มสมัครสมาชิก |
| `/admin` | Client | Dashboard: stats cards + recent orders |
| `/admin/products` | Client | CRUD สินค้า (modal form + table) |
| `/admin/categories` | Client | CRUD หมวดหมู่ (modal form + grid cards) |
| `/admin/orders` | Client | ตารางออเดอร์ทั้งหมด + dropdown เปลี่ยน status |
| `/admin/users` | Client | ตารางผู้ใช้ทั้งหมด |

---

### 6. State Management

`hooks/useCart.ts` — Zustand store:
- `items`, `itemCount`, `total`
- `fetchCart()` — GET /api/cart
- `addToCart(productId, qty, size, color)` — POST /api/cart
- `updateQuantity(itemId, qty)` — PUT /api/cart/[itemId]
- `removeItem(itemId)` — DELETE /api/cart?itemId=...
- `clearCart()` — DELETE /api/cart

---

### 7. Seed Data (`prisma/seed.ts`)

รัน `npm run db:seed` จะได้:
- **6 หมวดหมู่**: เสื้อผ้าผู้หญิง, ผู้ชาย, เครื่องประดับ, ลำลอง, ทำงาน, ออกกำลัง
- **8 สินค้าตัวอย่าง** พร้อมรูปจาก Unsplash
- **Admin**: `admin@cartin.com` / `admin1234`
- **User**: `user@cartin.com` / `user1234`

---

### 8. Business Logic สำคัญ

- **Free shipping** เมื่อยอดซื้อ ≥ ฿1,000 (hard-coded ใน `/api/orders/route.ts`)
- **Shipping cost** ฿50 เมื่อต่ำกว่า ฿1,000
- **Stock check** แสดง "หมดสต็อก" เมื่อ stock = 0
- **Discount badge** คำนวณ % จาก `comparePrice` vs `price`
- **avgRating** คำนวณ real-time จาก reviews ทุกครั้งที่ GET products

---

### 9. ไฟล์ Config สำคัญ

| ไฟล์ | หน้าที่ |
|---|---|
| `.env` | DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET |
| `prisma.config.ts` | Prisma 7 datasource config (อ่าน DATABASE_URL) |
| `prisma/schema.prisma` | Database schema (ไม่มี url ใน datasource) |
| `app/providers.tsx` | SessionProvider + Toaster wrapper |
| `app/layout.tsx` | Root layout — import Navbar, Footer, Providers |
| `AGENTS.md` | คู่มือสำหรับ AI agent / developer ใหม่ |

---

### 10. สิ่งที่ยังไม่ได้ทำ (TODO)

- [ ] รัน `npx prisma migrate dev --name init` จริงๆ (ต้องมี PostgreSQL รันอยู่)
- [ ] รัน `npm run db:seed` เพื่อใส่ข้อมูลตัวอย่าง
- [ ] ทดสอบ flow ทั้งหมดใน browser
- [ ] อัปโหลดรูปภาพจริง (ปัจจุบันใช้ URL จาก Unsplash)
- [ ] ระบบ payment gateway จริง (ปัจจุบัน mock)
- [ ] Email notification เมื่อสั่งซื้อ
- [ ] Wishlist / บันทึกสินค้าโปรด
- [ ] Coupon / discount code
- [ ] Deploy (Vercel + Supabase/Neon)

---

## วิธีเริ่มต้นใหม่ (ใน terminal/chat ใหม่)

```bash
# 1. เปิด terminal ไปที่โปรเจค
cd F:\comeback2026\cartin

# 2. ตรวจสอบ .env ว่าถูกต้อง
cat .env

# 3. ถ้ายังไม่มี database
npx prisma migrate dev --name init
npm run db:seed

# 4. รันโปรเจค
npm run dev
# → http://localhost:3000
```

อ่าน `AGENTS.md` สำหรับรายละเอียด architecture และ convention ทั้งหมด

---

## Session 2 — 2026-06-13

### สิ่งที่เปลี่ยนแปลง

- **[Docs]** เขียน `AGENTS.md` ฉบับสมบูรณ์ — คู่มือสำหรับ AI agent และ developer ใหม่
- **[Docs]** สร้าง `HISTORY.md` ไฟล์นี้ — บันทึกประวัติการพัฒนาทุก session
- **[Docs]** เพิ่มกฎ History Tracking ใน `AGENTS.md` — บังคับให้บันทึก HISTORY.md ทุกครั้งที่แก้ไขโปรเจค

### ไฟล์ที่แก้ไข

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `AGENTS.md` | เขียนใหม่ทั้งหมด + เพิ่มหมวด "History tracking" พร้อม format และ label |
| `HISTORY.md` | สร้างใหม่ — บันทึก Session 1 และ Session 2 |

---

## Session 3 — 2026-06-14

### สิ่งที่เปลี่ยนแปลง

- **[Config]** เชื่อมต่อ Neon PostgreSQL (production database) — อัปเดต `.env` ด้วย connection string จริง
- **[Config]** ค้นพบว่า Prisma 7 เปลี่ยน architecture ใหม่ทั้งหมด — `url` ใน `schema.prisma` ถูกลบออกแล้ว ต้องใช้ driver adapter แทน
- **[Config]** ติดตั้ง `@neondatabase/serverless` + `@prisma/adapter-neon` สำหรับ Prisma 7 runtime
- **[Config]** เพิ่ม `previewFeatures = ["driverAdapters"]` ใน `schema.prisma` generator
- **[Config]** อัปเดต `prisma.config.ts` — เพิ่ม `migrations.seed = "tsx prisma/seed.ts"`
- **[Config]** ติดตั้ง `tsx` แทน `ts-node` (ทำงานกับ Prisma 7 ได้ดีกว่า)
- **[Config]** รัน `prisma migrate dev --name init` สำเร็จ — สร้างตารางทั้งหมดใน Neon
- **[Config]** รัน `prisma db seed` สำเร็จ — มีข้อมูลตัวอย่างใน Neon แล้ว

### ไฟล์ที่แก้ไข

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `.env` | เปลี่ยน `DATABASE_URL` เป็น Neon connection string |
| `prisma/schema.prisma` | เพิ่ม `previewFeatures = ["driverAdapters"]`, ลบ `url` ออกจาก datasource |
| `prisma.config.ts` | เพิ่ม `migrations.seed = "tsx prisma/seed.ts"` |
| `prisma/seed.ts` | ใช้ `PrismaNeon` adapter แทน `new PrismaClient()` ตรงๆ |
| `lib/prisma.ts` | ใช้ `PrismaNeon` adapter — runtime client เชื่อมต่อผ่าน adapter |

### Prisma 7 Key Learnings

> **สำคัญมาก** — Prisma 7 เปลี่ยนวิธีเชื่อมต่อ database ใหม่ทั้งหมด:
> - `url = env("DATABASE_URL")` ใน `schema.prisma` **ใช้ไม่ได้แล้ว** (error P1012)
> - `prisma.config.ts` ใช้สำหรับ CLI commands เท่านั้น (migrate, generate, seed)
> - Runtime `PrismaClient` ต้องรับ `adapter` เสมอ — ไม่สามารถ `new PrismaClient()` เปล่าได้
> - ต้องใช้ `previewFeatures = ["driverAdapters"]` ใน schema generator

### สถานะ Database (Neon)

- ✅ Migration: `20260613170312_init` — สร้างตารางครบทั้งหมด
- ✅ Seed: 2 users (admin + user), 6 categories, 8 products

---

## Session 4 — 2026-06-14

### สิ่งที่เปลี่ยนแปลง

- **[Fix]** แก้ title หน้า `/products?group=clothing` — เพิ่มคำว่า "หมวด:" นำหน้า ให้เป็น "หมวด: เสื้อผ้าทั้งหมด" (ก่อนหน้าขาดคำว่า "หมวด")

### ไฟล์ที่แก้ไข

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `app/products/page.tsx` | เปลี่ยน `"เสื้อผ้าทั้งหมด"` → `"หมวด: เสื้อผ้าทั้งหมด"` ในบรรทัด h1 |
| `app/products/page.tsx` | เพิ่ม `group` ใน dependency array ของ useEffect ที่ fetch สินค้า |

---

## Session 5 — 2026-06-14

### สิ่งที่เปลี่ยนแปลง

- **[Fix]** แก้หน้าสินค้า (product detail) ขึ้น "ไม่พบสินค้า" เสมอ
  - ปัญหา: `[slug]/page.tsx` fetch ด้วย `?search=${slug}` ซึ่ง search จาก `name` — แต่ slug จริงมี timestamp ต่อท้าย เช่น `white-linen-shirt-1749826064523` จึงหาไม่เจอ
  - แก้: เพิ่ม query param `?slug=` ใน GET `/api/products` เพื่อ filter ด้วย slug ตรงๆ
  - แก้: เปลี่ยน `[slug]/page.tsx` ให้ fetch `?slug=${slug}` แทน `?search=${slug}`

### ไฟล์ที่แก้ไข

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `app/api/products/route.ts` | เพิ่ม `slug` query param — `where.slug = slug` |
| `app/products/[slug]/page.tsx` | เปลี่ยน fetch จาก `?search=${slug}` → `?slug=${slug}` |

---

## Session 6 — 2026-06-14

### สิ่งที่เปลี่ยนแปลง

- **[Fix]** แก้หน้า product detail ที่รูป/ราคา/ตะกร้าไม่แสดง
  - ปัญหา: Next.js 15/16 เปลี่ยน `params` ใน route handler ให้เป็น `Promise<{id: string}>` แต่โค้ดใช้ `params.id` โดยตรงโดยไม่ await → `id` เป็น undefined → `findUnique({ where: { id: undefined } })` คืน null → route ส่ง 404 error object กลับมา → page set product เป็น `{ error: "..." }` (truthy แต่ไม่มี field จริง) → แสดงผลเปล่า
  - แก้: เปลี่ยน type เป็น `Promise<{id: string}>` และ `await params` ก่อนใช้ ในทุก dynamic route handler

### ไฟล์ที่แก้ไข

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `app/api/products/[id]/route.ts` | `params` → `Promise<{id}>`, เพิ่ม `await params` ใน GET/PUT/DELETE |
| `app/api/orders/[id]/route.ts` | `params` → `Promise<{id}>`, เพิ่ม `await params` ใน GET/PUT |
| `app/api/categories/[id]/route.ts` | `params` → `Promise<{id}>`, เพิ่ม `await params` ใน PUT/DELETE |

---

## Session 7 — 2026-06-14

### สิ่งที่เปลี่ยนแปลง

- **[UI]** Navbar เปลี่ยน link เป็น: หน้าแรก (`/`), สินค้าทั้งหมด (`/products`), ติดต่อเรา (`/contact`) — ตัดเสื้อผ้า/เครื่องประดับออก
- **[UI]** Footer หมวดสินค้าเหลือแค่: สินค้าทั้งหมด, สินค้าแนะนำ — ตัด เสื้อผ้า/เครื่องประดับออก
- **[Feature]** สร้างหน้า `/contact` — ข้อมูลติดต่อ + ฟอร์มส่งข้อความ

### ไฟล์ที่แก้ไข

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `components/Navbar.tsx` | เปลี่ยน nav links เป็น หน้าแรก / สินค้าทั้งหมด / ติดต่อเรา (ทั้ง desktop และ mobile menu) |
| `components/Footer.tsx` | หมวดสินค้าเหลือ 2 รายการ: สินค้าทั้งหมด, สินค้าแนะนำ |
| `app/contact/page.tsx` | สร้างใหม่ — หน้าติดต่อเรา พร้อมข้อมูลและฟอร์ม |

---

---

## Session 10 — 2026-06-14

### สิ่งที่เปลี่ยนแปลง

- **[Schema]** เพิ่ม model `ContactMessage` — เก็บชื่อ, อีเมล, ข้อความ, และ userId (nullable สำหรับ guest)
- **[API]** สร้าง `POST /api/contact` — รับ form แล้ว save ลง DB พร้อม userId ถ้า login อยู่
- **[API]** สร้าง `GET /api/contact` — admin only ดูข้อความทั้งหมดพร้อมข้อมูล user
- **[UI]** แก้หน้า `/contact` — form ส่งได้จริง, autofill ชื่อ/อีเมลถ้า login, แสดง success banner, toast notification
- **[Migration]** `20260613185859_add_contact_messages`

### ไฟล์ที่แก้ไข

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `prisma/schema.prisma` | เพิ่ม `ContactMessage` model + relation ใน `User` |
| `app/api/contact/route.ts` | สร้างใหม่ — POST (public) + GET (admin) |
| `app/contact/page.tsx` | แก้ form ให้ส่งจริง + autofill + success state |

---

## Session 9 — 2026-06-14

### สิ่งที่เปลี่ยนแปลง

- **[UI]** เพิ่ม modal เลือก size/color ก่อนลงตะกร้าจาก ProductCard
  - กดปุ่มตะกร้าในหน้า listing → เปิด bottom sheet modal แสดงรูป ชื่อ ราคา + ตัวเลือกไซส์/สี
  - ถ้าสินค้าไม่มี sizes และ colors เลย → เพิ่มตะกร้าทันทีโดยไม่เปิด modal
  - กด backdrop หรือ X เพื่อปิด modal

### ไฟล์ที่แก้ไข

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `components/ProductCard.tsx` | เพิ่ม `sizes`/`colors` ใน interface, เพิ่ม modal state, เปลี่ยน handleCartClick ให้เปิด modal เมื่อมีตัวเลือก |
| `app/products/page.tsx` | เพิ่ม `sizes`, `colors` ใน Product interface |

---

## Session 8 — 2026-06-14

### สิ่งที่เปลี่ยนแปลง

- **[Schema]** เปลี่ยนหมวดหมู่ "เครื่องประดับ" (accessories) เป็น 2 หมวดแยก: "รองเท้า" (shoes) และ "กระเป๋า" (bags)
  - รัน script ย้าย products และลบ category เก่าจาก Neon DB โดยตรง
  - "กระเป๋าถือหนังสีน้ำตาล" → หมวด bags
  - "รองเท้าผ้าใบสีขาว" → หมวด shoes

### ไฟล์ที่แก้ไข

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `prisma/seed.ts` | เปลี่ยน accessories → shoes/bags, อัปเดต categorySlug ของ products |
| `app/api/products/route.ts` | เพิ่ม `accessories: ["shoes", "bags"]` ใน GROUP_MAP |

---

### Next.js 15/16 Key Learning

> Dynamic route params ใน route handlers (`app/api/**/[id]/route.ts`) เป็น `Promise` แล้ว:
> ```ts
> // WRONG (Next.js ≤14)
> export async function GET(_req, { params }: { params: { id: string } }) {
>   const id = params.id;  // undefined ใน Next.js 15/16!
> }
> // CORRECT
> export async function GET(_req, { params }: { params: Promise<{ id: string }> }) {
>   const { id } = await params;
> }
> ```

---

## Session 11 — 2026-06-14

### สิ่งที่เปลี่ยนแปลง

- **[Feature]** เพิ่มสินค้าใหม่ 8 ชิ้นลงฐานข้อมูล ครอบคลุมหลายหมวดหมู่
  1. **กระโปรงพลีท** (womens-clothing) — ราคา 450 บาท
  2. **เสื้อฮู้ดดี้** (casual) — ราคา 590 บาท
  3. **กางเกงขายาวสแล็ค** (formal) — ราคา 690 บาท
  4. **รองเท้าส้นสูง** (shoes) — ราคา 990 บาท
  5. **กระเป๋าเป้สะพายหลัง** (bags) — ราคา 1,190 บาท
  6. **เสื้อโปโล** (mens-clothing) — ราคา 490 บาท
  7. **รองเท้าวิ่ง** (shoes) — ราคา 1,290 บาท
  8. **ชุดเซตเสื้อกางเกง** (sportswear) — ราคา 790 บาท
- สินค้าทุกชิ้นมี 3 ภาพจาก Unsplash, คำอธิบายภาษาไทย, sizes, colors, stock

### ไฟล์ที่แก้ไข

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `prisma/add-products.ts` | สร้างสคริปต์เพิ่มสินค้า 8 ชิ้น (รันด้วย `npx tsx`) |

---

## Session 12 — 2026-06-14

### สิ่งที่เปลี่ยนแปลง

- **[Fix]** ตรวจสอบและซ่อม URL รูปสินค้าทั้งหมด 48 รูป (16 สินค้า × 3 รูป)
  - พบรูป 404 จำนวน 3 รูป: กระโปรงพลีท img0, เสื้อฮู้ดดี้ img0, กางเกงขายาวสแล็ค img0
  - พบ URL ซ้ำ 4 รายการ: กระเป๋าเป้สะพายหลัง img0, รองเท้าวิ่ง img0, ชุดเซตเสื้อกางเกง img0+img2
  - เปลี่ยน URL ใหม่ที่ทดสอบผ่านแล้วทั้ง 7 รายการ
  - ผลลัพธ์: ✅ ทุก URL โหลดได้ ✅ ไม่มี URL ซ้ำ

### ไฟล์ที่แก้ไข

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `prisma/check-images.ts` | สคริปต์ตรวจสอบ URL ทั้งหมดด้วย HEAD request |
| `prisma/fix-images.ts` | สคริปต์ทดสอบ candidate URLs และอัปเดต DB |
| `prisma/list-images.ts` | สคริปต์ list URL ทั้งหมดและหา duplicate |
| Database | อัปเดต images array ของ 5 สินค้า (7 รูป) |

---

## Session 13 — 2026-06-14

### สิ่งที่เปลี่ยนแปลง

- **[UI]** ยกเครื่อง UI ทั้งหมด สไตล์ "Editorial Fashion" (แบบ Zara / H&M / ASOS)
- **[UI]** `components/Navbar.tsx` — เปลี่ยนเป็น White navbar, scroll shadow, avatar dropdown, rounded pill CTA
- **[UI]** `app/page.tsx` — ออกแบบหน้าแรกใหม่ทั้งหมด:
  - Hero: full-height fashion photo (photo-1483985988355-763728e1935b) + gradient overlay + editorial text
  - Brand Promises bar: 4 icons บน dark slate
  - หมวดหมู่: image-backed cards พร้อม hover zoom + slide-up text (2 large + rest small)
  - สินค้าแนะนำ: section header ใหม่
  - Promo banner: full-width image-backed rounded section
- **[UI]** `components/ProductCard.tsx` — card ใหม่:
  - Portrait ratio (4:5) แบบ fashion standard
  - Image crossfade hover (รูป 1 → รูป 2)
  - Slide-up "เพิ่มลงตะกร้า" overlay button
  - Star ratings แบบ filled/empty stars
- **[UI]** `components/Footer.tsx` — dark slate-900 footer, 3-column layout, social placeholders
- **[UI]** `app/globals.css` — smooth scroll, custom scrollbar, selection color, CSS animations
- **[Fix]** `app/api/cart/[itemId]/route.ts` — แก้ params เป็น Promise ตาม Next.js 16 standard
- ทดสอบ image URLs สำหรับ hero + categories ทั้ง 9 URLs ล่วงหน้าก่อนใช้งาน

### ไฟล์ที่แก้ไข

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `app/globals.css` | smooth-scroll, scrollbar, selection, animation keyframes |
| `components/Navbar.tsx` | white nav, scroll shadow, avatar dropdown, pill CTA |
| `app/page.tsx` | complete redesign — hero, promises bar, category grid, promo banner |
| `components/ProductCard.tsx` | 4:5 portrait, image crossfade, slide-up cart, star ratings |
| `components/Footer.tsx` | dark slate, 3-col, social, SSL badges |
| `app/api/cart/[itemId]/route.ts` | `params` → Promise fix |

---

## Session 14 — 2026-06-14

### สิ่งที่เปลี่ยนแปลง

- **[UI]** ยกเครื่อง UI หน้าที่เหลือทั้งหมด — ต่อเนื่องจาก Session 13 ("ยกเครื่องหน้าอื่นด้วยไม่ใช่แค่หน้าแรก")

#### หน้าที่ redesign ในเซสชันนี้:

1. **`app/login/page.tsx`** — split-screen layout (fashion photo left 55%, form right 45%), eye toggle, loading spinner
2. **`app/register/page.tsx`** — split-screen layout (different fashion photo), password strength bar, password match indicator
3. **`app/products/page.tsx`** — category pills (แทน `<select>`), search + sort row, skeleton loading 4:5 ratio, pagination, empty state
4. **`app/products/[slug]/page.tsx`** — portrait 4:5 image, better thumbnails, discount % badge, size/color buttons upgrade, specs chips
5. **`app/cart/page.tsx`** — portrait product images (80×100), free shipping progress bar, better empty state, cleaner summary card
6. **`app/orders/page.tsx`** — product thumbnail stack, status badge with dot + border, chevron indicator, better empty state
7. **`app/orders/[id]/page.tsx`** — icon-based status tracker, better 2-col address/payment cards, portrait product images
8. **`app/profile/page.tsx`** — gradient avatar card (blue-700→blue-900), icon inputs, saved confirmation button, quick-links grid
9. **`app/contact/page.tsx`** — 5-col split (info left + form right), info cards with icon boxes, blue promo card
10. **`app/search/page.tsx`** — trending searches chips, browse by category grid, better centered hero

### Design system ที่ใช้ทั่วทุกหน้า

| Element | Class pattern |
|---|---|
| Page label | `text-xs text-blue-600 font-semibold tracking-[0.2em] uppercase` |
| Page title | `text-3xl font-bold text-slate-900` |
| Input | `px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white` |
| Primary CTA | `bg-blue-700 text-white rounded-xl hover:bg-blue-800 transition-all active:scale-[0.99]` |
| Card | `bg-white border border-gray-100 rounded-2xl shadow-sm` |
| Pill/Badge | `rounded-full text-xs font-semibold border` |

### ไฟล์ที่แก้ไข

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `app/login/page.tsx` | split-screen redesign, eye toggle, spinner |
| `app/register/page.tsx` | split-screen redesign, strength/match indicators |
| `app/products/page.tsx` | category pills, pagination, skeleton, empty state |
| `app/products/[slug]/page.tsx` | 4:5 portrait image, discount badge, upgraded controls |
| `app/cart/page.tsx` | portrait images, free shipping progress bar |
| `app/orders/page.tsx` | thumbnail stack, better status badges |
| `app/orders/[id]/page.tsx` | icon tracker, split info cards |
| `app/profile/page.tsx` | gradient avatar, icon inputs, quick links |
| `app/contact/page.tsx` | split layout, info cards, blue promo card |
| `app/search/page.tsx` | trending chips, category grid |

---

## Session 15 — 2026-06-14

### สิ่งที่เปลี่ยนแปลง

- **[Feature]** Dark mode / Light mode toggle ทั้ง webapp
  - ติดตั้ง `next-themes@0.4.6`
  - ปุ่ม toggle (🌙/☀️) อยู่ซ้ายปุ่ม Search บน Navbar
  - Default: Light mode, ไม่ follow system
  - Transition smooth 200ms บน background + text
- **[Fix]** Navbar bug — แผงควบคุม Admin มี underline ตลอดเวลา → แก้ด้วย `usePathname()` active detection
- **[UI]** Category grid → horizontal scroll slider พร้อมปุ่มลูกศร ← →
  - แยกเป็น `CategorySlider` (Client Component) จาก `page.tsx` (Server Component)
  - แสดง 4 การ์ด, ที่เหลือ scroll ขวา, ปุ่มลูกศรโผล่เมื่อ scroll ได้
- **[UI]** Admin dashboard redesign — gradient header, stat cards ทันสมัย, quick action grid, recent orders table

### ไฟล์ที่แก้ไข

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `package.json` | เพิ่ม `next-themes` |
| `app/globals.css` | `@custom-variant dark`, CSS vars สำหรับ dark mode, body transition |
| `app/layout.tsx` | `suppressHydrationWarning`, dark body classes |
| `app/providers.tsx` | เพิ่ม `ThemeProvider` (attribute="class", defaultTheme="light") |
| `components/Navbar.tsx` | Dark toggle button (SunIcon/MoonIcon), `usePathname` active underline, dark classes ทั้งหมด |
| `components/ProductCard.tsx` | dark: classes บน card, modal, images, text |
| `components/CategorySlider.tsx` | สร้างใหม่ — horizontal scroll + arrow buttons |
| `components/Footer.tsx` | (bg-slate-900 ทำงานดีใน dark mode อยู่แล้ว) |
| `app/page.tsx` | `dark:bg-slate-900`, section text dark classes, ใช้ `CategorySlider` |
| Pages ทั้งหมด | dark: classes สำหรับ bg, border, text ทุก page |

## Session 16 — 2026-06-14

### สิ่งที่เปลี่ยนแปลง

- **[Fix]** แก้รูปสินค้าให้ตรงหมวดหมู่ทั้งหมด — รูปก่อนหน้าไม่ตรงหัวข้อ (เช่น เสื้อผู้หญิงมีรูปผู้ชายผูกรองเท้า)
  - ผู้หญิง (บลาวส์ลูกไม้, กระโปรงพลีท, กางเกงขาบาน) → รูปจาก Unsplash women's search
  - ผู้ชาย (โปโล, ชิโน, แจ็คเก็ตยีนส์, เชิ้ตลินิน) → รูปจาก Unsplash men's search
  - รองเท้าส้นสูง → รูปจาก heels search; รองเท้าบูท → แก้รูปกระเป๋าที่หลุดเข้ามา
  - กระเป๋า (ถือ, เป้, คลัทช์, โท้ต, สะพาย) → รูปจาก handbag search
  - ชุดวิ่งผู้หญิง + เสื้อกล้ามฟิตเนส → รูปจาก running sportswear search
  - กางเกงวอร์ม → รูปจาก hoodie/casual search
- **[Fix]** แก้รูปซ้ำระหว่างสินค้า — `1548036328` เคยใช้ทั้งบูทและกระเป๋าถือ; `1509631179647` ซ้ำในคาร์ดิแกนและกางเกงขาบาน
- **[Fix]** แก้รูปกระเป๋าสะพายข้างที่มีรูปซ้ำกับสูทผู้ชายและกระเป๋าถือ

### ไฟล์ที่แก้ไข

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `prisma/seed.ts` | แก้ image URLs ทั้งหมดให้ตรงหมวดหมู่, กำจัดรูปซ้ำ |


## Session 17 — 2026-06-14

### สิ่งที่เปลี่ยนแปลง

- **[Fix]** ล้าง orders ทั้งหมดออกจาก database (3 orders ที่มีอยู่)
- **[Feature]** Review gating — รีวิวได้เฉพาะเมื่อ order สถานะ DELIVERED และมีสินค้านั้น
  - `GET /api/products/[id]` คืน `canReview: boolean` โดยตรวจ DELIVERED order ของ user ที่ login อยู่
  - `POST /api/reviews` ตรวจ DELIVERED order ก่อน — ถ้าไม่มีคืน 403
  - UI แสดง form รีวิวเฉพาะเมื่อ `canReview === true`; ถ้าไม่ผ่านเงื่อนไขแสดง banner สีเหลือง "รีวิวได้หลังจากได้รับสินค้า"

### ไฟล์ที่แก้ไข

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `app/api/products/[id]/route.ts` | GET เพิ่ม session check + query DELIVERED order → คืน `canReview` |
| `app/api/reviews/route.ts` | POST เพิ่ม DELIVERED order check ก่อน upsert review |
| `app/products/[slug]/page.tsx` | แสดง review form เฉพาะเมื่อ `canReview`; ไม่เช่นนั้นแสดง banner |


## Session 18 — 2026-06-14

### สิ่งที่เปลี่ยนแปลง

- **[Fix]** Logo ใน Navbar ไม่ตรงกลาง — SVG มีช่องว่างล่าง 17px ทำให้ flex center จัด position ผิด
  - แก้: เปลี่ยน `height="48" viewBox="0 0 148 48"` → `height="34" viewBox="0 0 148 34"` (content จริงจบที่ y≈31)
- **[Feature]** เพิ่ม favicon สำหรับ browser tab
  - สร้าง `app/icon.svg` — hanger icon บน background สีน้ำเงิน rounded
  - Next.js App Router ใช้ `app/icon.svg` อัตโนมัติ (แทน default Next.js favicon)

### ไฟล์ที่แก้ไข

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `components/Logo.tsx` | SVG height 48→34, viewBox height 48→34 เพื่อตัด whitespace ล่าง |
| `app/icon.svg` | สร้างใหม่ — SVG favicon hanger icon สีน้ำเงิน |

## Session 19 — 2026-06-14

### สิ่งที่เปลี่ยนแปลง

- **[UI]** Checkout phone field — `type="tel"`, `inputMode="numeric"`, กรอกได้เฉพาะตัวเลข, `maxLength={10}`
- **[UI]** Checkout address field (ถนน/ซอย) — เพิ่ม `maxLength={100}`
- **[UI]** Register page ชื่อ-นามสกุล — เพิ่ม `maxLength={100}`
- **[UI]** Register page อีเมล — เพิ่ม `maxLength={254}`
- **[Schema]** เพิ่ม model `SavedAddress` — id, userId, label?, name, phone, address, subDistrict, district, province, postalCode, isDefault, createdAt
- **[API]** สร้าง `GET/POST/PATCH/DELETE /api/addresses` — CRUD ที่อยู่จัดส่งที่บันทึกไว้
- **[Feature]** สร้างหน้า `/addresses` — รายการ/เพิ่ม/แก้ไข/ลบที่อยู่จัดส่ง สไตล์เดียวกับ payment-methods
- **[UI]** เพิ่มเมนู "ที่อยู่จัดส่ง" ใน Navbar dropdown ใต้ "วิธีชำระเงิน"
- **[UI]** Checkout — เพิ่ม section "ที่อยู่ที่บันทึกไว้" ในส่วน shipping (ตำแหน่ง/ระยะ/สไตล์เดียวกับ saved payment methods)

### ไฟล์ที่แก้ไข

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `app/checkout/page.tsx` | phone digits-only+max10, address maxLength, saved addresses selector prefill |
| `app/register/page.tsx` | name maxLength=100, email maxLength=254 |
| `prisma/schema.prisma` | เพิ่ม model `SavedAddress`, relation ใน User |
| `prisma/migrations/20260614133337_add_saved_address/` | migration สร้างตาราง `saved_addresses` |
| `app/api/addresses/route.ts` | สร้างใหม่ — GET/POST/PATCH/DELETE |
| `app/addresses/page.tsx` | สร้างใหม่ — หน้าจัดการที่อยู่จัดส่ง |
| `components/Navbar.tsx` | เพิ่ม "ที่อยู่จัดส่ง" ใน user dropdown |

## Session 20 — 2026-06-14

### สิ่งที่เปลี่ยนแปลง

- **[Feature]** รีวิวสินค้า — แก้ไขรีวิวได้ (one review per user per product, editable)
  - ถ้ามีรีวิวอยู่แล้ว: form pre-fill ดาว + ข้อความเดิมอัตโนมัติ
  - Header เปลี่ยนเป็น "แก้ไขรีวิวของคุณ", ปุ่มเปลี่ยนเป็น "บันทึกการแก้ไข", badge "รีวิวแล้ว"
  - Toast "แก้ไขรีวิวสำเร็จ!" แทน "รีวิวสำเร็จ!"
  - รีวิวของตัวเองในรายการ: highlight border สีน้ำเงิน + badge "รีวิวของฉัน"

### ไฟล์ที่แก้ไข

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `app/products/[slug]/page.tsx` | useEffect pre-fill form, myReview detection, UI edit mode |

## Session 21 — 2026-06-14

### สิ่งที่เปลี่ยนแปลง

- **[Schema]** เพิ่ม `coverImage String?` ใน model `Category` — แยก field รูปภาพ URL ออกจาก emoji icon
- **[API]** `POST /api/categories` รับ `coverImage` เพิ่มเติม
- **[Feature]** Admin หน้า `/admin/categories` — ปรับฟอร์ม/การ์ดใหม่ทั้งหมด
  - แยก field: "URL รูปภาพหน้าปก" (text input) + "ไอคอน Emoji" (emoji picker)
  - ติดตั้ง `emoji-picker-react` — picker เปิด/ปิดเมื่อคลิก, ปิดเมื่อคลิกนอก
  - Preview รูป URL แบบ real-time ใต้ช่อง URL
  - การ์ด category: cover image area 100px + info section พร้อม emoji + ชื่อ
  - ปุ่ม edit/delete ย้ายขึ้นไปบน cover image (overlay)
- **[UI]** `CategorySlider` — ใช้ `cat.coverImage` เป็น background image สำหรับ category ที่ slug ไม่อยู่ใน hardcode list

### ไฟล์ที่แก้ไข

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `prisma/schema.prisma` | เพิ่ม `coverImage String?` ใน Category |
| `prisma/migrations/20260614141133_add_category_cover_image/` | migration สร้าง column `cover_image` |
| `app/api/categories/route.ts` | POST รับ coverImage |
| `app/admin/categories/page.tsx` | เขียนใหม่ทั้งหมด — emoji picker, coverImage field, card redesign |
| `components/CategorySlider.tsx` | ใช้ `cat.coverImage` เป็น fallback รูปภาพ |

## Session 22 — 2026-06-14

### สิ่งที่เปลี่ยนแปลง

- **[Fix]** Admin categories — แก้ hydration error: `<button>` ซ้อนใน `<button>` (ปุ่ม X ล้าง emoji อยู่ในปุ่ม trigger)
  - แก้โดยแยกปุ่ม X ออกมาอยู่ข้างๆ แทนที่จะซ้อนอยู่ข้างใน
- **[Data]** อัปเดต `coverImage` ของ 7 categories ใน database ให้ตรงกับรูปที่ใช้ใน CategorySlider
  - womens-clothing, mens-clothing, casual, formal, sportswear, shoes, bags

### ไฟล์ที่แก้ไข

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `app/admin/categories/page.tsx` | ย้ายปุ่ม X (clear emoji) ออกจากข้างใน button trigger — แก้ nested button hydration error |


## Session 23 — 2026-06-14

### สิ่งที่เปลี่ยนแปลง

- **[Fix]** Profile page — Admin badge มองไม่เห็นใน light mode (white text บน white background)
  - แก้: เปลี่ยนเป็น `text-blue-700 bg-white` ให้มองเห็นได้ชัดทั้ง light และ dark mode
- **[Fix]** Category cascade delete — ลบหมวดหมู่ไม่ได้ถ้ายังมีสินค้าอยู่
  - แก้: DELETE handler ลบ reviews → cartItems → orderItems → products ก่อน จึงค่อยลบ category
- **[Config]** เพิ่ม `prisma generate &&` ใน build script — เตรียม deploy ขึ้น Vercel
- **[Config]** เพิ่ม `.claude/` ใน `.gitignore`

### ไฟล์ที่แก้ไข

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `app/profile/page.tsx` | Admin badge: `bg-white dark:bg-[#131c30]/20` → `text-blue-700 bg-white` |
| `app/api/categories/[id]/route.ts` | DELETE: cascade ลบ reviews/cartItems/orderItems/products ก่อนลบ category |
| `package.json` | `"build": "prisma generate && next build"` |
| `.gitignore` | เพิ่ม `.claude/` |

## Session 24 — 2026-07-20

### สิ่งที่เปลี่ยนแปลง

- **[UI]** Redesign ทั้งโปรเจคให้ตรงกับ Nordic Yellow Design System
  - Primary: `#003399` (IKEA Blue), Secondary: `#FFDA1A` (IKEA Yellow)
  - Background: `#F5F5F5`, Text: `#111111`, Border: `#DFDFDF`, Neutral: `#767676`
  - Semantic: Success `#0A8A00`, Warning `#E87400`, Error `#CC0008`
  - ลบ dark mode ออกทั้งหมด (ลบ `dark:` Tailwind classes ทุกที่)
  - Border radius: `rounded` (4px) แทน `rounded-xl`, `rounded-2xl`, `rounded-full`
  - Container: `max-w-[1400px]` แทน `max-w-7xl`
  - Typography: Noto Sans (กำหนดใน globals.css)
  - Card shadows: Level 1–3 ใช้ `rgba(17,17,17, ...)` แทน generic shadows

### ไฟล์ที่แก้ไข

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `app/globals.css` | CSS custom properties Nordic Yellow, Noto Sans font |
| `app/layout.tsx` | ลบ ThemeProvider, ใช้ Noto Sans, ลบ dark mode |
| `app/providers.tsx` | ลบ ThemeProvider |
| `components/Navbar.tsx` | Nordic Yellow colors, ลบ dark mode |
| `components/Footer.tsx` | Nordic Yellow colors, ลบ dark mode |
| `components/ProductCard.tsx` | Nordic Yellow colors, ลบ dark mode |
| `components/CategorySlider.tsx` | Nordic Yellow colors, ลบ dark mode |
| `app/page.tsx` | Hero + promo banner + brand bar → Nordic Yellow |
| `app/login/page.tsx` | Form + inputs → Nordic Yellow, ลบ dark mode |
| `app/register/page.tsx` | Form + password strength → Nordic Yellow, ลบ dark mode |
| `app/products/page.tsx` | Filters + pagination + skeleton → Nordic Yellow |
| `app/products/[slug]/page.tsx` | Product detail + reviews + rating → Nordic Yellow, ลบ dark mode |
| `app/search/page.tsx` | Search form + trending + categories → Nordic Yellow, ลบ dark mode |
| `app/cart/page.tsx` | Cart items + summary + shipping bar → Nordic Yellow |
| `app/checkout/page.tsx` | All form sections + payment → Nordic Yellow |
| `app/orders/page.tsx` | Order cards + STATUS_CONFIG → Nordic Yellow |
| `app/orders/[id]/page.tsx` | Status tracker + info cards → Nordic Yellow |
| `app/profile/page.tsx` | Avatar card + form → Nordic Yellow |
| `app/contact/page.tsx` | Info cards + FAQ + form → Nordic Yellow |
| `app/addresses/page.tsx` | Address cards + modal form → Nordic Yellow, ลบ dark mode |
| `app/payment-methods/page.tsx` | Method cards + modal form → Nordic Yellow, ลบ dark mode |
| `app/admin/page.tsx` | Dashboard header + stats + quick actions → Nordic Yellow |
| `app/admin/products/page.tsx` | Table + modal form → Nordic Yellow |
| `app/admin/orders/page.tsx` | Table + STATUS_COLORS → Nordic Yellow |
| `app/admin/categories/page.tsx` | Cards + modal form → Nordic Yellow |
| `app/admin/users/page.tsx` | Table + role badges → Nordic Yellow |
