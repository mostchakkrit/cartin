"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const SUGGESTIONS = [
  { label: "เสื้อผ้าผู้หญิง", href: "/products?category=womens-clothing" },
  { label: "เสื้อผ้าผู้ชาย",  href: "/products?category=mens-clothing" },
  { label: "รองเท้า",         href: "/products?category=shoes" },
  { label: "กระเป๋า",         href: "/products?category=bags" },
  { label: "สินค้าแนะนำ",     href: "/products?featured=true" },
];

const TRENDING = ["เสื้อยืด", "กางเกงยีนส์", "รองเท้าผ้าใบ", "กระเป๋าหนัง", "ชุดเซต"];

function SearchContent() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/products?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-20">
      <div className="text-center mb-10">
        <p className="text-xs text-blue-600 font-semibold tracking-[0.2em] uppercase mb-2">Search</p>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-[#dde8ff] mb-2">ค้นหาสินค้า</h1>
        <p className="text-gray-400 dark:text-[#4e6888] text-sm">พิมพ์ชื่อสินค้าหรือหมวดหมู่ที่ต้องการ</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-[#4e6888]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="เสื้อผ้า รองเท้า กระเป๋า..."
            className="w-full pl-12 pr-4 py-4 border border-gray-200 dark:border-[#304070] rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base bg-white dark:bg-[#131c30] shadow-sm"
            autoFocus
          />
        </div>
        <button
          type="submit"
          className="px-6 py-4 bg-blue-700 text-white font-bold rounded-2xl hover:bg-blue-800 transition-all active:scale-[0.98] shadow-md shadow-blue-200 dark:shadow-blue-900/40"
        >
          ค้นหา
        </button>
      </form>

      {/* Trending searches */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-gray-400 dark:text-[#4e6888] uppercase tracking-wider mb-3">กำลังเป็นที่นิยม</p>
        <div className="flex flex-wrap gap-2">
          {TRENDING.map((term) => (
            <button
              key={term}
              onClick={() => router.push(`/products?search=${encodeURIComponent(term)}`)}
              className="px-4 py-2 bg-gray-100 dark:bg-[#1a2540] hover:bg-blue-50 dark:bg-[#0f1d38] hover:text-blue-700 text-slate-600 dark:text-[#8aaad4] text-sm rounded-full transition-colors font-medium"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Browse by category */}
      <div>
        <p className="text-xs font-semibold text-gray-400 dark:text-[#4e6888] uppercase tracking-wider mb-3">เลือกตามหมวดหมู่</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SUGGESTIONS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="bg-white dark:bg-[#131c30] border border-gray-100 dark:border-[#253350] rounded-xl px-4 py-3 text-sm font-medium text-slate-700 dark:text-[#b8cef0] hover:border-blue-300 hover:bg-blue-50 dark:bg-[#0f1d38] hover:text-blue-700 transition-all text-center shadow-sm"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return <Suspense><SearchContent /></Suspense>;
}
