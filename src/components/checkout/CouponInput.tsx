"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface CouponInputProps {
  onApply: (code: string) => Promise<{ valid: boolean; error?: string; data?: any }>;
  onRemove: () => void;
  applied?: boolean;
}

export function CouponInput({ onApply, onRemove, applied }: CouponInputProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleApply() {
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    setSuccess("");

    const result = await onApply(code.trim());
    if (result.valid) {
      setSuccess("Coupon applied successfully!");
      setCode("");
    } else {
      setError(result.error || "Invalid coupon code");
    }
    setLoading(false);
  }

  if (applied) {
    return (
      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between">
          <span className="text-green-400 text-sm font-medium">Coupon applied ✓</span>
          <button
            onClick={onRemove}
            className="text-xs text-muted hover:text-white transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm text-white/80 font-medium">Have a coupon?</label>
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter coupon code"
          className="flex-1"
        />
        <Button
          variant="secondary"
          size="md"
          onClick={handleApply}
          loading={loading}
          disabled={!code.trim()}
        >
          Apply
        </Button>
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      {success && <p className="text-green-400 text-xs">{success}</p>}
    </div>
  );
}
