"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { api } from "@/lib/api";

function PaymentProcessing() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const gateway = searchParams.get("gateway");
  const [status, setStatus] = useState("Verifying Payment...");
  const [dots, setDots] = useState("");
  const mountedRef = useRef(true);
  const retryCount = useRef(0);

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

    async function poll() {
      while (mountedRef.current && retryCount.current < 10) {
        try {
          const data = await api.verifyPayment(ref, gw);

          if (!mountedRef.current) return;

          if (data.status === "completed") {
            setStatus("Payment confirmed! Redirecting...");
            await new Promise((r) => setTimeout(r, 1000));
            router.push(`/academy/payment/success?reference=${reference}&gateway=${gateway}`);
            return;
          }

          if (data.status === "failed") {
            router.push(`/academy/payment/failed?reference=${reference}`);
            return;
          }

          setStatus("Payment is still processing");
          retryCount.current++;
          await new Promise((r) => setTimeout(r, 3000));
        } catch {
          if (!mountedRef.current) return;
          setStatus("Retrying verification...");
          retryCount.current++;
          await new Promise((r) => setTimeout(r, 3000));
        }
      }

      if (mountedRef.current) {
        router.push(`/academy/payment/pending?reference=${reference}&gateway=${gateway}`);
      }
    }

    poll();

    return () => {
      mountedRef.current = false;
      clearInterval(dotInterval);
    };
  }, [reference, gateway, router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-white mb-2">{status}{dots}</h1>
        <p className="text-muted text-sm">Please wait while we confirm your payment</p>
      </div>
    </div>
  );
}

export default function ProcessingPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <PaymentProcessing />
    </Suspense>
  );
}
