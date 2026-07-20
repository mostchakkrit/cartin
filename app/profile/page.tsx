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
      <div className="h-40 bg-[#DFDFDF] rounded animate-pulse" />
      <div className="h-64 bg-[#DFDFDF] rounded animate-pulse" />
    </div>
  );

  const initial = session?.user.name?.[0]?.toUpperCase() || "U";
  const isAdmin = session?.user.role === "ADMIN";

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <p className="text-xs text-[#003399] font-semibold tracking-[0.2em] uppercase mb-1">My Account</p>
        <h1 className="text-3xl font-bold text-[#111111]">โปรไฟล์</h1>
      </div>

      {/* Avatar card */}
      <div className="bg-[#003399] rounded p-6 mb-5 text-white flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-[#FFDA1A] flex items-center justify-center text-[#003399] text-2xl font-bold flex-shrink-0 ring-2 ring-white/20">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-lg leading-tight">{session?.user.name || "ผู้ใช้งาน"}</p>
          <p className="text-white/70 text-sm truncate">{session?.user.email}</p>
          {isAdmin && (
            <span className="mt-1.5 inline-block text-[10px] font-bold tracking-wider text-[#003399] bg-[#FFDA1A] px-2 py-0.5 rounded uppercase">Administrator</span>
          )}
        </div>
      </div>

      {/* Form card */}
      <div className="bg-white border border-[#DFDFDF] rounded p-6 shadow-[0_1px_3px_rgba(17,17,17,0.06)] mb-5">
        <p className="text-xs font-semibold text-[#767676] uppercase tracking-wider mb-5">ข้อมูลส่วนตัว</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: "ชื่อ-นามสกุล", key: "name", type: "text", Icon: UserIcon, placeholder: "ชื่อของคุณ" },
            { label: "เบอร์โทรศัพท์", key: "phone", type: "tel", Icon: PhoneIcon, placeholder: "0XX-XXX-XXXX" },
            { label: "ที่อยู่", key: "address", type: "text", Icon: MapPinIcon, placeholder: "ที่อยู่สำหรับจัดส่ง" },
          ].map(({ label, key, type, Icon, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-semibold text-[#484848] mb-1.5">{label}</label>
              <div className="relative">
                <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#767676]" />
                <input
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                  className="w-full pl-10 pr-4 py-3 border border-[#DFDFDF] rounded focus:outline-none focus:ring-2 focus:ring-[#003399] text-sm bg-[#F5F5F5] focus:bg-white transition-colors"
                />
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#003399] text-white font-bold rounded hover:bg-[#002B80] disabled:opacity-50 transition-all active:scale-[0.99] mt-2 flex items-center justify-center gap-2"
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
        <Link href="/orders" className="bg-white border border-[#DFDFDF] rounded p-4 flex items-center gap-3 hover:shadow-[0_4px_12px_rgba(17,17,17,0.08)] hover:border-[#003399] transition-all group">
          <div className="w-9 h-9 bg-[#F5F5F5] rounded flex items-center justify-center group-hover:bg-[#003399]/10 transition-colors flex-shrink-0">
            <ShoppingBagIcon className="w-4 h-4 text-[#003399]" />
          </div>
          <div>
            <p className="font-semibold text-[#111111] text-sm">คำสั่งซื้อ</p>
            <p className="text-xs text-[#767676]">ประวัติการสั่งซื้อ</p>
          </div>
        </Link>
        <Link href="/payment-methods" className="bg-white border border-[#DFDFDF] rounded p-4 flex items-center gap-3 hover:shadow-[0_4px_12px_rgba(17,17,17,0.08)] hover:border-[#003399] transition-all group">
          <div className="w-9 h-9 bg-[#F5F5F5] rounded flex items-center justify-center group-hover:bg-[#003399]/10 transition-colors flex-shrink-0">
            <CreditCardIcon className="w-4 h-4 text-[#003399]" />
          </div>
          <div>
            <p className="font-semibold text-[#111111] text-sm">วิธีชำระเงิน</p>
            <p className="text-xs text-[#767676]">จัดการบัตร/บัญชี</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
