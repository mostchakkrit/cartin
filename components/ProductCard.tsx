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
      <div
        className="group relative bg-white border border-[#DFDFDF] rounded overflow-hidden shadow-[0_1px_3px_rgba(17,17,17,0.06)] hover:shadow-[0_4px_12px_rgba(17,17,17,0.08)] transition-shadow duration-300"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Link href={`/products/${product.slug}`} className="block">
          {/* Image area (1:1) */}
          <div className="relative overflow-hidden bg-[#F5F5F5]" style={{ aspectRatio: "1/1" }}>
            {product.images[0] ? (
              <>
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className={`object-cover transition-all duration-700 ${
                    product.images[1] && hovered ? "opacity-0 scale-[1.04]" : "opacity-100 scale-100"
                  }`}
                />
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
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-6xl">👗</span>
              </div>
            )}

            {/* Discount badge */}
            {discount > 0 && (
              <span className="absolute top-3 left-3 bg-[#CC0008] text-white text-xs font-bold px-2.5 py-1 rounded z-10">
                -{discount}%
              </span>
            )}

            {/* Out of stock */}
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
                <span className="bg-white text-[#767676] font-semibold px-4 py-2 rounded border border-[#DFDFDF] text-sm shadow-sm">
                  หมดสต็อก
                </span>
              </div>
            )}

            {/* Slide-up overlay */}
            <div className={`absolute inset-x-0 bottom-0 px-3 pb-3 transition-all duration-300 z-10 ${
              hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
            }`}>
              <div className="flex gap-2">
                {!isAdmin && product.stock > 0 && (
                  <button
                    onClick={handleCartClick}
                    disabled={adding}
                    className="flex-1 py-2.5 bg-[#003399] text-white text-xs font-bold rounded hover:bg-[#002B80] transition-colors flex items-center justify-center gap-1.5 shadow-lg"
                  >
                    <ShoppingCartIcon className="w-3.5 h-3.5" />
                    เพิ่มลงตะกร้า
                  </button>
                )}
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/products/${product.slug}`); }}
                  className={`flex items-center justify-center gap-1.5 py-2.5 bg-[#111111]/70 text-white text-xs font-bold rounded hover:bg-[#111111]/90 transition-colors shadow-lg ${
                    !isAdmin && product.stock > 0 ? "px-3" : "flex-1"
                  }`}
                >
                  <EyeIcon className="w-3.5 h-3.5" />
                  {(!isAdmin && product.stock > 0) ? "" : "ดูรายละเอียด"}
                </button>
              </div>
            </div>
          </div>

          {/* Card info */}
          <div className="p-4">
            {product.category && (
              <p className="text-[11px] text-[#003399] font-semibold uppercase tracking-wider mb-1.5">
                {product.category.name}
              </p>
            )}
            <h3 className="text-sm font-bold text-[#111111] line-clamp-1 mb-2">{product.name}</h3>

            {(product.reviewCount ?? 0) > 0 && (
              <div className="flex items-center gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon key={i} className={`w-3 h-3 ${i < Math.round(product.avgRating ?? 0) ? "text-[#FFDA1A]" : "text-[#DFDFDF]"}`} />
                ))}
                <span className="text-xs text-[#767676] ml-1">({product.reviewCount})</span>
              </div>
            )}

            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-[#111111]">฿{product.price.toLocaleString()}</span>
              {product.comparePrice && (
                <span className="text-xs text-[#767676] line-through">฿{product.comparePrice.toLocaleString()}</span>
              )}
            </div>
          </div>
        </Link>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded w-full max-w-sm p-6 shadow-[0_8px_24px_rgba(17,17,17,0.12)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-5">
              <div className="flex gap-3 items-center min-w-0">
                {product.images[0] && (
                  <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0 bg-[#F5F5F5] border border-[#DFDFDF]">
                    <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-bold text-[#111111] text-sm line-clamp-2 leading-snug">{product.name}</p>
                  <p className="text-[#003399] font-bold mt-1 text-base">฿{product.price.toLocaleString()}</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-[#767676] hover:text-[#111111] hover:bg-[#F5F5F5] rounded flex-shrink-0 ml-2">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {hasSizes && (
              <div className="mb-5">
                <p className="text-sm font-bold text-[#111111] mb-2.5 flex items-center gap-2">
                  ไซส์
                  {!selectedSize && <span className="text-[#CC0008] font-normal text-xs">* กรุณาเลือก</span>}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes!.map((s) => (
                    <button key={s} onClick={() => setSelectedSize(s)}
                      className={`px-3.5 py-2 border rounded text-sm font-semibold transition-all duration-150 ${
                        selectedSize === s
                          ? "border-[#003399] bg-[#003399] text-white"
                          : "border-[#DFDFDF] text-[#484848] hover:border-[#003399]"
                      }`}
                    >{s}</button>
                  ))}
                </div>
              </div>
            )}

            {hasColors && (
              <div className="mb-6">
                <p className="text-sm font-bold text-[#111111] mb-2.5 flex items-center gap-2">
                  สี
                  {!selectedColor && <span className="text-[#CC0008] font-normal text-xs">* กรุณาเลือก</span>}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {product.colors!.map((c) => (
                    <button key={c} onClick={() => setSelectedColor(c)}
                      className={`px-3.5 py-2 border rounded text-sm font-semibold transition-all duration-150 ${
                        selectedColor === c
                          ? "border-[#003399] bg-[#003399] text-white"
                          : "border-[#DFDFDF] text-[#484848] hover:border-[#003399]"
                      }`}
                    >{c}</button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#003399] text-white font-bold rounded hover:bg-[#002B80] disabled:opacity-60 transition-colors"
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
