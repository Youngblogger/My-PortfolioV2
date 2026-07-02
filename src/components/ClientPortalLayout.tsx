"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";

const sidebarLinks = [
  { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { label: "Projects", href: "/proposals", icon: "projects" },
  { label: "Messages", href: "/messages", icon: "messages" },
  { label: "Billing", href: "/payments", icon: "billing" },
  { label: "Account", href: "/profile", icon: "account" },
];

const iconPaths: Record<string, React.ReactNode> = {
  dashboard: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zm0 9.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zm0 9.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  ),
  projects: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  ),
  messages: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  ),
  billing: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
    </svg>
  ),
  account: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
};

export default function ClientPortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      await api.logout();
    } catch {}
    setAuthenticated(false);
    setUser(null);
    router.push("/");
  }

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const sidebarWidth = sidebarCollapsed ? "w-20" : "w-[260px]";

  const NavItem = ({ link }: { link: typeof sidebarLinks[number] }) => (
    <Link
      href={link.href}
      onClick={() => setMobileMenuOpen(false)}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
        isActive(link.href)
          ? "portal-sidebar-hover text-white"
          : "text-white/50 hover:text-white hover:bg-white/5"
      }`}
    >
      <span className="shrink-0">{iconPaths[link.icon]}</span>
      {!sidebarCollapsed && <span>{link.label}</span>}
    </Link>
  );

  return (
    <div className="min-h-screen portal-bg">
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-16 px-4 bg-white border-b border-[#ECEFF5]">
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-[#667085] hover:text-[#101828]" aria-label="Toggle menu">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            )}
          </svg>
        </button>
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image src="/iconLogo.png" alt="CODEMAFIA" width={28} height={28} className="rounded-lg" unoptimized />
          <span className="text-base font-bold" style={{ color: "#101828" }}>CODEMAFIA</span>
        </Link>
        {user && (
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "#5B4CF0" }}>
            <span className="text-xs font-bold text-white">{user.name?.charAt(0)?.toUpperCase() || "U"}</span>
          </div>
        )}
      </div>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="fixed inset-0 bg-black/40" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-72 portal-sidebar overflow-y-auto pt-20 pb-6 px-4">
            <nav className="flex flex-col gap-1">
              {sidebarLinks.map((link) => (
                <NavItem key={link.href} link={link} />
              ))}
            </nav>
            <div className="mt-8 p-4 rounded-2xl" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
              <p className="text-white/70 text-sm font-medium mb-1">Need Help?</p>
              <p className="text-white/40 text-xs mb-3">We&apos;re here to assist you</p>
              <a
                href="mailto:admin@codemafia.ng"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-200"
                style={{ backgroundColor: "#5B4CF0" }}
              >
                Contact Support
              </a>
            </div>
            <div className="mt-4">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-white/5 transition-colors w-full"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-300 ${sidebarWidth} z-30`}>
        <div className="flex flex-col flex-1 portal-sidebar">
          {/* Logo */}
          <div className="flex items-center h-[80px] px-6 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <Image src="/iconLogo.png" alt="CODEMAFIA" width={32} height={32} className="rounded-lg shrink-0" unoptimized />
              {!sidebarCollapsed && (
                <span className="text-lg font-bold text-white">CODEMAFIA</span>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
            {sidebarLinks.map((link) => (
              <NavItem key={link.href} link={link} />
            ))}
          </nav>

          {/* Support Card */}
          {!sidebarCollapsed && (
            <div className="px-4 pb-4">
              <div className="p-4 rounded-2xl" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                <p className="text-white/70 text-sm font-medium mb-1">Need Help?</p>
                <p className="text-white/40 text-xs mb-3">We&apos;re here to assist you</p>
                <a
                  href="mailto:admin@codemafia.ng"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:opacity-90"
                  style={{ backgroundColor: "#5B4CF0" }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  Contact Support
                </a>
              </div>
            </div>
          )}

          {/* Collapse Button & User */}
          <div className="px-4 py-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && user && (
                <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                  <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center" style={{ backgroundColor: "#5B4CF0" }}>
                    <span className="text-xs font-bold text-white">{user.name?.charAt(0)?.toUpperCase() || "U"}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">{user.name || "User"}</p>
                    <p className="text-xs text-white/40 truncate">{user.email || ""}</p>
                  </div>
                </div>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all shrink-0"
                aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <svg className={`w-5 h-5 transition-transform duration-300 ${sidebarCollapsed ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-white/5 transition-colors w-full mt-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Top Navbar */}
      <div className={`hidden lg:block fixed top-0 right-0 z-20 transition-all duration-300 ${sidebarCollapsed ? "left-20" : "left-[260px]"}`}>
        <div className="flex items-center justify-between h-[80px] px-8 bg-white/80 backdrop-blur-xl border-b border-[#ECEFF5]">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg text-[#667085] hover:text-[#101828] hover:bg-[#F7F9FC] transition-all lg:hidden"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <nav className="flex items-center gap-2 text-sm">
              <span className="text-[#98A2B3]">Pages</span>
              <svg className="w-4 h-4 text-[#98A2B3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
              <span className="font-medium" style={{ color: "#101828" }}>
                {pathname === "/dashboard" ? "Dashboard" : (() => { const seg = pathname.split("/").pop(); return seg ? seg.charAt(0).toUpperCase() + seg.slice(1) : "Dashboard"; })()}
              </span>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button className="relative p-2 rounded-xl text-[#667085] hover:text-[#101828] hover:bg-[#F7F9FC] transition-all">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ backgroundColor: "#5B4CF0" }} />
            </button>
            {/* Profile Avatar */}
            {user && (
              <div className="flex items-center gap-3 pl-3 border-l border-[#ECEFF5]">
                <div className="text-right">
                  <p className="text-sm font-medium truncate max-w-[120px]" style={{ color: "#101828" }}>{user.name || "User"}</p>
                  <p className="text-xs text-[#98A2B3] truncate max-w-[120px]">{user.email || ""}</p>
                </div>
                <button className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform hover:scale-105" style={{ backgroundColor: "#5B4CF0" }}>
                  <span className="text-sm font-bold text-white">{user.name?.charAt(0)?.toUpperCase() || "U"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`transition-all duration-300 pt-16 lg:pt-[80px] ${sidebarCollapsed ? "lg:ml-20" : "lg:ml-[260px]"}`}>
        <main className="p-6 lg:p-8 max-w-[1600px] mx-auto">{children}</main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#ECEFF5] safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {sidebarLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-0 ${
                  active ? "text-[#5B4CF0]" : "text-[#98A2B3]"
                }`}
              >
                <span className="shrink-0">{iconPaths[link.icon]}</span>
                <span className="text-[10px] font-medium truncate w-full text-center">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
