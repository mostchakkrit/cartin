import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { CategorySlider } from "@/components/CategorySlider";
import prisma from "@/lib/prisma";
import {
  ArrowRightIcon,
  TruckIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

const BRAND_PROMISES = [
  { icon: TruckIcon,       label: "จัดส่งฟรี",       sub: "เมื่อซื้อครบ ฿1,000" },
  { icon: ArrowPathIcon,   label: "คืนสินค้าได้",     sub: "ภายใน 30 วัน" },
  { icon: ShieldCheckIcon, label: "ชำระเงินปลอดภัย",  sub: "SSL Secured" },
  { icon: SparklesIcon,    label: "คุณภาพดี",         sub: "คัดสรรทุกชิ้น" },
];

async function getFeaturedProducts() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      include: {
        category: { select: { name: true } },
        reviews: { select: { rating: true } },
      },
      take: 8,
      orderBy: { createdAt: "desc" },
    });
    return products.map((p: any) => ({
      ...p,
      avgRating:
        p.reviews.length > 0
          ? p.reviews.reduce((s: number, r: any) => s + r.rating, 0) / p.reviews.length
          : 0,
      reviewCount: p.reviews.length,
    }));
  } catch {
    return [];
  }
}

async function getCategories() {
  try {
    return await prisma.category.findMany({ orderBy: { name: "asc" } });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [featured, categories] = await Promise.all([getFeaturedProducts(), getCategories()]);

  return (
    <div className="bg-white dark:bg-[#111827]">
      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section className="relative flex items-center overflow-hidden" style={{ minHeight: "88vh" }}>
        {/* Background image */}
        <Image
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&q=80"
          alt="Hero — Fashion Collection"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent" />

        {/* Hero content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full py-24">
          <div className="max-w-lg">
            <p className="text-blue-400 text-xs tracking-[0.35em] font-semibold uppercase mb-5">
              New Collection 2026
            </p>
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.1] mb-6">
              ค้นพบ<br />
              สไตล์<br />
              <span className="text-blue-400">ของคุณ</span>
            </h1>
            <p className="text-gray-300 text-base md:text-lg mb-10 leading-relaxed">
              แฟชั่นเสื้อผ้าและเครื่องประดับคุณภาพดี<br />
              จัดส่งฟรีเมื่อซื้อครบ ฿1,000
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-blue-900/30"
              >
                ช็อปเลย
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
              <Link
                href="/products?featured=true"
                className="inline-flex items-center gap-2 px-8 py-4 border border-white/50 text-white font-semibold rounded-full hover:bg-white/15 backdrop-blur-sm transition-all duration-200"
              >
                สินค้าแนะนำ
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50">
          <span className="text-[10px] tracking-[0.3em] uppercase">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-white/50 to-transparent animate-scroll-bounce" />
        </div>
      </section>

      {/* ─── BRAND PROMISES ───────────────────────────────────────── */}
      <section className="bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/10">
            {BRAND_PROMISES.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3 py-5 px-4 lg:px-6">
                <div className="w-9 h-9 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4.5 h-4.5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold leading-tight">{label}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ───────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="py-20 max-w-7xl mx-auto px-6 lg:px-8">
          {/* Section header */}
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs text-blue-600 font-semibold tracking-[0.2em] uppercase mb-2">
                Shop By
              </p>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-[#dde8ff]">หมวดหมู่สินค้า</h2>
            </div>
            <Link href="/products" className="hidden sm:flex items-center gap-1.5 text-sm text-slate-400 dark:text-[#4e6888] hover:text-blue-600 transition-colors">
              ดูทั้งหมด <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>

          <CategorySlider categories={categories} />
        </section>
      )}

      {/* ─── FEATURED PRODUCTS ────────────────────────────────────── */}
      <section className="pb-20 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs text-blue-600 font-semibold tracking-[0.2em] uppercase mb-2">
              Handpicked
            </p>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-[#dde8ff]">สินค้าแนะนำ</h2>
          </div>
          <Link href="/products?featured=true" className="hidden sm:flex items-center gap-1.5 text-sm text-slate-400 dark:text-[#4e6888] hover:text-blue-600 transition-colors">
            ดูทั้งหมด <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
            {featured.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 text-gray-300">
            <p className="text-6xl mb-4">🛍️</p>
            <p className="text-gray-400">ยังไม่มีสินค้า</p>
          </div>
        )}
      </section>

      {/* ─── PROMO BANNER ─────────────────────────────────────────── */}
      <section className="px-6 lg:px-8 pb-20 max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl min-h-[360px] flex items-center">
          {/* Background image */}
          <Image
            src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&q=80"
            alt="Free shipping promotion"
            fill
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/95 via-blue-800/80 to-blue-700/30" />

          {/* Content */}
          <div className="relative z-10 px-10 md:px-16 py-14 max-w-xl">
            <p className="text-blue-300 text-xs tracking-[0.3em] uppercase font-semibold mb-4">
              Special Offer
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              จัดส่งฟรี<br />
              ทั่วประเทศ
            </h2>
            <p className="text-blue-200 mb-8 leading-relaxed">
              เมื่อซื้อสินค้าครบ ฿1,000 ขึ้นไป<br />
              สั่งได้เลย รับของไว ส่งทุกจังหวัด
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-700 font-bold rounded-full hover:bg-blue-50 transition-all duration-200 hover:scale-105 active:scale-95 shadow-xl"
            >
              ช็อปเลย
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
