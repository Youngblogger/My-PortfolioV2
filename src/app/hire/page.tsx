"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import PageHeader from "@/components/pages/PageHeader";

const services = [
  { id: "web-development", title: "Web Development", description: "Custom websites and web applications — from personal portfolios to complex portals and enterprise platforms.", icon: "🌐", price: "Starting ₦250,000", gradient: "from-blue-500/10 to-cyan-500/10" },
  { id: "saas-development", title: "SaaS Development", description: "Scalable SaaS platforms, CRM systems, ERP solutions, subscription platforms, and internal business tools.", icon: "☁️", price: "Custom Quote", gradient: "from-purple-500/10 to-violet-500/10" },
  { id: "mobile-apps", title: "Mobile App Development", description: "Native and cross-platform mobile applications for iOS and Android — from business apps to marketplace platforms.", icon: "📱", price: "Starting ₦500,000", gradient: "from-green-500/10 to-emerald-500/10" },
  { id: "ui-ux-design", title: "UI/UX Design", description: "User-centered design — wireframes, prototypes, design systems, and user research for web and mobile products.", icon: "🎨", price: "Starting ₦150,000", gradient: "from-orange-500/10 to-amber-500/10" },
  { id: "technical-consulting", title: "Technical Consulting", description: "Architecture reviews, code audits, scaling strategies, and technical roadmaps for your engineering team.", icon: "🔧", price: "Custom Quote", gradient: "from-pink-500/10 to-rose-500/10" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function HirePage() {
  return (
    <>
        <PageHeader
          label="SERVICES"
          title="Build Your Next Product"
          highlight="With Us"
          description="From concept to launch — we partner with startups and enterprises to build world-class digital products."
        />

      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/50 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {services.map((service) => (
              <motion.div
                key={service.id}
                variants={cardVariants}
                className="group relative rounded-2xl glass glass-hover overflow-hidden"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />
                <Link href={`/hire/${service.id}`} className="relative block p-6 md:p-8">
                  <div className="text-3xl mb-4">{service.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {service.title}
                  </h3>
                  <p className="text-muted text-sm leading-relaxed mb-6">
                    {service.description}
                  </p>
                  <div className="inline-block px-4 py-2 rounded-full glass text-sm text-gold font-semibold">
                    {service.price}
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.02] to-transparent" />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)" }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Don&apos;t See What
              <br />
              <motion.span
                className="text-gradient inline-block"
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
              >
                You&apos;re Looking For?
              </motion.span>
            </h2>
            <p className="text-lg md:text-xl text-muted mt-6 max-w-2xl mx-auto leading-relaxed">
              Every product is unique. Tell us about your vision and we&apos;ll craft a custom solution tailored to your needs.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
            className="mt-10"
          >
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <Link
                href="/hire/request-quote"
                className="inline-block px-8 py-4 rounded-xl bg-gold-gradient text-background font-bold text-base hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
              >
                Request Custom Quote
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
