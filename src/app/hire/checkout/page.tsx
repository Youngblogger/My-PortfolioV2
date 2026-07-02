"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { useBooking } from "@/contexts/BookingContext";

export default function CheckoutPage() {
  const router = useRouter();
  const { state, setBilling, setProjectName, setProjectDescription, setPreferredStartDate, setPaymentGateway, setPaymentType } = useBooking();
  const [user, setUser] = useState<{ id: string; email: string; full_name: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showClientDetails, setShowClientDetails] = useState(false);
  const [showAllAddOns, setShowAllAddOns] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
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
        project_name: state.projectName || state.projectType?.title || "",
        project_description: state.projectDescription || "",
        preferred_start_date: state.preferredStartDate || "",
        payment_gateway: state.paymentGateway || "paystack",
        payment_type: state.paymentType || "full",
      }));
      setLoading(false);
    }).catch(() => {
      router.push(`/auth/login?redirect=${encodeURIComponent("/hire/checkout")}`);
    });
  }, [router]);

  if (!state.service || !state.projectType || !state.package) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-[0_10px_35px_rgba(16,24,40,0.06)] border border-[#ECEFF5] rounded-2xl p-8 text-center">
          <p className="text-[#98A2B3] mb-4">No project selected. Please start from the beginning.</p>
          <Link href="/hire" className="text-[#5B4CF0] hover:underline">Choose a Service</Link>
        </div>
      </div>
    );
  }

  const addOnsTotalNgn = state.addOns.reduce((sum, a) => sum + a.price_ngn, 0);
  const packagePriceNgn = state.package.price_ngn;
  const grandTotalNgn = packagePriceNgn + addOnsTotalNgn;
  const depositAmount = Math.round(grandTotalNgn / 2);
  const displayTotal = form.payment_type === "deposit" ? depositAmount : grandTotalNgn;
  const balanceAmount = grandTotalNgn - depositAmount;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting.current) return;
    if (!user) return;

    setValidationErrors({});

    const missingFields: string[] = [];
    if (!form.full_name.trim()) missingFields.push("full_name");
    if (!form.email.trim()) missingFields.push("email");
    if (!form.project_name.trim()) missingFields.push("project_name");

    if (missingFields.length > 0) {
      const errors: Record<string, string[]> = {};
      for (const field of missingFields) {
        errors[field] = ["This field is required."];
      }
      setValidationErrors(errors);
      return;
    }

    if (!state.service || !state.projectType || !state.package) {
      alert("Missing project selections. Please start over.");
      return;
    }

    isSubmitting.current = true;
    setSubmitting(true);

    const billing = {
      full_name: form.full_name.trim(),
      email: form.email.trim(),
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

    const payload = {
      service_id: state.service.id,
      project_type_id: state.projectType.id,
      package_id: state.package.id,
      add_on_ids: state.addOns.length > 0 ? state.addOns.map((a) => a.id) : undefined,
      payment_gateway: form.payment_gateway,
      payment_type: form.payment_type,
      project_name: form.project_name.trim(),
      project_description: form.project_description || undefined,
      preferred_start_date: form.preferred_start_date || undefined,
      billing,
    };

    console.log("[Checkout] Submitting order payload:", JSON.stringify(payload, null, 2));

    try {
      const res = await api.placeServiceOrder(payload);

      if (res.data.authorization_url) {
        window.location.href = res.data.authorization_url;
      } else {
        router.push(`/hire/order/${res.data.order_id}/success?reference=${res.data.reference}`);
      }
    } catch (err: unknown) {
      if (err instanceof ApiError && err.data && typeof err.data === "object" && "errors" in err.data) {
        setValidationErrors((err.data as Record<string, unknown>).errors as Record<string, string[]>);
      }
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
        <div className="bg-white rounded-2xl shadow-[0_10px_35px_rgba(16,24,40,0.06)] border border-[#ECEFF5] rounded-2xl p-8 animate-pulse space-y-4">
          <div className="h-8 w-48 bg-[#F7F9FC] rounded" />
          <div className="h-4 w-96 bg-[#F7F9FC] rounded" />
        </div>
      </div>
    );
  }

  return (
    <section className="relative pt-0 pb-16 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-white" />
        <motion.div
          className="absolute top-1/4 right-0 w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(91,76,240,0.06) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-0"
        >
          <Link
            href="/hire/review"
            className="inline-flex items-center gap-2 text-sm text-[#98A2B3] hover:text-[#101828] transition-colors mb-0 mt-2"
          >
            ← Back to Review
          </Link>
          <span className="section-label">FINAL STEP</span>
          <h1 className="section-heading mt-0">
            Secure <span className="text-[#5B4CF0]">Checkout</span>
          </h1>
          <p className="section-subtitle mt-0">
            Complete your order with confidence — encrypted and secure.
          </p>
        </motion.div>

        {Object.keys(validationErrors).length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-red-400 text-sm font-medium">Please fix the following errors:</p>
            <ul className="mt-2 space-y-1">
              {Object.entries(validationErrors).map(([field, msgs]) => (
                <li key={field} className="text-red-400/80 text-xs">
                  {field}: {msgs.join(", ")}
                </li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-5 gap-8">
            {/* LEFT - Order Information */}
            <div className="lg:col-span-3 space-y-6">
              {/* Order Review */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-2xl shadow-[0_10px_35px_rgba(16,24,40,0.06)] border border-[#ECEFF5] rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-[#5B4CF0]/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#5B4CF0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-[#101828]">Order Review</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between py-2 border-b border-[#ECEFF5]">
                    <span className="text-[#98A2B3]">Service</span>
                    <span className="text-[#101828] font-medium">{state.service.title}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-[#ECEFF5]">
                    <span className="text-[#98A2B3]">Package</span>
                    <span className="text-[#101828] font-medium">{state.package.name}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-[#ECEFF5]">
                    <span className="text-[#98A2B3]">Delivery</span>
                    <span className="text-[#101828] font-medium">To be agreed</span>
                  </div>
                  {state.addOns.length > 0 && (
                    <div className="py-2 border-b border-[#ECEFF5]">
                      <div className="flex items-start justify-between">
                        <span className="text-[#98A2B3] shrink-0 mt-1">Add-ons</span>
                        <div className="flex flex-wrap gap-1.5 justify-end">
                          {(showAllAddOns ? state.addOns : state.addOns.slice(0, 3)).map((a) => (
                            <span key={a.id} className="text-[#101828] font-medium text-sm border border-[#ECEFF5] rounded-md px-2 py-0.5">
                              {a.name}
                            </span>
                          ))}
                          {!showAllAddOns && state.addOns.length > 3 && (
                            <span className="text-[#98A2B3] text-sm border border-[#ECEFF5] rounded-md px-2 py-0.5">
                              +{state.addOns.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                      {state.addOns.length > 3 && (
                        <div className="flex justify-end mt-1">
                          <button
                            type="button"
                            onClick={() => setShowAllAddOns(!showAllAddOns)}
                            className="flex items-center gap-1 text-[10px] text-[#5B4CF0] hover:text-[#5B4CF0]/80 transition-colors"
                          >
                            {showAllAddOns ? "Show Less" : "View More"}
                            <svg className={`w-3 h-3 transition-transform duration-200 ${showAllAddOns ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex items-center justify-between py-2">
                    <span className="text-[#98A2B3]">Total</span>
                    <span className="text-base font-bold text-[#101828]">₦{grandTotalNgn.toLocaleString()}</span>
                  </div>
                </div>
              </motion.div>

              {/* Project Name */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.13 }}
                className="bg-white rounded-2xl shadow-[0_10px_35px_rgba(16,24,40,0.06)] border border-[#ECEFF5] rounded-2xl p-6"
              >
                <label className="block text-xs text-[#98A2B3] mb-2">Project Name</label>
                <input
                  type="text"
                  name="project_name"
                  value={form.project_name}
                  onChange={handleChange}
                  placeholder="e.g. Company Website Redesign"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#ECEFF5] text-[#101828] text-sm placeholder:text-[#98A2B3]/50 focus:outline-none focus:border-[#5B4CF0]/50 focus:ring-1 focus:ring-[#5B4CF0]/20 transition-all duration-300"
                />
                {validationErrors.project_name && (
                  <p className="text-red-400 text-xs mt-1">{validationErrors.project_name[0]}</p>
                )}
              </motion.div>

              {/* Client Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="bg-white rounded-2xl shadow-[0_10px_35px_rgba(16,24,40,0.06)] border border-[#ECEFF5] rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-[#5B4CF0]/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#5B4CF0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-[#101828]">Client Information</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-[10px] text-[#98A2B3] uppercase tracking-wider">Full Name *</span>
                    <input type="text" name="full_name" value={form.full_name} onChange={handleChange}
                      placeholder="Your full name"
                      className="w-full mt-0.5 px-3 py-2 rounded-lg bg-white border border-[#ECEFF5] text-[#101828] text-sm placeholder:text-[#98A2B3]/50 focus:outline-none focus:border-[#5B4CF0]/50 focus:ring-1 focus:ring-[#5B4CF0]/20 transition-all duration-300" />
                    {validationErrors["billing.full_name"] && (
                      <p className="text-red-400 text-xs mt-0.5">{validationErrors["billing.full_name"][0]}</p>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] text-[#98A2B3] uppercase tracking-wider">Email *</span>
                    <input type="email" name="email" value={form.email} onChange={handleChange}
                      placeholder="your@email.com"
                      className="w-full mt-0.5 px-3 py-2 rounded-lg bg-white border border-[#ECEFF5] text-[#101828] text-sm placeholder:text-[#98A2B3]/50 focus:outline-none focus:border-[#5B4CF0]/50 focus:ring-1 focus:ring-[#5B4CF0]/20 transition-all duration-300" />
                    {validationErrors["billing.email"] && (
                      <p className="text-red-400 text-xs mt-0.5">{validationErrors["billing.email"][0]}</p>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] text-[#98A2B3] uppercase tracking-wider">Phone</span>
                    <input type="text" name="phone" value={form.phone} onChange={handleChange}
                      placeholder="+234 800 000 0000"
                      className="w-full mt-0.5 px-3 py-2 rounded-lg bg-white border border-[#ECEFF5] text-[#101828] text-sm placeholder:text-[#98A2B3]/50 focus:outline-none focus:border-[#5B4CF0]/50 focus:ring-1 focus:ring-[#5B4CF0]/20 transition-all duration-300" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#98A2B3] uppercase tracking-wider">Company</span>
                    <input type="text" name="company" value={form.company} onChange={handleChange}
                      placeholder="Company name (optional)"
                      className="w-full mt-0.5 px-3 py-2 rounded-lg bg-white border border-[#ECEFF5] text-[#101828] text-sm placeholder:text-[#98A2B3]/50 focus:outline-none focus:border-[#5B4CF0]/50 focus:ring-1 focus:ring-[#5B4CF0]/20 transition-all duration-300" />
                  </div>
                </div>

                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => setShowClientDetails(!showClientDetails)}
                    className="text-xs text-[#5B4CF0] hover:text-[#5B4CF0]/80 transition-colors"
                  >
                    {showClientDetails ? "− Less" : "+ More"} details
                  </button>
                </div>

                {showClientDetails && (
                  <div className="mt-3 pt-3 border-t border-[#ECEFF5] grid md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-[10px] text-[#98A2B3] uppercase tracking-wider">Country</span>
                      <input type="text" name="country" value={form.country} onChange={handleChange}
                        placeholder="Your country"
                        className="w-full mt-0.5 px-3 py-2 rounded-lg bg-white border border-[#ECEFF5] text-[#101828] text-sm placeholder:text-[#98A2B3]/50 focus:outline-none focus:border-[#5B4CF0]/50 focus:ring-1 focus:ring-[#5B4CF0]/20 transition-all duration-300" />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#98A2B3] uppercase tracking-wider">City</span>
                      <input type="text" name="city" value={form.city} onChange={handleChange}
                        placeholder="Your city"
                        className="w-full mt-0.5 px-3 py-2 rounded-lg bg-white border border-[#ECEFF5] text-[#101828] text-sm placeholder:text-[#98A2B3]/50 focus:outline-none focus:border-[#5B4CF0]/50 focus:ring-1 focus:ring-[#5B4CF0]/20 transition-all duration-300" />
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-[10px] text-[#98A2B3] uppercase tracking-wider">Address</span>
                      <input type="text" name="address" value={form.address} onChange={handleChange}
                        placeholder="Your address"
                        className="w-full mt-0.5 px-3 py-2 rounded-lg bg-white border border-[#ECEFF5] text-[#101828] text-sm placeholder:text-[#98A2B3]/50 focus:outline-none focus:border-[#5B4CF0]/50 focus:ring-1 focus:ring-[#5B4CF0]/20 transition-all duration-300" />
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* RIGHT - Payment */}
            <div className="lg:col-span-2 space-y-6">
              {/* Preferred Start Date - only if not already set */}
              {!form.preferred_start_date && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.18 }}
                  className="bg-white rounded-2xl shadow-[0_10px_35px_rgba(16,24,40,0.06)] border border-[#ECEFF5] rounded-2xl p-5"
                >
                  <label className="block text-xs text-[#98A2B3] mb-2">Preferred Start Date</label>
                  <input type="date" name="preferred_start_date" value={form.preferred_start_date} onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#ECEFF5] text-[#101828] text-sm focus:outline-none focus:border-[#5B4CF0]/50 focus:ring-1 focus:ring-[#5B4CF0]/20 transition-all duration-300" />
                </motion.div>
              )}

              {/* Payment & Total Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-2xl shadow-[0_10px_35px_rgba(16,24,40,0.06)] border border-[#ECEFF5] rounded-2xl p-6 sticky top-32"
              >
                {/* Payment Type */}
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-[#101828] mb-3">Payment Type</h4>
                  <div className="grid gap-3">
                    {[
                      { value: "full" as const, label: "Pay in Full", desc: `Pay ₦${grandTotalNgn.toLocaleString()} now, nothing later` },
                      { value: "deposit" as const, label: "Pay 50% Deposit", desc: `Pay ₦${depositAmount.toLocaleString()} now, balance later` },
                    ].map((option) => (
                      <label key={option.value}
                        className={`flex items-start gap-3 rounded-xl p-3.5 cursor-pointer transition-all duration-200 ${
                          form.payment_type === option.value ? "bg-[#5B4CF0]/10 ring-1 ring-[#5B4CF0]/30" : "bg-[#F7F9FC] hover:bg-[#F7F9FC]"
                        }`}
                      >
                        <input type="radio" name="payment_type" value={option.value} checked={form.payment_type === option.value} onChange={handleChange} className="hidden" />
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                          form.payment_type === option.value ? "border-[#5B4CF0]" : "border-[#ECEFF5]"
                        }`}>
                          {form.payment_type === option.value && <div className="w-2 h-2 rounded-full bg-[#5B4CF0]" />}
                        </div>
                        <div>
                          <span className="text-sm text-[#101828] font-medium">{option.label}</span>
                          <p className="text-xs text-[#98A2B3] mt-0.5">{option.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-[#101828] mb-3">Payment Method</h4>
                  <div className="grid gap-3">
                    {[
                      { value: "paystack", label: "Paystack", badge: "NGN", icon: (
                        <svg className="w-7 h-7" viewBox="0 0 32 22" fill="none">
                          <rect x="0.5" y="0.5" width="31" height="21" rx="3" className="fill-[#101828]/10 stroke-[#101828]/20" />
                          <rect x="3" y="4" width="12" height="2" rx="1" className="fill-[#101828]/30" />
                          <rect x="3" y="8" width="8" height="2" rx="1" className="fill-[#101828]/20" />
                          <rect x="3" y="12" width="10" height="2" rx="1" className="fill-[#101828]/20" />
                          <circle cx="22" cy="13" r="4" className="fill-[#5B4CF0]/30" />
                          <circle cx="25" cy="13" r="4" className="fill-[#5B4CF0]/20" />
                        </svg>
                      )},
                      { value: "flutterwave", label: "Flutterwave", badge: "NGN/USD", icon: (
                        <svg className="w-7 h-7" viewBox="0 0 32 22" fill="none">
                          <rect x="0.5" y="0.5" width="31" height="21" rx="3" className="fill-[#101828]/10 stroke-[#101828]/20" />
                          <circle cx="10" cy="11" r="5" className="fill-[#5B4CF0]/20" />
                          <path d="M17 7l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#101828]/40" />
                          <path d="M23 7l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#101828]/40" />
                        </svg>
                      )}
                    ].map((gateway) => (
                      <label key={gateway.value}
                        className={`flex items-center gap-3 rounded-xl p-3 cursor-pointer transition-all duration-200 ${
                          form.payment_gateway === gateway.value ? "bg-[#5B4CF0]/10 ring-1 ring-[#5B4CF0]/30" : "bg-[#F7F9FC] hover:bg-[#F7F9FC]"
                        }`}
                      >
                        <input type="radio" name="payment_gateway" value={gateway.value} checked={form.payment_gateway === gateway.value} onChange={handleChange} className="hidden" />
                        <div className="w-10 h-7 flex items-center justify-center shrink-0">
                          {gateway.icon}
                        </div>
                        <div className="flex-1">
                          <span className="text-sm text-[#101828] font-medium">{gateway.label}</span>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          form.payment_gateway === gateway.value ? "border-[#5B4CF0]" : "border-[#ECEFF5]"
                        }`}>
                          {form.payment_gateway === gateway.value && <div className="w-2 h-2 rounded-full bg-[#5B4CF0]" />}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[#ECEFF5] my-4" />

                {/* Price Breakdown */}
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-[#98A2B3]">Package</span>
                    <span className="text-[#101828]">₦{packagePriceNgn.toLocaleString()}</span>
                  </div>
                  {state.addOns.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[#98A2B3]">Add-ons ({state.addOns.length})</span>
                      <span className="text-[#101828]">₦{addOnsTotalNgn.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-[#ECEFF5]">
                    <span className="text-[#101828] font-bold">Total Due Now</span>
                    <span className="text-[#5B4CF0] text-lg font-bold">₦{displayTotal.toLocaleString()}</span>
                  </div>
                  {form.payment_type === "deposit" && (
                    <div className="flex justify-between text-xs text-[#98A2B3]">
                      <span>Balance later</span>
                      <span>₦{balanceAmount.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Pay Button */}
                <button type="submit" disabled={submitting}
                  className="w-full px-6 py-3.5 rounded-xl bg-[#5B4CF0] text-white font-bold text-sm hover:shadow-[0_4px_14px_rgba(91,76,240,0.3)] hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Processing..." : "Complete Secure Payment"}
                </button>

                {/* Secure Badge */}
                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-[#98A2B3]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  256-bit encrypted & secure
                </div>

                {/* Terms */}
                <p className="mt-4 pt-4 border-t border-[#ECEFF5] text-[10px] text-[#98A2B3] leading-relaxed text-center">
                  By clicking <span className="text-[#101828]">Complete Secure Payment</span>, you agree to our{" "}
                  <Link href="/legal/terms" className="text-[#5B4CF0] hover:underline">Terms of Service</Link> and{" "}
                  <Link href="/legal/privacy" className="text-[#5B4CF0] hover:underline">Privacy Policy</Link>.
                  Your payment will be processed securely via {form.payment_gateway === "paystack" ? "Paystack" : "Flutterwave"}.
                </p>
              </motion.div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
