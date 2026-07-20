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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <div className="h-4 w-24 bg-[#DFDFDF] rounded animate-pulse mb-2" />
          <div className="h-8 w-48 bg-[#DFDFDF] rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-[#DFDFDF] rounded animate-pulse" />)}
          </div>
          <div className="h-64 bg-[#DFDFDF] rounded animate-pulse" />
        </div>
      </div>
    );
  }

  const shipping = total >= 1000 ? 0 : 50;
  const freeShippingProgress = Math.min((total / 1000) * 100, 100);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <p className="text-xs text-[#003399] font-semibold tracking-[0.2em] uppercase mb-1">My Cart</p>
        <h1 className="text-3xl font-bold text-[#111111]">ตะกร้าสินค้า</h1>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-24 h-24 rounded bg-[#F5F5F5] border border-[#DFDFDF] flex items-center justify-center mx-auto mb-5">
            <ShoppingBagIcon className="w-10 h-10 text-[#DFDFDF]" />
          </div>
          <p className="text-xl font-semibold text-[#111111] mb-1">ตะกร้าว่างเปล่า</p>
          <p className="text-[#767676] text-sm mb-8">เพิ่มสินค้าที่คุณชื่นชอบลงในตะกร้า</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#003399] text-white font-bold rounded hover:bg-[#002B80] transition-all"
          >
            เริ่มช็อปเลย
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Item list */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="bg-white border border-[#DFDFDF] rounded p-4 flex gap-4 hover:shadow-[0_4px_12px_rgba(17,17,17,0.08)] transition-shadow">
                <Link href={`/products/${item.product.slug}`} className="relative flex-shrink-0 rounded overflow-hidden bg-[#F5F5F5]" style={{ width: 80, height: 80 }}>
                  {item.product.images[0] ? (
                    <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">👗</div>
                  )}
                </Link>

                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.product.slug}`} className="font-semibold text-[#111111] hover:text-[#003399] line-clamp-2 text-sm leading-snug">
                    {item.product.name}
                  </Link>
                  {(item.size || item.color) && (
                    <div className="flex gap-2 mt-1">
                      {item.size && <span className="text-xs bg-[#F5F5F5] text-[#767676] px-2 py-0.5 rounded border border-[#DFDFDF]">ไซส์ {item.size}</span>}
                      {item.color && <span className="text-xs bg-[#F5F5F5] text-[#767676] px-2 py-0.5 rounded border border-[#DFDFDF]">{item.color}</span>}
                    </div>
                  )}
                  <p className="text-[#003399] font-bold mt-2 text-sm">฿{item.product.price.toLocaleString()}</p>
                </div>

                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => { removeItem(item.id); toast.success("ลบสินค้าแล้ว"); }}
                    className="p-1.5 text-[#DFDFDF] hover:text-[#CC0008] transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>

                  <div>
                    <div className="flex items-center border border-[#DFDFDF] rounded overflow-hidden mb-1.5">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 hover:bg-[#F5F5F5] hover:text-[#003399] transition-colors">
                        <MinusIcon className="w-3 h-3" />
                      </button>
                      <span className="px-3 text-sm font-semibold text-[#111111]">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 hover:bg-[#F5F5F5] hover:text-[#003399] transition-colors">
                        <PlusIcon className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-xs font-bold text-[#111111] text-right">฿{(item.product.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div>
            <div className="bg-white border border-[#DFDFDF] rounded p-6 sticky top-24 shadow-[0_1px_3px_rgba(17,17,17,0.06)]">
              <h2 className="font-bold text-[#111111] mb-5 text-base">สรุปคำสั่งซื้อ</h2>

              {/* Free shipping progress */}
              <div className="mb-5 bg-[#F5F5F5] border border-[#DFDFDF] rounded p-3">
                <div className="flex justify-between text-xs text-[#003399] font-semibold mb-1.5">
                  <span>{total >= 1000 ? "✓ ได้รับส่งฟรี!" : `อีก ฿${(1000 - total).toLocaleString()} รับส่งฟรี`}</span>
                  <span>฿1,000</span>
                </div>
                <div className="w-full bg-[#DFDFDF] rounded-full h-1.5">
                  <div
                    className="bg-[#003399] h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2.5 text-sm mb-5">
                <div className="flex justify-between text-[#484848]">
                  <span>สินค้า ({itemCount} ชิ้น)</span>
                  <span>฿{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#484848]">
                  <span>ค่าจัดส่ง</span>
                  <span className={shipping === 0 ? "text-[#0A8A00] font-semibold" : ""}>{shipping === 0 ? "ฟรี!" : `฿${shipping}`}</span>
                </div>
                <div className="border-t border-[#DFDFDF] pt-2.5 flex justify-between font-bold text-base">
                  <span>รวมทั้งหมด</span>
                  <span className="text-[#003399]">฿{(total + shipping).toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => router.push("/checkout")}
                className="w-full py-3.5 bg-[#003399] text-white font-bold rounded hover:bg-[#002B80] transition-all active:scale-[0.99]"
              >
                ดำเนินการสั่งซื้อ
              </button>
              <Link href="/products" className="block text-center text-sm text-[#767676] hover:text-[#003399] mt-4 transition-colors">
                ← ช็อปต่อ
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
