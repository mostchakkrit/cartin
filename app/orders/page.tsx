"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronRightIcon, ArchiveBoxIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  PENDING:    { label: "รอดำเนินการ", color: "bg-amber-50 text-amber-700 border border-amber-200",   dot: "bg-amber-400" },
  CONFIRMED:  { label: "ยืนยันแล้ว",  color: "bg-blue-50 dark:bg-[#0f1d38] text-blue-700 border border-blue-200",     dot: "bg-blue-500" },
  PROCESSING: { label: "กำลังเตรียม", color: "bg-purple-50 text-purple-700 border border-purple-200", dot: "bg-purple-500" },
  SHIPPED:    { label: "จัดส่งแล้ว",  color: "bg-indigo-50 text-indigo-700 border border-indigo-200", dot: "bg-indigo-500" },
  DELIVERED:  { label: "ส่งสำเร็จ",   color: "bg-green-50 text-green-700 border border-green-200",   dot: "bg-green-500" },
  CANCELLED:  { label: "ยกเลิก",      color: "bg-red-50 text-red-600 border border-red-200",         dot: "bg-red-400" },
};

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") {
      fetch("/api/orders")
        .then((r) => r.json())
        .then((data) => setOrders(data.orders || []))
        .finally(() => setLoading(false));
    }
  }, [status]);

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <div className="h-3 w-20 bg-gray-100 dark:bg-[#1a2540] rounded animate-pulse mb-2" />
        <div className="h-8 w-48 bg-gray-100 dark:bg-[#1a2540] rounded animate-pulse" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-gray-100 dark:bg-[#1a2540] rounded-2xl animate-pulse" />)}
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <p className="text-xs text-blue-600 font-semibold tracking-[0.2em] uppercase mb-1">My Account</p>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-[#dde8ff]">คำสั่งซื้อของฉัน</h1>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-[#1a2540] flex items-center justify-center mx-auto mb-5">
            <ArchiveBoxIcon className="w-10 h-10 text-gray-300" />
          </div>
          <p className="text-xl font-semibold text-slate-700 dark:text-[#b8cef0] mb-1">ยังไม่มีคำสั่งซื้อ</p>
          <p className="text-gray-400 dark:text-[#4e6888] text-sm mb-8">เริ่มต้นซื้อสินค้าชิ้นแรกของคุณได้เลย</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/40"
          >
            ช็อปเลย
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const cfg = STATUS_CONFIG[order.status] || { label: order.status, color: "bg-gray-100 dark:bg-[#1a2540] text-gray-600 dark:text-[#8aaad4] border border-gray-200 dark:border-[#304070]", dot: "bg-gray-400" };
            const isDelivered = order.status === "DELIVERED";
            return (
              <Link key={order.id} href={`/orders/${order.id}`}>
                <div className="bg-white dark:bg-[#131c30] border border-gray-100 dark:border-[#253350] rounded-2xl p-5 hover:shadow-md hover:border-blue-100 transition-all cursor-pointer group">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {isDelivered && <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />}
                        <p className="font-bold text-slate-800 dark:text-[#dde8ff] text-sm">#{order.id.slice(-8).toUpperCase()}</p>
                      </div>
                      <p className="text-xs text-gray-400 dark:text-[#4e6888]">{new Date(order.createdAt).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${cfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                      <ChevronRightIcon className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                    </div>
                  </div>

                  {/* Product image thumbnails + summary */}
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {order.items?.slice(0, 3).map((item: any, idx: number) => (
                        <div
                          key={item.id}
                          className="relative w-10 h-10 rounded-lg overflow-hidden border-2 border-white bg-gray-100 dark:bg-[#1a2540] flex-shrink-0"
                          style={{ zIndex: 3 - idx }}
                        >
                          {item.product.images?.[0] ? (
                            <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs">👗</div>
                          )}
                        </div>
                      ))}
                      {order.items?.length > 3 && (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#1a2540] border-2 border-white flex items-center justify-center text-xs text-gray-500 dark:text-[#6080a8] font-semibold flex-shrink-0">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-[#6080a8] truncate">
                        {order.items?.slice(0, 2).map((i: any) => i.product.name).join(", ")}
                        {order.items?.length > 2 ? ` และอีก ${order.items.length - 2} รายการ` : ""}
                      </p>
                    </div>
                    <p className="font-bold text-blue-700 text-sm flex-shrink-0">฿{order.total.toLocaleString()}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
