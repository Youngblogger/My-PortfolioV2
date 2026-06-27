"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ACADEMY_NAME, ACADEMY_ADDRESS, ACADEMY_EMAIL, ACADEMY_PHONE } from "@/lib/constants";
import { api, type ReceiptData } from "@/lib/api";

function ReceiptDetail() {
  const params = useParams();
  const id = params.id as string;

  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await api.getReceipt(id);
        if (mounted) setReceipt(data.receipt);
      } catch (err) {
        console.error("Receipt fetch error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <PageLoader />;
  if (!receipt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted">Receipt not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="glass rounded-2xl p-8 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold text-gold">{ACADEMY_NAME}</h1>
              <p className="text-xs text-muted">{ACADEMY_ADDRESS}</p>
              <p className="text-xs text-muted">{ACADEMY_EMAIL} | {ACADEMY_PHONE}</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-gold">RECEIPT</h2>
              <p className="text-xs text-muted font-mono">#{receipt.receipt_number}</p>
              <span className="inline-block bg-green-500/20 text-green-400 text-xs font-medium px-2 py-0.5 rounded-full mt-1">
                Paid
              </span>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Transaction Reference</span>
              <span className="text-white font-mono text-xs">{receipt.transaction_reference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Student</span>
              <span className="text-white">{receipt.student_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Course</span>
              <span className="text-white">{receipt.course_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Amount</span>
              <span className="text-gold font-bold">{formatCurrency(receipt.amount, receipt.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Payment Method</span>
              <span className="text-white capitalize">{receipt.payment_gateway || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Date</span>
              <span className="text-white">{formatDate(receipt.created_at)}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={() => window.print()}>Print</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReceiptPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ReceiptDetail />
    </Suspense>
  );
}
