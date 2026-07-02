"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const STEPS = [
  { label: "Service", path: "/hire" },
  { label: "Project Type", pathPattern: "/hire/[service]" },
  { label: "Details", pathPattern: "/hire/[service]/[project]" },
  { label: "Customize", pathPattern: "/hire/[service]/[project]/book" },
  { label: "Requirements", pathPattern: "/hire/[service]/[project]/requirements" },
  { label: "Review", pathPattern: "/hire/review" },
  { label: "Checkout", pathPattern: "/hire/checkout" },
];

function getCurrentStep(pathname: string): number {
  if (pathname === "/hire") return 0;
  if (/^\/hire\/[^/]+$/.test(pathname) && !STEPS.some((s) => s.pathPattern && pathname.startsWith("/hire/checkout") || pathname.startsWith("/hire/review") || pathname.startsWith("/hire/order") || pathname.startsWith("/hire/project"))) return 1;
  if (/^\/hire\/[^/]+\/[^/]+$/.test(pathname) && !pathname.includes("/book") && !pathname.includes("/requirements")) return 2;
  if (pathname.includes("/book")) return 3;
  if (pathname.includes("/requirements")) return 4;
  if (pathname.startsWith("/hire/review")) return 5;
  if (pathname.startsWith("/hire/checkout")) return 6;
  return -1;
}

const stepLabels = ["Browse", "Choose", "Details", "Add-ons", "Requirements", "Review", "Pay"];

export default function HireProgressBar() {
  const pathname = usePathname();
  const currentStep = getCurrentStep(pathname);
  const progress = currentStep >= 0 ? ((currentStep + 1) / STEPS.length) * 100 : 0;

  if (currentStep < 0) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1 md:gap-2 min-w-max md:min-w-0">
          {stepLabels.map((label, i) => (
            <div key={label} className="flex-1 flex items-center">
              <div className="flex items-center gap-1 md:gap-2 min-w-0">
                <div
                  className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                    i === currentStep
                      ? "bg-gold-gradient text-background font-bold"
                      : i < currentStep
                      ? "bg-gold/20 text-gold"
                      : "bg-white/5 text-muted"
                  }`}
                >
                  {i < currentStep ? (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-[10px] md:text-xs font-semibold">{i + 1}</span>
                  )}
                </div>
                <span
                  className={`hidden md:inline text-[10px] md:text-xs font-medium truncate transition-colors duration-300 ${
                    i === currentStep ? "text-gold" : i < currentStep ? "text-white/60" : "text-muted"
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < stepLabels.length - 1 && (
                <div className="flex-1 mx-1 md:mx-2 h-px bg-white/5 relative overflow-hidden min-w-[12px] md:min-w-0">
                  <motion.div
                    className="absolute inset-0 bg-gold-gradient"
                    initial={{ width: 0 }}
                    animate={{ width: i < currentStep ? "100%" : "0%" }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
