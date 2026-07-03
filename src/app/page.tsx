"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Hero from "@/components/hero";
import Tech from "@/components/tech";

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
    id: "lms-platform",
    title: "Learning Management System",
    description: "A comprehensive online learning platform supporting 10,000+ concurrent users with live coding environments, assessments, and certification workflows.",
    icon: "📚",
    tech: ["React", "Python", "Django"],
    results: "8,000+ active users, 95% completion rate",
  },
  {
    id: "fintech-dashboard",
    title: "Fintech Dashboard",
    description: "An enterprise financial analytics dashboard processing millions in daily transactions. Real-time reporting, fraud detection, and multi-currency support.",
    icon: "📊",
    tech: ["TypeScript", "Next.js", "Supabase"],
    results: "40% faster decisions, $2M+ fraud prevented",
  },
];

const services = [
  {
    id: "web-development",
    title: "Websites & Brand Platforms",
    description: "From company websites to marketing sites — we build fast, beautiful web experiences that represent your brand and drive results.",
    icon: "globe",
    price: "Starting from ₦250,000",
  },
  {
    id: "custom-applications",
    title: "Custom Web Applications",
    description: "Tailored platforms, internal tools, and business software built to your exact requirements. Scalable, secure, and built for the real world.",
    icon: "app",
    price: "Custom Quote",
  },
  {
    id: "portals",
    title: "Dashboards & Client Portals",
    description: "Admin dashboards, client portals, analytics interfaces, and internal management systems that put your data and operations at your fingertips.",
    icon: "dashboard",
    price: "Custom Quote",
  },
  {
    id: "ecommerce",
    title: "E-Commerce & Marketplaces",
    description: "Online stores, multi-vendor marketplaces, booking platforms, and subscription-based products designed to sell, scale, and convert.",
    icon: "cart",
    price: "Starting from ₦500,000",
  },
  {
    id: "design",
    title: "Product Design & UX",
    description: "User research, wireframing, prototyping, and visual design. We create interfaces that are intuitive, accessible, and beautiful.",
    icon: "design",
    price: "Starting from ₦150,000",
  },
  {
    id: "consulting",
    title: "Technical Consulting",
    description: "Architecture review, technology strategy, code audits, and fractional CTO guidance for startups and growing teams.",
    icon: "consult",
    price: "Custom Quote",
  },
];

const ServiceIcon = ({ id }: { id: string }) => {
  if (id === "web-development") return (
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
  if (id === "custom-applications") return (
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
    </svg>
  );
  if (id === "portals") return (
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" />
    </svg>
  );
  if (id === "ecommerce") return (
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
  if (id === "design") return (
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19l7-7 3 3-7 7-3-3z" /><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" /><path d="M2 2l7.586 7.586" /><circle cx="11" cy="11" r="2" />
    </svg>
  );
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
};

const testimonials = [
  { name: "Kunle A.", role: "Founder, VendSpace Marketplace", text: "CODEMAFIA built our entire marketplace platform from scratch. The team understood our vision immediately and delivered a product that exceeded our expectations. Our vendors love the dashboard.", image: "KA" },
  { name: "Tara O.", role: "CTO, FinEdge Analytics", text: "We needed a complex financial dashboard with real-time data processing. CODEMAFIA delivered on time, communicated clearly throughout, and the system has been rock-solid since launch.", image: "TO" },
  { name: "Emeka N.", role: "Director, LearnFirst Institute", text: "The learning platform CODEMAFIA built for us handles thousands of concurrent users without breaking a sweat. The team's attention to UX and performance set them apart from every other agency we interviewed.", image: "EN" },
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
  return (
    <>
      <Hero />

      {/* Featured Projects */}
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
              Products We&apos;ve <span className="text-gradient">Built</span>
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
                <Link href={`/projects/${project.id}`} className="relative block p-6 md:p-8">
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
              href="/projects"
              className="px-8 py-4 rounded-xl border border-white/10 text-white font-bold text-base hover:bg-white/5 hover:border-white/20 transition-all duration-300 inline-block"
            >
              View All Projects
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Services Overview */}
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
            <span className="section-label">SERVICES</span>
            <h2 className="section-heading">
              What We <span className="text-gradient">Build</span>
            </h2>
            <p className="section-subtitle mt-4 mx-auto">
              From business websites to custom platforms — we deliver digital products that work.
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
                <Link href="/hire" className="relative block p-6 md:p-8">
                  <div className="mb-4">
                    <ServiceIcon id={service.id} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3 group-hover:text-gold transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-muted text-sm leading-relaxed mb-6">{service.description}</p>
                  <div className="inline-block px-4 py-2 rounded-full glass text-sm text-gold font-semibold">
                    {service.price}
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
              href="/hire"
              className="px-8 py-4 rounded-xl bg-gold-gradient text-background font-bold text-base hover:shadow-gold hover:scale-[1.02] transition-all duration-300 inline-block"
            >
              Discuss Your Project
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Why Choose CODEMAFIA */}
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
              Built Different. <span className="text-gradient">Delivered Better.</span>
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
              { title: "Premium Design & UX", desc: "We don't just write code — we craft experiences. Every interface we build is designed to be intuitive, accessible, and visually polished." },
              { title: "Strong Engineering", desc: "Our team builds with modern, scalable technologies. You get a product that performs, stays reliable as you grow, and is maintainable long-term." },
              { title: "Product-Minded Thinking", desc: "We ask the right questions before we write a line of code. We think about your users, your business goals, and what actually needs to be built." },
              { title: "Clear Communication", desc: "No black boxes. We keep you informed at every stage — from planning through launch. You'll always know where your project stands." },
              { title: "Reliable Delivery", desc: "We set realistic timelines and deliver on them. Our process is structured enough to be predictable without sacrificing flexibility." },
              { title: "Post-Launch Support", desc: "Launch day isn't the end. We provide ongoing maintenance, monitoring, and support to keep your product running smoothly." },
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

      {/* Process */}
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
              From Idea to <span className="text-gradient">Launch</span>
            </h2>
            <p className="section-subtitle mt-4 mx-auto">
              A structured process that keeps your project on track and on budget.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-5">
            {[
              { step: "01", title: "Discovery", desc: "We learn about your business, goals, users, and requirements. This phase sets the foundation for everything that follows." },
              { step: "02", title: "Planning", desc: "We define scope, architecture, design direction, timeline, and deliverables. You get a clear roadmap before we build anything." },
              { step: "03", title: "Design & Build", desc: "We design and develop your product iteratively. Regular updates keep you involved and aligned throughout the process." },
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

      {/* Testimonials */}
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
            <span className="section-label">CLIENT STORIES</span>
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

      {/* Blog Highlights */}
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
              Thoughts on <span className="text-gradient">Building Products</span>
            </h2>
            <p className="section-subtitle mt-4 mx-auto">
              Engineering deep dives, product strategy, and lessons from building real digital products.
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
              Let&apos;s talk about your idea. Whether it&apos;s a website, a dashboard, an online store, or a custom platform — we can build it.
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
              href="/hire"
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
