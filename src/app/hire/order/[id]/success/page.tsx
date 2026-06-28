"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { api } from "@/lib/api";
import { useBooking } from "@/contexts/BookingContext";

export default function OrderSuccessPage() {
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
  }, [id, searchParams]);

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

  return (
    <section className="relative pt-32 pb-20 md:pt-40 overflow-hidden">
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-8">
            <span className="text-4xl">✓</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {status?.payment_status === "paid" || status?.payment_status === "partially_paid"
              ? "Payment Successful!"
              : "Order Placed!"}
          </h1>
          <p className="text-lg text-muted mb-8">
            {status?.payment_status === "paid" || status?.payment_status === "partially_paid"
              ? "Your project has been created. We'll be in touch within 24 hours."
              : "Your order has been received. Complete payment to start the project."}
          </p>
        </motion.div>

        {status && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-6 md:p-8 text-left max-w-lg mx-auto"
          >
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Order Number</span>
                <span className="text-white font-medium">{status.order_number}</span>
              </div>
              {status.invoice_number && (
                <div className="flex justify-between">
                  <span className="text-muted">Invoice Number</span>
                  <span className="text-white font-medium">{status.invoice_number}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted">Project</span>
                <span className="text-white font-medium">{status.project_name}</span>
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
              <div className="flex justify-between">
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/hire"
            className="px-8 py-3.5 rounded-xl bg-gold-gradient text-background font-bold text-sm hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
          >
            Start Another Project
          </Link>
          <Link
            href="/academy/dashboard"
            className="px-8 py-3.5 rounded-xl glass text-white font-bold text-sm hover:bg-white/10 transition-all duration-300"
          >
            Go to Dashboard
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
