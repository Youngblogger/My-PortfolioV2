"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const types = [
  { slug: "product-design", title: "Product Design", description: "End-to-end product design from concept to polished UI, including user flows and interaction design.", price: "Starting ₦250,000", icon: "🎨" },
  { slug: "wireframes", title: "Wireframes", description: "Low and high-fidelity wireframes to visualize layout, structure, and user flow before development.", price: "Starting ₦100,000", icon: "📐" },
  { slug: "design-systems", title: "Design Systems", description: "Comprehensive design systems with component libraries, style guides, and documentation for consistent branding.", price: "Starting ₦300,000", icon: "📦" },
  { slug: "user-research", title: "User Research", description: "User research including interviews, surveys, usability testing, and data-driven design recommendations.", price: "Starting ₦150,000", icon: "🔍" },
  { slug: "prototyping", title: "Prototyping", description: "Interactive prototypes with realistic animations and transitions for user testing and stakeholder approval.", price: "Starting ₦150,000", icon: "⚡" },
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

export default function UiUxDesignPage() {
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
              href="/services"
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-gold transition-colors duration-300 mb-8"
            >
              ← Back to Services
            </Link>
            <div className="text-5xl mb-6">🎨</div>
            <h1 className="section-heading max-w-4xl">
              UI/UX <span className="text-gradient">Design</span>
            </h1>
            <p className="section-subtitle mt-4 max-w-2xl">
              User-centered design that delights users and drives business results. From research to polished interfaces.
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
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {types.map((type) => (
              <motion.div key={type.slug} variants={fadeUp} className="h-full">
                <Link
                  href={`/hire/ui-ux-design/${type.slug}`}
                  className="block glass rounded-2xl p-6 md:p-8 hover:border-gold/20 transition-all duration-300 cursor-pointer h-full"
                >
                  <div className="text-3xl mb-4">{type.icon}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{type.title}</h3>
                  <p className="text-muted text-sm leading-relaxed mb-4">{type.description}</p>
                  <span className="inline-block px-3 py-1.5 rounded-full glass text-xs text-gold font-semibold">
                    {type.price}
                  </span>
                </Link>
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
              Need a Design That
              <br />
              <span className="text-gradient">Converts?</span>
            </h2>
            <p className="text-muted mb-8 max-w-lg mx-auto">
              Let&apos;s create a design that your users will love. We combine research, creativity, and data-driven decisions.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/start-project"
                className="px-8 py-4 rounded-xl bg-gold-gradient text-background font-bold text-base hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
              >
                Start a Project
              </Link>
              <Link
                href="/work"
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
