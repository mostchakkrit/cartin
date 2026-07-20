"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  ShoppingCartIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useCart } from "@/hooks/useCart";
import { Logo } from "@/components/Logo";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { itemCount } = useCart();

  useEffect(() => {
    if (!userMenuOpen) return;
    const close = () => setUserMenuOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [userMenuOpen]);

  return (
    <nav className="sticky top-0 z-50 bg-[#003399] shadow-[0_2px_8px_rgba(0,51,153,0.3)]">
      <div className="max-w-[1400px] mx-auto px-5">
        <div className="flex items-center justify-between h-[60px]">

          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <Logo variant="light" />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { href: "/", label: "หน้าแรก" },
              { href: "/products", label: "สินค้าทั้งหมด" },
              { href: "/contact", label: "ติดต่อเรา" },
            ].map(({ href, label }) => {
              const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link key={href} href={href}
                  className={`text-sm font-semibold pb-0.5 transition-colors border-b-2 ${
                    isActive
                      ? "text-[#FFDA1A] border-[#FFDA1A]"
                      : "text-white/80 border-transparent hover:text-white hover:border-white/40"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
            {session?.user.role === "ADMIN" && (
              <Link href="/admin"
                className={`text-sm font-semibold pb-0.5 transition-colors border-b-2 ${
                  pathname.startsWith("/admin")
                    ? "text-[#FFDA1A] border-[#FFDA1A]"
                    : "text-white/80 border-transparent hover:text-white hover:border-white/40"
                }`}
              >
                แผงควบคุม
              </Link>
            )}
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <Link href="/search" className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors">
              <MagnifyingGlassIcon className="w-5 h-5" />
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative p-2 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors">
              <ShoppingCartIcon className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#FFDA1A] text-[#003399] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Link>

            {/* User */}
            {session ? (
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="hidden md:flex items-center gap-1.5 pl-2 pr-3 py-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors text-sm"
                >
                  <span className="w-7 h-7 rounded-full bg-[#FFDA1A] text-[#003399] font-bold flex items-center justify-center text-xs">
                    {session.user.name?.[0]?.toUpperCase() ?? "U"}
                  </span>
                  <span className="font-semibold max-w-[80px] truncate">{session.user.name?.split(" ")[0]}</span>
                  <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="md:hidden p-2 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
                >
                  <UserIcon className="w-5 h-5" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded shadow-[0_8px_24px_rgba(17,17,17,0.12)] border border-[#DFDFDF] py-1 z-50 animate-fade-up">
                    <div className="px-4 py-3 border-b border-[#DFDFDF]">
                      <p className="text-[11px] text-[#767676] uppercase tracking-wider">ยินดีต้อนรับ</p>
                      <p className="text-sm font-bold text-[#111111] mt-0.5 truncate">{session.user.name}</p>
                    </div>
                    <div className="py-1">
                      {[
                        { href: "/profile", label: "โปรไฟล์" },
                        { href: "/orders", label: "คำสั่งซื้อ" },
                        { href: "/payment-methods", label: "วิธีชำระเงิน" },
                        { href: "/addresses", label: "ที่อยู่จัดส่ง" },
                      ].map(({ href, label }) => (
                        <Link key={href} href={href}
                          className="flex items-center px-4 py-2.5 text-sm text-[#484848] hover:bg-[#F5F5F5] hover:text-[#003399] transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          {label}
                        </Link>
                      ))}
                      {session.user.role === "ADMIN" && (
                        <Link href="/admin"
                          className="flex items-center px-4 py-2.5 text-sm text-[#003399] font-semibold hover:bg-[#F5F5F5] transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          แผงควบคุมแอดมิน
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-[#DFDFDF] pt-1">
                      <button
                        onClick={() => { signOut(); setUserMenuOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-[#CC0008] hover:bg-[#F5F5F5] transition-colors"
                      >
                        ออกจากระบบ
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2 ml-2">
                <Link href="/login" className="px-4 py-2 text-sm font-semibold text-white/80 hover:text-white transition-colors">
                  เข้าสู่ระบบ
                </Link>
                <Link href="/register" className="px-5 py-2 text-sm font-bold bg-[#FFDA1A] text-[#111111] rounded hover:bg-yellow-300 transition-colors">
                  สมัครสมาชิก
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors ml-1"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#002B80] border-t border-white/10">
          <div className="px-4 py-3 space-y-0.5">
            {[
              { href: "/", label: "หน้าแรก" },
              { href: "/products", label: "สินค้าทั้งหมด" },
              { href: "/contact", label: "ติดต่อเรา" },
            ].map((item) => (
              <Link key={item.href} href={item.href}
                className="block py-2.5 px-3 text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
                onClick={() => setMobileOpen(false)}>
                {item.label}
              </Link>
            ))}
            {session?.user.role === "ADMIN" && (
              <Link href="/admin"
                className="block py-2.5 px-3 text-sm font-bold text-[#FFDA1A] hover:bg-white/10 rounded transition-colors"
                onClick={() => setMobileOpen(false)}>
                แผงควบคุม Admin
              </Link>
            )}
          </div>
          {!session && (
            <div className="px-4 py-4 flex gap-3 border-t border-white/10">
              <Link href="/login"
                className="flex-1 py-2.5 text-center text-sm font-semibold border border-white/30 rounded text-white hover:bg-white/10 transition-colors"
                onClick={() => setMobileOpen(false)}>
                เข้าสู่ระบบ
              </Link>
              <Link href="/register"
                className="flex-1 py-2.5 text-center text-sm font-bold bg-[#FFDA1A] text-[#111111] rounded hover:bg-yellow-300 transition-colors"
                onClick={() => setMobileOpen(false)}>
                สมัครสมาชิก
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
