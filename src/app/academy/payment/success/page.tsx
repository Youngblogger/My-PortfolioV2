"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { formatCurrency, formatDate } from "@/lib/utils";
import { api, type EnrollmentData, type TransactionData } from "@/lib/api";

function PaymentSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const gateway = searchParams.get("gateway");

  const [enrollment, setEnrollment] = useState<EnrollmentData | null>(null);
  const [transaction, setTransaction] = useState<TransactionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reference || !gateway) {
      setError("Missing payment reference");
      setLoading(false);
      return;
    }

    const ref = reference;
    const gw = gateway;
    let mounted = true;

    async function verify() {
      try {
        const data = await api.verifyPayment(ref, gw);
        if (!mounted) return;

        if (data.status === "completed") {
          setEnrollment(data.enrollment || null);
          setTransaction(data.transaction);
        } else {
          router.push(`/academy/payment/failed?reference=${reference}`);
        }
      } catch {
        if (mounted) setError("Failed to verify payment");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    verify();
    return () => { mounted = false; };
  }, [reference, gateway, router]);

  if (loading) return <PageLoader />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-6xl mb-4" aria-hidden="true">❌</div>
          <h1 className="text-2xl font-bold text-white mb-2">Verification Failed</h1>
          <p className="text-muted mb-6">{error}</p>
          <Link href="/academy/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className="max-w-lg w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>

          <h1 className="text-3xl font-bold text-white mb-2">Congratulations!</h1>
          <p className="text-muted mb-8">Your payment was successful</p>

          {enrollment && (
            <div className="bg-white/5 rounded-xl p-4 mb-6 text-left space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Enrollment ID</span>
                <span className="text-white font-mono">{enrollment.enrollment_number}</span>
              </div>
              {transaction && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted">Transaction Ref</span>
                    <span className="text-white font-mono text-xs">{transaction.transaction_reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Amount Paid</span>
                    <span className="text-gold font-bold">{formatCurrency(transaction.amount, transaction.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Payment Method</span>
                    <span className="text-white capitalize">{transaction.payment_gateway}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Status</span>
                    <span className="text-green-400">Completed</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Date</span>
                    <span className="text-white">{formatDate(transaction.created_at)}</span>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={`/academy/enrollment/${enrollment?.id}?success=true`}>
              <Button>Start Learning</Button>
            </Link>
            <Link href="/academy/dashboard">
              <Button variant="secondary">Go to Dashboard</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <PaymentSuccess />
    </Suspense>
  );
}
