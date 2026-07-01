"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { api } from "@/lib/api";

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await api.sendPasswordResetLink(email);
      if (!result.success) {
        setError(result.error || "We couldn't process your password reset request. Please try again later.");
        setLoading(false);
        return;
      }
      setResponseMessage(result.message || "If an account with that email address exists, a password reset link has been sent.");
      setSent(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      setError(message || "We couldn't process your password reset request. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
    <div className="min-h-screen flex items-start justify-center px-0 sm:px-6 pt-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/50 to-transparent pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">Check Your Email</h1>
          </div>
          <div className="glass rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-muted mb-6">
              {responseMessage}
            </p>
            <Link href="/auth/login">
              <Button variant="outline" fullWidth>Back to Login</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-start justify-center px-0 sm:px-6 pt-10">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/50 to-transparent pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Reset Password</h1>
          <p className="text-muted mt-2">
            Enter your email and we&apos;ll send you reset instructions
          </p>
        </div>

        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />

            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 rounded-lg p-3">{error}</p>
            )}

            <Button type="submit" loading={loading} fullWidth>
              Send Reset Link
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

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
