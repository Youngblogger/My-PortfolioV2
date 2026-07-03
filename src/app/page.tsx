"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Hero from "@/components/hero";

const featuredProjects = [
  {
    id: "marketplace-platform",
    title: "Marketplace Platform",
    description: "A multi-vendor marketplace connecting artisans across Africa with global buyers. Features vendor dashboards, payment processing, and real-time inventory management.",
    icon: "🛒",
    tech: ["Next.js", "Node.js", "PostgreSQL"],
    results: "10,000+ vendors, 50,000+ monthly transactions",
  },
  {
    id: "fintech-dashboard",
    title: "Fintech Dashboard",
    description: "An enterprise financial analytics dashboard processing millions in daily transactions. Real-time reporting, fraud detection, and multi-currency support.",
    icon: "📊",
    tech: ["TypeScript", "Next.js", "Supabase"],
    results: "40% faster decisions, $2M+ fraud prevented",
  },
  {
    id: "restaurant-platform",
    title: "Restaurant Ordering Platform",
    description: "A complete digital ordering ecosystem with online ordering, table management, and delivery logistics for a growing restaurant chain.",
    icon: "🍽",
    tech: ["React Native", "Node.js", "MongoDB"],
    results: "300% increase in online orders, 60% less wait time",
  },
];

const services = [
  {
    id: "web-development",
    title: "Business Websites",
    description: "A professional website that represents your brand and converts visitors into customers.",
    icon: "globe",
    for: "Companies, SMEs, brands",
  },
  {
    id: "custom-applications",
    title: "Custom Web Applications",
    description: "Tailored platforms built to handle your specific business logic and workflows.",
    icon: "app",
    for: "Startups, growing companies",
  },
  {
    id: "portals",
    title: "Dashboards & Admin Portals",
    description: "Internal tools that give you visibility, control, and efficiency over your operations.",
    icon: "dashboard",
    for: "Operations, management teams",
  },
  {
    id: "ecommerce",
    title: "E-Commerce & Marketplaces",
    description: "Online stores and multi-vendor platforms designed to sell, scale, and grow revenue.",
    icon: "cart",
    for: "Retail, commerce businesses",
  },
  {
    id: "booking",
    title: "Booking & Service Platforms",
    description: "Let clients book, pay, and manage appointments or services online.",
    icon: "calendar",
    for: "Service businesses, creators",
  },
  {
    id: "mvp",
    title: "MVP & Prototype Development",
    description: "Get a working product in front of users fast, without cutting corners on quality.",
    icon: "rocket",
    for: "Startups, founders",
  },
];

const ServiceIcon = ({ id }: { id: string }) => {
  if (id === "web-development") return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
  if (id === "custom-applications") return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
    </svg>
  );
  if (id === "portals") return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" />
    </svg>
  );
  if (id === "ecommerce") return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
  if (id === "booking") return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
  if (id === "mvp") return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4" /><path d="M12 15v5s3.03-.55 4-2" />
    </svg>
  );
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
};

const testimonials = [
  { name: "Kunle A.", role: "Founder, VendSpace Marketplace", text: "CODEMAFIA built our entire marketplace platform from scratch. The team understood our vision immediately and delivered a product that exceeded our expectations. Our vendors love the dashboard.", image: "KA" },
  { name: "Tara O.", role: "CTO, FinEdge Analytics", text: "We needed a complex financial dashboard with real-time data processing. CODEMAFIA delivered on time, communicated clearly throughout, and the system has been rock-solid since launch.", image: "TO" },
  { name: "Emeka N.", role: "Director, LearnFirst Institute", text: "The learning platform CODEMAFIA built for us handles thousands of concurrent users without breaking a sweat. The team's attention to UX and performance set them apart from every other agency we interviewed.", image: "EN" },
];

const faqs = [
  { q: "What kind of projects do you take on?", a: "We build websites, web applications, dashboards, portals, e-commerce stores, booking platforms, MVPs, and internal business tools. If it involves writing code and solving a business problem, we're probably a good fit." },
  { q: "How long does a typical project take?", a: "A standard business website takes 2-4 weeks. Custom web applications and dashboards typically take 6-12 weeks. MVPs can be delivered in as little as 3-4 weeks. We'll give you a clear timeline during the proposal phase." },
  { q: "Do you work with startups or only established businesses?", a: "Both. We work with founders who have an idea and need a technical partner to build it, as well as established organizations looking to build or improve their digital products." },
  { q: "Can you redesign an existing website?", a: "Yes. We regularly take existing sites and redesign them — improving the visuals, performance, content structure, and user experience." },
  { q: "How do I get started?", a: "Click 'Start a Project' and fill out the form. We'll review it and get back to you within 24 hours with a clear next step — whether that's a discovery call, a proposal, or a quick yes/no on fit." },
];

const blogPosts = [
  { slug: "building-production-apis-nextjs", category: "Web Development", title: "Building Production-Ready APIs with Next.js", date: "Jun 15, 2026", gradient: "from-blue-500/10 to-cyan-500/10" },
  { slug: "integrating-llms-web-apps", category: "Artificial Intelligence", title: "Integrating LLMs Into Your Web Applications", date: "Jun 10, 2026", gradient: "from-purple-500/10 to-pink-500/10" },
  { slug: "self-taught-to-software-engineer", category: "Career Growth", title: "From Self-Taught to Software Engineer: A Roadmap", date: "Jun 5, 2026", gradient: "from-emerald-500/10 to-teal-500/10" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
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

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <Hero />

      {/* What We Build */}
      <section id="services" className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/30 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            className="text-center mb-16"
          >
            <span className="section-label">WHAT WE BUILD</span>
            <h2 className="section-heading">
              Digital Products for <span className="text-gradient">Real Business Needs</span>
            </h2>
            <p className="section-subtitle mt-4 mx-auto">
              From websites to custom platforms — we deliver digital products that work for your business.
            </p>
          </motion.div>

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
                <Link href="/services" className="relative block p-6 md:p-8">
                  <div className="mb-4">
                    <ServiceIcon id={service.id} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-gold transition-colors">
                    {service.title}
                  </h3>
                  <span className="inline-block text-[11px] uppercase tracking-wider text-gold/70 mb-3">
                    For {service.for}
                  </span>
                  <p className="text-muted text-sm leading-relaxed">{service.description}</p>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
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

      {/* Selected Work */}
      <section id="work" className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.02] to-transparent" />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)" }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            className="text-center mb-16"
          >
            <span className="section-label">SELECTED WORK</span>
            <h2 className="section-heading">
              Projects We&apos;ve <span className="text-gradient">Built</span>
            </h2>
            <p className="section-subtitle mt-4 mx-auto">
              Real platforms, real scale — from marketplaces to fintech dashboards.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-3 gap-5"
          >
            {featuredProjects.map((project) => (
              <motion.div
                key={project.id}
                variants={cardVariants}
                className="group relative rounded-2xl glass glass-hover overflow-hidden"
              >
                <Link href={`/work/${project.id}`} className="relative block p-6 md:p-8">
                  <div className="text-3xl mb-4">{project.icon}</div>
                  <h3 className="text-lg font-bold text-white mb-3 group-hover:text-gold transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-muted text-sm leading-relaxed mb-6">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tech.map((t) => (
                      <span key={t} className="px-2.5 py-1 rounded-md bg-white/5 text-xs text-muted">{t}</span>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-white/5">
                    <span className="text-sm text-gold font-semibold">{project.results}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
            className="text-center mt-12"
          >
            <Link
              href="/work"
              className="px-8 py-4 rounded-xl bg-gold-gradient text-background font-bold text-base hover:shadow-gold hover:scale-[1.02] transition-all duration-300 inline-block"
            >
              View All Projects
            </Link>
          </motion.div>
        </div>
      </section>

      {/* How We Work */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/30 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            className="text-center mb-16"
          >
            <span className="section-label">HOW WE WORK</span>
            <h2 className="section-heading">
              From Concept to <span className="text-gradient">Launch</span>
            </h2>
            <p className="section-subtitle mt-4 mx-auto">
              A structured process that keeps your project on track and on budget.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-5">
            {[
              { step: "01", title: "Discovery", desc: "We learn about your business, goals, users, and requirements. This phase sets the foundation for everything that follows." },
              { step: "02", title: "Strategy", desc: "We define scope, architecture, design direction, timeline, and deliverables. You get a clear roadmap before we build anything." },
              { step: "03", title: "Build", desc: "We design and develop your product iteratively. Regular updates keep you involved and aligned throughout the process." },
              { step: "04", title: "Launch & Support", desc: "We deploy, test, and go live. Then we stay on board for maintenance, monitoring, and continued improvements." },
            ].map((phase) => (
              <motion.div
                key={phase.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: Number(phase.step) * 0.1 }}
                className="glass rounded-2xl p-6 md:p-8 text-center"
              >
                <div className="text-3xl font-bold text-gold mb-3">{phase.step}</div>
                <h3 className="text-base font-bold text-white mb-3">{phase.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{phase.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why CODEMAFIA */}
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
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            className="text-center mb-16"
          >
            <span className="section-label">WHY CODEMAFIA</span>
            <h2 className="section-heading">
              Built to <span className="text-gradient">Deliver</span>
            </h2>
            <p className="section-subtitle mt-4 mx-auto">
              What makes working with us different from a typical agency.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-3 gap-5"
          >
            {[
              { title: "Custom Solutions, Not Templates", desc: "Every project is built from the ground up for your specific needs. No off-the-shelf shortcuts." },
              { title: "Design & Engineering in One Place", desc: "No handoff between a designer and a developer who never talk. We do both, in sync." },
              { title: "We Think About Your Business", desc: "We ask why before we write a line of code. Your goals shape the architecture." },
              { title: "Transparent Process, Clear Communication", desc: "No black boxes. You'll always know what's happening and when to expect it." },
              { title: "Long-Term Thinking", desc: "We build things that are maintainable, scalable, and built to last — not quick fixes." },
              { title: "Launched and Supported", desc: "We don't disappear after launch. We stay on board for support, updates, and growth." },
            ].map((reason) => (
              <motion.div
                key={reason.title}
                variants={cardVariants}
                className="glass rounded-2xl p-6 md:p-8"
              >
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center mb-5">
                  <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-white mb-3">{reason.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{reason.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/30 to-transparent" />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)" }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            className="text-center mb-16"
          >
            <span className="section-label">CLIENTS</span>
            <h2 className="section-heading">
              What Our <span className="text-gradient">Clients Say</span>
            </h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-3 gap-5"
          >
            {testimonials.map((t) => (
              <motion.div
                key={t.name}
                variants={cardVariants}
                className="glass rounded-2xl p-6 md:p-8"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-full bg-gold-gradient flex items-center justify-center text-sm font-bold text-background">
                    {t.image}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    <div className="text-xs text-muted">{t.role}</div>
                  </div>
                </div>
                <p className="text-sm text-muted leading-relaxed">&ldquo;{t.text}&rdquo;</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.02] to-transparent" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            className="text-center mb-14"
          >
            <span className="section-label">COMMON QUESTIONS</span>
            <h2 className="section-heading">
              Everything You Need to <span className="text-gradient">Know</span>
            </h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-3"
          >
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                variants={cardVariants}
                className="glass rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 md:p-8 text-left"
                  aria-expanded={openFaq === i}
                >
                  <span className="text-sm md:text-base font-semibold text-white pr-4">{faq.q}</span>
                  <motion.span
                    animate={{ rotate: openFaq === i ? 45 : 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="text-gold shrink-0 text-xl leading-none"
                  >
                    +
                  </motion.span>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 md:px-8 pb-6 md:pb-8">
                        <p className="text-muted text-sm leading-relaxed">{faq.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-10"
          >
            <Link
              href="/faq"
              className="px-6 py-3 rounded-xl border border-white/10 text-white font-semibold text-sm hover:bg-white/5 hover:border-white/20 transition-all duration-300 inline-block"
            >
              Read All FAQs →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Blog */}
      <section id="insights" className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/30 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            className="text-center mb-16"
          >
            <span className="section-label">INSIGHTS</span>
            <h2 className="section-heading">
              Engineering & Product <span className="text-gradient">Insights</span>
            </h2>
            <p className="section-subtitle mt-4 mx-auto">
              Deep dives, product strategy, and lessons from building real digital products.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-3 gap-5"
          >
            {blogPosts.map((post) => (
              <motion.div
                key={post.slug}
                variants={cardVariants}
                className="group relative rounded-2xl glass glass-hover overflow-hidden"
              >
                <Link href={`/insights/${post.slug}`} className="block">
                  <div className={`absolute inset-0 bg-gradient-to-br ${post.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="relative p-6 md:p-8">
                    <span className="inline-block text-xs font-semibold uppercase tracking-wider text-gold mb-3">
                      {post.category}
                    </span>
                    <h3 className="text-base font-bold text-white mb-3 leading-snug group-hover:text-gold transition-colors">
                      {post.title}
                    </h3>
                    <span className="text-xs text-muted">{post.date}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
            className="text-center mt-12"
          >
            <Link
              href="/insights"
              className="px-8 py-4 rounded-xl border border-white/10 text-white font-bold text-base hover:bg-white/5 hover:border-white/20 transition-all duration-300 inline-block"
            >
              Read All Articles
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/50 to-transparent pointer-events-none" />
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
              Tell us what you&apos;re building. We&apos;ll get back to you within 24 hours with a clear next step.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
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
