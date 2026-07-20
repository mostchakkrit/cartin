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
      {[200, 120, 160, 200].map((h, i) => <div key={i} className="bg-[#DFDFDF] rounded animate-pulse" style={{ height: h }} />)}
    </div>
  );
  if (!order || order.error) return <div className="text-center py-20 text-[#767676]">ไม่พบคำสั่งซื้อ</div>;

  const currentStep = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === "CANCELLED";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Link href="/orders" className="inline-flex items-center gap-1.5 text-[#767676] hover:text-[#003399] text-sm mb-8 group transition-colors">
        <ChevronLeftIcon className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
        คำสั่งซื้อของฉัน
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs text-[#003399] font-semibold tracking-[0.2em] uppercase mb-1">Order</p>
          <h1 className="text-2xl font-bold text-[#111111]">#{order.id.slice(-8).toUpperCase()}</h1>
          <p className="text-sm text-[#767676] mt-0.5">
            {new Date(order.createdAt).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        {isCancelled && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#CC0008]/10 text-[#CC0008] border border-[#CC0008]/30 rounded text-xs font-semibold">
            <XCircleIcon className="w-4 h-4" /> ยกเลิกแล้ว
          </span>
        )}
      </div>

      {/* Status tracker */}
      {!isCancelled && (
        <div className="bg-white border border-[#DFDFDF] rounded p-6 mb-5 shadow-[0_1px_3px_rgba(17,17,17,0.06)]">
          <p className="text-xs font-semibold text-[#767676] uppercase tracking-wider mb-5">สถานะการสั่งซื้อ</p>
          <div className="flex items-start">
            {STATUS_STEPS.map((step, i) => {
              const Icon = STEP_ICONS[i];
              const done = i < currentStep;
              const active = i === currentStep;
              return (
                <div key={step} className="flex items-start flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                      done ? "bg-[#003399] text-white" : active ? "bg-[#003399] text-white ring-4 ring-[#003399]/20" : "bg-[#F5F5F5] text-[#DFDFDF]"
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <p className={`text-[10px] mt-1.5 text-center hidden sm:block font-semibold leading-tight max-w-[60px] ${active ? "text-[#003399]" : done ? "text-[#484848]" : "text-[#767676]"}`}>
                      {STATUS_LABELS[step]}
                    </p>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className="flex-1 h-0.5 mt-4 mx-1 rounded-full transition-all" style={{ background: i < currentStep ? "#003399" : "#DFDFDF" }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Address + Payment */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div className="bg-white border border-[#DFDFDF] rounded p-5 shadow-[0_1px_3px_rgba(17,17,17,0.06)]">
          <div className="flex items-center gap-2 mb-3">
            <MapPinIcon className="w-4 h-4 text-[#003399]" />
            <p className="font-semibold text-[#111111] text-sm">ที่อยู่จัดส่ง</p>
          </div>
          {order.shippingAddress && (
            <div className="text-sm space-y-0.5 leading-relaxed">
              <p className="font-semibold text-[#111111]">{order.shippingAddress.name}</p>
              <p className="text-[#767676]">{order.shippingAddress.phone}</p>
              <p className="text-[#484848]">{order.shippingAddress.address}</p>
              <p className="text-[#484848]">{order.shippingAddress.province} {order.shippingAddress.postalCode}</p>
            </div>
          )}
        </div>

        <div className="bg-white border border-[#DFDFDF] rounded p-5 shadow-[0_1px_3px_rgba(17,17,17,0.06)]">
          <div className="flex items-center gap-2 mb-3">
            <CreditCardIcon className="w-4 h-4 text-[#003399]" />
            <p className="font-semibold text-[#111111] text-sm">การชำระเงิน</p>
          </div>
          <div className="text-sm space-y-1">
            <p className="text-[#484848]">{order.paymentMethod === "cod" ? "เก็บเงินปลายทาง" : order.paymentMethod === "bank_transfer" ? "โอนเงิน" : "บัตรเครดิต/เดบิต"}</p>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold ${order.paymentStatus === "PAID" ? "bg-[#0A8A00]/10 text-[#0A8A00] border border-[#0A8A00]/30" : "bg-[#E87400]/10 text-[#E87400] border border-[#E87400]/30"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${order.paymentStatus === "PAID" ? "bg-[#0A8A00]" : "bg-[#E87400]"}`} />
              {order.paymentStatus === "PAID" ? "ชำระแล้ว" : order.paymentStatus === "REFUNDED" ? "คืนเงินแล้ว" : "รอชำระ"}
            </span>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white border border-[#DFDFDF] rounded p-6 shadow-[0_1px_3px_rgba(17,17,17,0.06)]">
        <p className="text-xs font-semibold text-[#767676] uppercase tracking-wider mb-4">รายการสินค้า</p>
        <div className="space-y-4 mb-5">
          {order.items.map((item: any) => (
            <div key={item.id} className="flex gap-4 items-center">
              <Link href={`/products/${item.product.slug}`} className="relative flex-shrink-0 rounded overflow-hidden bg-[#F5F5F5]" style={{ width: 64, height: 64 }}>
                {item.product.images?.[0] ? (
                  <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg">👗</div>
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#111111] text-sm leading-snug">{item.product.name}</p>
                <div className="flex gap-1.5 mt-1">
                  {item.size && <span className="text-[10px] bg-[#F5F5F5] text-[#767676] px-1.5 py-0.5 rounded border border-[#DFDFDF]">ไซส์ {item.size}</span>}
                  {item.color && <span className="text-[10px] bg-[#F5F5F5] text-[#767676] px-1.5 py-0.5 rounded border border-[#DFDFDF]">{item.color}</span>}
                </div>
                <p className="text-xs text-[#767676] mt-0.5">x{item.quantity}</p>
              </div>
              <p className="font-bold text-[#111111] text-sm flex-shrink-0">฿{(item.price * item.quantity).toLocaleString()}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-[#DFDFDF] pt-4 space-y-2 text-sm">
          <div className="flex justify-between text-[#767676]">
            <span>ค่าสินค้า</span>
            <span>฿{order.subtotal?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-[#767676]">
            <span>ค่าจัดส่ง</span>
            <span className={order.shippingCost === 0 ? "text-[#0A8A00] font-semibold" : ""}>{order.shippingCost === 0 ? "ฟรี!" : `฿${order.shippingCost}`}</span>
          </div>
          <div className="flex justify-between font-bold text-base pt-1 border-t border-[#DFDFDF]">
            <span>รวมทั้งหมด</span>
            <span className="text-[#003399]">฿{order.total?.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
