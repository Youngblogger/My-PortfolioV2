"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { api } from "@/lib/api";
import { useBooking } from "@/contexts/BookingContext";
import { PageLoader } from "@/components/ui/LoadingSpinner";

function OrderSuccessContent() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<{
    order_number: string;
    invoice_number: string;
    status: string;
    payment_status: string;
    amount_paid_ngn: number;
    balance_ngn: number;
    total_ngn: number;
    payment_type: string;
    project_name: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const { reset } = useBooking();

  useEffect(() => {
    if (!id) return;

    const reference = searchParams.get("reference");
    if (reference) {
      api.verifyServicePayment(reference, id).then((res) => {
        setStatus(res.data);
        setLoading(false);
        reset();
      }).catch(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [id, searchParams, reset]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl p-8 animate-pulse space-y-4">
          <div className="h-8 w-48 bg-white/10 rounded" />
          <div className="h-4 w-64 bg-white/10 rounded" />
        </div>
      </div>
    );
  }

  const paid = status?.payment_status === "paid" || status?.payment_status === "partially_paid";
  const isDeposit = status?.payment_type === "deposit";

  return (
    <section className="relative pt-20 pb-20 md:pt-28 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/30 to-surface" />
        <motion.div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center mx-auto mb-8">
            <motion.svg
              className="w-12 h-12 text-gold"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: 0.3, ease: "easeInOut" }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </motion.svg>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {paid ? "Payment Successful!" : "Order Placed!"}
          </h1>
          <p className="text-lg text-muted mb-2 max-w-lg mx-auto">
            {paid
              ? isDeposit
                ? "Your deposit has been received. We'll begin work once everything is confirmed."
                : "Your project is confirmed! Our team will reach out within 24 hours."
              : "Your order has been received. Complete payment to start the project."}
          </p>
          <p className="text-sm text-muted">Order reference: <span className="text-white font-mono">{status?.order_number}</span></p>
        </motion.div>

        {status && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-6 md:p-8 text-left max-w-lg mx-auto mt-8"
          >
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Order Number</span>
                <span className="text-white font-medium font-mono">{status.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Project</span>
                <span className="text-white font-medium">{status.project_name}</span>
              </div>
              <div className="border-t border-white/10 my-2" />
              <div className="flex justify-between">
                <span className="text-muted">Total Amount</span>
                <span className="text-white font-bold">₦{status.total_ngn.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Amount Paid</span>
                <span className="text-gold font-bold">₦{status.amount_paid_ngn.toLocaleString()}</span>
              </div>
              {status.balance_ngn > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted">Balance Due</span>
                  <span className="text-gold font-bold">₦{status.balance_ngn.toLocaleString()}</span>
                </div>
              )}
              <div className={`flex justify-between ${
                status.payment_status === "paid" ? "" : "pt-2"
              }`}>
                <span className="text-muted">Payment Status</span>
                <span className={`font-medium capitalize ${
                  status.payment_status === "paid" ? "text-green-400" : "text-yellow-400"
                }`}>
                  {status.payment_status === "partially_paid" ? "Deposit Paid" : status.payment_status}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-10 glass rounded-2xl p-6 text-left max-w-lg mx-auto"
        >
          <h3 className="text-sm font-bold text-white mb-3">What&apos;s Next?</h3>
          <div className="space-y-3">
            {[
              { step: 1, text: "We'll review your requirements and project details", done: true },
              { step: 2, text: isDeposit ? "Balance payment due at project midpoint" : "Project kickoff within 24-48 hours", done: false },
              { step: 3, text: "Receive regular updates through your project dashboard", done: false },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  item.done ? "bg-gold/20" : "bg-white/5"
                }`}>
                  {item.done ? (
                    <span className="text-gold text-xs">✓</span>
                  ) : (
                    <span className="text-muted text-xs">{item.step}</span>
                  )}
                </div>
                <span className={`text-sm ${item.done ? "text-white" : "text-muted"}`}>{item.text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href={paid ? "/academy/dashboard" : "/hire"}
            className="px-8 py-3.5 rounded-xl bg-gold-gradient text-background font-bold text-sm hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
          >
            {paid ? "Go to Dashboard" : "Start Another Project"}
          </Link>
          <Link
            href={paid ? `/hire/project/${id}` : "/contact"}
            className="px-8 py-3.5 rounded-xl glass text-white font-bold text-sm hover:bg-white/10 transition-all duration-300"
          >
            {paid ? "View Project Workspace" : "Contact Support"}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <OrderSuccessContent />
    </Suspense>
  );
}
