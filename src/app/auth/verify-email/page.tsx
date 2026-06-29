"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { PageLoader, LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { api } from "@/lib/api";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<"loading" | "success" | "expired" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const id = searchParams.get("id");
    const hash = searchParams.get("hash");
    const expires = searchParams.get("expires");
    const signature = searchParams.get("signature");

    if (!id || !hash || !expires || !signature) {
      setStatus("error");
      setMessage("Invalid verification link");
      return;
    }

    api
      .verifyEmail(id, hash, expires, signature)
      .then((res) => {
        if (res.success) {
          setStatus("success");
          setMessage(res.message || "Email verified successfully");
        } else {
          setStatus("error");
          setMessage(res.error || "Verification failed");
        }
      })
      .catch((err) => {
        const msg = err.message || "Verification failed";
        if (msg.toLowerCase().includes("expired") || msg.toLowerCase().includes("invalid signature")) {
          setStatus("expired");
          setMessage("This verification link has expired");
        } else {
          setStatus("error");
          setMessage(msg);
        }
      });
  }, [searchParams]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-8 text-center"
    >
      {status === "loading" && (
        <div className="space-y-4">
          <LoadingSpinner size="lg" className="text-gold mx-auto" />
          <p className="text-muted">Verifying your email...</p>
        </div>
      )}

      {status === "success" && (
        <div className="space-y-6">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Email Verified!</h2>
            <p className="text-muted mt-2">{message}</p>
          </div>
          <Button onClick={() => router.push("/dashboard")} fullWidth>
            Go to Dashboard
          </Button>
        </div>
      )}

      {status === "expired" && (
        <div className="space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Link Expired</h2>
            <p className="text-muted mt-2">{message}. Request a new verification email.</p>
          </div>
          <Button onClick={() => router.push("/auth/verify-pending")} fullWidth>
            Resend Verification
          </Button>
        </div>
      )}

      {status === "error" && (
        <div className="space-y-6">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Verification Failed</h2>
            <p className="text-muted mt-2">{message}</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/auth/verify-pending")} fullWidth>
            Try Again
          </Button>
          <Link href="/auth/login" className="block text-sm text-gold hover:underline">
            Back to Sign In
          </Link>
        </div>
      )}
    </motion.div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
