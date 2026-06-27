"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/LoadingSpinner";

const commonReasons = [
  "Payment was cancelled",
  "Insufficient balance",
  "Card was declined",
  "Card has expired",
  "Gateway timeout",
  "Verification failure",
];

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/5 to-transparent pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-lg w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center"
        >
          <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </motion.div>

        <h1 className="text-3xl font-bold text-white mb-2">Payment Failed</h1>
        <p className="text-muted mb-8">
          Your payment could not be processed. Common reasons:
        </p>

        <div className="glass rounded-2xl p-6 mb-8 text-left">
          <ul className="space-y-2">
            {commonReasons.map((reason, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-muted">
                <span className="text-red-400">•</span>
                {reason}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          {reference && (
            <Link href={`/academy/checkout/${reference.split("-")[0]}`}>
              <Button fullWidth>Retry Payment</Button>
            </Link>
          )}
          <Link href="/academy">
            <Button variant="outline" fullWidth>Back to Courses</Button>
          </Link>
          <Link href="/contact">
            <Button variant="ghost" fullWidth size="sm">Contact Support</Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <PaymentFailedContent />
    </Suspense>
  );
}
