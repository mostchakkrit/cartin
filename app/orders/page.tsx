"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronRightIcon, ArchiveBoxIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  PENDING:    { label: "รอดำเนินการ", color: "bg-[#E87400]/10 text-[#E87400] border border-[#E87400]/30",   dot: "bg-[#E87400]" },
  CONFIRMED:  { label: "ยืนยันแล้ว",  color: "bg-[#003399]/10 text-[#003399] border border-[#003399]/30",   dot: "bg-[#003399]" },
  PROCESSING: { label: "กำลังเตรียม", color: "bg-purple-50 text-purple-700 border border-purple-200",        dot: "bg-purple-500" },
  SHIPPED:    { label: "จัดส่งแล้ว",  color: "bg-indigo-50 text-indigo-700 border border-indigo-200",        dot: "bg-indigo-500" },
  DELIVERED:  { label: "ส่งสำเร็จ",   color: "bg-[#0A8A00]/10 text-[#0A8A00] border border-[#0A8A00]/30",   dot: "bg-[#0A8A00]" },
  CANCELLED:  { label: "ยกเลิก",      color: "bg-[#CC0008]/10 text-[#CC0008] border border-[#CC0008]/30",   dot: "bg-[#CC0008]" },
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
        <div className="h-3 w-20 bg-[#DFDFDF] rounded animate-pulse mb-2" />
        <div className="h-8 w-48 bg-[#DFDFDF] rounded animate-pulse" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-[#DFDFDF] rounded animate-pulse" />)}
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <p className="text-xs text-[#003399] font-semibold tracking-[0.2em] uppercase mb-1">My Account</p>
        <h1 className="text-3xl font-bold text-[#111111]">คำสั่งซื้อของฉัน</h1>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-24 h-24 rounded bg-[#F5F5F5] border border-[#DFDFDF] flex items-center justify-center mx-auto mb-5">
            <ArchiveBoxIcon className="w-10 h-10 text-[#DFDFDF]" />
          </div>
          <p className="text-xl font-semibold text-[#111111] mb-1">ยังไม่มีคำสั่งซื้อ</p>
          <p className="text-[#767676] text-sm mb-8">เริ่มต้นซื้อสินค้าชิ้นแรกของคุณได้เลย</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#003399] text-white font-bold rounded hover:bg-[#002B80] transition-all"
          >
            ช็อปเลย
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const cfg = STATUS_CONFIG[order.status] || { label: order.status, color: "bg-[#F5F5F5] text-[#484848] border border-[#DFDFDF]", dot: "bg-[#767676]" };
            const isDelivered = order.status === "DELIVERED";
            return (
              <Link key={order.id} href={`/orders/${order.id}`}>
                <div className="bg-white border border-[#DFDFDF] rounded p-5 hover:shadow-[0_4px_12px_rgba(17,17,17,0.08)] hover:border-[#003399] transition-all cursor-pointer group">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {isDelivered && <CheckCircleIcon className="w-4 h-4 text-[#0A8A00] flex-shrink-0" />}
                        <p className="font-bold text-[#111111] text-sm">#{order.id.slice(-8).toUpperCase()}</p>
                      </div>
                      <p className="text-xs text-[#767676]">{new Date(order.createdAt).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 ${cfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                      <ChevronRightIcon className="w-4 h-4 text-[#DFDFDF] group-hover:text-[#003399] transition-colors flex-shrink-0" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {order.items?.slice(0, 3).map((item: any, idx: number) => (
                        <div
                          key={item.id}
                          className="relative w-10 h-10 rounded overflow-hidden border-2 border-white bg-[#F5F5F5] flex-shrink-0"
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
                        <div className="w-10 h-10 rounded bg-[#F5F5F5] border-2 border-white flex items-center justify-center text-xs text-[#767676] font-semibold flex-shrink-0">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#767676] truncate">
                        {order.items?.slice(0, 2).map((i: any) => i.product.name).join(", ")}
                        {order.items?.length > 2 ? ` และอีก ${order.items.length - 2} รายการ` : ""}
                      </p>
                    </div>
                    <p className="font-bold text-[#003399] text-sm flex-shrink-0">฿{order.total.toLocaleString()}</p>
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
