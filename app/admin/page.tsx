"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBagIcon,
  UsersIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  ChevronRightIcon,
  Squares2X2Icon,
  TagIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING:    { label: "รอดำเนินการ", color: "bg-[#E87400]/10 text-[#E87400] border border-[#E87400]/30" },
  CONFIRMED:  { label: "ยืนยันแล้ว",  color: "bg-[#003399]/10 text-[#003399] border border-[#003399]/30" },
  PROCESSING: { label: "กำลังเตรียม", color: "bg-purple-50 text-purple-700 border border-purple-200" },
  SHIPPED:    { label: "จัดส่งแล้ว",  color: "bg-indigo-50 text-indigo-700 border border-indigo-200" },
  DELIVERED:  { label: "ส่งสำเร็จ",   color: "bg-[#0A8A00]/10 text-[#0A8A00] border border-[#0A8A00]/30" },
  CANCELLED:  { label: "ยกเลิก",      color: "bg-[#CC0008]/10 text-[#CC0008] border border-[#CC0008]/30" },
};

const QUICK_ACTIONS = [
  { href: "/admin/products",   label: "จัดการสินค้า",    desc: "เพิ่ม แก้ไข ลบสินค้า",     Icon: ShoppingBagIcon,          accent: "bg-[#003399]/10 text-[#003399]" },
  { href: "/admin/categories", label: "จัดการหมวดหมู่",  desc: "จัดการประเภทสินค้า",        Icon: TagIcon,                   accent: "bg-violet-50 text-violet-600" },
  { href: "/admin/orders",     label: "คำสั่งซื้อ",      desc: "ดูและอัปเดตสถานะออเดอร์",   Icon: ClipboardDocumentListIcon, accent: "bg-[#0A8A00]/10 text-[#0A8A00]" },
  { href: "/admin/users",      label: "ผู้ใช้งาน",       desc: "ดูข้อมูลสมาชิกทั้งหมด",     Icon: UserGroupIcon,             accent: "bg-[#E87400]/10 text-[#E87400]" },
];

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") {
      if (session?.user.role !== "ADMIN") { router.push("/"); return; }
      fetch("/api/admin/stats")
        .then((r) => r.json())
        .then(setStats)
        .finally(() => setLoading(false));
    }
  }, [status, session]);

  if (loading) return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="h-24 bg-[#DFDFDF] rounded animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-28 bg-[#DFDFDF] rounded animate-pulse" />)}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-[#DFDFDF] rounded animate-pulse" />)}
      </div>
    </div>
  );

  const statCards = [
    { label: "ผู้ใช้งานทั้งหมด",     value: (stats?.totalUsers || 0).toLocaleString(),              Icon: UsersIcon,          bg: "bg-[#003399]",   light: "bg-[#003399]/10", text: "text-[#003399]" },
    { label: "สินค้าทั้งหมด",         value: (stats?.totalProducts || 0).toLocaleString(),            Icon: ShoppingBagIcon,    bg: "bg-violet-600",  light: "bg-violet-50",    text: "text-violet-600" },
    { label: "คำสั่งซื้อทั้งหมด",    value: (stats?.totalOrders || 0).toLocaleString(),              Icon: ShoppingCartIcon,   bg: "bg-[#0A8A00]",   light: "bg-[#0A8A00]/10", text: "text-[#0A8A00]" },
    { label: "รายได้รวม (ที่ชำระแล้ว)", value: `฿${(stats?.totalRevenue || 0).toLocaleString()}`,  Icon: CurrencyDollarIcon, bg: "bg-[#E87400]",   light: "bg-[#E87400]/10", text: "text-[#E87400]" },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Header */}
      <div className="bg-[#003399] rounded p-7 mb-8 flex items-center justify-between text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 50%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Squares2X2Icon className="w-4 h-4 text-[#FFDA1A]" />
            <p className="text-[#FFDA1A] text-xs font-semibold tracking-[0.2em] uppercase">Admin Panel</p>
          </div>
          <h1 className="text-2xl font-bold mb-0.5">แผงควบคุม</h1>
          <p className="text-white/70 text-sm">ยินดีต้อนรับ, {session?.user.name}</p>
        </div>
        <div className="relative hidden sm:flex items-center justify-center w-16 h-16 rounded-full bg-[#FFDA1A] text-[#003399] text-2xl font-bold ring-2 ring-white/20 flex-shrink-0">
          {session?.user.name?.[0]?.toUpperCase()}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, Icon, light, text }) => (
          <div key={label} className="bg-white border border-[#DFDFDF] rounded p-5 shadow-[0_1px_3px_rgba(17,17,17,0.06)]">
            <div className={`w-10 h-10 rounded ${light} flex items-center justify-center mb-4`}>
              <Icon className={`w-5 h-5 ${text}`} />
            </div>
            <p className="text-2xl font-bold text-[#111111] leading-tight">{value}</p>
            <p className="text-xs text-[#767676] mt-1 leading-snug">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {QUICK_ACTIONS.map(({ href, label, desc, Icon, accent }) => (
          <Link key={href} href={href}
            className="group bg-white border border-[#DFDFDF] rounded p-5 hover:shadow-[0_4px_12px_rgba(17,17,17,0.08)] hover:border-[#003399] transition-all"
          >
            <div className={`w-10 h-10 rounded ${accent} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="font-semibold text-[#111111] text-sm mb-0.5">{label}</p>
            <p className="text-xs text-[#767676] leading-snug">{desc}</p>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      {stats?.recentOrders?.length > 0 && (
        <div className="bg-white border border-[#DFDFDF] rounded shadow-[0_1px_3px_rgba(17,17,17,0.06)] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#DFDFDF]">
            <div className="flex items-center gap-2">
              <ArrowTrendingUpIcon className="w-4 h-4 text-[#003399]" />
              <h2 className="font-semibold text-[#111111] text-sm">คำสั่งซื้อล่าสุด</h2>
            </div>
            <Link href="/admin/orders" className="text-xs text-[#003399] hover:text-[#002B80] font-semibold flex items-center gap-1 transition-colors">
              ดูทั้งหมด <ChevronRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#DFDFDF]">
            {stats.recentOrders.map((order: any) => {
              const cfg = STATUS_CONFIG[order.status] || { label: order.status, color: "bg-[#F5F5F5] text-[#484848] border border-[#DFDFDF]" };
              return (
                <Link key={order.id} href={`/admin/orders`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-[#F5F5F5] transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded bg-[#003399]/10 flex items-center justify-center flex-shrink-0">
                      <ShoppingCartIcon className="w-4 h-4 text-[#003399]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#111111] text-sm">#{order.id.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-[#767676] mt-0.5">{order.user?.name} · {new Date(order.createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`hidden sm:inline-flex px-2.5 py-1 rounded text-[10px] font-semibold ${cfg.color}`}>
                      {cfg.label}
                    </span>
                    {order.paymentStatus === "PAID" && (
                      <CheckCircleIcon className="w-4 h-4 text-[#0A8A00] flex-shrink-0" title="ชำระแล้ว" />
                    )}
                    <p className="font-bold text-[#003399] text-sm">฿{order.total.toLocaleString()}</p>
                    <ChevronRightIcon className="w-4 h-4 text-[#DFDFDF] group-hover:text-[#003399] transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
