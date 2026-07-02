"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { api } from "@/lib/api";

const navLinks = [
  { label: "Academy", href: "/academy" },
  { label: "Projects", href: "/projects" },
  { label: "Services", href: "/hire" },
  { label: "Blog", href: "/insights" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const dashboardLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "My Projects", href: "/proposals" },
  { label: "Academy", href: "/academy/dashboard" },
  { label: "Notifications", href: "/notifications" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";
  const isAdminPage = pathname.startsWith("/admin");
  const portalPaths = ["/dashboard", "/academy/enrollment", "/academy/dashboard", "/proposals", "/notifications", "/messages", "/payments", "/downloads", "/profile", "/settings", "/auth", "/hire/checkout"];
  const isPortalPage = portalPaths.some(p => pathname === p || pathname.startsWith(p + "/"));

  useEffect(() => {
    let mounted = true;
    async function checkAuth() {
      try {
        const res = await fetch("/api/v1/auth/user", { credentials: "include" });
        if (!mounted) return;
        if (res.ok) {
          const data = await res.json();
          const userData = data.data || data;
          setAuthenticated(true);
          setIsAdmin(userData?.role === "admin");
          setUser(userData);
        } else {
          setAuthenticated(false);
          setIsAdmin(false);
          setUser(null);
        }
      } catch {
        if (mounted) {
          setAuthenticated(false);
          setIsAdmin(false);
          setUser(null);
        }
      }
    }
    checkAuth();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!isHome || authenticated) return;
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      const sections = ["learn", "build", "hire", "insights", "community", "founder"];
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.getBoundingClientRect().top <= 200) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome, authenticated]);

  useEffect(() => {
    setScrolled(window.scrollY > 50);
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [mobileOpen]);

  if (isAdminPage || isPortalPage) return null;

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await api.logout();
    } catch {}
    setAuthenticated(false);
    setIsAdmin(false);
    setUser(null);
    setLoggingOut(false);
    setMobileOpen(false);
    router.push("/");
  }

  // Loading state — prevent flash of public nav while auth check runs
  if (authenticated === null) {
    return <header className="fixed top-0 left-0 right-0 z-50 h-20 bg-transparent" />;
  }

  // ─── AUTHENTICATED: dashboard navigation ──────────────────────
  if (authenticated) {
    return (
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-background/85 backdrop-blur-2xl border-b border-white/5"
            : "bg-transparent"
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/dashboard" className="flex flex-col shrink-0 self-start outline-none">
            <span className="flex items-center gap-2">
              <Image src="/iconLogo.png" alt="CODEMAFIA" width={32} height={32} className="rounded-lg" unoptimized />
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {dashboardLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 text-sm transition-colors duration-300 rounded-lg ${
                    isActive ? "text-white" : "text-muted hover:text-white"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 bg-white/5 rounded-lg"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
            {isAdmin && (
              <Link href="/admin" className="relative px-4 py-2 text-sm text-muted hover:text-white transition-colors duration-300 rounded-lg">
                Admin
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            {<NotificationBell />}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="hidden md:inline-flex px-4 py-2 text-sm text-red-400 hover:text-red-300 border border-red-400/30 hover:border-red-400/50 rounded-lg transition-colors"
            >
              {loggingOut ? "Logging out…" : "Logout"}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden relative w-6 h-6 flex items-center justify-center"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <div className="flex flex-col gap-1.5">
                <motion.span animate={mobileOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }} className="block w-6 h-[1.5px] bg-white" />
                <motion.span animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }} className="block w-6 h-[1.5px] bg-white" />
                <motion.span animate={mobileOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }} className="block w-6 h-[1.5px] bg-white" />
              </div>
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden bg-background/95 backdrop-blur-2xl border-b border-white/5 overflow-hidden"
            >
              <div className="px-6 py-6 flex flex-col gap-1">
                {dashboardLinks.map((link, i) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setMobileOpen(false)}
                    className="text-muted hover:text-white transition-colors px-4 py-3 rounded-lg hover:bg-white/[0.03]"
                  >
                    {link.label}
                  </motion.a>
                ))}
                {isAdmin && (
                  <motion.a
                    href="/admin"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.16 }}
                    onClick={() => setMobileOpen(false)}
                    className="text-muted hover:text-white transition-colors px-4 py-3 rounded-lg hover:bg-white/[0.03]"
                  >
                    Admin
                  </motion.a>
                )}
                <div className="mt-3 pt-3 border-t border-white/5 flex flex-col gap-2">
                  <motion.button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-white/5 transition-colors rounded-lg"
                  >
                    {loggingOut ? "Logging out…" : "Logout"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    );
  }

  // ─── NOT AUTHENTICATED: public marketing navigation ──────────
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/85 backdrop-blur-2xl border-b border-white/5 shadow-[0_1px_0_0_rgba(255,255,255,0.03)]"
          : "bg-transparent"
      }`}
    >
      <nav role="navigation" aria-label="Main navigation" className="max-w-7xl mx-auto px-4 h-20 flex items-start pt-4 justify-between">
        <Link href="/" className="flex flex-col shrink-0 self-start outline-none">
            <span className="flex items-center gap-2">
            <Image src="/CodemafiaLogo.png" alt="CODEMAFIA" width={128} height={32} className="w-28 sm:w-32 h-auto" unoptimized />
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 text-sm transition-colors duration-300 rounded-lg ${
                  isActive ? "text-white" : "text-muted hover:text-white"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {link.label}
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 bg-white/5 rounded-lg"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
          <div className="ml-4 pl-4 border-l border-white/5 flex items-center gap-3">
            <Link
              href="/auth/login"
              className="relative px-4 py-2 text-sm font-bold transition-colors duration-300 rounded-lg text-gold/70 hover:text-gold border border-gold/20 hover:border-gold/40"
            >
              Client Portal
            </Link>
            <Link
              href="/hire"
              className="px-5 py-2.5 rounded-lg border border-white/10 text-white font-semibold text-sm hover:bg-white/5 hover:border-white/20 animate-blink-border"
            >
              Hire Us
            </Link>
            <Link
              href="/academy"
              className="px-5 py-2.5 rounded-lg bg-gold-gradient text-background font-semibold text-sm hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
            >
              Enroll Now
            </Link>
          </div>
        </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden relative w-6 h-6 flex items-center justify-center"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
          <div className="flex flex-col gap-1.5">
            <motion.span
              animate={mobileOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              className="block w-6 h-[1.5px] bg-white"
            />
            <motion.span
              animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
              className="block w-6 h-[1.5px] bg-white"
            />
            <motion.span
              animate={mobileOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              className="block w-6 h-[1.5px] bg-white"
            />
          </div>
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden bg-background/95 backdrop-blur-2xl border-b border-white/5 overflow-hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-1">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setMobileOpen(false)}
                  className="text-muted hover:text-white transition-colors px-4 py-3 rounded-lg hover:bg-white/[0.03]"
                >
                  {link.label}
                </motion.a>
              ))}
              <div className="mt-3 pt-3 border-t border-white/5 flex flex-col gap-2">
                <motion.a
                  href="/auth/login"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  onClick={() => setMobileOpen(false)}
                  className="font-bold text-gold/70 hover:text-gold transition-colors px-4 py-3 rounded-lg border border-gold/20 hover:border-gold/40 hover:bg-gold/[0.03]"
                >
                  Client Portal
                </motion.a>
                <motion.a
                  href="/hire"
                  onClick={() => setMobileOpen(false)}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.24 }}
                  className="block px-5 py-3 rounded-lg border border-white/10 text-white font-semibold text-sm text-center hover:bg-white/5 animate-blink-border"
                >
                  Hire Us
                </motion.a>
                <motion.a
                  href="/academy"
                  onClick={() => setMobileOpen(false)}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.28 }}
                  className="block px-5 py-3 rounded-lg bg-gold-gradient text-background font-semibold text-sm text-center"
                >
                  Enroll Now
                </motion.a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
