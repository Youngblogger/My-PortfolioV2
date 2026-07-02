"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { PageLoader } from "@/components/ui/LoadingSpinner";

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

const inputClasses = "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-muted text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all duration-300";
const labelClasses = "block text-sm font-medium text-white/80 mb-2";

function DiscoveryCallForm() {
  const searchParams = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    meeting_type: "",
    preferred_date: "",
    preferred_time: "",
    timezone: "Africa/Lagos",
    project_summary: "",
    service_order_id: "",
  });

  useEffect(() => {
    const orderId = searchParams.get("service_order_id");
    if (orderId) {
      setForm((prev) => ({ ...prev, service_order_id: orderId }));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      const payload: Record<string, string | undefined> = {
        preferred_date: form.preferred_date,
        preferred_time: form.preferred_time,
        timezone: form.timezone,
        meeting_type: form.meeting_type,
      };
      if (form.project_summary.trim()) payload.project_summary = form.project_summary.trim();
      if (form.service_order_id) payload.service_order_id = form.service_order_id;
      await api.requestDiscoveryCall(payload as any);
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again or email us at admin@codemafia.ng.");
    } finally {
      setSending(false);
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

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
            <div className="text-6xl mb-6">✅</div>
            <h1 className="section-heading">
              Discovery Call
              <br />
              <span className="text-gradient">Requested!</span>
            </h1>
            <p className="section-subtitle mt-4 mx-auto">
              Your discovery call has been scheduled. We&apos;ll review your request and send a
              confirmation with the meeting link shortly.
            </p>
            <div className="mt-10 space-y-3">
              <p className="text-sm text-muted">
                📅 <span className="text-white">{new Date(form.preferred_date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</span>
                {" at "}
                <span className="text-white">{form.preferred_time}</span>
              </p>
              <p className="text-sm text-muted">
                🎯 Meeting Type: <span className="text-white">{form.meeting_type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}</span>
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
        <div className="absolute inset-0 opacity-20"
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
            Schedule a
            <br />
            <span className="text-gradient">Discovery Call</span>
          </h1>
          <p className="section-subtitle mt-0">
            Let&apos;s chat about your project idea, goals, and how we can help bring it to life.
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
            <label className={labelClasses}>Meeting Type</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "google_meet", label: "Google Meet" },
                { value: "zoom", label: "Zoom" },
                { value: "phone", label: "Phone" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center justify-center px-4 py-3 rounded-xl border text-sm font-medium cursor-pointer transition-all duration-300 ${
                    form.meeting_type === opt.value
                      ? "border-gold bg-gold/10 text-gold"
                      : "border-white/10 bg-white/5 text-muted hover:text-white hover:border-white/20"
                  }`}
                >
                  <input
                    type="radio"
                    name="meeting_type"
                    value={opt.value}
                    checked={form.meeting_type === opt.value}
                    onChange={handleChange}
                    className="sr-only"
                    required
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6">
            <motion.div variants={fadeUp}>
              <label htmlFor="preferred_date" className={labelClasses}>Preferred Date</label>
              <input
                id="preferred_date"
                name="preferred_date"
                type="date"
                required
                min={minDate}
                value={form.preferred_date}
                onChange={handleChange}
                className={inputClasses}
              />
            </motion.div>

            <motion.div variants={fadeUp}>
              <label htmlFor="preferred_time" className={labelClasses}>Preferred Time</label>
              <input
                id="preferred_time"
                name="preferred_time"
                type="time"
                required
                value={form.preferred_time}
                onChange={handleChange}
                className={inputClasses}
              />
            </motion.div>
          </div>

          <motion.div variants={fadeUp}>
            <label htmlFor="timezone" className={labelClasses}>Timezone</label>
            <input
              id="timezone"
              name="timezone"
              type="text"
              value={form.timezone}
              onChange={handleChange}
              placeholder="e.g. Africa/Lagos"
              className={inputClasses}
            />
          </motion.div>

          <motion.div variants={fadeUp}>
            <label htmlFor="project_summary" className={labelClasses}>
              Project Summary <span className="text-muted/60">(optional)</span>
            </label>
            <textarea
              id="project_summary"
              name="project_summary"
              rows={5}
              value={form.project_summary}
              onChange={handleChange}
              placeholder="Briefly describe your project idea, goals, and any questions you have..."
              className={`${inputClasses} resize-none`}
            />
          </motion.div>

          {form.service_order_id && (
            <input type="hidden" name="service_order_id" value={form.service_order_id} />
          )}

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
              {sending ? "Scheduling..." : "Request Discovery Call"}
            </button>
          </motion.div>
        </motion.form>
      </div>
    </section>
  );
}

export default function DiscoveryCallPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <DiscoveryCallForm />
    </Suspense>
  );
}
