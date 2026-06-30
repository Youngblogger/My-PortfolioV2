"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { api, type ProjectDetailData } from "@/lib/api";
import { useBooking } from "@/contexts/BookingContext";

export default function ReviewPage() {
  const router = useRouter();
  const { state } = useBooking();
  const [projectData, setProjectData] = useState<ProjectDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthOptions, setShowAuthOptions] = useState(false);

  useEffect(() => {
    if (state.service && state.projectType) {
      api.getProjectType(state.service.slug, state.projectType.slug)
        .then((res) => { setProjectData(res.data); setLoading(false); })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [state.service, state.projectType]);

  const addOnsTotalNgn = state.addOns.reduce((sum, a) => sum + a.price_ngn, 0);
  const packagePriceNgn = state.package?.price_ngn || 0;
  const grandTotalNgn = packagePriceNgn + addOnsTotalNgn;
  const taxNgn = Math.round(grandTotalNgn * 0.075);
  const grandTotalWithTax = grandTotalNgn + taxNgn;

  if (!state.service || !state.projectType || !state.package) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-muted mb-4">No project selected. Please start from the beginning.</p>
          <Link href="/hire" className="text-gold hover:underline">Choose a Service</Link>
        </div>
      </div>
    );
  }

  const handleProceed = async () => {
    try {
      const res = await fetch("/api/auth/user", { credentials: "include" });
      if (res.ok) {
        router.push("/hire/checkout");
      } else {
        setShowAuthOptions(true);
      }
    } catch {
      setShowAuthOptions(true);
    }
  };

  return (
    <section className="relative pt-20 pb-20 md:pt-28 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/30 to-surface" />
        <motion.div
          className="absolute top-1/4 right-0 w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <Link
            href={`/hire/${state.service.slug}/${state.projectType.slug}/book`}
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-white transition-colors mb-6"
          >
            ← Back
          </Link>
          <span className="section-label">REVIEW</span>
          <h1 className="section-heading mt-2">
            Project Review & <span className="text-gradient">Cost Estimate</span>
          </h1>
          <p className="section-subtitle mt-3">
            Review your complete project details before proceeding to checkout.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {/* Service & Project */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xs text-muted uppercase tracking-wider">Project Overview</h3>
                <Link href={`/hire/${state.service.slug}`} className="text-xs text-gold hover:underline">
                  Edit Service
                </Link>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-muted">Service</span>
                  <p className="text-white font-semibold mt-0.5">{state.service.title}</p>
                </div>
                <div>
                  <span className="text-xs text-muted">Project Type</span>
                  <p className="text-white font-semibold mt-0.5">{state.projectType.title}</p>
                </div>
                <div>
                  <span className="text-xs text-muted">Package</span>
                  <p className="text-white font-semibold mt-0.5">{state.package.name}</p>
                </div>
                <div>
                  <span className="text-xs text-muted">Estimated Timeline</span>
                  <p className="text-white font-semibold mt-0.5">
                    {projectData?.packages.find((p) => p.id === state.package?.id)?.estimated_timeline || "Varies"}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Package Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs text-muted uppercase tracking-wider">Package Features</h3>
                <Link href={`/hire/${state.service.slug}/${state.projectType.slug}`} className="text-xs text-gold hover:underline">
                  Edit Package
                </Link>
              </div>
              <ul className="space-y-2">
                {(projectData?.packages.find((p) => p.id === state.package?.id)?.features || []).map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted">
                    <span className="text-gold shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-4 text-xs text-muted flex gap-4">
                <span>{projectData?.packages.find((p) => p.id === state.package?.id)?.revision_count} revisions</span>
                <span>{projectData?.packages.find((p) => p.id === state.package?.id)?.support_period} support</span>
              </div>
            </motion.div>

            {/* Add-ons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs text-muted uppercase tracking-wider">Add-ons</h3>
                <Link href={`/hire/${state.service.slug}/${state.projectType.slug}/book`} className="text-xs text-gold hover:underline">
                  Edit Add-ons
                </Link>
              </div>
              {state.addOns.length > 0 ? (
                <div className="space-y-2">
                  {state.addOns.map((a) => (
                    <div key={a.id} className="flex items-center justify-between text-sm">
                      <span className="text-white">{a.name}</span>
                      <span className="text-gold">+₦{a.price_ngn.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted">No add-ons selected.</p>
              )}
            </motion.div>

            {/* Requirements link */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs text-muted uppercase tracking-wider">Project Requirements</h3>
                  <p className="text-sm text-muted mt-1">Provide detailed project requirements to help us understand your needs</p>
                </div>
                <Link
                  href={`/hire/${state.service.slug}/${state.projectType.slug}/requirements`}
                  className="text-sm text-gold hover:underline shrink-0"
                >
                  Add Requirements →
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Cost Summary Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="glass rounded-2xl p-6 sticky top-32"
            >
              <h3 className="text-sm font-bold text-white mb-4">Cost Estimate</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Package</span>
                  <span className="text-white">₦{packagePriceNgn.toLocaleString()}</span>
                </div>
                {state.addOns.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted">Add-ons ({state.addOns.length})</span>
                    <span className="text-white">₦{addOnsTotalNgn.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted">Subtotal</span>
                  <span className="text-white">₦{grandTotalNgn.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">VAT (7.5%)</span>
                  <span className="text-white">₦{taxNgn.toLocaleString()}</span>
                </div>
                <div className="border-t border-white/10 pt-3" />
                <div className="flex justify-between font-bold">
                  <span className="text-white">Estimated Total</span>
                  <span className="text-gold text-lg">₦{grandTotalWithTax.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {!showAuthOptions ? (
                  <button
                    onClick={handleProceed}
                    className="w-full px-6 py-3.5 rounded-xl bg-gold-gradient text-background font-bold text-sm hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
                  >
                    Proceed to Checkout
                  </button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-muted text-center">
                      Sign in or create an account to continue.
                    </p>
                    <Link
                      href={`/auth/login?redirect=${encodeURIComponent("/hire/checkout")}`}
                      className="block w-full px-6 py-3 rounded-xl bg-gold-gradient text-background font-bold text-sm text-center hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
                    >
                      Sign In
                    </Link>
                    <Link
                      href={`/auth/register?redirect=${encodeURIComponent("/hire/checkout")}`}
                      className="block w-full px-6 py-3 rounded-xl border border-white/10 text-white font-bold text-sm text-center hover:bg-white/5 transition-all duration-300"
                    >
                      Create Account
                    </Link>
                    <p className="text-xs text-center text-muted">
                      <button
                        onClick={() => router.push("/hire/checkout")}
                        className="text-gold hover:underline"
                      >
                        Continue as guest
                      </button>
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-center gap-2 text-xs text-muted pt-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Secured with Paystack & Flutterwave
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
