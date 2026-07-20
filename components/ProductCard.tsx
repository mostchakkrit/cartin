"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { StarIcon } from "@heroicons/react/24/solid";
import { ShoppingCartIcon, XMarkIcon, EyeIcon } from "@heroicons/react/24/outline";
import { useCart } from "@/hooks/useCart";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number | null;
  images: string[];
  stock: number;
  sizes?: string[];
  colors?: string[];
  avgRating?: number;
  reviewCount?: number;
  category?: { name: string };
}

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [adding, setAdding] = useState(false);
  const [hovered, setHovered] = useState(false);

  const isAdmin = session?.user.role === "ADMIN";
  const hasSizes = (product.sizes?.length ?? 0) > 0;
  const hasColors = (product.colors?.length ?? 0) > 0;
  const needsModal = hasSizes || hasColors;

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session) {
      toast.error("กรุณาเข้าสู่ระบบก่อน");
      router.push("/login");
      return;
    }
    if (needsModal) {
      setSelectedSize("");
      setSelectedColor("");
      setShowModal(true);
    } else {
      handleAddToCart();
    }
  };

  const handleAddToCart = async () => {
    if (hasSizes && !selectedSize) { toast.error("กรุณาเลือกไซส์"); return; }
    if (hasColors && !selectedColor) { toast.error("กรุณาเลือกสี"); return; }
    setAdding(true);
    await addToCart(product.id, 1, selectedSize, selectedColor);
    toast.success("เพิ่มสินค้าลงตะกร้าแล้ว!");
    setAdding(false);
    setShowModal(false);
  };

  return (
    <>
      {/* Card */}
      <div
        className="group relative bg-white dark:bg-[#131c30] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Link href={`/products/${product.slug}`} className="block">
          {/* ── Image area (portrait 4:5) ── */}
          <div className="relative overflow-hidden bg-slate-100 dark:bg-[#1a2540]" style={{ aspectRatio: "4/5" }}>
            {product.images[0] ? (
              <>
                {/* Primary image */}
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className={`object-cover transition-all duration-700 ${
                    product.images[1] && hovered
                      ? "opacity-0 scale-[1.04]"
                      : "opacity-100 scale-100"
                  }`}
                />
                {/* Secondary image on hover */}
                {product.images[1] && (
                  <Image
                    src={product.images[1]}
                    alt={product.name + " — view 2"}
                    fill
                    className={`object-cover transition-all duration-700 ${
                      hovered ? "opacity-100 scale-100" : "opacity-0 scale-[1.04]"
                    }`}
                  />
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <span className="text-6xl">👗</span>
              </div>
            )}

            {/* Discount badge */}
            {discount > 0 && (
              <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm z-10">
                -{discount}%
              </span>
            )}

            {/* Out of stock overlay */}
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-white/60 dark:bg-[#0b0f1e]/70 backdrop-blur-[2px] flex items-center justify-center z-10">
                <span className="bg-white dark:bg-[#131c30] text-slate-600 dark:text-[#8aaad4] font-medium px-4 py-2 rounded-full text-sm shadow-md">
                  หมดสต็อก
                </span>
              </div>
            )}

            {/* Slide-up overlay (inside image area) */}
            <div
              className={`absolute inset-x-0 bottom-0 px-3 pb-3 transition-all duration-300 z-10 ${
                hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
              }`}
            >
              <div className="flex gap-2">
                {!isAdmin && product.stock > 0 && (
                  <button
                    onClick={handleCartClick}
                    disabled={adding}
                    className="flex-1 py-2.5 bg-white/95 backdrop-blur-sm text-slate-900 text-xs font-semibold rounded-xl hover:bg-blue-700 hover:text-white transition-all duration-200 shadow-xl flex items-center justify-center gap-1.5"
                  >
                    <ShoppingCartIcon className="w-3.5 h-3.5" />
                    เพิ่มลงตะกร้า
                  </button>
                )}
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/products/${product.slug}`); }}
                  className={`flex items-center justify-center gap-1.5 py-2.5 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold rounded-xl hover:bg-black/80 transition-all duration-200 shadow-xl ${
                    !isAdmin && product.stock > 0 ? "px-3" : "flex-1"
                  }`}
                >
                  <EyeIcon className="w-3.5 h-3.5" />
                  {(!isAdmin && product.stock > 0) ? "" : "ดูรายละเอียด"}
                </button>
              </div>
            </div>
          </div>

          {/* ── Card info ── */}
          <div className="p-4 pb-5">
            {product.category && (
              <p className="text-[11px] text-blue-600 font-semibold uppercase tracking-wider mb-1.5">
                {product.category.name}
              </p>
            )}
            <h3 className="text-sm font-medium text-slate-800 dark:text-[#dde8ff] line-clamp-1 mb-2.5">{product.name}</h3>

            {/* Star rating */}
            {(product.reviewCount ?? 0) > 0 && (
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.round(product.avgRating ?? 0) ? "text-yellow-400" : "text-gray-200 dark:text-slate-600"
                    }`}
                  />
                ))}
                <span className="text-xs text-gray-400 dark:text-[#4e6888] ml-1">({product.reviewCount})</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-slate-900 dark:text-[#dde8ff]">
                ฿{product.price.toLocaleString()}
              </span>
              {product.comparePrice && (
                <span className="text-xs text-gray-400 dark:text-[#4e6888] line-through">
                  ฿{product.comparePrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </Link>
      </div>

      {/* ── Size / Color Modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white dark:bg-[#131c30] rounded-2xl w-full max-w-sm p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex gap-3 items-center min-w-0">
                {product.images[0] && (
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-[#1a2540]">
                    <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 dark:text-[#dde8ff] text-sm line-clamp-2 leading-snug">{product.name}</p>
                  <p className="text-blue-700 dark:text-blue-400 font-bold mt-1">฿{product.price.toLocaleString()}</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg flex-shrink-0 ml-2"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Size selection */}
            {hasSizes && (
              <div className="mb-5">
                <p className="text-sm font-semibold text-slate-700 mb-2.5 flex items-center gap-2">
                  ไซส์
                  {!selectedSize && (
                    <span className="text-red-400 font-normal text-xs">* กรุณาเลือก</span>
                  )}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes!.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`px-3.5 py-2 border rounded-xl text-sm font-medium transition-all duration-150 ${
                        selectedSize === s
                          ? "border-blue-600 bg-blue-600 text-white shadow-md"
                          : "border-gray-200 dark:border-[#304070] text-slate-700 dark:text-[#b8cef0] hover:border-blue-400"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color selection */}
            {hasColors && (
              <div className="mb-6">
                <p className="text-sm font-semibold text-slate-700 mb-2.5 flex items-center gap-2">
                  สี
                  {!selectedColor && (
                    <span className="text-red-400 font-normal text-xs">* กรุณาเลือก</span>
                  )}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {product.colors!.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`px-3.5 py-2 border rounded-xl text-sm font-medium transition-all duration-150 ${
                        selectedColor === c
                          ? "border-blue-600 bg-blue-600 text-white shadow-md"
                          : "border-gray-200 dark:border-[#304070] text-slate-700 dark:text-[#b8cef0] hover:border-blue-400"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 disabled:opacity-60 transition-all duration-200 active:scale-98"
            >
              <ShoppingCartIcon className="w-5 h-5" />
              {adding ? "กำลังเพิ่ม..." : "เพิ่มลงตะกร้า"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
