"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const categories = [
  { value: "business-website", label: "Business Website" },
  { value: "e-commerce", label: "E-commerce Website" },
  { value: "saas", label: "SaaS Platform" },
  { value: "lms", label: "Educational / LMS Platform" },
  { value: "marketplace", label: "Marketplace Website" },
  { value: "portfolio", label: "Portfolio Website" },
  { value: "blog", label: "Blog / News Website" },
  { value: "mobile", label: "Mobile App System" },
  { value: "custom", label: "Custom Web Application" },
];

const subOptions: Record<string, { value: string; label: string }[]> = {
  "business-website": [
    { value: "corporate", label: "Corporate Website" },
    { value: "company-profile", label: "Company Profile Website" },
    { value: "startup", label: "Startup Website" },
    { value: "landing-page", label: "Landing Page Website" },
    { value: "personal-brand", label: "Personal Brand Website" },
  ],
  "e-commerce": [
    { value: "single-vendor", label: "Single Vendor Store" },
    { value: "multi-vendor", label: "Multi-vendor Marketplace" },
    { value: "dropshipping", label: "Dropshipping Store" },
    { value: "digital-products", label: "Digital Products Store" },
    { value: "product-showcase", label: "Product Showcase Website" },
  ],
  saas: [
    { value: "subscription-saas", label: "Subscription SaaS" },
    { value: "ai-saas", label: "AI SaaS Tool" },
    { value: "crm", label: "CRM System" },
    { value: "dashboard", label: "Dashboard Platform" },
    { value: "automation", label: "Automation Tool" },
  ],
  lms: [
    { value: "online-course", label: "Online Course Platform" },
    { value: "coaching", label: "Coaching Website" },
    { value: "school-management", label: "School Management System" },
    { value: "elearning", label: "E-learning Academy" },
    { value: "membership-learning", label: "Membership Learning Platform" },
  ],
  marketplace: [
    { value: "service-marketplace", label: "Service Marketplace" },
    { value: "job-marketplace", label: "Job Marketplace" },
    { value: "rental-marketplace", label: "Rental Marketplace" },
    { value: "product-marketplace", label: "Product Marketplace" },
    { value: "freelance", label: "Freelance Platform" },
  ],
  portfolio: [
    { value: "dev-portfolio", label: "Developer Portfolio" },
    { value: "designer-portfolio", label: "Designer Portfolio" },
    { value: "freelancer-portfolio", label: "Freelancer Portfolio" },
    { value: "personal-cv", label: "Personal CV Website" },
  ],
  blog: [
    { value: "personal-blog", label: "Personal Blog" },
    { value: "tech-blog", label: "Tech Blog" },
    { value: "news-platform", label: "News Platform" },
    { value: "magazine", label: "Magazine Website" },
  ],
  mobile: [
    { value: "app-backend", label: "App Backend System" },
    { value: "api-dev", label: "API Development" },
    { value: "mobile-backend", label: "Mobile Backend Integration" },
    { value: "full-app", label: "Full App + Web Admin Panel" },
  ],
  custom: [
    { value: "ai-app", label: "AI Application" },
    { value: "fintech", label: "Fintech System" },
    { value: "admin-dashboard", label: "Admin Dashboard System" },
    { value: "custom-automation", label: "Custom Automation Tool" },
    { value: "enterprise", label: "Enterprise Solution" },
  ],
};

const subServiceLabel: Record<string, string> = {
  corporate: "Corporate Website",
  "company-profile": "Company Profile Website",
  startup: "Startup Website",
  "landing-page": "Landing Page Website",
  "personal-brand": "Personal Brand Website",
  "single-vendor": "Single Vendor Store",
  "multi-vendor": "Multi-vendor Marketplace",
  dropshipping: "Dropshipping Store",
  "digital-products": "Digital Products Store",
  "product-showcase": "Product Showcase Website",
  "subscription-saas": "Subscription SaaS",
  "ai-saas": "AI SaaS Tool",
  crm: "CRM System",
  dashboard: "Dashboard Platform",
  automation: "Automation Tool",
  "online-course": "Online Course Platform",
  coaching: "Coaching Website",
  "school-management": "School Management System",
  elearning: "E-learning Academy",
  "membership-learning": "Membership Learning Platform",
  "service-marketplace": "Service Marketplace",
  "job-marketplace": "Job Marketplace",
  "rental-marketplace": "Rental Marketplace",
  "product-marketplace": "Product Marketplace",
  freelance: "Freelance Platform",
  "dev-portfolio": "Developer Portfolio",
  "designer-portfolio": "Designer Portfolio",
  "freelancer-portfolio": "Freelancer Portfolio",
  "personal-cv": "Personal CV Website",
  "personal-blog": "Personal Blog",
  "tech-blog": "Tech Blog",
  "news-platform": "News Platform",
  magazine: "Magazine Website",
  "app-backend": "App Backend System",
  "api-dev": "API Development",
  "mobile-backend": "Mobile Backend Integration",
  "full-app": "Full App + Web Admin Panel",
  "ai-app": "AI Application",
  fintech: "Fintech System",
  "admin-dashboard": "Admin Dashboard System",
  "custom-automation": "Custom Automation Tool",
  enterprise: "Enterprise Solution",
};

const categoryLabel: Record<string, string> = {
  "business-website": "Business Website",
  "e-commerce": "E-commerce Website",
  saas: "SaaS Platform",
  lms: "Educational / LMS Platform",
  marketplace: "Marketplace Website",
  portfolio: "Portfolio Website",
  blog: "Blog / News Website",
  mobile: "Mobile App System",
  custom: "Custom Web Application",
};

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
      const res = await fetch("/api/request-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to send");
      setSubmitted(true);
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
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 min-h-screen overflow-hidden">
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
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 overflow-hidden">
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-20"
          style={{ background: "radial-gradient(circle at 50% 50%, rgba(212,175,55,0.08) 0%, transparent 50%)" }}
        />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
          className="mb-10"
        >
          <Link
            href="/hire"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-gold transition-colors duration-300 mb-6"
          >
            ← Back to Services
          </Link>
          <h1 className="section-heading">
            Request a
            <br />
            <span className="text-gradient">Custom Quote</span>
          </h1>
          <p className="section-subtitle mt-4">
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
