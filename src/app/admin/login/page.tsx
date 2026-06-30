"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";

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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="glass rounded-2xl p-8 border border-white/10">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gradient">CODEMAFIA</h1>
            <p className="text-sm text-muted mt-1">Admin Portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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

            <Checkbox
              label="Remember me"
              checked={remember}
              onChange={setRemember}
            />

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
              >
                <p className="text-red-400 text-sm">{error}</p>
              </motion.div>
            )}

            <Button
              type="submit"
              fullWidth
              loading={loading}
              className="mt-2"
            >
              Sign In
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted mt-6">
          &copy; {new Date().getFullYear()} CODEMAFIA. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
