"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Hero from "@/components/hero";
import Tech from "@/components/tech";

const learningPaths = [
  { id: "frontend", title: "Frontend Engineering", description: "Master React, Next.js, and modern frontend frameworks to build stunning user interfaces.", icon: "🖥", gradient: "from-blue-500/10 to-cyan-500/10" },
  { id: "fullstack", title: "Full-Stack Development", description: "Become a complete developer capable of building production-ready applications end-to-end.", icon: "🚀", gradient: "from-purple-500/10 to-violet-500/10" },
  { id: "ai", title: "AI Engineering", description: "Dive into machine learning, LLMs, and AI-powered applications that solve real problems.", icon: "🤖", gradient: "from-pink-500/10 to-rose-500/10" },
];

const featuredProjects = [
  { id: "marketplace-platform", title: "Marketplace Platform", description: "Multi-vendor marketplace connecting artisans across Africa with global buyers.", icon: "🛒", tech: ["Next.js", "Node.js", "PostgreSQL"], results: "10,000+ vendors, 50,000+ monthly transactions" },
  { id: "lms-platform", title: "Learning Management System", description: "Comprehensive LMS supporting 10,000+ concurrent students with live coding environments.", icon: "📚", tech: ["React", "Python", "Django"], results: "8,000+ active students, 95% completion rate" },
  { id: "fintech-dashboard", title: "Fintech Dashboard", description: "Enterprise financial analytics dashboard processing millions in daily transactions.", icon: "📊", tech: ["TypeScript", "Next.js", "Supabase"], results: "40% faster decisions, $2M+ fraud prevented" },
];

const services = [
  { id: "web-development", title: "Web Development", description: "From business websites to complex portals — we build web applications that drive results.", icon: "🌐", price: "Starting ₦250,000" },
  { id: "saas-development", title: "SaaS Development", description: "Custom SaaS platforms, CRM systems, and subscription-based applications tailored to your business.", icon: "☁️", price: "Custom Quote" },
  { id: "mobile-apps", title: "Mobile Apps", description: "Native and cross-platform mobile applications for iOS and Android that users love.", icon: "📱", price: "Starting ₦500,000" },
];

const testimonials = [
  { name: "Chioma O.", role: "Frontend Engineering Graduate", text: "CODEMAFIA transformed my career. The structured curriculum and mentorship helped me land my first developer role within 3 months of graduating.", image: "CO" },
  { name: "Samuel A.", role: "Full-Stack Developer", text: "The project-based learning approach at CODEMAFIA gave me real-world experience that made me job-ready. I built more in 12 weeks than I did in 2 years of self-learning.", image: "SA" },
  { name: "Blessing E.", role: "AI Engineering Student", text: "The AI Engineering track is incredible. Learning LLMs and building actual AI products gave me skills that are in high demand right now.", image: "BE" },
];

const blogPosts = [
  { slug: "building-production-apis-nextjs", category: "Full-Stack Development", title: "Building Production-Ready APIs with Next.js", date: "Jun 15, 2026", gradient: "from-blue-500/10 to-cyan-500/10" },
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

      {/* Academy Overview */}
      <section id="learn" className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/30 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            className="text-center mb-16"
          >
            <span className="section-label">ACADEMY</span>
            <h2 className="section-heading">
              Master Modern <span className="text-gradient">Software Development</span>
            </h2>
            <p className="section-subtitle mt-4 mx-auto">
              Industry-led courses designed to take you from beginner to production-ready engineer.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-3 gap-5"
          >
            {learningPaths.map((program) => (
              <motion.div
                key={program.id}
                variants={cardVariants}
                className="group relative rounded-2xl glass glass-hover overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${program.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative p-6 md:p-8">
                  <div className="text-3xl mb-4">{program.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-3">{program.title}</h3>
                  <p className="text-muted text-sm leading-relaxed mb-6">{program.description}</p>
                  <Link
                    href={`/academy/${program.id}`}
                    className="text-sm text-gold hover:text-white transition-colors duration-300 flex items-center gap-1 group/link"
                  >
                    View Program
                    <span className="transition-transform duration-300 group-hover/link:translate-x-1">→</span>
                  </Link>
                </div>
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
              href="/academy"
              className="px-8 py-4 rounded-xl bg-gold-gradient text-background font-bold text-base hover:shadow-gold hover:scale-[1.02] transition-all duration-300 inline-block"
            >
              Explore All Programs
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Projects */}
      <section id="build" className="relative py-24 md:py-32 overflow-hidden">
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
            <span className="section-label">PROJECTS</span>
            <h2 className="section-heading">
              Real Projects. <span className="text-gradient">Real Results.</span>
            </h2>
            <p className="section-subtitle mt-4 mx-auto">
              Enterprise-grade solutions we've built for startups, businesses, and institutions across Africa.
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
                    <span className="text-sm text-gold font-semibold">📈 {project.results}</span>
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
      <section id="hire" className="relative py-24 md:py-32 overflow-hidden">
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
              Build Your Next <span className="text-gradient">Digital Product</span>
            </h2>
            <p className="section-subtitle mt-4 mx-auto">
              From concept to launch — we partner with startups and enterprises to build world-class digital products.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-3 gap-5"
          >
            {services.map((service) => (
              <motion.div
                key={service.id}
                variants={cardVariants}
                className="group relative rounded-2xl glass glass-hover overflow-hidden"
              >
                <Link href={`/hire/${service.id}`} className="relative block p-6 md:p-8">
                  <div className="text-3xl mb-4">{service.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-gold transition-colors">{service.title}</h3>
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
              View All Services
            </Link>
          </motion.div>
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
            <span className="section-label">TESTIMONIALS</span>
            <h2 className="section-heading">
              What Our <span className="text-gradient">Students Say</span>
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
            <span className="section-label">BLOG</span>
            <h2 className="section-heading">
              Insights & <span className="text-gradient">Tutorials</span>
            </h2>
            <p className="section-subtitle mt-4 mx-auto">
              Deep dives into software engineering, AI, career growth, and building technology products.
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

      {/* Community + Final CTA */}
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
              Ready To Start Your
              <br />
              <span className="text-gradient">Journey?</span>
            </h2>
            <p className="text-lg md:text-xl text-muted mt-6 max-w-2xl mx-auto leading-relaxed">
              Join thousands of developers building the future of African technology.
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
              href="/academy"
              className="px-8 py-4 rounded-xl bg-gold-gradient text-background font-bold text-base hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
            >
              Enroll Now
            </Link>
            <Link
              href="/community"
              className="px-8 py-4 rounded-xl border border-white/10 text-white font-bold text-base hover:bg-white/5 hover:border-white/20 transition-all duration-300"
            >
              Join Community
            </Link>
            <Link
              href="/hire"
              className="px-8 py-4 rounded-xl border border-white/10 text-white font-bold text-base hover:bg-white/5 hover:border-white/20 transition-all duration-300"
            >
              Hire Us
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
