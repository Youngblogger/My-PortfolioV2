"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { NotificationBell } from "@/components/ui/NotificationBell";

export default function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/v1/auth/user", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setAuthenticated(true);
          setUser(data.data || data);
        }
      } catch {
        setAuthenticated(false);
      }
    }
    checkAuth();
  }, []);

    async function handleLogout() {
    try {
      await fetch("/api/v1/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
    } catch {}
    router.push("/auth/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image
              src="/iconLogo.png"
              alt="CODEMAFIA"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="text-lg font-bold">
              <span className="text-gradient">CODEMAFIA</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/dashboard"
              className={`text-sm transition-colors ${
                pathname === "/dashboard" ? "text-gold" : "text-white/60 hover:text-white"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/proposals"
              className={`text-sm transition-colors ${
                pathname.startsWith("/proposals") ? "text-gold" : "text-white/60 hover:text-white"
              }`}
            >
              Proposals
            </Link>
            <Link
              href="/academy/dashboard"
              className={`text-sm transition-colors ${
                pathname.startsWith("/academy/dashboard") ? "text-gold" : "text-white/60 hover:text-white"
              }`}
            >
              Academy
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {authenticated && <NotificationBell />}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <div className="w-7 h-7 rounded-full bg-gold/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-gold">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
                <span className="text-sm text-white/70 hidden sm:block">
                  {user?.name || "User"}
                </span>
                <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-surface border border-white/10 shadow-xl z-20 py-2">
                    <div className="px-4 py-2 border-b border-white/5">
                      <p className="text-sm font-medium text-white">{user?.name}</p>
                      <p className="text-xs text-white/40 truncate">{user?.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/notifications"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      Notifications
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
