"use client";

import { formatCurrency } from "@/lib/utils";
import type { CheckoutData } from "@/types/database";

interface OrderSummaryProps {
  data: CheckoutData;
}

export function OrderSummary({ data }: OrderSummaryProps) {
  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <h3 className="text-lg font-bold text-white">Order Summary</h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-muted">
          <span>Course Price</span>
          <span className="text-white">
            {formatCurrency(data.subtotal, data.currency)}
          </span>
        </div>

        {data.coupon && data.discount_amount > 0 && (
          <div className="flex justify-between text-green-400">
            <span>Discount ({data.coupon.code})</span>
            <span>-{formatCurrency(data.discount_amount, data.currency)}</span>
          </div>
        )}

        {data.tax_amount > 0 && (
          <div className="flex justify-between text-muted">
            <span>Tax</span>
            <span className="text-white">
              {formatCurrency(data.tax_amount, data.currency)}
            </span>
          </div>
        )}
      </div>

      <div className="border-t border-white/10 pt-4">
        <div className="flex justify-between items-baseline">
          <span className="text-white font-semibold">Total</span>
          <div className="text-right">
            {data.course.original_price_ngn && data.discount_amount > 0 && (
              <span className="text-muted text-xs line-through block">
                {formatCurrency(data.course.original_price_ngn, data.currency)}
              </span>
            )}
            <span className="text-2xl font-bold text-gold">
              {formatCurrency(data.grand_total, data.currency)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
