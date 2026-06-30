"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { api } from "@/lib/api";
import { useBooking } from "@/contexts/BookingContext";

export default function CheckoutPage() {
  const router = useRouter();
  const { state, setBilling, setProjectName, setProjectDescription, setPreferredStartDate, setPaymentGateway, setPaymentType, reset } = useBooking();
  const [user, setUser] = useState<{ id: string; email: string; full_name: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const isSubmitting = useRef(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    country: "",
    state: "",
    city: "",
    address: "",
    company: "",
    project_name: "",
    project_description: "",
    preferred_start_date: "",
    payment_gateway: "paystack",
    payment_type: "full" as "full" | "deposit",
  });

  useEffect(() => {
    api.getUser().then((res) => {
      const u = res.user;
      setUser(u);
      setForm((prev) => ({
        ...prev,
        full_name: u.full_name || "",
        email: u.email || "",
      }));
      setLoading(false);
    }).catch(() => {
      router.push(`/auth/login?redirect=${encodeURIComponent("/hire/checkout")}`);
    });
  }, [router]);

  useEffect(() => {
    if (state.billing.full_name) {
      setForm((prev) => ({
        ...prev,
        ...state.billing,
        project_name: state.projectName || prev.project_name,
        project_description: state.projectDescription || prev.project_description,
        preferred_start_date: state.preferredStartDate || prev.preferred_start_date,
        payment_gateway: state.paymentGateway || prev.payment_gateway,
        payment_type: state.paymentType || prev.payment_type,
      }));
    }
  }, []);

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

  const addOnsTotalNgn = state.addOns.reduce((sum, a) => sum + a.price_ngn, 0);
  const packagePriceNgn = state.package.price_ngn;
  const grandTotalNgn = packagePriceNgn + addOnsTotalNgn;
  const taxNgn = Math.round(grandTotalNgn * 0.075);
  const grandTotalWithTax = grandTotalNgn + taxNgn;
  const depositAmount = Math.round(grandTotalWithTax / 2);
  const displayTotal = form.payment_type === "deposit" ? depositAmount : grandTotalWithTax;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting.current) return;
    if (!user) return;
    if (!state.service || !state.projectType || !state.package) {
      alert("Missing project selections. Please start over.");
      return;
    }
    isSubmitting.current = true;
    setSubmitting(true);

    const billing = {
      full_name: form.full_name,
      email: form.email,
      phone: form.phone,
      country: form.country,
      state: form.state,
      city: form.city,
      address: form.address,
      company: form.company,
    };

    setBilling(billing);
    setProjectName(form.project_name);
    setProjectDescription(form.project_description);
    setPreferredStartDate(form.preferred_start_date);
    setPaymentGateway(form.payment_gateway);
    setPaymentType(form.payment_type);

    try {
      const res = await api.placeServiceOrder({
        service_id: state.service.id,
        project_type_id: state.projectType.id,
        package_id: state.package.id,
        add_on_ids: state.addOns.map((a) => a.id),
        payment_gateway: form.payment_gateway,
        payment_type: form.payment_type,
        project_name: form.project_name,
        project_description: form.project_description,
        preferred_start_date: form.preferred_start_date || undefined,
        billing,
      });

      if (res.data.authorization_url) {
        window.location.href = res.data.authorization_url;
      } else {
        router.push(`/hire/order/${res.data.order_id}/success?reference=${res.data.reference}`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      alert(message);
    } finally {
      isSubmitting.current = false;
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl p-8 animate-pulse space-y-4">
          <div className="h-8 w-48 bg-white/10 rounded" />
          <div className="h-4 w-96 bg-white/10 rounded" />
        </div>
      </div>
    );
  }

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

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <Link
            href="/hire/review"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-white transition-colors mb-6"
          >
            ← Back to Review
          </Link>
          <span className="section-label">FINAL STEP</span>
          <h1 className="section-heading mt-2">
            Secure <span className="text-gradient">Checkout</span>
          </h1>
          <p className="section-subtitle mt-3">
            Complete your order with confidence — encrypted and secure.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-6">
              {/* Project Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-white">Project Information</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-muted mb-1.5">Project Name *</label>
                    <input type="text" name="project_name" value={form.project_name} onChange={handleChange} required placeholder="e.g. ACME Corp Website"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-muted/50 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all duration-300" />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1.5">Preferred Start Date</label>
                    <input type="date" name="preferred_start_date" value={form.preferred_start_date} onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all duration-300" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-muted mb-1.5">Project Description</label>
                    <textarea name="project_description" value={form.project_description} onChange={handleChange} rows={3} placeholder="Describe your project requirements..."
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-muted/50 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all duration-300 resize-none" />
                  </div>
                </div>
              </motion.div>

              {/* Client Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-white">Client Information</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-muted mb-1.5">Full Name *</label>
                    <input type="text" name="full_name" value={form.full_name} onChange={handleChange} required
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-muted/50 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all duration-300" />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1.5">Email *</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} required
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-muted/50 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all duration-300" />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1.5">Phone</label>
                    <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+234 800 000 0000"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-muted/50 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all duration-300" />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1.5">Company</label>
                    <input type="text" name="company" value={form.company} onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-muted/50 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all duration-300" />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1.5">Country</label>
                    <input type="text" name="country" value={form.country} onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-muted/50 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all duration-300" />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1.5">City</label>
                    <input type="text" name="city" value={form.city} onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-muted/50 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all duration-300" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-muted mb-1.5">Address</label>
                    <input type="text" name="address" value={form.address} onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-muted/50 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all duration-300" />
                  </div>
                </div>
              </motion.div>

              {/* Payment Method */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-white">Payment Method</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {["paystack", "flutterwave"].map((gateway) => (
                    <label key={gateway}
                      className={`glass rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                        form.payment_gateway === gateway ? "gold-border ring-1 ring-gold/20" : "hover:bg-white/5"
                      }`}
                    >
                      <input type="radio" name="payment_gateway" value={gateway} checked={form.payment_gateway === gateway} onChange={handleChange} className="hidden" />
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          form.payment_gateway === gateway ? "border-gold" : "border-white/20"
                        }`}>
                          {form.payment_gateway === gateway && <div className="w-2 h-2 rounded-full bg-gold" />}
                        </div>
                        <span className="text-sm text-white font-medium capitalize">{gateway}</span>
                        <span className="text-[10px] text-muted px-1.5 py-0.5 rounded bg-white/5 ml-auto">{gateway === "paystack" ? "NGN" : "NGN/USD"}</span>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-bold text-white mb-3">Payment Type</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { value: "full" as const, label: "Pay in Full", desc: `Pay ₦${grandTotalWithTax.toLocaleString()} now` },
                      { value: "deposit" as const, label: "Pay 50% Deposit", desc: `Pay ₦${depositAmount.toLocaleString()} now, balance later` },
                    ].map((option) => (
                      <label key={option.value}
                        className={`glass rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                          form.payment_type === option.value ? "gold-border ring-1 ring-gold/20" : "hover:bg-white/5"
                        }`}
                      >
                        <input type="radio" name="payment_type" value={option.value} checked={form.payment_type === option.value} onChange={handleChange} className="hidden" />
                        <div className="flex items-start gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                            form.payment_type === option.value ? "border-gold" : "border-white/20"
                          }`}>
                            {form.payment_type === option.value && <div className="w-2 h-2 rounded-full bg-gold" />}
                          </div>
                          <div>
                            <span className="text-sm text-white font-medium">{option.label}</span>
                            <p className="text-xs text-muted mt-0.5">{option.desc}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="glass rounded-2xl p-6 sticky top-32"
              >
                <h3 className="text-sm font-bold text-white mb-4">Order Summary</h3>

                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-[10px] text-muted uppercase tracking-wider">Service</span>
                    <p className="text-white font-medium mt-0.5">{state.service.title}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted uppercase tracking-wider">Project Type</span>
                    <p className="text-white font-medium mt-0.5">{state.projectType.title}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted uppercase tracking-wider">Package</span>
                    <p className="text-white font-medium mt-0.5">{state.package.name}</p>
                  </div>
                </div>

                <div className="border-t border-white/10 my-4" />

                <div className="space-y-2 text-sm">
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
                </div>

                <div className="border-t border-white/10 my-4" />

                <div className="flex justify-between items-center">
                  <span className="text-white font-bold">Total Due Now</span>
                  <span className="text-gold text-xl font-bold">₦{displayTotal.toLocaleString()}</span>
                </div>

                {form.payment_type === "deposit" && (
                  <p className="text-xs text-muted mt-1">
                    Balance of ₦{(grandTotalWithTax - depositAmount).toLocaleString()} due at project midpoint.
                  </p>
                )}

                <div className="mt-6 space-y-3">
                  <button type="submit" disabled={submitting}
                    className="w-full px-6 py-3.5 rounded-xl bg-gold-gradient text-background font-bold text-sm hover:shadow-gold hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Processing..." : `Pay ₦${displayTotal.toLocaleString()}`}
                  </button>

                  <div className="flex items-center justify-center gap-2 text-xs text-muted">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    256-bit encrypted & secure
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5">
                  <p className="text-[10px] text-muted leading-relaxed">
                    By clicking <span className="text-white">Pay</span>, you agree to our{" "}
                    <Link href="/legal/terms" className="text-gold hover:underline">Terms of Service</Link> and{" "}
                    <Link href="/legal/privacy" className="text-gold hover:underline">Privacy Policy</Link>.
                    Your payment will be processed securely via {form.payment_gateway === "paystack" ? "Paystack" : "Flutterwave"}.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
