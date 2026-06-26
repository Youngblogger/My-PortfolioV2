"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const types = [
  { title: "Architecture Reviews", description: "Comprehensive review of your system architecture with recommendations for scalability, performance, and reliability.", price: "Starting ₦200,000", icon: "🏛️" },
  { title: "Code Audits", description: "Detailed code audit covering security, performance, maintainability, and best practices compliance.", price: "Starting ₦150,000", icon: "🔍" },
  { title: "Scaling Strategies", description: "Strategic guidance on scaling your infrastructure, team, and processes for growth.", price: "Custom Quote", icon: "📈" },
  { title: "Product Consulting", description: "End-to-end product consulting from ideation to launch, including technical feasibility and roadmap planning.", price: "Custom Quote", icon: "💡" },
  { title: "Technical Roadmaps", description: "Detailed technical roadmaps aligned with business goals, including technology selection and architecture decisions.", price: "Starting ₦200,000", icon: "🗺️" },
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

export default function TechnicalConsultingPage() {
  return (
    <>
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 overflow-hidden">
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
            <div className="text-5xl mb-6">🔧</div>
            <h1 className="section-heading max-w-4xl">
              Technical <span className="text-gradient">Consulting</span>
            </h1>
            <p className="section-subtitle mt-4 max-w-2xl">
              Expert technical guidance to help your team build better products, faster. From architecture reviews to scaling strategies.
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
              Need Expert
              <br />
              <span className="text-gradient">Guidance?</span>
            </h2>
            <p className="text-muted mb-8 max-w-lg mx-auto">
              Let&apos;s discuss how we can help your team build better products with confidence.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/hire/request-quote"
                className="px-8 py-4 rounded-xl bg-gold-gradient text-background font-bold text-base hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
              >
                Book a Consultation
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
