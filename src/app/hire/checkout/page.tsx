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
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push(`/auth/login?redirect=${encodeURIComponent("/hire/checkout")}`);
      return;
    }
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
  const depositAmount = Math.round(grandTotalNgn / 2);

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
    <section className="relative pt-32 pb-20 md:pt-40 overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="mb-10">
          <span className="section-label">STEP 6</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2">
            Complete Your <span className="text-gradient">Order</span>
          </h2>
          <p className="text-muted mt-2">Fill in your details to proceed with payment.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Project Info */}
              <div className="glass rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-4">Project Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-muted mb-1.5">Project Name *</label>
                    <input
                      type="text"
                      name="project_name"
                      value={form.project_name}
                      onChange={handleChange}
                      required
                      placeholder="e.g. ACME Corp Website"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-muted focus:outline-none focus:border-gold/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1.5">Preferred Start Date</label>
                    <input
                      type="date"
                      name="preferred_start_date"
                      value={form.preferred_start_date}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-gold/50 transition-colors"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-muted mb-1.5">Project Description</label>
                    <textarea
                      name="project_description"
                      value={form.project_description}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Describe your project requirements..."
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-muted focus:outline-none focus:border-gold/50 transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Billing */}
              <div className="glass rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-4">Client Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-muted mb-1.5">Full Name *</label>
                    <input
                      type="text"
                      name="full_name"
                      value={form.full_name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-muted focus:outline-none focus:border-gold/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1.5">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-muted focus:outline-none focus:border-gold/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1.5">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+234 800 000 0000"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-muted focus:outline-none focus:border-gold/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1.5">Company</label>
                    <input
                      type="text"
                      name="company"
                      value={form.company}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-muted focus:outline-none focus:border-gold/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1.5">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-muted focus:outline-none focus:border-gold/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1.5">City</label>
                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-muted focus:outline-none focus:border-gold/50 transition-colors"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-muted mb-1.5">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-muted focus:outline-none focus:border-gold/50 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="glass rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-4">Payment Method</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {["paystack", "flutterwave"].map((gateway) => (
                    <label
                      key={gateway}
                      className={`glass rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                        form.payment_gateway === gateway ? "gold-border ring-1 ring-gold/20" : "hover:bg-white/5"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment_gateway"
                        value={gateway}
                        checked={form.payment_gateway === gateway}
                        onChange={handleChange}
                        className="hidden"
                      />
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          form.payment_gateway === gateway ? "border-gold" : "border-white/20"
                        }`}>
                          {form.payment_gateway === gateway && (
                            <div className="w-2 h-2 rounded-full bg-gold" />
                          )}
                        </div>
                        <span className="text-sm text-white font-medium capitalize">{gateway}</span>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-bold text-white mb-3">Payment Type</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { value: "full" as const, label: "Pay in Full", desc: `Pay ₦${grandTotalNgn.toLocaleString()} now` },
                      { value: "deposit" as const, label: "Pay 50% Deposit", desc: `Pay ₦${depositAmount.toLocaleString()} now, balance later` },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`glass rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                          form.payment_type === option.value ? "gold-border ring-1 ring-gold/20" : "hover:bg-white/5"
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment_type"
                          value={option.value}
                          checked={form.payment_type === option.value}
                          onChange={handleChange}
                          className="hidden"
                        />
                        <div className="flex items-start gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                            form.payment_type === option.value ? "border-gold" : "border-white/20"
                          }`}>
                            {form.payment_type === option.value && (
                              <div className="w-2 h-2 rounded-full bg-gold" />
                            )}
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
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="glass rounded-2xl p-6 sticky top-32">
                <h3 className="text-sm font-bold text-white mb-4">Order Summary</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-xs text-muted">Service</span>
                    <p className="text-white font-medium">{state.service.title}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted">Project</span>
                    <p className="text-white font-medium">{state.projectType.title}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted">Package</span>
                    <p className="text-white font-medium">{state.package.name}</p>
                  </div>
                  <div className="border-t border-white/10 pt-3 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-muted">Package Price</span>
                      <span className="text-white">₦{packagePriceNgn.toLocaleString()}</span>
                    </div>
                    {state.addOns.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted">Add-ons ({state.addOns.length})</span>
                        <span className="text-white">₦{addOnsTotalNgn.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t border-white/10 pt-2 flex justify-between font-bold">
                      <span className="text-white">Total</span>
                      <span className="text-gold text-lg">₦{grandTotalNgn.toLocaleString()}</span>
                    </div>
                    {form.payment_type === "deposit" && (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted">Due Now (50%)</span>
                        <span className="text-gold">₦{depositAmount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-6 px-6 py-3.5 rounded-xl bg-gold-gradient text-background font-bold text-sm hover:shadow-gold hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Processing..." : `Pay ${form.payment_type === "deposit" ? `₦${depositAmount.toLocaleString()}` : `₦${grandTotalNgn.toLocaleString()}`}`}
                </button>

                <p className="text-xs text-muted text-center mt-3">
                  By proceeding, you agree to our Terms of Service
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
