"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const projects = [
  {
    id: "marketplace-platform",
    title: "Marketplace Platform",
    category: "E-Commerce",
    summary: "A multi-vendor marketplace connecting artisans across Africa with global buyers.",
    description: "A scalable platform with vendor dashboards, multi-currency payments, real-time inventory, and order management.",
    result: "10,000+ vendors, 50,000+ monthly transactions",
    tags: ["Next.js", "Node.js", "PostgreSQL"],
    gradient: "from-blue-500/20 via-cyan-500/10 to-transparent",
  },
  {
    id: "fintech-dashboard",
    title: "Fintech Dashboard",
    category: "Dashboard",
    summary: "An enterprise financial analytics dashboard processing millions in daily transactions.",
    description: "Real-time data visualization with multi-currency support, fraud detection, and regulatory reporting.",
    result: "$2M+ fraud prevented, 40% faster decisions",
    tags: ["Next.js", "TypeScript", "Supabase"],
    gradient: "from-purple-500/20 via-violet-500/10 to-transparent",
  },
  {
    id: "restaurant-platform",
    title: "Restaurant Ordering Platform",
    category: "Platform",
    summary: "A complete digital ordering ecosystem for a multi-branch restaurant chain.",
    description: "Online ordering, QR code menus, real-time order tracking, kitchen display system, and delivery route optimization.",
    result: "300% increase in online orders",
    tags: ["React Native", "Node.js", "MongoDB"],
    gradient: "from-orange-500/20 via-amber-500/10 to-transparent",
  },
  {
    id: "lms-platform",
    title: "Learning Management System",
    category: "Web Application",
    summary: "A comprehensive LMS supporting 10,000+ concurrent students with live coding environments.",
    description: "Real-time collaborative learning with integrated code editors, video streaming, progress tracking, and automated grading.",
    result: "8,000+ active users, 95% completion rate",
    tags: ["React", "Python", "Django"],
    gradient: "from-green-500/20 via-emerald-500/10 to-transparent",
  },
  {
    id: "ai-content-platform",
    title: "AI Content Platform",
    category: "Web Application",
    summary: "An AI-powered content generation platform for marketing copy, blogs, and social media.",
    description: "LLM-powered platform with multi-language support, brand voice customization, and performance analytics.",
    result: "5,000+ business users, 1M+ content pieces",
    tags: ["Next.js", "Python", "FastAPI"],
    gradient: "from-pink-500/20 via-rose-500/10 to-transparent",
  },
  {
    id: "saas-analytics",
    title: "SaaS Analytics Tool",
    category: "Dashboard",
    summary: "A multi-tenant analytics platform providing real-time business intelligence for SMEs.",
    description: "Customizable dashboards, automated reporting, predictive analytics, and self-service data exploration.",
    result: "500+ subscribers, 99.99% data accuracy",
    tags: ["React", "Node.js", "PostgreSQL"],
    gradient: "from-yellow-500/20 via-orange-500/10 to-transparent",
  },
];

const categories = ["All Work", "Web Application", "Dashboard", "E-Commerce", "Platform"];

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

const ProjectVisual = ({ gradient, large }: { gradient: string; large?: boolean }) => (
  <div
    className={`relative overflow-hidden bg-gradient-to-br ${gradient} ${
      large ? "h-full min-h-[300px] rounded-2xl" : "h-28 rounded-t-2xl"
    }`}
  >
    <div
      className="absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage:
          "radial-gradient(circle at 30% 40%, rgba(255,255,255,0.3) 1px, transparent 1px)",
        backgroundSize: large ? "30px 30px" : "20px 20px",
      }}
    />
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)",
        backgroundSize: large ? "60px 60px" : "40px 40px",
      }}
    />
    {large && (
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
    )}
  </div>
);

export default function WorkPage() {
  const [activeCategory, setActiveCategory] = useState("All Work");

  const filtered =
    activeCategory === "All Work"
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <>
      {/* Hero */}
      <section className="relative pt-20 pb-16 md:pt-24 md:pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(212,175,55,0.08) 0%, transparent 50%)",
            }}
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl"
          >
            <span className="section-label">OUR WORK</span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mt-4">
              Selected Projects
              <br />
              <span className="text-gradient">Built for Real Businesses</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted mt-6 max-w-2xl leading-relaxed">
              We design and build websites, web applications, dashboards, and digital platforms
              for businesses across industries. Here&apos;s a selection of what we&apos;ve delivered.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter Strip */}
      <section className="relative py-8 md:py-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/30 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="flex flex-wrap justify-center gap-2"
          >
            {categories.map((cat) => (
              <motion.button
                key={cat}
                variants={cardUp}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeCategory === cat
                    ? "bg-gold-gradient text-background"
                    : "glass text-white/70 hover:text-white"
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Project */}
      {featured && (
        <section className="relative py-8 md:py-12 overflow-hidden">
          <div className="relative z-10 max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="glass rounded-2xl overflow-hidden"
            >
              <Link
                href={`/work/${featured.id}`}
                className="flex flex-col md:flex-row"
              >
                <div className="md:w-3/5">
                  <ProjectVisual gradient={featured.gradient} large />
                </div>
                <div className="md:w-2/5 p-8 md:p-10 flex flex-col justify-center">
                  <span className="inline-block px-2.5 py-1 rounded-lg bg-gold/10 text-gold text-[11px] uppercase tracking-wider font-semibold mb-3 w-fit">
                    {featured.category}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 group-hover:text-gold transition-colors">
                    {featured.title}
                  </h2>
                  <p className="text-muted text-sm leading-relaxed mb-4">
                    {featured.description}
                  </p>
                  <span className="text-gold font-semibold text-sm mb-6">
                    {featured.result}
                  </span>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {featured.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-1 rounded-md bg-white/5 text-xs text-muted"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gold font-semibold hover:text-white transition-colors">
                    View Case Study &rarr;
                  </span>
                </div>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Project Grid */}
      {rest.length > 0 && (
        <section className="relative py-12 md:py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/20 to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-7xl mx-auto px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={stagger}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {rest.map((project) => (
                <motion.div
                  key={project.id}
                  variants={cardUp}
                  className="group relative rounded-2xl glass glass-hover overflow-hidden"
                >
                  <Link
                    href={`/work/${project.id}`}
                    className="block"
                  >
                    <ProjectVisual gradient={project.gradient} />
                    <div className="p-6 md:p-8">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-gold/10 text-gold text-[11px] uppercase tracking-wider font-semibold mb-3">
                        {project.category}
                      </span>
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-gold transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-muted text-sm leading-relaxed mb-4">
                        {project.summary}
                      </p>
                      <span className="block text-gold text-sm font-semibold mb-4">
                        {project.result}
                      </span>
                      <div className="flex flex-wrap gap-2 mb-5">
                        {project.tags.map((t) => (
                          <span
                            key={t}
                            className="px-2.5 py-1 rounded-md bg-white/5 text-xs text-muted"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-gold font-semibold group-hover:text-white transition-colors">
                        View Case Study &rarr;
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Trust Strip */}
      <section className="relative py-20 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.015] to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <p className="text-white/80 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
              Every project is custom-built from the ground up &mdash; designed and developed for
              the specific needs of each business.
            </p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-6 text-sm text-muted">
              <span>Business Websites</span>
              <span className="text-white/20">·</span>
              <span>Web Applications</span>
              <span className="text-white/20">·</span>
              <span>Dashboards &amp; Portals</span>
              <span className="text-white/20">·</span>
              <span>E-Commerce Stores</span>
              <span className="text-white/20">·</span>
              <span>Booking Platforms</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.02] to-transparent" />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)",
            }}
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
              Have a Project
              <br />
              <span className="text-gradient">In Mind?</span>
            </h2>
            <p className="text-lg md:text-xl text-muted mt-6 max-w-2xl mx-auto leading-relaxed">
              Tell us what you&apos;re building. We&apos;ll get back to you within 24 hours with a
              clear next step.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.6,
              delay: 0.2,
              ease: [0.16, 1, 0.3, 1] as const,
            }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <Link
              href="/start-project"
              className="px-8 py-4 rounded-xl bg-gold-gradient text-background font-bold text-base hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
            >
              Start a Project
            </Link>
            <Link
              href="/services"
              className="px-8 py-4 rounded-xl border border-white/10 text-white font-bold text-base hover:bg-white/5 hover:border-white/20 transition-all duration-300"
            >
              View Services
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
