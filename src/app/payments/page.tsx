"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { api, type PaymentRecord } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";

const paymentBadgeClass = (status: string): string => {
  const map: Record<string, string> = {
    paid: "bg-green-500/10 text-green-400 border border-green-500/20",
    completed: "bg-green-500/10 text-green-400 border border-green-500/20",
    pending: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    failed: "bg-red-500/10 text-red-400 border border-red-500/20",
    refunded: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    cancelled: "bg-red-500/10 text-red-400 border border-red-500/20",
  };
  return map[status] || "bg-[#5B4CF0]/10 text-[#5B4CF0] border border-[#5B4CF0]/20";
};

const paymentLabel = (status: string): string => {
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [totals, setTotals] = useState({ total_spent_ngn: 0, total_paid: 0, total_pending: 0, total_failed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.getPayments();
      setPayments(res.data.payments || []);
      setTotals(res.data.totals || { total_spent_ngn: 0, total_paid: 0, total_pending: 0, total_failed: 0 });
    } catch {
      setError("Failed to load payment history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="min-h-screen py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="h-8 bg-[#F7F9FC] rounded w-48 mb-2 animate-pulse" />
            <div className="h-5 bg-[#F7F9FC] rounded w-64 animate-pulse" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-[0_10px_35px_rgba(16,24,40,0.06)] border border-[#ECEFF5] rounded-xl p-5 animate-pulse space-y-2">
                <div className="h-3 bg-[#F7F9FC] rounded w-16" />
                <div className="h-7 bg-[#F7F9FC] rounded w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-20 px-6">
        <div className="max-w-xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-[0_10px_35px_rgba(16,24,40,0.06)] border border-[#ECEFF5] rounded-2xl p-12">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-bold text-[#101828] mb-2">Oops</h3>
            <p className="text-[#98A2B3] text-sm mb-6">{error}</p>
            <button onClick={load} className="px-6 py-3 rounded-xl bg-[#5B4CF0] text-white font-bold text-sm hover:shadow-[0_0_20px_rgba(91,76,240,0.3)] transition-all">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#101828]">Payments</h1>
          <p className="text-[#98A2B3] mt-1">Your payment history across all projects.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white rounded-2xl shadow-[0_10px_35px_rgba(16,24,40,0.06)] border border-[#ECEFF5] rounded-xl p-5">
            <p className="text-xs text-[#98A2B3] mb-1">Total Spent</p>
            <p className="text-2xl font-bold text-[#5B4CF0]">{formatCurrency(totals.total_spent_ngn)}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-[0_10px_35px_rgba(16,24,40,0.06)] border border-[#ECEFF5] rounded-xl p-5">
            <p className="text-xs text-[#98A2B3] mb-1">Paid</p>
            <p className="text-2xl font-bold text-green-400">{totals.total_paid}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-[0_10px_35px_rgba(16,24,40,0.06)] border border-[#ECEFF5] rounded-xl p-5">
            <p className="text-xs text-[#98A2B3] mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-400">{totals.total_pending}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-[0_10px_35px_rgba(16,24,40,0.06)] border border-[#ECEFF5] rounded-xl p-5">
            <p className="text-xs text-[#98A2B3] mb-1">Failed</p>
            <p className="text-2xl font-bold text-red-400">{totals.total_failed}</p>
          </div>
        </div>

        {payments.length === 0 ? (
          <EmptyState
            icon="💳"
            title="No Payment History"
            description="Payment records will appear here once you make a purchase."
            action={{ label: "Start a Project", href: "/hire" }}
          />
        ) : (
          <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-3">
            {payments.map((payment, i) => (
              <motion.div key={payment.id} variants={fadeUp}>
                <Link
                  href={`/hire/project/${payment.order_id}`}
                  className="block bg-white rounded-2xl shadow-[0_10px_35px_rgba(16,24,40,0.06)] border border-[#ECEFF5] rounded-xl p-5 hover:border-[#5B4CF0]/20 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#101828] truncate">
                        {payment.project_name}
                      </p>
                      <p className="text-xs text-[#98A2B3] mt-0.5">
                        {payment.service} &middot; Ref: {payment.reference.slice(0, 12)}...
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${paymentBadgeClass(payment.status)}`}>
                          {paymentLabel(payment.status)}
                        </span>
                        <span className="text-xs text-[#98A2B3]/60">
                          {payment.paid_at ? formatDate(payment.paid_at) : formatDate(payment.created_at)}
                        </span>
                        <span className="text-xs text-[#98A2B3]/60">{payment.gateway}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-sm font-bold text-[#5B4CF0]">{formatCurrency(payment.amount_ngn)}</p>
                      <p className="text-[10px] text-[#98A2B3]/60 mt-0.5">{payment.currency}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
