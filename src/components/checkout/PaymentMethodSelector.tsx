"use client";

import { motion } from "framer-motion";
import type { PaymentGateway } from "@/types/database";

interface PaymentMethodSelectorProps {
  selected: PaymentGateway;
  onSelect: (gateway: PaymentGateway) => void;
}

const methods = [
  {
    id: "paystack" as PaymentGateway,
    name: "Paystack",
    description: "Pay with card, bank transfer, or USSD",
    supported: "Visa, Mastercard, Verve, American Express",
    speed: "Instant",
    fees: "1.5% + ₦100",
  },
  {
    id: "flutterwave" as PaymentGateway,
    name: "Flutterwave",
    description: "Pay with card, bank transfer, or mobile money",
    supported: "Visa, Mastercard, Verve, Discover",
    speed: "Instant",
    fees: "1.4% + ₦0",
  },
];

export function PaymentMethodSelector({ selected, onSelect }: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-white">Payment Method</h3>
      {methods.map((method) => (
        <motion.button
          key={method.id}
          whileTap={{ scale: 0.99 }}
          onClick={() => onSelect(method.id)}
          className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${
            selected === method.id
              ? "border-gold/50 bg-gold/5"
              : "border-white/10 bg-white/5 hover:border-white/20"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selected === method.id ? "border-gold" : "border-white/30"
              }`}>
                {selected === method.id && (
                  <div className="w-2.5 h-2.5 rounded-full bg-gold" />
                )}
              </div>
              <span className="text-white font-medium">{method.name}</span>
            </div>
          </div>
          <p className="text-muted text-sm ml-8">{method.description}</p>
          <div className="flex gap-4 ml-8 mt-2 text-xs text-muted">
            <span>⚡ {method.speed}</span>
            <span>💰 {method.fees}</span>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
