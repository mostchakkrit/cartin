"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { Logo } from "@/components/Logo";
import { EyeIcon, EyeSlashIcon, CheckIcon } from "@heroicons/react/24/outline";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const pwStrong = form.password.length >= 8;
  const pwMatch = form.password === form.confirm && form.confirm.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error("รหัสผ่านไม่ตรงกัน"); return; }
    if (form.password.length < 6) { toast.error("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      if (res.ok) {
        toast.success("สมัครสมาชิกสำเร็จ!");
        router.push("/login");
      } else {
        const data = await res.json();
        toast.error(data.error || "เกิดข้อผิดพลาด");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-60px)]">
      {/* Left — fashion image */}
      <div className="hidden lg:block lg:w-[45%] relative overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80"
          alt="Fashion store"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-[#003399]/60" />
        <div className="absolute inset-0 flex flex-col items-start justify-end p-14">
          <Logo variant="light" />
          <p className="text-white/70 text-sm mt-3 max-w-xs leading-relaxed">
            เข้าร่วมเป็นสมาชิก Cartin วันนี้ รับสิทธิพิเศษและส่วนลดมากมาย
          </p>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white overflow-y-auto">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 flex justify-center">
            <Link href="/"><Logo variant="dark" /></Link>
          </div>

          <p className="text-xs text-[#003399] font-semibold tracking-[0.2em] uppercase mb-2">Join Us</p>
          <h1 className="text-3xl font-bold text-[#111111] mb-1">สมัครสมาชิก</h1>
          <p className="text-[#767676] text-sm mb-8">สร้างบัญชีใหม่ของคุณ</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#484848] mb-1.5">ชื่อ-นามสกุล</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                maxLength={100}
                className="w-full px-4 py-3 border border-[#DFDFDF] rounded focus:outline-none focus:ring-2 focus:ring-[#003399] text-sm bg-[#F5F5F5] focus:bg-white transition-colors"
                placeholder="ชื่อของคุณ"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#484848] mb-1.5">อีเมล</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                maxLength={254}
                className="w-full px-4 py-3 border border-[#DFDFDF] rounded focus:outline-none focus:ring-2 focus:ring-[#003399] text-sm bg-[#F5F5F5] focus:bg-white transition-colors"
                placeholder="example@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#484848] mb-1.5">รหัสผ่าน</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  className="w-full px-4 py-3 pr-11 border border-[#DFDFDF] rounded focus:outline-none focus:ring-2 focus:ring-[#003399] text-sm bg-[#F5F5F5] focus:bg-white transition-colors"
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#767676] hover:text-[#484848] p-1">
                  {showPw ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
              {form.password && (
                <p className={`text-xs mt-1.5 flex items-center gap-1 ${pwStrong ? "text-[#0A8A00]" : "text-[#E87400]"}`}>
                  <CheckIcon className="w-3 h-3" />
                  {pwStrong ? "รหัสผ่านแข็งแกร่ง" : "ควรมี 8 ตัวอักษรขึ้นไป"}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#484848] mb-1.5">ยืนยันรหัสผ่าน</label>
              <div className="relative">
                <input
                  type="password"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  required
                  className={`w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 text-sm bg-[#F5F5F5] focus:bg-white transition-colors ${
                    form.confirm ? (pwMatch ? "border-[#0A8A00] focus:ring-[#0A8A00]" : "border-[#CC0008] focus:ring-[#CC0008]") : "border-[#DFDFDF] focus:ring-[#003399]"
                  }`}
                  placeholder="••••••••"
                />
                {pwMatch && (
                  <CheckIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0A8A00]" />
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#003399] text-white font-bold rounded hover:bg-[#002B80] disabled:opacity-50 transition-all active:scale-[0.98] mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  กำลังสมัคร...
                </span>
              ) : "สมัครสมาชิก"}
            </button>
          </form>

          <p className="text-center text-sm text-[#767676] mt-8">
            มีบัญชีแล้ว?{" "}
            <Link href="/login" className="text-[#003399] hover:text-[#002B80] font-semibold">
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
