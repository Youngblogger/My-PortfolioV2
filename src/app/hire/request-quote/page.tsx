"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { api, type QuoteData } from "@/lib/api";

const serviceStructure: Record<string, { label: string; options: string[] }> = {
  "business-website": { label: "Business Website", options: ["Corporate Website", "Company Profile Website", "Startup Website", "Landing Page Website", "Personal Brand Website"] },
  "ecommerce-store": { label: "E-commerce Store", options: ["Single Vendor Store", "Multi-vendor Marketplace", "Dropshipping Store", "Digital Products Store", "Product Catalog Website"] },
  "saas-platform": { label: "SaaS Platform", options: ["Subscription SaaS", "AI SaaS Tool", "CRM System", "Admin Dashboard System", "Automation Tool"] },
  "educational-website": { label: "Educational Website", options: ["Online Learning Platform (LMS)", "School Website", "Coaching / Mentorship Platform", "Course Marketplace", "Exam / Quiz Platform", "Membership Learning System"] },
  "marketplace-platform": { label: "Marketplace Platform", options: ["Service Marketplace", "Freelance Marketplace", "Job Marketplace", "Rental Marketplace", "Product Marketplace"] },
  "portfolio-website": { label: "Portfolio Website", options: ["Developer Portfolio", "Designer Portfolio", "Freelancer Portfolio", "Personal CV Website"] },
  "blog-news": { label: "Blog / News Website", options: ["Personal Blog", "Tech Blog", "News Platform", "Online Magazine", "Content Publishing Platform"] },
  "mobile-app-system": { label: "Mobile App System", options: ["App Backend System", "API Development", "Mobile Backend Integration", "Full App + Web Admin Panel"] },
  "custom-web-app": { label: "Custom Web Application", options: ["AI Application", "Fintech System", "Admin Dashboard System", "Custom Automation Tool", "Enterprise Solution"] },
  "booking-system": { label: "Booking System", options: ["Appointment Booking System", "Hotel Booking System", "Restaurant Reservation System", "Event Booking Platform"] },
  "social-platform": { label: "Social Platform", options: ["Community Platform", "Social Network Website", "Forum Platform", "Messaging Platform"] },
  "real-estate": { label: "Real Estate Website", options: ["Property Listing Website", "Rental Marketplace", "Real Estate Agency Website"] },
  "restaurant-food": { label: "Restaurant / Food Website", options: ["Restaurant Website", "Online Food Ordering System", "Menu Showcase Website"] },
  "nonprofit-ngo": { label: "NGO / Non-Profit Website", options: ["Charity Website", "Church Website", "Donation Platform", "Community Outreach Website"] },
  "landing-page": { label: "Landing Page", options: ["Product Landing Page", "Marketing Funnel Page", "Event Landing Page", "Sales Page"] },
  "erp-system": { label: "ERP / Business System", options: ["Business Management System", "Inventory System", "HR Management System", "Finance Management System"] },
  "ai-system": { label: "AI System", options: ["AI Chatbot System", "AI Content Generator", "AI Automation System", "AI SaaS Product"] },
  "gaming-entertainment": { label: "Entertainment Website", options: ["Streaming Platform", "Video Platform", "Music Platform", "Gaming Platform"] },
};

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const categories = Object.entries(serviceStructure).map(([value, cat]) => ({ value, label: cat.label }));

const subOptions: Record<string, { value: string; label: string }[]> = {};
const subServiceLabel: Record<string, string> = {};
const categoryLabel: Record<string, string> = {};

for (const [catValue, cat] of Object.entries(serviceStructure)) {
  categoryLabel[catValue] = cat.label;
  subOptions[catValue] = cat.options.map((opt) => {
    const val = slugify(opt);
    subServiceLabel[val] = opt;
    return { value: val, label: opt };
  });
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function RequestQuotePage() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    subService: "",
    budget: "",
    project: "",
    timeline: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "service") {
      setForm((prev) => ({ ...prev, service: value, subService: "" }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      const quoteData: QuoteData = {
        full_name: form.name,
        email: form.email,
        phone: form.phone,
        project_type: form.subService || form.service,
        budget_range: form.budget,
        timeline: form.timeline,
        description: form.project,
      };
      await api.sendQuoteRequest(quoteData);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Something went wrong. Please try again or email us directly at admin@codemafia.ng.");
    } finally {
      setSending(false);
    }
  };

  const inputClasses = "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-muted text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all duration-300";
  const labelClasses = "block text-sm font-medium text-white/80 mb-2";

  if (submitted) {
    return (
      <section className="relative pt-20 pb-16 md:pt-24 md:pb-20 min-h-screen overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 opacity-20"
            style={{ background: "radial-gradient(circle at 50% 50%, rgba(212,175,55,0.08) 0%, transparent 50%)" }}
          />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
          >
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="section-heading">
              Thank You,
              <br />
              <span className="text-gradient">{form.name}!</span>
            </h1>
            <p className="section-subtitle mt-4 mx-auto">
              Your quote request has been received. We&apos;ll review your project requirements and reach out within 24 hours with a custom proposal.
            </p>
            <div className="mt-10 space-y-3">
              <p className="text-sm text-muted">
                📧 Confirmation sent to <span className="text-white">admin@codemafia.ng</span>
              </p>
              <p className="text-sm text-muted">
                🎯 Service: <span className="text-white">{categoryLabel[form.service] || form.service}{form.subService ? ` — ${subServiceLabel[form.subService] || form.subService}` : ""}</span>
              </p>
            </div>
            <Link
              href="/hire"
              className="inline-block mt-10 px-8 py-4 rounded-xl bg-gold-gradient text-background font-bold text-base hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
            >
              Back to Services
            </Link>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative pt-0 pb-16 overflow-hidden">
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-20"
          style={{ background: "radial-gradient(circle at 50% 50%, rgba(212,175,55,0.08) 0%, transparent 50%)" }}
        />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
          className="mb-0"
        >
          <Link
            href="/hire"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-gold transition-colors duration-300 mb-0 mt-2"
          >
            ← Back to Services
          </Link>
          <h1 className="section-heading">
            Request a
            <br />
            <span className="text-gradient">Custom Quote</span>
          </h1>
          <p className="section-subtitle mt-0">
            Tell us about your project and we&apos;ll put together a tailored proposal for you.
          </p>
        </motion.div>

        <motion.form
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          onSubmit={handleSubmit}
          className="glass rounded-2xl p-8 md:p-10 space-y-6"
        >
          <motion.div variants={fadeUp}>
            <label htmlFor="name" className={labelClasses}>Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={inputClasses}
            />
          </motion.div>

          <motion.div variants={fadeUp}>
            <label htmlFor="email" className={labelClasses}>Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={inputClasses}
            />
          </motion.div>

          <motion.div variants={fadeUp}>
            <label htmlFor="phone" className={labelClasses}>Phone Number</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              value={form.phone}
              onChange={handleChange}
              placeholder="+234 813 371 2756"
              className={inputClasses}
            />
          </motion.div>

          <motion.div variants={fadeUp}>
            <label htmlFor="service" className={labelClasses}>Service Interested In</label>
            <select
              id="service"
              name="service"
              required
              value={form.service}
              onChange={handleChange}
              className={inputClasses}
            >
              <option value="" disabled className="bg-surface">Select a service category</option>
              <option value="not-sure" className="bg-surface">⭐ Not sure — recommend for me</option>
              {categories.map((s) => (
                <option key={s.value} value={s.value} className="bg-surface">{s.label}</option>
              ))}
            </select>
          </motion.div>

          <AnimatePresence mode="wait">
            {form.service && form.service !== "not-sure" && subOptions[form.service] && (
              <motion.div
                key={form.service}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <label htmlFor="subService" className={labelClasses}>Project Type</label>
                <select
                  id="subService"
                  name="subService"
                  required
                  value={form.subService}
                  onChange={handleChange}
                  className={inputClasses}
                >
                  <option value="" disabled className="bg-surface">Select project type</option>
                  {subOptions[form.service].map((s) => (
                    <option key={s.value} value={s.value} className="bg-surface">{s.label}</option>
                  ))}
                </select>
              </motion.div>
            )}
            {form.service === "not-sure" && (
              <motion.div
                key="not-sure"
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="glass rounded-xl p-5 border border-gold/20 bg-gold/[0.03]"
              >
                <p className="text-sm text-gold font-medium mb-1">No worries — we&apos;ve got you covered!</p>
                <p className="text-xs text-muted">Tell us about your idea in the project details below, and we&apos;ll recommend the best solution for you.</p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div variants={fadeUp}>
            <label htmlFor="budget" className={labelClasses}>Budget Range</label>
            <select
              id="budget"
              name="budget"
              required
              value={form.budget}
              onChange={handleChange}
              className={inputClasses}
            >
              <option value="" disabled className="bg-surface">Select your budget range</option>
              <option value="250-500k" className="bg-surface">₦250,000 – ₦500,000</option>
              <option value="500k-1m" className="bg-surface">₦500,000 – ₦1,000,000</option>
              <option value="1m-3m" className="bg-surface">₦1,000,000 – ₦3,000,000</option>
              <option value="3m+" className="bg-surface">₦3,000,000+</option>
              <option value="unsure" className="bg-surface">Not sure yet</option>
            </select>
          </motion.div>

          <motion.div variants={fadeUp}>
            <label htmlFor="project" className={labelClasses}>Tell us about your project</label>
            <textarea
              id="project"
              name="project"
              rows={6}
              required
              value={form.project}
              onChange={handleChange}
              placeholder="Describe your project, goals, target audience, and any specific features you need..."
              className={`${inputClasses} resize-none`}
            />
          </motion.div>

          <motion.div variants={fadeUp}>
            <label htmlFor="timeline" className={labelClasses}>Timeline</label>
            <select
              id="timeline"
              name="timeline"
              required
              value={form.timeline}
              onChange={handleChange}
              className={inputClasses}
            >
              <option value="" disabled className="bg-surface">Select your timeline</option>
              <option value="asap" className="bg-surface">ASAP</option>
              <option value="1-2" className="bg-surface">1-2 months</option>
              <option value="3-6" className="bg-surface">3-6 months</option>
              <option value="exploring" className="bg-surface">Just exploring</option>
            </select>
          </motion.div>

          {error && (
            <motion.div variants={fadeUp} className="text-red-400 text-sm text-center">
              {error}
            </motion.div>
          )}
          <motion.div variants={fadeUp} className="pt-4">
            <button
              type="submit"
              disabled={sending}
              className="w-full px-8 py-4 rounded-xl bg-gold-gradient text-background font-bold text-base hover:shadow-gold hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? "Submitting..." : "Submit Quote Request"}
            </button>
          </motion.div>
        </motion.form>
      </div>
    </section>
  );
}
