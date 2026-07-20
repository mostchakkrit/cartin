"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { UserIcon, PhoneIcon, MapPinIcon, ShoppingBagIcon, CreditCardIcon, CheckIcon } from "@heroicons/react/24/outline";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") {
      fetch("/api/users/profile")
        .then((r) => r.json())
        .then((data) => setForm({ name: data.name || "", phone: data.phone || "", address: data.address || "" }));
    }
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) { toast.success("บันทึกข้อมูลสำเร็จ!"); setSaved(true); setTimeout(() => setSaved(false), 3000); }
      else toast.error("เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-4">
      <div className="h-40 bg-gray-100 dark:bg-[#1a2540] rounded-2xl animate-pulse" />
      <div className="h-64 bg-gray-100 dark:bg-[#1a2540] rounded-2xl animate-pulse" />
    </div>
  );

  const initial = session?.user.name?.[0]?.toUpperCase() || "U";
  const isAdmin = session?.user.role === "ADMIN";

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <p className="text-xs text-blue-600 font-semibold tracking-[0.2em] uppercase mb-1">My Account</p>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-[#dde8ff]">โปรไฟล์</h1>
      </div>

      {/* Avatar card */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl p-6 mb-5 text-white flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-white dark:bg-[#131c30]/20 backdrop-blur flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 ring-2 ring-white/30">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-lg leading-tight">{session?.user.name || "ผู้ใช้งาน"}</p>
          <p className="text-blue-200 text-sm truncate">{session?.user.email}</p>
          {isAdmin && (
            <span className="mt-1.5 inline-block text-[10px] font-bold tracking-wider text-blue-700 bg-white px-2 py-0.5 rounded-full uppercase">Administrator</span>
          )}
        </div>
      </div>

      {/* Form card */}
      <div className="bg-white dark:bg-[#131c30] border border-gray-100 dark:border-[#253350] rounded-2xl p-6 shadow-sm mb-5">
        <p className="text-xs font-semibold text-gray-400 dark:text-[#4e6888] uppercase tracking-wider mb-5">ข้อมูลส่วนตัว</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: "ชื่อ-นามสกุล", key: "name", type: "text", Icon: UserIcon, placeholder: "ชื่อของคุณ" },
            { label: "เบอร์โทรศัพท์", key: "phone", type: "tel", Icon: PhoneIcon, placeholder: "0XX-XXX-XXXX" },
            { label: "ที่อยู่", key: "address", type: "text", Icon: MapPinIcon, placeholder: "ที่อยู่สำหรับจัดส่ง" },
          ].map(({ label, key, type, Icon, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-700 dark:text-[#b8cef0] mb-1.5">{label}</label>
              <div className="relative">
                <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-[#4e6888]" />
                <input
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-[#304070] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50 dark:bg-[#111827] focus:bg-white dark:bg-[#131c30] transition-colors"
                />
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 disabled:opacity-50 transition-all active:scale-[0.99] mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> กำลังบันทึก...</>
            ) : saved ? (
              <><CheckIcon className="w-4 h-4" /> บันทึกสำเร็จ!</>
            ) : "บันทึกข้อมูล"}
          </button>
        </form>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/orders" className="bg-white dark:bg-[#131c30] border border-gray-100 dark:border-[#253350] rounded-2xl p-4 flex items-center gap-3 hover:shadow-md hover:border-blue-100 transition-all group">
          <div className="w-9 h-9 bg-blue-50 dark:bg-[#0f1d38] rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors flex-shrink-0">
            <ShoppingBagIcon className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 dark:text-[#dde8ff] text-sm">คำสั่งซื้อ</p>
            <p className="text-xs text-gray-400 dark:text-[#4e6888]">ประวัติการสั่งซื้อ</p>
          </div>
        </Link>
        <Link href="/payment-methods" className="bg-white dark:bg-[#131c30] border border-gray-100 dark:border-[#253350] rounded-2xl p-4 flex items-center gap-3 hover:shadow-md hover:border-blue-100 transition-all group">
          <div className="w-9 h-9 bg-blue-50 dark:bg-[#0f1d38] rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors flex-shrink-0">
            <CreditCardIcon className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 dark:text-[#dde8ff] text-sm">วิธีชำระเงิน</p>
            <p className="text-xs text-gray-400 dark:text-[#4e6888]">จัดการบัตร/บัญชี</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
