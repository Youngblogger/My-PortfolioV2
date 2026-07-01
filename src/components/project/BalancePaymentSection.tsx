"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

interface BalancePaymentSectionProps {
  orderId: string;
  balanceNgn: number;
  totalNgn: number;
  amountPaidNgn: number;
  invoiceNumber?: string;
  onPaymentSuccess?: () => void;
}

export default function BalancePaymentSection({
  orderId,
  balanceNgn,
  totalNgn,
  amountPaidNgn,
  invoiceNumber,
  onPaymentSuccess,
}: BalancePaymentSectionProps) {
  const [loading, setLoading] = useState(false);
  const [gateway, setGateway] = useState("paystack");
  const [error, setError] = useState<string | null>(null);

  const handlePayBalance = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.initializeBalancePayment(orderId, gateway);
      const { authorization_url } = res.data;
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
      setTimeout(() => {
        window.location.href = authorization_url;
      }, 300);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to initialize payment.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass rounded-2xl p-6 md:p-8 border border-gold/20">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">💰</span>
        <h3 className="text-lg font-bold text-white">Remaining Balance</h3>
      </div>

      <p className="text-sm text-muted mb-4">
        You have an outstanding balance of{" "}
        <span className="text-gold font-bold">{formatCurrency(balanceNgn)}</span>.
      </p>

      <p className="text-xs text-muted/70 mb-6">
        Your project will be available for download only after full payment has been received and the project has been completed.
      </p>

      {/* Updated Invoice Summary */}
      <div className="bg-white/5 rounded-xl p-4 mb-6 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted">Total Project Cost</span>
          <span className="text-white font-semibold">{formatCurrency(totalNgn)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted">Amount Paid</span>
          <span className="text-green-400 font-semibold">{formatCurrency(amountPaidNgn)}</span>
        </div>
        <div className="border-t border-white/10 pt-2 flex justify-between text-sm">
          <span className="text-muted font-semibold">Remaining Balance</span>
          <span className="text-gold font-bold">{formatCurrency(balanceNgn)}</span>
        </div>
        {invoiceNumber && (
          <div className="text-xs text-muted pt-1">
            Invoice: <span className="font-mono">{invoiceNumber}</span>
          </div>
        )}
      </div>

      {/* Payment Gateway Selection */}
      <div className="mb-4">
        <label className="text-xs text-muted block mb-2">Payment Method</label>
        <div className="flex gap-3">
          <button
            onClick={() => setGateway("paystack")}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
              gateway === "paystack"
                ? "bg-gold/10 text-gold border-gold/30"
                : "bg-white/5 text-muted border-white/10 hover:text-white"
            }`}
          >
            Paystack
          </button>
          <button
            onClick={() => setGateway("flutterwave")}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
              gateway === "flutterwave"
                ? "bg-gold/10 text-gold border-gold/30"
                : "bg-white/5 text-muted border-white/10 hover:text-white"
            }`}
          >
            Flutterwave
          </button>
        </div>
      </div>

      {error && (
        <div className="text-xs text-red-400 mb-4 bg-red-500/10 p-3 rounded-lg">
          {error}
        </div>
      )}

      <button
        onClick={handlePayBalance}
        disabled={loading}
        className="w-full px-6 py-3 rounded-xl bg-gold-gradient text-background font-bold text-sm hover:shadow-gold transition-all disabled:opacity-50"
      >
        {loading ? "Redirecting to payment..." : `Pay ${formatCurrency(balanceNgn)} Now`}
      </button>

      <p className="text-xs text-muted/50 mt-3 text-center">
        You will be redirected to the payment gateway to complete the transaction.
      </p>
    </div>
  );
}
