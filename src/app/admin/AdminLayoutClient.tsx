"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/orders", label: "Orders", icon: "📦" },
  { href: "/admin/projects", label: "Projects", icon: "📁" },
  { href: "/admin/proposals", label: "Proposals", icon: "📄" },
  { href: "/admin/discovery-calls", label: "Discovery Calls", icon: "📞" },
  { href: "/admin/services", label: "Services", icon: "⚙️" },
  { href: "/admin/project-types", label: "Project Types", icon: "📋" },
  { href: "/admin/packages", label: "Packages", icon: "📦" },
  { href: "/admin/add-ons", label: "Add-ons", icon: "🧩" },
  { href: "/admin/requirement-questions", label: "Requirement Questions", icon: "❓" },
  { href: "/admin/team-members", label: "Team Members", icon: "👥" },
];

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push("/auth/login?redirect=/admin");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  const handleLogout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
    }
    api.removeToken();
    router.push("/auth/login");
  }, [router]);

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-background flex">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 260 : 0 }}
        className="fixed lg:static z-50 h-screen overflow-hidden lg:w-64"
      >
        <motion.div
          initial={false}
          animate={{ x: sidebarOpen ? 0 : -260 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-64 h-full glass border-r border-white/10 flex flex-col"
        >
          <div className="p-6 border-b border-white/10">
            <Link href="/admin" className="text-xl font-bold text-gradient">
              CODEMAFIA
            </Link>
            <p className="text-xs text-muted mt-1">Admin Panel</p>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-gold/10 text-gold border border-gold/20"
                      : "text-muted hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className="text-lg">{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all duration-300"
            >
              <span className="text-lg">🚪</span>
              Logout
            </button>
          </div>
        </motion.div>
      </motion.aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 glass border-b border-white/10">
          <div className="flex items-center justify-between px-4 md:px-6 h-16">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-muted hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Toggle sidebar"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {sidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            <h2 className="text-lg font-semibold text-white truncate">
              Admin Dashboard
            </h2>

            <button
              onClick={handleLogout}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all duration-300"
            >
              <span>🚪</span>
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
