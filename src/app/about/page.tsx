"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const capabilities = [
  { title: "Business Websites", desc: "Company sites, marketing pages, and brand platforms that convert visitors into customers." },
  { title: "Web Applications", desc: "Custom platforms, internal tools, and business software built to your exact requirements." },
  { title: "Dashboards & Portals", desc: "Admin dashboards, client portals, and analytics interfaces for operations and data." },
  { title: "E-Commerce & Marketplaces", desc: "Online stores, multi-vendor platforms, booking systems, and subscription products." },
  { title: "MVP & Prototypes", desc: "Working products in weeks. We help founders validate ideas and raise funding." },
  { title: "Maintenance & Support", desc: "Ongoing care — updates, monitoring, features, and technical support after launch." },
];

const principles = [
  { title: "Build Custom, Not Template", desc: "Every project is built from the ground up for your specific needs. No off-the-shelf shortcuts." },
  { title: "Design & Engineering, Together", desc: "No handoff between a designer and a developer who never talk. We do both, in sync." },
  { title: "Think Business, Not Just Code", desc: "We ask why before we write a line of code. Your goals shape the architecture." },
  { title: "Transparent Process", desc: "You'll always know what's happening and when to expect it. No black boxes." },
  { title: "Built to Last", desc: "Scalable architecture, clean code, and maintainable systems designed for the long term." },
  { title: "Supported Beyond Launch", desc: "We don't disappear after go-live. We stay on board for support, updates, and growth." },
];

const stats = [
  { value: "100+", label: "Projects Delivered" },
  { value: "50+", label: "Clients Served" },
  { value: "8+", label: "Industries" },
  { value: "5+", label: "Years in Operation" },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-gold/[0.03]" />
          <motion.div
            className="absolute top-1/4 left-1/4 w-[800px] h-[800px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 60%)" }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "linear-gradient(rgba(212,175,55,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.3) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20 w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl"
          >
            <span className="section-label">About CODEMAFIA</span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mt-4">
              A Full-Stack Web
              <br />
              <span className="text-gradient">Development Studio.</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted mt-6 max-w-2xl leading-relaxed">
              CODEMAFIA partners with founders, startups, and organizations to design, build, and launch custom digital products — from business websites to dashboards, portals, and full-scale web applications.
            </p>
            <div className="flex flex-wrap gap-4 mt-10">
              <Link
                href="/start-project"
                className="px-8 py-4 rounded-xl bg-gold-gradient text-background font-bold text-base hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
              >
                Start a Project
              </Link>
              <Link
                href="/work"
                className="px-8 py-4 rounded-xl border border-white/10 text-white font-bold text-base hover:bg-white/5 hover:border-white/20 transition-all duration-300"
              >
                View Our Work
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Who We Are */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.015] to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="max-w-3xl"
          >
            <span className="section-label">Who We Are</span>
            <h2 className="section-heading mt-2">
              A Studio That <span className="text-gradient">Delivers</span>
            </h2>
            <p className="section-subtitle mt-4">
              CODEMAFIA is a full-stack web development studio. We work with businesses, startups, and organizations to design, build, and launch websites, web applications, and custom digital platforms.
            </p>
            <p className="section-subtitle mt-4">
              We believe in quality over volume, clarity over complexity, and products that actually solve problems. Every project we take on is built from the ground up — no templates, no shortcuts, no black boxes.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/20 to-transparent pointer-events-none" />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(212,175,55,0.04) 0%, transparent 60%)" }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-5"
          >
            {stats.map((s) => (
              <motion.div
                key={s.label}
                variants={cardUp}
                className="glass rounded-2xl p-6 md:p-8 text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">{s.value}</div>
                <div className="text-muted text-sm">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* What We Build */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/20 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <span className="section-label">What We Build</span>
            <h2 className="section-heading mt-2">
              Our <span className="text-gradient">Capabilities</span>
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {capabilities.map((cap) => (
              <motion.div
                key={cap.title}
                variants={cardUp}
                className="glass rounded-2xl p-6 md:p-8"
              >
                <h3 className="text-lg font-bold text-white mb-3">{cap.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{cap.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-12"
          >
            <Link
              href="/services"
              className="px-8 py-4 rounded-xl border border-white/10 text-white font-bold text-base hover:bg-white/5 hover:border-white/20 transition-all duration-300 inline-block"
            >
              See All Services →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Principles / Why CODEMAFIA */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.015] to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <span className="section-label">How We Work</span>
            <h2 className="section-heading mt-2">
              Built on <span className="text-gradient">Principles</span>
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {principles.map((p) => (
              <motion.div
                key={p.title}
                variants={cardUp}
                className="glass rounded-2xl p-6 md:p-8"
              >
                <h3 className="text-lg font-bold text-white mb-3">{p.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/30 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Ready to Build?
              <br />
              <span className="text-gradient">Let&apos;s Talk.</span>
            </h2>
            <p className="text-lg md:text-xl text-muted mt-6 max-w-2xl mx-auto leading-relaxed">
              Tell us about your project. We&apos;ll get back to you within 24 hours with a clear next step.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <Link
              href="/start-project"
              className="px-8 py-4 rounded-xl bg-gold-gradient text-background font-bold text-base hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
            >
              Start a Project
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 rounded-xl border border-white/10 text-white font-bold text-base hover:bg-white/5 hover:border-white/20 transition-all duration-300"
            >
              Get in Touch
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
