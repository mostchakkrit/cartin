import Link from "next/link";
import { Logo } from "@/components/Logo";
import { EnvelopeIcon, PhoneIcon, ClockIcon } from "@heroicons/react/24/outline";

export function Footer() {
  return (
    <footer className="bg-[#003399] text-white mt-auto">
      <div className="max-w-[1400px] mx-auto px-5">
        {/* Main grid */}
        <div className="py-14 grid grid-cols-1 md:grid-cols-12 gap-10 border-b border-white/10">
          {/* Brand */}
          <div className="md:col-span-5">
            <Logo className="mb-5" variant="light" />
            <p className="text-white/60 text-sm leading-relaxed max-w-xs mb-6">
              แหล่งรวมแฟชั่นเสื้อผ้าและเครื่องประดับคุณภาพดี ราคาจับต้องได้
              จัดส่งรวดเร็วทั่วประเทศ
            </p>
            <div className="flex gap-3">
              {[{ id: "f", label: "f" }, { id: "ig", label: "ig" }, { id: "line", label: "L" }].map(({ id, label }) => (
                <div key={id} className="w-9 h-9 rounded bg-white/10 hover:bg-[#FFDA1A] hover:text-[#003399] flex items-center justify-center text-xs font-bold text-white/60 transition-all cursor-pointer select-none">
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Products links */}
          <div className="md:col-span-3">
            <h4 className="text-[11px] tracking-[0.2em] text-white/40 uppercase font-semibold mb-5">สินค้า</h4>
            <ul className="space-y-3">
              {[
                { href: "/products", label: "สินค้าทั้งหมด" },
                { href: "/products?featured=true", label: "สินค้าแนะนำ" },
                { href: "/products?category=womens-clothing", label: "เสื้อผ้าผู้หญิง" },
                { href: "/products?category=mens-clothing", label: "เสื้อผ้าผู้ชาย" },
                { href: "/products?category=shoes", label: "รองเท้า" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-white/60 hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account & Contact */}
          <div className="md:col-span-4">
            <h4 className="text-[11px] tracking-[0.2em] text-white/40 uppercase font-semibold mb-5">บัญชี & ติดต่อ</h4>
            <ul className="space-y-3 mb-6">
              {[
                { href: "/login", label: "เข้าสู่ระบบ" },
                { href: "/register", label: "สมัครสมาชิก" },
                { href: "/orders", label: "ประวัติคำสั่งซื้อ" },
                { href: "/contact", label: "ติดต่อเรา" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-white/60 hover:text-white transition-colors">
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
                <div key={text} className="flex items-center gap-2.5 text-white/50 text-xs">
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/40 text-xs">© 2026 Cartin. All rights reserved.</p>
          <div className="flex items-center gap-1.5">
            <span className="text-white/30 text-xs">Secured by</span>
            {["SSL", "VISA", "MC"].map((b) => (
              <span key={b} className="text-xs font-semibold text-white/50 bg-white/10 px-2 py-0.5 rounded">{b}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
