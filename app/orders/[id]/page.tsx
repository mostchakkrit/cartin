"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  HomeIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";
import { ChevronLeftIcon, MapPinIcon, CreditCardIcon } from "@heroicons/react/24/outline";

const STATUS_STEPS = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];
const STATUS_LABELS: Record<string, string> = {
  PENDING: "รอดำเนินการ", CONFIRMED: "ยืนยันแล้ว", PROCESSING: "กำลังเตรียม",
  SHIPPED: "จัดส่งแล้ว", DELIVERED: "ส่งสำเร็จ", CANCELLED: "ยกเลิก",
};
const STEP_ICONS = [ClockIcon, CheckCircleIcon, CheckCircleIcon, TruckIcon, HomeIcon];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { status } = useSession();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated" && id) {
      fetch(`/api/orders/${id}`)
        .then((r) => r.json())
        .then(setOrder)
        .finally(() => setLoading(false));
    }
  }, [status, id]);

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-4">
      {[200, 120, 160, 200].map((h, i) => <div key={i} className="bg-gray-100 dark:bg-[#1a2540] rounded-2xl animate-pulse" style={{ height: h }} />)}
    </div>
  );
  if (!order || order.error) return <div className="text-center py-20 text-gray-400 dark:text-[#4e6888]">ไม่พบคำสั่งซื้อ</div>;

  const currentStep = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === "CANCELLED";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Link href="/orders" className="inline-flex items-center gap-1.5 text-gray-500 dark:text-[#6080a8] hover:text-blue-700 text-sm mb-8 group transition-colors">
        <ChevronLeftIcon className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
        คำสั่งซื้อของฉัน
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs text-blue-600 font-semibold tracking-[0.2em] uppercase mb-1">Order</p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-[#dde8ff]">#{order.id.slice(-8).toUpperCase()}</h1>
          <p className="text-sm text-gray-400 dark:text-[#4e6888] mt-0.5">
            {new Date(order.createdAt).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        {isCancelled && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-full text-xs font-semibold">
            <XCircleIcon className="w-4 h-4" /> ยกเลิกแล้ว
          </span>
        )}
      </div>

      {/* Status tracker */}
      {!isCancelled && (
        <div className="bg-white dark:bg-[#131c30] border border-gray-100 dark:border-[#253350] rounded-2xl p-6 mb-5 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 dark:text-[#4e6888] uppercase tracking-wider mb-5">สถานะการสั่งซื้อ</p>
          <div className="flex items-start">
            {STATUS_STEPS.map((step, i) => {
              const Icon = STEP_ICONS[i];
              const done = i < currentStep;
              const active = i === currentStep;
              return (
                <div key={step} className="flex items-start flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                      done ? "bg-blue-600 text-white" : active ? "bg-blue-700 text-white ring-4 ring-blue-100" : "bg-gray-100 dark:bg-[#1a2540] text-gray-400 dark:text-[#4e6888]"
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <p className={`text-[10px] mt-1.5 text-center hidden sm:block font-medium leading-tight max-w-[60px] ${active ? "text-blue-700" : done ? "text-slate-600 dark:text-[#8aaad4]" : "text-gray-400 dark:text-[#4e6888]"}`}>
                      {STATUS_LABELS[step]}
                    </p>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mt-4 mx-1 rounded-full transition-all ${done || active && i < currentStep ? "bg-blue-500" : i < currentStep ? "bg-blue-500" : "bg-gray-200"}`} style={{ background: i < currentStep ? "#3b82f6" : "#e5e7eb" }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Address + Payment */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div className="bg-white dark:bg-[#131c30] border border-gray-100 dark:border-[#253350] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <MapPinIcon className="w-4 h-4 text-blue-600" />
            <p className="font-semibold text-slate-800 dark:text-[#dde8ff] text-sm">ที่อยู่จัดส่ง</p>
          </div>
          {order.shippingAddress && (
            <div className="text-sm text-gray-600 dark:text-[#8aaad4] space-y-0.5 leading-relaxed">
              <p className="font-semibold text-slate-800 dark:text-[#dde8ff]">{order.shippingAddress.name}</p>
              <p className="text-gray-500 dark:text-[#6080a8]">{order.shippingAddress.phone}</p>
              <p>{order.shippingAddress.address}</p>
              <p>{order.shippingAddress.province} {order.shippingAddress.postalCode}</p>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-[#131c30] border border-gray-100 dark:border-[#253350] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <CreditCardIcon className="w-4 h-4 text-blue-600" />
            <p className="font-semibold text-slate-800 dark:text-[#dde8ff] text-sm">การชำระเงิน</p>
          </div>
          <div className="text-sm text-gray-600 dark:text-[#8aaad4] space-y-1">
            <p>{order.paymentMethod === "cod" ? "เก็บเงินปลายทาง" : order.paymentMethod === "bank_transfer" ? "โอนเงิน" : "บัตรเครดิต/เดบิต"}</p>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${order.paymentStatus === "PAID" ? "bg-green-50 text-green-700 border border-green-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${order.paymentStatus === "PAID" ? "bg-green-500" : "bg-amber-400"}`} />
              {order.paymentStatus === "PAID" ? "ชำระแล้ว" : order.paymentStatus === "REFUNDED" ? "คืนเงินแล้ว" : "รอชำระ"}
            </span>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white dark:bg-[#131c30] border border-gray-100 dark:border-[#253350] rounded-2xl p-6 shadow-sm">
        <p className="text-xs font-semibold text-gray-400 dark:text-[#4e6888] uppercase tracking-wider mb-4">รายการสินค้า</p>
        <div className="space-y-4 mb-5">
          {order.items.map((item: any) => (
            <div key={item.id} className="flex gap-4 items-center">
              <Link href={`/products/${item.product.slug}`} className="relative flex-shrink-0 rounded-xl overflow-hidden bg-gray-50 dark:bg-[#111827]" style={{ width: 64, height: 80 }}>
                {item.product.images?.[0] ? (
                  <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg">👗</div>
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 dark:text-[#dde8ff] text-sm leading-snug">{item.product.name}</p>
                <div className="flex gap-1.5 mt-1">
                  {item.size && <span className="text-[10px] bg-gray-100 dark:bg-[#1a2540] text-gray-500 dark:text-[#6080a8] px-1.5 py-0.5 rounded">ไซส์ {item.size}</span>}
                  {item.color && <span className="text-[10px] bg-gray-100 dark:bg-[#1a2540] text-gray-500 dark:text-[#6080a8] px-1.5 py-0.5 rounded">{item.color}</span>}
                </div>
                <p className="text-xs text-gray-400 dark:text-[#4e6888] mt-0.5">x{item.quantity}</p>
              </div>
              <p className="font-bold text-slate-800 dark:text-[#dde8ff] text-sm flex-shrink-0">฿{(item.price * item.quantity).toLocaleString()}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 dark:border-[#253350] pt-4 space-y-2 text-sm">
          <div className="flex justify-between text-gray-500 dark:text-[#6080a8]">
            <span>ค่าสินค้า</span>
            <span>฿{order.subtotal?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-gray-500 dark:text-[#6080a8]">
            <span>ค่าจัดส่ง</span>
            <span className={order.shippingCost === 0 ? "text-green-600 font-medium" : ""}>{order.shippingCost === 0 ? "ฟรี!" : `฿${order.shippingCost}`}</span>
          </div>
          <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-100 dark:border-[#253350]">
            <span>รวมทั้งหมด</span>
            <span className="text-blue-700">฿{order.total?.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
