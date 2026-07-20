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
        <p className="text-xs text-[#003399] font-semibold tracking-[0.2em] uppercase mb-2">Search</p>
        <h1 className="text-3xl font-bold text-[#111111] mb-2">ค้นหาสินค้า</h1>
        <p className="text-[#767676] text-sm">พิมพ์ชื่อสินค้าหรือหมวดหมู่ที่ต้องการ</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#767676]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="เสื้อผ้า รองเท้า กระเป๋า..."
            className="w-full pl-12 pr-4 py-4 border border-[#DFDFDF] rounded focus:outline-none focus:ring-2 focus:ring-[#003399] text-base bg-[#F5F5F5] focus:bg-white transition-colors"
            autoFocus
          />
        </div>
        <button
          type="submit"
          className="px-6 py-4 bg-[#003399] text-white font-bold rounded hover:bg-[#002B80] transition-colors"
        >
          ค้นหา
        </button>
      </form>

      {/* Trending searches */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-[#767676] uppercase tracking-wider mb-3">กำลังเป็นที่นิยม</p>
        <div className="flex flex-wrap gap-2">
          {TRENDING.map((term) => (
            <button
              key={term}
              onClick={() => router.push(`/products?search=${encodeURIComponent(term)}`)}
              className="px-4 py-2 bg-[#F5F5F5] hover:bg-[#003399]/5 hover:text-[#003399] text-[#484848] text-sm rounded transition-colors font-medium border border-[#DFDFDF] hover:border-[#003399]"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Browse by category */}
      <div>
        <p className="text-xs font-semibold text-[#767676] uppercase tracking-wider mb-3">เลือกตามหมวดหมู่</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SUGGESTIONS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="bg-white border border-[#DFDFDF] rounded px-4 py-3 text-sm font-medium text-[#484848] hover:border-[#003399] hover:bg-[#003399]/5 hover:text-[#003399] transition-all text-center"
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
