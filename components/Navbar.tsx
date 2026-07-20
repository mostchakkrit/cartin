"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  ShoppingCartIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  SunIcon,
  MoonIcon,
} from "@heroicons/react/24/outline";
import { useCart } from "@/hooks/useCart";
import { Logo } from "@/components/Logo";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { itemCount } = useCart();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!userMenuOpen) return;
    const close = () => setUserMenuOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [userMenuOpen]);

  const navLink = (href: string) => {
    const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
    return `text-sm font-medium py-1 transition-colors border-b-2 ${
      isActive
        ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400"
        : "text-slate-600 dark:text-[#8aaad4] border-transparent hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-400 dark:hover:border-blue-500"
    }`;
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 bg-white dark:bg-[#111827] ${
      scrolled ? "shadow-lg dark:shadow-[#05080f]/60" : "border-b border-gray-100 dark:border-[#253350]"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <Logo variant={mounted && theme === "dark" ? "light" : "dark"} />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className={navLink("/")}>หน้าแรก</Link>
            <Link href="/products" className={navLink("/products")}>สินค้าทั้งหมด</Link>
            <Link href="/contact" className={navLink("/contact")}>ติดต่อเรา</Link>
            {session?.user.role === "ADMIN" && (
              <Link href="/admin" className={navLink("/admin")}>แผงควบคุม Admin</Link>
            )}
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-1">
            {/* Dark mode toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 text-slate-500 dark:text-[#6080a8] hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-[#1a2540] rounded-full transition-colors"
              aria-label="Toggle dark mode"
            >
              {mounted && theme === "dark"
                ? <SunIcon className="w-5 h-5" />
                : <MoonIcon className="w-5 h-5" />
              }
            </button>

            {/* Search */}
            <Link
              href="/search"
              className="p-2 text-slate-500 dark:text-[#6080a8] hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-[#1a2540] rounded-full transition-colors"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 text-slate-500 dark:text-[#6080a8] hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-[#1a2540] rounded-full transition-colors"
            >
              <ShoppingCartIcon className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Link>

            {/* User */}
            {session ? (
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="hidden md:flex items-center gap-1.5 pl-2 pr-3 py-1.5 text-slate-600 dark:text-[#8aaad4] hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-[#1a2540] rounded-full transition-colors text-sm"
                >
                  <span className="w-7 h-7 rounded-full bg-blue-100 dark:bg-[#0f1d38] text-blue-700 dark:text-blue-400 font-bold flex items-center justify-center text-xs">
                    {session.user.name?.[0]?.toUpperCase() ?? "U"}
                  </span>
                  <span className="font-medium max-w-[80px] truncate">{session.user.name?.split(" ")[0]}</span>
                  <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>

                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="md:hidden p-2 text-slate-500 dark:text-[#6080a8] hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-[#1a2540] rounded-full transition-colors"
                >
                  <UserIcon className="w-5 h-5" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#131c30] rounded-2xl shadow-xl dark:shadow-[#05080f]/70 border border-gray-100 dark:border-[#253350] py-2 z-50 animate-fade-up">
                    <div className="px-4 py-3 border-b border-gray-50 dark:border-[#253350]">
                      <p className="text-[11px] text-gray-400 dark:text-[#4e6888] uppercase tracking-wider">ยินดีต้อนรับ</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-[#dde8ff] mt-0.5 truncate">{session.user.name}</p>
                    </div>
                    <div className="py-1">
                      {[
                        { href: "/profile", label: "โปรไฟล์" },
                        { href: "/orders", label: "คำสั่งซื้อ" },
                        { href: "/payment-methods", label: "วิธีชำระเงิน" },
                        { href: "/addresses", label: "ที่อยู่จัดส่ง" },
                      ].map(({ href, label }) => (
                        <Link key={href} href={href}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-[#b8cef0] hover:bg-blue-50 dark:hover:bg-[#1a2540] hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          {label}
                        </Link>
                      ))}
                      {session.user.role === "ADMIN" && (
                        <Link href="/admin"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-blue-700 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-[#1a2540] transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          แผงควบคุมแอดมิน
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-gray-100 dark:border-[#253350] pt-1">
                      <button
                        onClick={() => { signOut(); setUserMenuOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-[#2a1020] transition-colors"
                      >
                        ออกจากระบบ
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2 ml-1">
                <Link href="/login" className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-[#8aaad4] hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  เข้าสู่ระบบ
                </Link>
                <Link href="/register" className="px-5 py-2 text-sm font-semibold bg-blue-700 text-white rounded-full hover:bg-blue-800 transition-all hover:scale-105 active:scale-95">
                  สมัครสมาชิก
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 text-slate-500 dark:text-[#6080a8] hover:text-blue-600 dark:hover:text-blue-400 rounded-full transition-colors ml-1"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-[#111827] border-t border-gray-100 dark:border-[#253350] divide-y divide-gray-50 dark:divide-[#131c30]">
          <div className="px-4 py-3 space-y-0.5">
            {[
              { href: "/", label: "หน้าแรก" },
              { href: "/products", label: "สินค้าทั้งหมด" },
              { href: "/contact", label: "ติดต่อเรา" },
            ].map((item) => (
              <Link key={item.href} href={item.href}
                className="block py-2.5 px-2 text-sm font-medium text-slate-700 dark:text-[#b8cef0] hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-[#1a2540] rounded-xl transition-colors"
                onClick={() => setMobileOpen(false)}>
                {item.label}
              </Link>
            ))}
            {session?.user.role === "ADMIN" && (
              <Link href="/admin"
                className="block py-2.5 px-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-[#1a2540] rounded-xl transition-colors"
                onClick={() => setMobileOpen(false)}>
                แผงควบคุม Admin
              </Link>
            )}
          </div>

          {!session && (
            <div className="px-4 py-4 flex gap-3">
              <Link href="/login"
                className="flex-1 py-2.5 text-center text-sm font-medium border border-gray-200 dark:border-[#304070] rounded-xl text-slate-700 dark:text-[#b8cef0] hover:border-blue-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                onClick={() => setMobileOpen(false)}>
                เข้าสู่ระบบ
              </Link>
              <Link href="/register"
                className="flex-1 py-2.5 text-center text-sm font-bold bg-blue-700 text-white rounded-xl hover:bg-blue-800 transition-colors"
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
