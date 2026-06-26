"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import PageHeader from "@/components/pages/PageHeader";

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

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
            <div className="text-6xl mb-6">✉️</div>
            <h1 className="section-heading">
              Message
              <br />
              <span className="text-gradient">Sent!</span>
            </h1>
            <p className="section-subtitle mt-4 mx-auto">
              Thank you for reaching out, {form.name}. We&apos;ll get back to you within 24 hours.
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
      <PageHeader
        label="CONTACT"
        title="Let&apos;s Start a"
        highlight="Conversation"
        description="Have a project in mind, a question about our programs, or just want to say hello? We&apos;d love to hear from you."
      />

      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/30 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-10 items-start">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
                Get In <span className="text-gradient">Touch</span>
              </h2>

              <div className="space-y-6">
                <div className="glass rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-gold uppercase tracking-wider mb-2">Email</h3>
                  <a href="mailto:hello@codemafia.ng" className="text-white hover:text-gold transition-colors">
                    hello@codemafia.ng
                  </a>
                </div>

                <div className="glass rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-gold uppercase tracking-wider mb-2">Phone</h3>
                  <a href="tel:+2348000000000" className="text-white hover:text-gold transition-colors">
                    +234 800 000 0000
                  </a>
                </div>

                <div className="glass rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-gold uppercase tracking-wider mb-2">Location</h3>
                  <p className="text-white/80">Lagos, Nigeria</p>
                </div>

                <div className="glass rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-gold uppercase tracking-wider mb-2">Follow Us</h3>
                  <div className="flex gap-3 mt-2">
                    {["LinkedIn", "GitHub", "X", "YouTube"].map((social) => (
                      <a
                        key={social}
                        href={`https://${social.toLowerCase()}.com/codemafia`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-lg glass flex items-center justify-center text-sm text-muted hover:text-gold hover:border-gold/30 transition-all duration-300"
                        aria-label={social}
                      >
                        {social[0]}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
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
                <input id="name" name="name" type="text" required value={form.name} onChange={handleChange} placeholder="Enter your name" className={inputClasses} />
              </motion.div>

              <motion.div variants={fadeUp}>
                <label htmlFor="email" className={labelClasses}>Email Address</label>
                <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} placeholder="you@example.com" className={inputClasses} />
              </motion.div>

              <motion.div variants={fadeUp}>
                <label htmlFor="subject" className={labelClasses}>Subject</label>
                <select id="subject" name="subject" required value={form.subject} onChange={handleChange} className={inputClasses}>
                  <option value="" disabled className="bg-surface">Select a subject</option>
                  <option value="academy" className="bg-surface">Academy Inquiry</option>
                  <option value="project" className="bg-surface">Project Inquiry</option>
                  <option value="partnership" className="bg-surface">Partnership</option>
                  <option value="general" className="bg-surface">General Inquiry</option>
                </select>
              </motion.div>

              <motion.div variants={fadeUp}>
                <label htmlFor="message" className={labelClasses}>Message</label>
                <textarea id="message" name="message" rows={6} required value={form.message} onChange={handleChange} placeholder="Tell us more about what you're looking for..." className={`${inputClasses} resize-none`} />
              </motion.div>

              <motion.div variants={fadeUp}>
                <button type="submit" className="w-full px-8 py-4 rounded-xl bg-gold-gradient text-background font-bold text-base hover:shadow-gold hover:scale-[1.02] transition-all duration-300">
                  Send Message
                </button>
              </motion.div>
            </motion.form>
          </div>
        </div>
      </section>
    </>
  );
}
