import Link from "next/link";
import { Logo } from "@/components/Logo";
import {
  EnvelopeIcon,
  PhoneIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Main grid */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-12 gap-10 border-b border-white/10">
          {/* Brand column */}
          <div className="md:col-span-5">
            <Logo className="mb-5" variant="light" />
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs mb-6">
              แหล่งรวมแฟชั่นเสื้อผ้าและเครื่องประดับคุณภาพดี ราคาจับต้องได้
              จัดส่งรวดเร็วทั่วประเทศ
            </p>
            {/* Social icons placeholder */}
            <div className="flex gap-3">
              {["f", "ig", "line"].map((s) => (
                <div
                  key={s}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-blue-600 flex items-center justify-center text-xs font-bold text-gray-400 hover:text-white transition-all duration-200 cursor-pointer select-none"
                >
                  {s === "f" ? "f" : s === "ig" ? "ig" : "L"}
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="md:col-span-3">
            <h4 className="text-[11px] tracking-[0.2em] text-gray-500 uppercase font-semibold mb-5">
              สินค้า
            </h4>
            <ul className="space-y-3">
              {[
                { href: "/products", label: "สินค้าทั้งหมด" },
                { href: "/products?featured=true", label: "สินค้าแนะนำ" },
                { href: "/products?category=womens-clothing", label: "เสื้อผ้าผู้หญิง" },
                { href: "/products?category=mens-clothing", label: "เสื้อผ้าผู้ชาย" },
                { href: "/products?category=shoes", label: "รองเท้า" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors hover:translate-x-0.5 inline-block"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account + Contact */}
          <div className="md:col-span-4">
            <h4 className="text-[11px] tracking-[0.2em] text-gray-500 uppercase font-semibold mb-5">
              บัญชี & ติดต่อ
            </h4>
            <ul className="space-y-3 mb-6">
              {[
                { href: "/login", label: "เข้าสู่ระบบ" },
                { href: "/register", label: "สมัครสมาชิก" },
                { href: "/orders", label: "ประวัติคำสั่งซื้อ" },
                { href: "/contact", label: "ติดต่อเรา" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors hover:translate-x-0.5 inline-block"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="space-y-2.5">
              {[
                { icon: EnvelopeIcon, text: "support@cartin.com" },
                { icon: PhoneIcon, text: "02-XXX-XXXX" },
                { icon: ClockIcon, text: "จันทร์–ศุกร์ 9:00–18:00" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5 text-gray-500 text-xs">
                  <Icon className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-600 text-xs">© 2026 Cartin. All rights reserved.</p>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-700 text-xs">Secured by</span>
            <span className="text-xs font-semibold text-gray-500 bg-white/5 px-2 py-0.5 rounded">SSL</span>
            <span className="text-gray-700 text-xs ml-1">·</span>
            <span className="text-xs font-semibold text-gray-500 bg-white/5 px-2 py-0.5 rounded">VISA</span>
            <span className="text-xs font-semibold text-gray-500 bg-white/5 px-2 py-0.5 rounded">MC</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
