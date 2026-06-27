"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { api } from "@/lib/api";

function PaymentPending() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const gateway = searchParams.get("gateway");
  const [dots, setDots] = useState("");
  const mountedRef = useRef(true);

  useEffect(() => {
    if (!reference || !gateway) {
      router.push("/academy/payment/failed");
      return;
    }

    const ref = reference;
    const gw = gateway;

    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    const timeout = setTimeout(() => {
      if (mountedRef.current) {
        router.push(`/academy/payment/failed?reference=${ref}`);
      }
    }, 120000);

    let pollCount = 0;
    const pollInterval = setInterval(async () => {
      pollCount++;
      if (pollCount > 24) {
        clearInterval(pollInterval);
        return;
      }

      try {
        const data = await api.verifyPayment(ref, gw);
        if (!mountedRef.current) return;

        if (data.status === "completed") {
          clearTimeout(timeout);
          router.push(`/academy/payment/success?reference=${ref}&gateway=${gw}`);
          return;
        }

        if (data.status === "failed") {
          clearTimeout(timeout);
          router.push(`/academy/payment/failed?reference=${ref}`);
          return;
        }
      } catch {
        // retry on next interval
      }
    }, 5000);

    return () => {
      mountedRef.current = false;
      clearInterval(dotInterval);
      clearInterval(pollInterval);
      clearTimeout(timeout);
    };
  }, [reference, gateway, router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-6 relative">
          <svg className="w-20 h-20 text-gold animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <svg className="w-8 h-8 text-gold absolute top-6 left-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Payment Received{dots}</h1>
        <p className="text-muted text-sm mb-6">We&apos;re confirming your payment. This page will update automatically.</p>
        <Link href="/academy/dashboard">
          <span className="text-gold text-sm hover:underline">Go to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}

export default function PendingPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <PaymentPending />
    </Suspense>
  );
}
