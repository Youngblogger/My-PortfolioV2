"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import PageHeader from "@/components/pages/PageHeader";
import { api } from "@/lib/api";

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
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      await api.sendContact(form);
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
        <div className="relative z-10 max-w-7xl mx-auto px-0 sm:px-6">
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
                  <a href="mailto:admin@codemafia.ng" className="text-white hover:text-gold transition-colors">
                    admin@codemafia.ng
                  </a>
                </div>

                <div className="glass rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-gold uppercase tracking-wider mb-2">WhatsApp</h3>
                  <a href="https://wa.me/2348133712756" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gold transition-colors">
                    +234 813 371 2756
                  </a>
                </div>

                <div className="glass rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-gold uppercase tracking-wider mb-2">Location</h3>
                  <p className="text-white/80">Lagos, Nigeria</p>
                </div>

                <div className="glass rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-gold uppercase tracking-wider mb-2">Connect with Us</h3>
                  <div className="flex gap-3 mt-2">
                    <a href="https://wa.me/2348133712756" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg glass flex items-center justify-center text-muted hover:text-gold hover:border-gold/30 transition-all duration-300" aria-label="WhatsApp">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    </a>
                    <a href="https://facebook.com/codemafia" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg glass flex items-center justify-center text-muted hover:text-gold hover:border-gold/30 transition-all duration-300" aria-label="Facebook">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </a>
                    <a href="https://x.com/codemafia" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg glass flex items-center justify-center text-muted hover:text-gold hover:border-gold/30 transition-all duration-300" aria-label="X (Twitter)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </a>
                    <a href="https://linkedin.com/in/codemafia" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg glass flex items-center justify-center text-muted hover:text-gold hover:border-gold/30 transition-all duration-300" aria-label="LinkedIn">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    </a>
                    <a href="https://github.com/youngblogger" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg glass flex items-center justify-center text-muted hover:text-gold hover:border-gold/30 transition-all duration-300" aria-label="GitHub">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                    </a>
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

              {error && (
                <motion.div variants={fadeUp} className="text-red-400 text-sm text-center">
                  {error}
                </motion.div>
              )}
              <motion.div variants={fadeUp}>
                <button type="submit" disabled={sending} className="w-full px-8 py-4 rounded-xl bg-gold-gradient text-background font-bold text-base hover:shadow-gold hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                  {sending ? "Sending..." : "Send Message"}
                </button>
              </motion.div>
            </motion.form>
          </div>
        </div>
      </section>
    </>
  );
}
