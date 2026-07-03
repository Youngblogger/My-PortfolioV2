"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function StartProjectPage() {
  const [step, setStep] = useState<"form" | "success">("form");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    company: "",
    project_type: "",
    description: "",
    timeline: "",
    budget_range: "",
    referral: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      await api.sendQuoteRequest({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        company: form.company || undefined,
        project_type: form.project_type,
        budget_range: form.budget_range,
        timeline: form.timeline,
        description: form.description,
      });
      setStep("success");
    } catch {
      setError("Something went wrong. Please try again or email us directly at admin@codemafia.ng.");
    } finally {
      setSending(false);
    }
  };

  const inputClasses = "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-muted text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all duration-300";
  const labelClasses = "block text-sm font-medium text-white/80 mb-2";
  const selectClasses = `${inputClasses} appearance-none`;

  if (step === "success") {
    return (
      <section className="relative pt-20 pb-16 md:pt-24 md:pb-20 min-h-screen overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-20"
            style={{ background: "radial-gradient(circle at 50% 50%, rgba(212,175,55,0.08) 0%, transparent 50%)" }}
          />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
          >
            <div className="text-6xl mb-6">🚀</div>
            <h1 className="section-heading">
              Inquiry
              <br />
              <span className="text-gradient">Sent!</span>
            </h1>
            <p className="section-subtitle mt-4 mx-auto">
              Thank you, {form.full_name}. We&apos;ll review your project and get back to you within 24 hours with a clear next step.
            </p>
            <p className="text-muted text-sm mt-4">
              All project discussions are confidential.
            </p>
            <a
              href="/"
              className="inline-block mt-10 px-8 py-4 rounded-xl bg-gold-gradient text-background font-bold text-base hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
            >
              Back to Home
            </a>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="relative pt-20 pb-16 md:pt-24 md:pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-20"
            style={{ background: "radial-gradient(circle at 50% 50%, rgba(212,175,55,0.08) 0%, transparent 50%)" }}
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            className="text-center mb-12"
          >
            <span className="section-label">START A PROJECT</span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight mt-4">
              Tell Us About
              <br />
              <span className="text-gradient">What You Need</span>
            </h1>
            <p className="text-base sm:text-lg text-muted mt-4 max-w-xl mx-auto leading-relaxed">
              Fill out the form below and we&apos;ll get back to you within 24 hours with a clear next step — whether that&apos;s a discovery call, a proposal, or a quick yes/no on fit.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] as const }}
            className="max-w-2xl mx-auto"
          >
            <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 md:p-10 space-y-6">
              <div className="grid sm:grid-cols-2 gap-5">
                <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  <label htmlFor="full_name" className={labelClasses}>Full Name <span className="text-gold">*</span></label>
                  <input id="full_name" name="full_name" type="text" required value={form.full_name} onChange={handleChange} placeholder="Enter your name" className={inputClasses} />
                </motion.div>

                <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  <label htmlFor="email" className={labelClasses}>Email Address <span className="text-gold">*</span></label>
                  <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} placeholder="you@example.com" className={inputClasses} />
                </motion.div>
              </div>

              <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <label htmlFor="phone" className={labelClasses}>Phone Number</label>
                <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+234 800 000 0000" className={inputClasses} />
              </motion.div>

              <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <label htmlFor="company" className={labelClasses}>Company (Optional)</label>
                <input id="company" name="company" type="text" value={form.company} onChange={handleChange} placeholder="Your company or organization name" className={inputClasses} />
              </motion.div>

              <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <label htmlFor="project_type" className={labelClasses}>Project Type <span className="text-gold">*</span></label>
                <select id="project_type" name="project_type" required value={form.project_type} onChange={handleChange} className={selectClasses}>
                  <option value="" disabled className="bg-surface">Select project type</option>
                  <option value="website" className="bg-surface">Business Website</option>
                  <option value="web-app" className="bg-surface">Web Application</option>
                  <option value="dashboard" className="bg-surface">Dashboard / Admin Portal</option>
                  <option value="ecommerce" className="bg-surface">E-Commerce / Marketplace</option>
                  <option value="mobile" className="bg-surface">Mobile App</option>
                  <option value="landing" className="bg-surface">Landing Page</option>
                  <option value="mvp" className="bg-surface">MVP / Prototype</option>
                  <option value="other" className="bg-surface">Other</option>
                </select>
              </motion.div>

              <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <label htmlFor="description" className={labelClasses}>What Do You Need Built? <span className="text-gold">*</span></label>
                <textarea id="description" name="description" rows={5} required value={form.description} onChange={handleChange} placeholder="Describe your project — what problem does it solve? Who is it for? What features do you need?" className={`${inputClasses} resize-none`} />
              </motion.div>

              <div className="grid sm:grid-cols-2 gap-5">
                <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  <label htmlFor="timeline" className={labelClasses}>Timeline</label>
                  <select id="timeline" name="timeline" value={form.timeline} onChange={handleChange} className={selectClasses}>
                    <option value="" disabled className="bg-surface">Select timeline</option>
                    <option value="asap" className="bg-surface">ASAP</option>
                    <option value="1-2" className="bg-surface">1-2 months</option>
                    <option value="2-3" className="bg-surface">2-3 months</option>
                    <option value="flexible" className="bg-surface">Flexible</option>
                  </select>
                </motion.div>

                <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  <label htmlFor="budget_range" className={labelClasses}>Budget Range</label>
                  <select id="budget_range" name="budget_range" value={form.budget_range} onChange={handleChange} className={selectClasses}>
                    <option value="" disabled className="bg-surface">Select budget range</option>
                    <option value="under-500k" className="bg-surface">Under ₦500,000</option>
                    <option value="500k-2m" className="bg-surface">₦500,000 - ₦2,000,000</option>
                    <option value="2m-5m" className="bg-surface">₦2,000,000 - ₦5,000,000</option>
                    <option value="5m+" className="bg-surface">₦5,000,000+</option>
                    <option value="not-sure" className="bg-surface">Not sure</option>
                  </select>
                </motion.div>
              </div>

              <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <label htmlFor="referral" className={labelClasses}>How Did You Hear About Us? (Optional)</label>
                <input id="referral" name="referral" type="text" value={form.referral} onChange={handleChange} placeholder="Google, referral, social media, etc." className={inputClasses} />
              </motion.div>

              {error && (
                <motion.div variants={fadeUp} className="text-red-400 text-sm text-center">
                  {error}
                </motion.div>
              )}

              <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <button type="submit" disabled={sending} className="w-full px-8 py-4 rounded-xl bg-gold-gradient text-background font-bold text-base hover:shadow-gold hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                  {sending ? "Sending..." : "Send Inquiry"}
                </button>
              </motion.div>

              <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center space-y-1">
                <p className="text-xs text-muted">We respond to every inquiry within 24 hours.</p>
                <p className="text-xs text-muted">All project discussions are confidential.</p>
              </motion.div>
            </form>
          </motion.div>
        </div>
      </section>
    </>
  );
}
