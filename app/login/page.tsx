"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { Logo } from "@/components/Logo";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        toast.error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      } else {
        toast.success("เข้าสู่ระบบสำเร็จ!");
        router.push("/");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Left — fashion image */}
      <div className="hidden lg:block lg:w-[55%] relative overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&q=80"
          alt="Fashion"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 to-slate-900/40" />
        <div className="absolute inset-0 flex flex-col items-start justify-end p-14">
          <Logo variant="light" />
          <p className="text-white/70 text-sm mt-3 max-w-xs leading-relaxed">
            แหล่งรวมแฟชั่นคุณภาพดี ราคาจับต้องได้ ส่งตรงถึงประตูบ้าน
          </p>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white dark:bg-[#111827] dark:bg-[#131c30]">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Link href="/"><Logo variant="dark" /></Link>
          </div>

          <p className="text-xs text-blue-600 font-semibold tracking-[0.2em] uppercase mb-2">Welcome Back</p>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-[#dde8ff] mb-1">เข้าสู่ระบบ</h1>
          <p className="text-gray-400 dark:text-[#4e6888] text-sm mb-8">ยินดีต้อนรับกลับมา</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-[#b8cef0] mb-1.5">อีเมล</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 dark:border-[#304070] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50 dark:bg-[#111827] focus:bg-white dark:bg-[#131c30] transition-colors"
                placeholder="example@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-[#b8cef0] mb-1.5">รหัสผ่าน</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-11 border border-gray-200 dark:border-[#304070] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50 dark:bg-[#111827] focus:bg-white dark:bg-[#131c30] transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#4e6888] hover:text-gray-600 dark:text-[#8aaad4] p-1"
                >
                  {showPw ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 disabled:opacity-50 transition-all active:scale-[0.98] mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  กำลังเข้าสู่ระบบ...
                </span>
              ) : "เข้าสู่ระบบ"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 dark:text-[#4e6888] mt-8">
            ยังไม่มีบัญชี?{" "}
            <Link href="/register" className="text-blue-600 hover:text-blue-800 font-semibold">
              สมัครสมาชิก
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
