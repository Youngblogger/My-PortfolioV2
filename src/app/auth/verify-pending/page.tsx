"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

export default function VerifyPendingPage() {
  const router = useRouter();

  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const checkVerification = useCallback(async () => {
    setLoading(true);
    try {
      const userRes = await api.getUser();
      if (userRes.user) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      // User not logged in or not verified yet
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkVerification();
  }, [checkVerification]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function handleResend() {
    if (cooldown > 0) return;
    setResendLoading(true);
    setError("");
    setMessage("");
    try {
      const result = await api.resendVerificationEmail();
      if (result.success) {
        setMessage("Verification email sent! Check your inbox.");
        setCooldown(60);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend");
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-8 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>

      <h2 className="text-xl font-bold text-white">Check Your Email</h2>
      <p className="text-muted mt-2 text-sm">
        We&apos;ve sent a verification link to your email address. Click the link to activate your account.
      </p>

      <div className="bg-white/5 rounded-xl p-4 mt-6 text-left text-sm text-muted space-y-2">
        <p className="flex items-start gap-2">
          <span className="text-gold shrink-0">1.</span>
          <span>Open your email inbox</span>
        </p>
        <p className="flex items-start gap-2">
          <span className="text-gold shrink-0">2.</span>
          <span>Click the verification link in the email</span>
        </p>
        <p className="flex items-start gap-2">
          <span className="text-gold shrink-0">3.</span>
          <span>You&apos;ll be redirected back to confirm your account</span>
        </p>
      </div>

      <div className="mt-6 space-y-3">
        {message && (
          <p className="text-green-400 text-sm bg-green-500/10 rounded-lg p-3">{message}</p>
        )}
        {error && (
          <p className="text-red-400 text-sm bg-red-500/10 rounded-lg p-3">{error}</p>
        )}

        <Button
          variant="primary"
          fullWidth
          loading={resendLoading}
          disabled={cooldown > 0}
          onClick={handleResend}
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Verification Email"}
        </Button>

        <Button variant="ghost" fullWidth loading={loading} onClick={checkVerification}>
          I&apos;ve Verified My Email
        </Button>
      </div>

      <div className="mt-6 space-y-2 text-sm">
        <p className="text-muted">
          Didn&apos;t receive the email? Check your spam folder or try a different email address.
        </p>
        <Link href="/auth/login" className="block text-gold hover:underline">
          Back to Sign In
        </Link>
      </div>
    </motion.div>
  );
}
