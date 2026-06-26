"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

const stacks = [
  { id: "frontend", title: "Frontend Engineering", icon: "🖥" },
  { id: "backend", title: "Backend Engineering", icon: "⚙" },
  { id: "fullstack", title: "Full-Stack Development", icon: "🚀" },
  { id: "mobile", title: "Mobile Development", icon: "📱" },
  { id: "ai", title: "AI Engineering", icon: "🤖" },
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

export default function EnrollPage() {
  const params = useParams();
  const stack = stacks.find((s) => s.id === params.stack);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    level: "",
    goals: "",
    startDay: "",
    startMonth: "",
    startYear: "",
    paymentPlan: "",
    cohort: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [showDateModal, setShowDateModal] = useState(false);
  const [showRequiredModal, setShowRequiredModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.level || !form.goals || !form.startDay || !form.startMonth || !form.startYear || !form.paymentPlan || !form.cohort) {
      setShowRequiredModal(true);
      return;
    }

    setSending(true);
    setError("");

    const selected = new Date(`${form.startYear}-${form.startMonth}-${form.startDay}`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selected < today) {
      setShowDateModal(true);
      setSending(false);
      return;
    }

    try {
      const startDate = `${form.startYear}-${form.startMonth}-${form.startDay}`;
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, startDate, stack: stack?.title || stack?.id }),
      });
      if (!res.ok) throw new Error("Failed to send");
      window.scrollTo(0, 0);
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again or email us directly.");
    } finally {
      setSending(false);
    }
  };

  const inputClasses = "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-muted text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all duration-300";

  const labelClasses = "block text-sm font-medium text-white/80 mb-2";

  if (!stack) {
    return (
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <h1 className="section-heading">Stack Not Found</h1>
          <p className="section-subtitle mt-4 mx-auto">The program you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/academy" className="inline-block mt-8 px-6 py-3 rounded-xl bg-gold-gradient text-background font-bold text-sm">
            Back to Academy
          </Link>
        </div>
      </section>
    );
  }

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
              Your enrollment for <strong className="text-white">{stack.title}</strong> has been received.
              We&apos;ll reach out within 24 hours with next steps.
            </p>
            <div className="mt-10 space-y-3">
              <p className="text-sm text-muted">
                📧 Confirmation sent to <span className="text-white">admin@codemafia.ng</span>
              </p>
              <p className="text-sm text-muted">
                🗓 Preferred start: <span className="text-white">{form.startDay && form.startMonth && form.startYear ? `${form.startDay}/${form.startMonth}/${form.startYear}` : "Not specified"}</span>
              </p>
            </div>
            <Link
              href="/academy"
              className="inline-block mt-10 px-8 py-4 rounded-xl bg-gold-gradient text-background font-bold text-base hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
            >
              Back to Academy
            </Link>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <>
      {showRequiredModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6"
          onClick={() => setShowRequiredModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
            className="glass rounded-2xl p-8 max-w-sm w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-white mb-2">All Fields Required</h3>
            <p className="text-muted text-sm mb-6">Please fill in all fields including the payment plan before submitting.</p>
            <button
              onClick={() => setShowRequiredModal(false)}
              className="px-6 py-3 rounded-xl bg-gold-gradient text-background font-bold text-sm hover:shadow-gold transition-all duration-300"
            >
              Got it
            </button>
          </motion.div>
        </motion.div>
      )}
      {showDateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6"
          onClick={() => setShowDateModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
            className="glass rounded-2xl p-8 max-w-sm w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-xl font-bold text-white mb-2">Invalid Date</h3>
            <p className="text-muted text-sm mb-6">Please select a future date for your enrollment.</p>
            <button
              onClick={() => setShowDateModal(false)}
              className="px-6 py-3 rounded-xl bg-gold-gradient text-background font-bold text-sm hover:shadow-gold transition-all duration-300"
            >
              Got it
            </button>
          </motion.div>
        </motion.div>
      )}
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
            href={`/academy/${stack.id}`}
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-gold transition-colors duration-300 mb-6"
          >
            ← Back to {stack.title}
          </Link>
          <div className="text-4xl mb-4">{stack.icon}</div>
          <h1 className="section-heading">
            Enroll in
            <br />
            <span className="text-gradient">{stack.title}</span>
          </h1>
          <p className="section-subtitle mt-4">
            Fill out the form below to begin your enrollment. We&apos;ll get back to you within 24 hours.
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
            <label htmlFor="level" className={labelClasses}>Skill Level</label>
            <select
              id="level"
              name="level"
              required
              value={form.level}
              onChange={handleChange}
              className={inputClasses}
            >
              <option value="" disabled className="bg-surface">Select your level</option>
              <option value="beginner" className="bg-surface">Beginner</option>
              <option value="intermediate" className="bg-surface">Intermediate</option>
              <option value="advanced" className="bg-surface">Advanced</option>
            </select>
          </motion.div>

          <motion.div variants={fadeUp}>
            <label htmlFor="goals" className={labelClasses}>Learning Goals</label>
            <textarea
              id="goals"
              name="goals"
              rows={4}
              required
              value={form.goals}
              onChange={handleChange}
              placeholder="What do you hope to achieve from this program?"
              className={`${inputClasses} resize-none`}
            />
          </motion.div>

          <motion.div variants={fadeUp}>
            <label className={labelClasses}>Preferred Start Date</label>
            <div className="grid grid-cols-3 gap-3">
              <select
                name="startDay"
                required
                value={form.startDay}
                onChange={handleChange}
                className={inputClasses}
              >
                <option value="" disabled className="bg-surface">Day</option>
                {Array.from({ length: 31 }, (_, i) => (
                  <option key={i + 1} value={String(i + 1).padStart(2, "0")} className="bg-surface">{i + 1}</option>
                ))}
              </select>
              <select
                name="startMonth"
                required
                value={form.startMonth}
                onChange={handleChange}
                className={inputClasses}
              >
                <option value="" disabled className="bg-surface">Month</option>
                {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => (
                  <option key={m} value={String(i + 1).padStart(2, "0")} className="bg-surface">{m}</option>
                ))}
              </select>
              <select
                name="startYear"
                required
                value={form.startYear}
                onChange={handleChange}
                className={inputClasses}
              >
                <option value="" disabled className="bg-surface">Year</option>
                {Array.from({ length: 3 }, (_, i) => (
                  <option key={i} value={String(2026 + i)} className="bg-surface">{2026 + i}</option>
                ))}
              </select>
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <label className={labelClasses}>Payment Plan</label>
            <div className="space-y-3">
              {[
                { value: "full", label: "Full Payment", desc: "One-time payment at 10% discount" },
                { value: "monthly", label: "Monthly Installment", desc: "Spread payments over 6 months" },
                { value: "pay-as-you-learn", label: "Pay As You Learn", desc: "Pay per phase" },
              ].map((plan) => (
                <label
                  key={plan.value}
                  className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                    form.paymentPlan === plan.value
                      ? "gold-border bg-white/5"
                      : "border border-white/5 bg-white/[0.02] hover:bg-white/5"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentPlan"
                    value={plan.value}
                    checked={form.paymentPlan === plan.value}
                    onChange={handleChange}
                    className="mt-1 accent-gold"
                  />
                  <div>
                    <span className="block text-sm font-medium text-white">{plan.label}</span>
                    <span className="block text-xs text-muted mt-0.5">{plan.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <label htmlFor="cohort" className={labelClasses}>Cohort</label>
            <select
              id="cohort"
              name="cohort"
              required
              value={form.cohort}
              onChange={handleChange}
              className={inputClasses}
            >
              <option value="" disabled className="bg-surface">Select a cohort</option>
              <option value="aug-2026" className="bg-surface">Next Cohort (Aug 2026)</option>
              <option value="oct-2026" className="bg-surface">Following Cohort (Oct 2026)</option>
            </select>
          </motion.div>

          <motion.div variants={fadeUp} className="pt-4">
            <button
              type="submit"
              className="w-full px-8 py-4 rounded-xl bg-gold-gradient text-background font-bold text-base hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
            >
              Submit Enrollment
            </button>
          </motion.div>
        </motion.form>
      </div>
      </section>
    </>
  );
}
