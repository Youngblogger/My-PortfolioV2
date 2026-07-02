"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Copyright } from "@/components/Copyright";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      // Fetch Sanctum CSRF cookie before login
      await fetch("/sanctum/csrf-cookie", { credentials: "include" });

      // Extract CSRF token from cookie for the X-XSRF-TOKEN header
      const csrfMatch = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
      const csrfToken = csrfMatch ? decodeURIComponent(csrfMatch[1]) : "";

      const res = await fetch("/api/v1/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-XSRF-TOKEN": csrfToken } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), password, remember }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Invalid credentials");
      }

      if (data.user?.role !== "admin") {
        throw new Error("Unauthorized. Admin access required.");
      }

      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col bg-background h-screen overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(212,175,55,0.06)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,rgba(212,175,55,0.04)_0%,transparent_50%)]" />
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
      </div>

      {/* Main */}
      <main className="relative z-10 flex-1 px-0 sm:px-6 pt-12 sm:pt-20">
        <div className="w-full max-w-none sm:max-w-[440px] mx-auto px-0 sm:px-0">
          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative rounded-2xl bg-surface border border-white/[0.06] shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_20px_60px_-12px_rgba(0,0,0,0.5)]">
              <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

              <div className="p-4">
                <div className="text-center mb-6">
                  <Image src="/CodemafiaLogo.png" alt="CODEMAFIA" width={180} height={50} className="mx-auto" priority />
                  <p className="text-xs text-muted mt-1 mb-4">Engineering Excellence. Inspiring Innovation.</p>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10 border border-gold/10 text-gold text-[11px] font-semibold uppercase tracking-wider">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    Admin Portal
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <Input
                    label="Email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />

                  <div className="space-y-1.5">
                    <Input
                      label="Password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => router.push("/admin/forgot-password")}
                        className="text-xs text-gold hover:underline transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={remember}
                          onChange={(e) => setRemember(e.target.checked)}
                          className="peer sr-only"
                        />
                        <div className="w-4 h-4 rounded border border-white/20 bg-transparent peer-checked:bg-gold peer-checked:border-gold transition-all duration-200 group-hover:border-white/30" />
                        <svg className="absolute inset-0 w-4 h-4 text-background opacity-0 peer-checked:opacity-100 transition-opacity duration-200 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-xs text-muted group-hover:text-white/70 transition-colors select-none">Remember me</span>
                    </label>
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -8, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      className="text-red-400 text-sm bg-red-500/10 rounded-lg px-4 py-3 border border-red-500/10"
                      role="alert"
                    >
                      {error}
                    </motion.p>
                  )}

                  <Button type="submit" loading={loading} fullWidth>
                    {loading ? "Signing In..." : "Sign In to Admin"}
                  </Button>
                </form>

                {/* Security notice */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mt-6 pt-6 border-t border-white/[0.04]"
                >
                  <div className="flex items-center justify-center gap-2 text-xs text-muted">
                    <svg className="w-3.5 h-3.5 text-muted/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                    Encrypted &amp; secure connection
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.04]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="max-w-7xl mx-auto px-6 h-10 flex items-center justify-between"
        >
          <p className="text-xs text-muted"><Copyright /></p>
        </motion.div>
      </footer>
    </div>
  );
}
