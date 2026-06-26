"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const services = [
  { value: "e-commerce", label: "E-Commerce Website" },
  { value: "lms", label: "LMS / Education Platform" },
  { value: "business-website", label: "Business Website" },
  { value: "entertainment", label: "Entertainment Platform" },
  { value: "saas", label: "SaaS Platform" },
  { value: "mvp", label: "Startup MVP Build" },
];

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
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    budget: "",
    project: "",
    timeline: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
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
                📧 Confirmation sent to <span className="text-white">{form.email}</span>
              </p>
              <p className="text-sm text-muted">
                🎯 Service: <span className="text-white">{services.find((s) => s.value === form.service)?.label || "Custom"}</span>
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
              placeholder="+234 800 000 0000"
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
              <option value="" disabled className="bg-surface">Select a service</option>
              {services.map((s) => (
                <option key={s.value} value={s.value} className="bg-surface">{s.label}</option>
              ))}
            </select>
          </motion.div>

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

          <motion.div variants={fadeUp} className="pt-4">
            <button
              type="submit"
              className="w-full px-8 py-4 rounded-xl bg-gold-gradient text-background font-bold text-base hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
            >
              Submit Quote Request
            </button>
          </motion.div>
        </motion.form>
      </div>
    </section>
  );
}
