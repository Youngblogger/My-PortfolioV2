"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

interface SidebarGroup {
  label: string;
  links: { href: string; label: string }[];
}

const sidebarGroups: SidebarGroup[] = [
  {
    label: "",
    links: [{ href: "/admin", label: "Dashboard" }],
  },
  {
    label: "Orders & Projects",
    links: [
      { href: "/admin/orders", label: "Orders" },
      { href: "/admin/projects", label: "Projects" },
      { href: "/admin/kanban", label: "Kanban Board" },
    ],
  },
  {
    label: "Clients",
    links: [{ href: "/admin/clients", label: "All Clients" }],
  },
  {
    label: "Proposals & Calls",
    links: [
      { href: "/admin/proposals", label: "Proposals" },
      { href: "/admin/discovery-calls", label: "Discovery Calls" },
    ],
  },
  {
    label: "Communication",
    links: [
      { href: "/admin/messages", label: "Messages" },
      { href: "/admin/notifications", label: "Notifications" },
    ],
  },
  {
    label: "Payment & Finance",
    links: [
      { href: "/admin/payments", label: "Payments" },
      { href: "/admin/invoices", label: "Invoices" },
      { href: "/admin/receipts", label: "Receipts" },
    ],
  },
  {
    label: "Academy",
    links: [
      { href: "/admin/academy/courses", label: "Courses" },
      { href: "/admin/academy/categories", label: "Categories" },
      { href: "/admin/academy/lessons", label: "Lessons" },
      { href: "/admin/academy/enrollments", label: "Enrollments" },
      { href: "/admin/academy/certificates", label: "Certificates" },
    ],
  },
  {
    label: "Content",
    links: [
      { href: "/admin/portfolio", label: "Portfolio" },
      { href: "/admin/blog", label: "Blog Posts" },
      { href: "/admin/blog/categories", label: "Blog Categories" },
      { href: "/admin/services", label: "Services" },
      { href: "/admin/project-types", label: "Project Types" },
      { href: "/admin/packages", label: "Packages" },
      { href: "/admin/add-ons", label: "Add-ons" },
      { href: "/admin/requirement-questions", label: "Requirement Questions" },
      { href: "/admin/testimonials", label: "Testimonials" },
      { href: "/admin/cms", label: "Website CMS" },
    ],
  },
  {
    label: "Team & Users",
    links: [
      { href: "/admin/team-members", label: "Team Members" },
      { href: "/admin/admin-users", label: "Admin Users" },
      { href: "/admin/roles", label: "Roles & Permissions" },
    ],
  },
  {
    label: "Reviews & Feedback",
    links: [{ href: "/admin/reviews", label: "Project Reviews" }],
  },
  {
    label: "System",
    links: [
      { href: "/admin/media", label: "Media Library" },
      { href: "/admin/analytics", label: "Analytics" },
      { href: "/admin/audit-logs", label: "Audit Logs" },
      { href: "/admin/settings", label: "Settings" },
    ],
  },
];

function AdminNotificationBell() {
  const router = useRouter();
  const [count, setCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function fetchCount() {
      try {
        const res = await fetch("/api/v1/notifications/unread-count", { credentials: "include" });
        const data = await res.json();
        if (mounted && data.data) setCount(data.data.count);
      } catch { if (mounted) setCount(0); }
    }
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  return (
    <button onClick={() => router.push("/admin/notifications")} className="relative p-2 rounded-lg text-muted hover:text-white hover:bg-white/5 transition-colors" title="Notifications">
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white px-1 shadow-lg">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}

function AdminChatBell() {
  const router = useRouter();
  const [count, setCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function fetchCount() {
      try {
        const res = await api.getConversationUnreadCounts();
        if (mounted && res.data?.total_unread) setCount(res.data.total_unread);
      } catch { if (mounted) setCount(0); }
    }
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  return (
    <button onClick={() => router.push("/admin/messages")} className="relative p-2 rounded-lg text-muted hover:text-white hover:bg-white/5 transition-colors" title="Messages">
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white px-1 shadow-lg">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(min-width: 1024px)").matches : false
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handler = (e: MediaQueryListEvent) => setSidebarOpen(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  const [authorized, setAuthorized] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    sidebarGroups.forEach((group) => {
      if (group.links.some((link) => pathname.startsWith(link.href) && link.href !== "/admin")) {
        if (group.label) initial.add(group.label);
      }
    });
    return initial;
  });

  useEffect(() => {
    if (pathname === "/admin/login") {
      setVerifying(false);
      setAuthorized(false);
      return;
    }

    const verify = async () => {
      setVerifying(true);
      try {
        const res = await fetch("/api/v1/admin/me", {
          credentials: "include",
          headers: { Accept: "application/json" },
        });

        if (!res.ok) throw new Error("unauthorized");

        const data = await res.json();

        if (data.success) {
          setAuthorized(true);
        } else {
          throw new Error("unauthorized");
        }
      } catch {
        setAuthorized(false);
        router.push("/admin/login");
      } finally {
        setVerifying(false);
      }
    };

    verify();
  }, [router, pathname]);

  const handleLogout = useCallback(async () => {
    try {
      await api.adminLogout();
    } catch {
      // fire-and-forget
    }
    router.push("/admin/login");
  }, [router]);

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (verifying) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-xl bg-gold-gradient flex items-center justify-center">
            <span className="text-background font-black text-2xl">C</span>
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-gradient">CODEMAFIA</h1>
            <p className="text-sm text-muted mt-1">Admin Portal</p>
          </div>
          <div className="flex gap-2">
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              className="w-2.5 h-2.5 rounded-full bg-gold"
            />
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
              className="w-2.5 h-2.5 rounded-full bg-gold"
            />
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
              className="w-2.5 h-2.5 rounded-full bg-gold"
            />
          </div>
        </div>
      </div>
    );
  }

  if (!authorized) {
    if (pathname === "/admin/login" || pathname === "/admin/forgot-password") {
      return <>{children}</>;
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`${sidebarOpen ? "block" : "hidden"} lg:block shrink-0 lg:w-[220px]`}>
        <div className="fixed z-50 h-screen w-[220px] glass border-r border-white/10 flex flex-col">
          <div className="p-5 border-b border-white/10 shrink-0">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gold-gradient flex items-center justify-center">
                <span className="text-background font-black text-sm">C</span>
              </div>
              <div>
                <span className="text-lg font-bold text-gradient block leading-tight">CODEMAFIA</span>
                <span className="text-[10px] text-muted uppercase tracking-widest">Admin Panel</span>
              </div>
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
            {sidebarGroups.map((group) => {
              const isDashboard = !group.label;
              const groupExpanded = expandedGroups.has(group.label);

              return (
                <div key={group.label || "dashboard"} className="mb-1">
                  {!isDashboard && (
                    <button
                      onClick={() => toggleGroup(group.label)}
                      className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider text-muted hover:text-white transition-colors"
                    >
                      {group.label}
                      <svg
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${groupExpanded ? "rotate-90" : ""}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}

                  {(isDashboard || groupExpanded) && (
                    <div className={isDashboard ? "" : "space-y-0.5 pt-0.5"}>
                      {group.links.map((link) => {
                        const active = isActive(link.href);
                        return (
                          <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                              "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                              active
                                ? "bg-gold/10 text-gold border border-gold/20"
                                : "text-muted hover:text-white hover:bg-white/5"
                            )}
                          >
                            {active && <span className="w-1 h-4 rounded-full bg-gold shrink-0" />}
                            {!active && <span className="w-1 shrink-0" />}
                            {link.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="p-3 border-t border-white/10 shrink-0">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all duration-200"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 glass border-b border-white/10">
          <div className="flex items-center justify-between px-4 md:px-6 h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg text-muted hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Toggle sidebar"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  {sidebarOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
              <span className="hidden sm:inline text-sm text-muted">/</span>
              <span className="hidden sm:inline text-sm text-white/60 truncate max-w-[200px] capitalize">
                {pathname.split("/").filter(Boolean).slice(1).join(" / ") || "Dashboard"}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <AdminChatBell />
              <AdminNotificationBell />
              <button
                onClick={handleLogout}
                className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
