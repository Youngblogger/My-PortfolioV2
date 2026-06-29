"use client";

import { useState, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { api } from "@/lib/api";

function getStrength(password: string): { label: string; color: string; width: string } {
  if (!password) return { label: "", color: "", width: "0%" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  const map = [
    { label: "Weak", color: "bg-red-500", width: "25%" },
    { label: "Fair", color: "bg-orange-500", width: "50%" },
    { label: "Good", color: "bg-yellow-500", width: "75%" },
    { label: "Strong", color: "bg-gold", width: "100%" },
  ];
  return map[score - 1] || map[0];
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const strength = useMemo(() => getStrength(password), [password]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const result = await api.resetPassword(token, email, password);
      if (result.success) {
        setSuccess(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/50 to-transparent pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md">
          <div className="glass rounded-2xl p-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Invalid Reset Link</h1>
            <p className="text-muted mb-6">This password reset link is invalid or has expired.</p>
            <Link href="/auth/forgot-password">
              <Button variant="outline" fullWidth>Request New Link</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/50 to-transparent pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md">
          <div className="glass rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Password Reset</h1>
            <p className="text-muted mb-6">Your password has been reset successfully.</p>
            <Link href="/auth/login">
              <Button fullWidth>Sign In</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/50 to-transparent pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/academy" className="text-gold text-xl font-bold">
            CODEMAFIA Academy
          </Link>
          <h1 className="text-3xl font-bold text-white mt-6">Set New Password</h1>
          <p className="text-muted mt-2">Choose a strong password for your account</p>
        </div>

        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="New Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              minLength={8}
            />

            {password && (
              <div className="space-y-1.5">
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${strength.color}`} style={{ width: strength.width }} />
                </div>
                <p className="text-xs text-muted">{strength.label}</p>
              </div>
            )}

            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              required
              minLength={8}
            />

            <ul className="text-xs text-muted space-y-1">
              <li className={password.length >= 8 ? "text-gold" : ""}>At least 8 characters</li>
              <li className={/[a-z]/.test(password) && /[A-Z]/.test(password) ? "text-gold" : ""}>Mixed case letters</li>
              <li className={/\d/.test(password) ? "text-gold" : ""}>At least one number</li>
            </ul>

            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 rounded-lg p-3">{error}</p>
            )}

            <Button type="submit" loading={loading} fullWidth>
              Reset Password
            </Button>
          </form>

          <p className="text-center text-sm text-muted mt-6">
            Remember your password?{" "}
            <Link href="/auth/login" className="text-gold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
