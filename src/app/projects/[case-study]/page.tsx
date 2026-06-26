"use client";

import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

const projects = [
  { id: "marketplace-platform", title: "Marketplace Platform", description: "A scalable multi-vendor marketplace connecting artisans across Africa with global buyers.", icon: "🛒", tech: ["Next.js", "Node.js", "PostgreSQL", "Redis", "AWS"], results: "10,000+ vendors, 50,000+ monthly transactions", gradient: "from-blue-500/10 to-cyan-500/10" },
  { id: "lms-platform", title: "Learning Management System", description: "A comprehensive LMS for CODEMAFIA Academy supporting 10,000+ concurrent students.", icon: "📚", tech: ["React", "Python", "Django", "WebSocket", "Docker"], results: "8,000+ active students, 95% completion rate", gradient: "from-green-500/10 to-emerald-500/10" },
  { id: "fintech-dashboard", title: "Fintech Dashboard", description: "An enterprise financial analytics dashboard processing millions in daily transactions.", icon: "📊", tech: ["TypeScript", "Next.js", "Supabase", "D3.js", "Tailwind"], results: "40% faster decisions, $2M+ fraud prevented", gradient: "from-purple-500/10 to-violet-500/10" },
  { id: "restaurant-platform", title: "Restaurant Ordering Platform", description: "A complete digital ordering ecosystem with online ordering, table management, and delivery logistics.", icon: "🍽", tech: ["React Native", "Node.js", "MongoDB", "Socket.io", "GCP"], results: "300% increase in online orders, 60% less wait time", gradient: "from-orange-500/10 to-amber-500/10" },
  { id: "ai-content-platform", title: "AI Content Platform", description: "An AI-powered content generation platform for marketing copy, blogs, and social media at scale.", icon: "🤖", tech: ["Next.js", "Python", "FastAPI", "LangChain", "OpenAI"], results: "5,000+ business users, 1M+ content pieces", gradient: "from-pink-500/10 to-rose-500/10" },
  { id: "saas-analytics", title: "SaaS Analytics Tool", description: "A multi-tenant analytics platform providing real-time business intelligence for SMEs across Africa.", icon: "📈", tech: ["React", "Node.js", "PostgreSQL", "Kafka", "Docker"], results: "500+ subscribers, 99.99% data accuracy", gradient: "from-yellow-500/10 to-orange-500/10" },
];

const details: Record<string, { challenge: string; solution: string; architecture: string[]; results: string[] }> = {
  "marketplace-platform": {
    challenge: "Built a scalable multi-vendor marketplace connecting artisans across Africa with global buyers, handling complex payment processing and logistics across multiple currencies and regions.",
    solution: "Architected a microservices-based platform with real-time inventory management, escrow payment system, AI-powered product recommendations, and multi-currency support.",
    architecture: ["Microservices architecture", "Event-driven design", "CQRS pattern", "Horizontal scaling"],
    results: ["10,000+ vendors onboarded", "50,000+ monthly transactions", "99.9% uptime SLA", "40% reduction in cart abandonment"],
  },
  "lms-platform": {
    challenge: "Designed a comprehensive LMS supporting 10,000+ concurrent students with live coding environments, real-time assessments, and collaborative learning features.",
    solution: "Built a real-time collaborative learning platform with integrated code editors, video streaming, progress tracking, automated grading, and peer review system.",
    architecture: ["Micro-frontends", "WebSocket real-time sync", "Event sourcing", "CDN-optimized delivery"],
    results: ["8,000+ active students", "95% course completion rate", "4.8/5 average rating", "50% reduction in churn"],
  },
  "fintech-dashboard": {
    challenge: "Created an enterprise financial analytics dashboard for a leading African fintech startup processing millions in daily transactions across multiple currencies.",
    solution: "Developed a real-time data visualization platform with multi-currency support, fraud detection alerts, regulatory compliance reporting, and predictive analytics.",
    architecture: ["Real-time data pipeline", "Stream processing", "Columnar database", "Microservices"],
    results: ["40% faster decision-making", "$2M+ fraud prevented", "Enterprise-wide adoption", "99.99% uptime"],
  },
  "restaurant-platform": {
    challenge: "Built a complete digital ordering ecosystem for a restaurant chain with online ordering, table management, delivery logistics, and kitchen display integration.",
    solution: "Created a white-label ordering platform with QR code menus, real-time order tracking, kitchen display system, delivery route optimization, and multi-branch management.",
    architecture: ["White-label architecture", "Real-time order flow", "Route optimization engine", "Multi-tenant database"],
    results: ["300% increase in online orders", "60% reduction in wait times", "4 branches onboarded", "25% revenue increase"],
  },
  "ai-content-platform": {
    challenge: "Developed an AI-powered content generation platform helping businesses create marketing copy, blog posts, and social media content at scale across multiple languages.",
    solution: "Built a platform leveraging LLMs with custom fine-tuning for African markets, multi-language support, brand voice customization, and performance analytics.",
    architecture: ["LLM orchestration layer", "Fine-tuning pipeline", "Multi-model routing", "Feedback loop system"],
    results: ["5,000+ business users", "1M+ content pieces generated", "85% user satisfaction", "45% time savings"],
  },
  "saas-analytics": {
    challenge: "Created a multi-tenant SaaS analytics platform providing real-time business intelligence for small and medium enterprises across Africa.",
    solution: "Designed a scalable analytics infrastructure with customizable dashboards, automated reporting, predictive analytics powered by machine learning, and data export.",
    architecture: ["Multi-tenant data isolation", "Real-time aggregation", "Predictive ML models", "Self-service analytics"],
    results: ["500+ business subscribers", "99.99% data accuracy", "60% faster reporting", "NPS score of 72"],
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
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

export default function CaseStudyDetailPage() {
  const params = useParams();
  const project = projects.find((p) => p.id === params["case-study"]);

  if (!project) {
    notFound();
  }

  const detail = details[project.id];

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
              href="/projects"
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-gold transition-colors duration-300 mb-8"
            >
              ← Back to Projects
            </Link>
            <div className="text-5xl mb-6">{project.icon}</div>
            <h1 className="section-heading max-w-4xl">
              {project.title}
            </h1>
            <p className="section-subtitle mt-4 max-w-2xl">
              {project.description}
            </p>
            <div className="flex flex-wrap gap-2 mt-6">
              {project.tech.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1.5 rounded-lg glass text-xs text-muted"
                >
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/50 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            className="mb-12"
          >
            <span className="section-label">CHALLENGE</span>
            <h2 className="section-heading mt-2">
              The
              <br />
              <span className="text-gradient">Challenge</span>
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div
              variants={fadeUp}
              className="glass rounded-2xl p-8 md:p-10"
            >
              <p className="text-white/80 text-base md:text-lg leading-relaxed">
                {detail.challenge}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            className="mb-12"
          >
            <span className="section-label">SOLUTION</span>
            <h2 className="section-heading mt-2">
              Our
              <br />
              <span className="text-gradient">Solution</span>
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div
              variants={fadeUp}
              className="glass rounded-2xl p-8 md:p-10"
            >
              <p className="text-white/80 text-base md:text-lg leading-relaxed">
                {detail.solution}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/50 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            className="mb-12"
          >
            <span className="section-label">ARCHITECTURE</span>
            <h2 className="section-heading mt-2">
              System
              <br />
              <span className="text-gradient">Architecture</span>
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {detail.architecture.map((item) => (
              <motion.div
                key={item}
                variants={fadeUp}
                className="glass rounded-2xl p-5 text-center"
              >
                <span className="text-sm text-white/80 font-medium">{item}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            className="mb-12"
          >
            <span className="section-label">IMPACT</span>
            <h2 className="section-heading mt-2">
              Results &amp;
              <br />
              <span className="text-gradient">Impact</span>
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 gap-4"
          >
            {detail.results.map((result) => (
              <motion.div
                key={result}
                variants={fadeUp}
                className="glass rounded-2xl p-5 flex items-start gap-3"
              >
                <span className="text-gold shrink-0 mt-0.5">✓</span>
                <span className="text-white/80 text-sm">{result}</span>
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
              Interested in a
              <br />
              <span className="text-gradient">Similar Project?</span>
            </h2>
            <p className="text-lg md:text-xl text-muted mt-6 max-w-2xl mx-auto leading-relaxed">
              Let&apos;s build something impactful together. Reach out and we&apos;ll discuss your vision.
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
              href="/hire/request-quote"
              className="px-8 py-4 rounded-xl bg-gold-gradient text-background font-bold text-base hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
            >
              Request a Quote
            </Link>
            <Link
              href="/projects"
              className="px-8 py-4 rounded-xl border border-white/10 text-white font-bold text-base hover:bg-white/5 transition-all duration-300"
            >
              View All Projects
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
