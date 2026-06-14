"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

const CATEGORY_IMAGES: Record<string, string> = {
  "womens-clothing": "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80",
  "mens-clothing":   "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=800&q=80",
  "shoes":           "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80",
  "bags":            "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&q=80",
  "casual":          "https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=800&q=80",
  "formal":          "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80",
  "sportswear":      "https://images.unsplash.com/photo-1549576490-b0b4831ef60a?w=800&q=80",
};

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  coverImage?: string | null;
}

export function CategorySlider({ categories }: { categories: Category[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [categories]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.clientWidth / 4 + 12;
    el.scrollBy({ left: dir === "right" ? cardWidth * 2 : -cardWidth * 2, behavior: "smooth" });
    setTimeout(checkScroll, 350);
  };

  return (
    <div className="relative group/slider">
      {/* Left arrow */}
      <button
        onClick={() => scroll("left")}
        aria-label="เลื่อนซ้าย"
        className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-9 h-9 rounded-full bg-white dark:bg-[#131c30] shadow-md border border-gray-100 dark:border-[#253350] flex items-center justify-center text-slate-600 dark:text-[#8aaad4] hover:text-blue-700 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-500 transition-all duration-200 ${canLeft ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <ChevronLeftIcon className="w-4 h-4" />
      </button>

      {/* Scrollable row */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth"
      >
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.slug}`}
            className="group relative overflow-hidden rounded-xl bg-slate-200 flex-shrink-0"
            style={{ width: "calc(25% - 9px)", minWidth: 160, aspectRatio: "3/2" }}
          >
            {(() => {
              const src = CATEGORY_IMAGES[cat.slug] || cat.coverImage || null;
              return src ? (
                <Image
                  src={src}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-800 to-blue-600 flex items-center justify-center text-4xl">
                  {cat.image || "🗂️"}
                </div>
              );
            })()}
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3.5">
              <p className="text-white font-semibold text-sm leading-tight">{cat.name}</p>
              <p className="text-blue-300 text-[10px] mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                ดูสินค้า <ArrowRightIcon className="w-2.5 h-2.5" />
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Right arrow */}
      <button
        onClick={() => scroll("right")}
        aria-label="เลื่อนขวา"
        className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-9 h-9 rounded-full bg-white dark:bg-[#131c30] shadow-md border border-gray-100 dark:border-[#253350] flex items-center justify-center text-slate-600 dark:text-[#8aaad4] hover:text-blue-700 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-500 transition-all duration-200 ${canRight ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <ChevronRightIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
