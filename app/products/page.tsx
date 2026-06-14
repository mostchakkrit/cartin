"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface Product {
  id: string; name: string; slug: string; price: number; comparePrice?: number | null;
  images: string[]; stock: number; sizes: string[]; colors: string[];
  avgRating: number; reviewCount: number; category: { name: string };
}
interface Category { id: string; name: string; slug: string }

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");

  const page = parseInt(searchParams.get("page") || "1");
  const category = searchParams.get("category") || "";
  const group = searchParams.get("group") || "";
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "createdAt";
  const featured = searchParams.get("featured") || "";

  useEffect(() => {
    setSearchInput(search);
    fetch("/api/categories").then((r) => r.json()).then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));
    if (group) params.set("group", group);
    else if (category) params.set("category", category);
    if (search) params.set("search", search);
    if (sort !== "createdAt") params.set("sort", sort);
    if (featured) params.set("featured", featured);

    fetch(`/api/products?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      })
      .finally(() => setLoading(false));
  }, [page, category, group, search, sort, featured]);

  const setParam = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams.toString());
    if (value) p.set(key, value); else p.delete(key);
    if (key !== "page") p.delete("page");
    router.push(`/products?${p}`);
  };

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (p > 1) params.set("page", String(p)); else params.delete("page");
    router.push(`/products?${params}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pageTitle = featured
    ? "สินค้าแนะนำ"
    : group === "clothing"
    ? "เสื้อผ้าทั้งหมด"
    : category
    ? categories.find((c) => c.slug === category)?.name || category
    : "สินค้าทั้งหมด";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page header */}
      <div className="mb-8">
        <p className="text-xs text-blue-600 font-semibold tracking-[0.2em] uppercase mb-1">Shop</p>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-[#dde8ff]">{pageTitle}</h1>
      </div>

      {/* Search + Sort row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <form
          className="relative flex-1"
          onSubmit={(e) => { e.preventDefault(); setParam("search", searchInput); }}
        >
          <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-[#4e6888]" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="ค้นหาสินค้า..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-[#304070] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50 dark:bg-[#111827] focus:bg-white dark:bg-[#131c30] transition-colors"
          />
        </form>

        <div className="flex items-center gap-2">
          <AdjustmentsHorizontalIcon className="w-4 h-4 text-gray-400 dark:text-[#4e6888] flex-shrink-0" />
          <select
            value={sort}
            onChange={(e) => setParam("sort", e.target.value)}
            className="pl-3 pr-8 py-2.5 border border-gray-200 dark:border-[#304070] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-[#131c30]"
          >
            <option value="createdAt">ใหม่ล่าสุด</option>
            <option value="price_asc">ราคา: น้อย → มาก</option>
            <option value="price_desc">ราคา: มาก → น้อย</option>
            <option value="name">ชื่อ A-Z</option>
          </select>
        </div>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 flex-wrap mb-6">
        {[{ id: "", name: "ทั้งหมด", slug: "" }, ...categories].map((c) => (
          <button
            key={c.id}
            onClick={() => setParam("category", c.slug)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              category === c.slug
                ? "bg-blue-700 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/40"
                : "bg-gray-100 dark:bg-[#1a2540] text-slate-600 dark:text-[#8aaad4] hover:bg-gray-200"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Result count */}
      <p className="text-sm text-gray-400 dark:text-[#4e6888] mb-6">
        {loading ? "กำลังโหลด..." : `พบ ${total} รายการ`}
      </p>

      {/* Product grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 lg:gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-gray-100 dark:bg-[#1a2540] rounded-2xl animate-pulse" style={{ aspectRatio: "4/5" }} />
          ))}
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 lg:gap-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-12">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 dark:border-[#304070] text-slate-600 dark:text-[#8aaad4] hover:bg-blue-50 dark:hover:bg-[#1a2540] hover:border-blue-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => goToPage(n)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                    n === page
                      ? "bg-blue-700 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/40"
                      : "border border-gray-200 dark:border-[#304070] hover:bg-blue-50 dark:hover:bg-[#1a2540] hover:border-blue-300 text-slate-600 dark:text-[#8aaad4]"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-gray-200 dark:border-[#304070] text-slate-600 dark:text-[#8aaad4] hover:bg-blue-50 dark:hover:bg-[#1a2540] hover:border-blue-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-24">
          <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-[#1a2540] flex items-center justify-center mx-auto mb-4">
            <MagnifyingGlassIcon className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-lg font-semibold text-slate-700 dark:text-[#b8cef0] mb-1">ไม่พบสินค้า</p>
          <p className="text-gray-400 dark:text-[#4e6888] text-sm">ลองค้นหาด้วยคำอื่น หรือเลือกหมวดหมู่อื่น</p>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsContent />
    </Suspense>
  );
}
