"use client";

import { useEffect } from "react";
import { useCart } from "@/hooks/useCart";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { TrashIcon, MinusIcon, PlusIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items, total, itemCount, fetchCart, updateQuantity, removeItem, isLoading } = useCart();

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") fetchCart();
  }, [status]);

  if (status === "loading" || isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <div className="h-4 w-24 bg-gray-100 dark:bg-[#1a2540] rounded animate-pulse mb-2" />
          <div className="h-8 w-48 bg-gray-100 dark:bg-[#1a2540] rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-gray-100 dark:bg-[#1a2540] rounded-2xl animate-pulse" />)}
          </div>
          <div className="h-64 bg-gray-100 dark:bg-[#1a2540] rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  const shipping = total >= 1000 ? 0 : 50;
  const freeShippingProgress = Math.min((total / 1000) * 100, 100);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <p className="text-xs text-blue-600 font-semibold tracking-[0.2em] uppercase mb-1">My Cart</p>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-[#dde8ff]">ตะกร้าสินค้า</h1>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-[#1a2540] flex items-center justify-center mx-auto mb-5">
            <ShoppingBagIcon className="w-10 h-10 text-gray-300" />
          </div>
          <p className="text-xl font-semibold text-slate-700 dark:text-[#b8cef0] mb-1">ตะกร้าว่างเปล่า</p>
          <p className="text-gray-400 dark:text-[#4e6888] text-sm mb-8">เพิ่มสินค้าที่คุณชื่นชอบลงในตะกร้า</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/40"
          >
            เริ่มช็อปเลย
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Item list */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="bg-white dark:bg-[#131c30] border border-gray-100 dark:border-[#253350] rounded-2xl p-4 flex gap-4 hover:shadow-sm transition-shadow">
                {/* Product image — portrait ratio */}
                <Link href={`/products/${item.product.slug}`} className="relative flex-shrink-0 rounded-xl overflow-hidden bg-gray-50 dark:bg-[#111827]" style={{ width: 80, height: 100 }}>
                  {item.product.images[0] ? (
                    <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">👗</div>
                  )}
                </Link>

                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.product.slug}`} className="font-semibold text-slate-800 dark:text-[#dde8ff] hover:text-blue-700 line-clamp-2 text-sm leading-snug">
                    {item.product.name}
                  </Link>
                  {(item.size || item.color) && (
                    <div className="flex gap-2 mt-1">
                      {item.size && <span className="text-xs bg-gray-100 dark:bg-[#1a2540] text-gray-500 dark:text-[#6080a8] px-2 py-0.5 rounded-full">ไซส์ {item.size}</span>}
                      {item.color && <span className="text-xs bg-gray-100 dark:bg-[#1a2540] text-gray-500 dark:text-[#6080a8] px-2 py-0.5 rounded-full">{item.color}</span>}
                    </div>
                  )}
                  <p className="text-blue-700 font-bold mt-2 text-sm">฿{item.product.price.toLocaleString()}</p>
                </div>

                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => { removeItem(item.id); toast.success("ลบสินค้าแล้ว"); }}
                    className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>

                  <div>
                    <div className="flex items-center border border-gray-200 dark:border-[#304070] rounded-lg overflow-hidden mb-1.5">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 hover:bg-gray-50 dark:bg-[#111827] hover:text-blue-700 transition-colors">
                        <MinusIcon className="w-3 h-3" />
                      </button>
                      <span className="px-3 text-sm font-semibold text-slate-800 dark:text-[#dde8ff]">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 hover:bg-gray-50 dark:bg-[#111827] hover:text-blue-700 transition-colors">
                        <PlusIcon className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-xs font-bold text-slate-700 dark:text-[#b8cef0] text-right">฿{(item.product.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div>
            <div className="bg-white dark:bg-[#131c30] border border-gray-100 dark:border-[#253350] rounded-2xl p-6 sticky top-24 shadow-sm">
              <h2 className="font-bold text-slate-900 dark:text-[#dde8ff] mb-5 text-base">สรุปคำสั่งซื้อ</h2>

              {/* Free shipping progress */}
              <div className="mb-5 bg-blue-50 dark:bg-[#0f1d38] rounded-xl p-3">
                <div className="flex justify-between text-xs text-blue-600 font-medium mb-1.5">
                  <span>{total >= 1000 ? "✓ ได้รับส่งฟรี!" : `อีก ฿${(1000 - total).toLocaleString()} รับส่งฟรี`}</span>
                  <span>฿1,000</span>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-1.5">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2.5 text-sm mb-5">
                <div className="flex justify-between text-gray-600 dark:text-[#8aaad4]">
                  <span>สินค้า ({itemCount} ชิ้น)</span>
                  <span>฿{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-[#8aaad4]">
                  <span>ค่าจัดส่ง</span>
                  <span className={shipping === 0 ? "text-green-600 font-semibold" : ""}>{shipping === 0 ? "ฟรี!" : `฿${shipping}`}</span>
                </div>
                <div className="border-t border-gray-100 dark:border-[#253350] pt-2.5 flex justify-between font-bold text-base">
                  <span>รวมทั้งหมด</span>
                  <span className="text-blue-700">฿{(total + shipping).toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => router.push("/checkout")}
                className="w-full py-3.5 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 transition-all active:scale-[0.99] shadow-md shadow-blue-200 dark:shadow-blue-900/40"
              >
                ดำเนินการสั่งซื้อ
              </button>
              <Link href="/products" className="block text-center text-sm text-gray-400 dark:text-[#4e6888] hover:text-blue-600 mt-4 transition-colors">
                ← ช็อปต่อ
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
