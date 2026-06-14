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
  PENDING:    { label: "รอดำเนินการ", color: "bg-amber-50 text-amber-700 border border-amber-200" },
  CONFIRMED:  { label: "ยืนยันแล้ว",  color: "bg-blue-50 dark:bg-[#0f1d38] text-blue-700 border border-blue-200" },
  PROCESSING: { label: "กำลังเตรียม", color: "bg-purple-50 text-purple-700 border border-purple-200" },
  SHIPPED:    { label: "จัดส่งแล้ว",  color: "bg-indigo-50 text-indigo-700 border border-indigo-200" },
  DELIVERED:  { label: "ส่งสำเร็จ",   color: "bg-green-50 text-green-700 border border-green-200" },
  CANCELLED:  { label: "ยกเลิก",      color: "bg-red-50 text-red-600 border border-red-200" },
};

const QUICK_ACTIONS = [
  { href: "/admin/products",   label: "จัดการสินค้า",    desc: "เพิ่ม แก้ไข ลบสินค้า",     Icon: ShoppingBagIcon,           accent: "bg-blue-50 dark:bg-[#0f1d38] text-blue-600" },
  { href: "/admin/categories", label: "จัดการหมวดหมู่",  desc: "จัดการประเภทสินค้า",        Icon: TagIcon,                    accent: "bg-violet-50 text-violet-600" },
  { href: "/admin/orders",     label: "คำสั่งซื้อ",      desc: "ดูและอัปเดตสถานะออเดอร์",   Icon: ClipboardDocumentListIcon,  accent: "bg-emerald-50 text-emerald-600" },
  { href: "/admin/users",      label: "ผู้ใช้งาน",       desc: "ดูข้อมูลสมาชิกทั้งหมด",     Icon: UserGroupIcon,              accent: "bg-orange-50 text-orange-600" },
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="h-24 bg-gray-100 dark:bg-[#1a2540] rounded-2xl animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-100 dark:bg-[#1a2540] rounded-2xl animate-pulse" />)}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-100 dark:bg-[#1a2540] rounded-2xl animate-pulse" />)}
      </div>
    </div>
  );

  const statCards = [
    {
      label: "ผู้ใช้งานทั้งหมด",
      value: (stats?.totalUsers || 0).toLocaleString(),
      Icon: UsersIcon,
      bg: "bg-blue-600",
      light: "bg-blue-50 dark:bg-[#0f1d38]",
      text: "text-blue-600",
    },
    {
      label: "สินค้าทั้งหมด",
      value: (stats?.totalProducts || 0).toLocaleString(),
      Icon: ShoppingBagIcon,
      bg: "bg-violet-600",
      light: "bg-violet-50",
      text: "text-violet-600",
    },
    {
      label: "คำสั่งซื้อทั้งหมด",
      value: (stats?.totalOrders || 0).toLocaleString(),
      Icon: ShoppingCartIcon,
      bg: "bg-emerald-600",
      light: "bg-emerald-50",
      text: "text-emerald-600",
    },
    {
      label: "รายได้รวม (ที่ชำระแล้ว)",
      value: `฿${(stats?.totalRevenue || 0).toLocaleString()}`,
      Icon: CurrencyDollarIcon,
      bg: "bg-orange-500",
      light: "bg-orange-50",
      text: "text-orange-500",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Header */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl p-7 mb-8 flex items-center justify-between text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 50%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Squares2X2Icon className="w-4 h-4 text-blue-300" />
            <p className="text-blue-300 text-xs font-semibold tracking-[0.2em] uppercase">Admin Panel</p>
          </div>
          <h1 className="text-2xl font-bold mb-0.5">แผงควบคุม</h1>
          <p className="text-blue-200 text-sm">ยินดีต้อนรับ, {session?.user.name}</p>
        </div>
        <div className="relative hidden sm:flex items-center justify-center w-16 h-16 rounded-full bg-white dark:bg-[#131c30]/15 text-white text-2xl font-bold ring-2 ring-white/20 flex-shrink-0">
          {session?.user.name?.[0]?.toUpperCase()}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, Icon, bg, light, text }) => (
          <div key={label} className="bg-white dark:bg-[#131c30] border border-gray-100 dark:border-[#253350] rounded-2xl p-5 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${light} flex items-center justify-center mb-4`}>
              <Icon className={`w-5 h-5 ${text}`} />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-[#dde8ff] leading-tight">{value}</p>
            <p className="text-xs text-gray-400 dark:text-[#4e6888] mt-1 leading-snug">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {QUICK_ACTIONS.map(({ href, label, desc, Icon, accent }) => (
          <Link key={href} href={href}
            className="group bg-white dark:bg-[#131c30] border border-gray-100 dark:border-[#253350] rounded-2xl p-5 hover:shadow-md hover:border-blue-100 transition-all"
          >
            <div className={`w-10 h-10 rounded-xl ${accent} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="font-semibold text-slate-800 dark:text-[#dde8ff] text-sm mb-0.5">{label}</p>
            <p className="text-xs text-gray-400 dark:text-[#4e6888] leading-snug">{desc}</p>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      {stats?.recentOrders?.length > 0 && (
        <div className="bg-white dark:bg-[#131c30] border border-gray-100 dark:border-[#253350] rounded-2xl shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#253350]">
            <div className="flex items-center gap-2">
              <ArrowTrendingUpIcon className="w-4 h-4 text-blue-600" />
              <h2 className="font-semibold text-slate-800 dark:text-[#dde8ff] text-sm">คำสั่งซื้อล่าสุด</h2>
            </div>
            <Link href="/admin/orders" className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors">
              ดูทั้งหมด <ChevronRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Table */}
          <div className="divide-y divide-gray-50 dark:divide-[#131c30]">
            {stats.recentOrders.map((order: any) => {
              const cfg = STATUS_CONFIG[order.status] || { label: order.status, color: "bg-gray-100 dark:bg-[#1a2540] text-gray-600 dark:text-[#8aaad4] border border-gray-200 dark:border-[#304070]" };
              return (
                <Link key={order.id} href={`/admin/orders`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:bg-[#111827] transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-[#0f1d38] flex items-center justify-center flex-shrink-0">
                      <ShoppingCartIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-[#dde8ff] text-sm">#{order.id.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-gray-400 dark:text-[#4e6888] mt-0.5">{order.user?.name} · {new Date(order.createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`hidden sm:inline-flex px-2.5 py-1 rounded-full text-[10px] font-semibold ${cfg.color}`}>
                      {cfg.label}
                    </span>
                    {order.paymentStatus === "PAID" && (
                      <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" title="ชำระแล้ว" />
                    )}
                    <p className="font-bold text-blue-700 text-sm">฿{order.total.toLocaleString()}</p>
                    <ChevronRightIcon className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
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
