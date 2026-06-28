"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const types = [
  { title: "Personal Portfolio Website", description: "A stunning personal website to showcase your work, skills, and professional journey.", price: "₦250,000 – ₦500,000", icon: "👤" },
  { title: "Business Website", description: "Professional business website with service pages, contact forms, and CMS integration.", price: "₦350,000 – ₦800,000", icon: "🏢" },
  { title: "Corporate Website", description: "Multi-page corporate site with team pages, investor relations, and news section.", price: "₦500,000 – ₦1,500,000", icon: "🏛️" },
  { title: "School Portal", description: "Complete school management portal with student records, grades, attendance, and parent communication.", price: "₦600,000 – ₦2,000,000", icon: "🎓" },
  { title: "Church Website", description: "Church website with sermon uploads, event calendar, donation system, and member portal.", price: "₦300,000 – ₦700,000", icon: "⛪" },
  { title: "News Website", description: "News portal with article management, categories, multimedia support, and subscription system.", price: "₦400,000 – ₦1,200,000", icon: "📰" },
  { title: "NGO Website", description: "Non-profit website with donation integration, impact stories, volunteer management, and campaign pages.", price: "₦300,000 – ₦800,000", icon: "🤝" },
  { title: "Real Estate Website", description: "Property listing platform with search filters, virtual tours, agent profiles, and inquiry management.", price: "₦500,000 – ₦1,500,000", icon: "🏠" },
  { title: "Membership Website", description: "Members-only platform with tiered access, billing integration, content gating, and community features.", price: "₦500,000 – ₦1,500,000", icon: "🔐" },
  { title: "Booking Website", description: "Appointment booking system with calendar sync, payment processing, reminders, and admin dashboard.", price: "₦400,000 – ₦1,000,000", icon: "📅" },
  { title: "E-Commerce Website", description: "Online store with product management, shopping cart, secure checkout, payment gateway integration, and inventory tracking.", price: "₦600,000 – ₦2,500,000", icon: "🛒" },
  { title: "Landing Page", description: "High-converting single-page website designed for product launches, marketing campaigns, or lead generation with analytics integration.", price: "₦150,000 – ₦400,000", icon: "🎯" },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
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

export default function WebDevelopmentPage() {
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
          >
            <Link
              href="/hire"
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-gold transition-colors duration-300 mb-8"
            >
              ← Back to Services
            </Link>
            <div className="text-5xl mb-6">🌐</div>
            <h1 className="section-heading max-w-4xl">
              Web <span className="text-gradient">Development</span>
            </h1>
            <p className="section-subtitle mt-4 max-w-2xl">
              Custom websites and web applications tailored to your business needs. From personal portfolios to complex enterprise portals.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/30 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {types.map((type) => (
              <motion.div
                key={type.title}
                variants={fadeUp}
                className="glass rounded-2xl p-6 md:p-8 hover:border-gold/20 transition-all duration-300"
              >
                <div className="text-3xl mb-4">{type.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">{type.title}</h3>
                <p className="text-muted text-sm leading-relaxed mb-4">{type.description}</p>
                <span className="inline-block px-3 py-1.5 rounded-full glass text-xs text-gold font-semibold">
                  {type.price}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.02] to-transparent" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
          >
            <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-6">
              Ready to Build Your
              <br />
              <span className="text-gradient">Website?</span>
            </h2>
            <p className="text-muted mb-8 max-w-lg mx-auto">
              Tell us about your project and we&apos;ll create a custom proposal tailored to your needs.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/hire/request-quote"
                className="px-8 py-4 rounded-xl bg-gold-gradient text-background font-bold text-base hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
              >
                Request a Quote
              </Link>
              <Link
                href="/projects"
                className="px-8 py-4 rounded-xl border border-white/10 text-white font-bold text-base hover:bg-white/5 transition-all duration-300"
              >
                View Our Work
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
