"use client";

import { motion } from "framer-motion";

const caseStudies = [
  {
    title: "Marketplace Platform",
    challenge: "Built a scalable multi-vendor marketplace connecting artisans across Africa with global buyers, handling complex payment processing and logistics.",
    solution: "Architected a microservices-based platform with real-time inventory management, escrow payment system, and AI-powered product recommendations.",
    tech: ["Next.js", "Node.js", "PostgreSQL", "Redis", "AWS"],
    results: "10,000+ vendors onboarded, 50,000+ monthly transactions, 99.9% uptime",
    image: "🛒",
  },
  {
    title: "Learning Management System",
    challenge: "Designed a comprehensive LMS for CODEMAFIA Academy supporting 10,000+ concurrent students with live coding environments and assessments.",
    solution: "Built a real-time collaborative learning platform with integrated code editors, video streaming, progress tracking, and automated grading.",
    tech: ["React", "Python", "Django", "WebSocket", "Docker"],
    results: "8,000+ active students, 95% completion rate, 4.8/5 average rating",
    image: "📚",
  },
  {
    title: "Fintech Dashboard",
    challenge: "Created an enterprise financial analytics dashboard for a leading African fintech startup processing millions in daily transactions.",
    solution: "Developed a real-time data visualization platform with multi-currency support, fraud detection alerts, and regulatory compliance reporting.",
    tech: ["TypeScript", "Next.js", "Supabase", "D3.js", "Tailwind"],
    results: "40% faster decision-making, $2M+ fraud prevented, enterprise adoption",
    image: "📊",
  },
  {
    title: "Restaurant Ordering Platform",
    challenge: "Built a complete digital ordering ecosystem for a restaurant chain with online ordering, table management, and delivery logistics.",
    solution: "Created a white-label ordering platform with QR code menus, real-time order tracking, kitchen display system, and delivery route optimization.",
    tech: ["React Native", "Node.js", "MongoDB", "Socket.io", "Google Cloud"],
    results: "300% increase in online orders, 60% reduction in wait times",
    image: "🍽",
  },
  {
    title: "AI Content Platform",
    challenge: "Developed an AI-powered content generation platform helping businesses create marketing copy, blog posts, and social media content at scale.",
    solution: "Built a platform leveraging LLMs with custom fine-tuning for African markets, multi-language support, and brand voice customization.",
    tech: ["Next.js", "Python", "FastAPI", "LangChain", "OpenAI"],
    results: "5,000+ business users, 1M+ content pieces generated",
    image: "🤖",
  },
  {
    title: "SaaS Analytics Tool",
    challenge: "Created a multi-tenant SaaS analytics platform providing real-time business intelligence for small and medium enterprises across Africa.",
    solution: "Designed a scalable analytics infrastructure with customizable dashboards, automated reporting, and predictive analytics powered by machine learning.",
    tech: ["React", "Node.js", "PostgreSQL", "Apache Kafka", "Docker"],
    results: "500+ business subscribers, 99.99% data accuracy",
    image: "📈",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function Build() {
  return (
    <section id="build" className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-surface/50 via-transparent to-surface/50 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
        >
          <span className="section-label">BUILD</span>
          <h2 className="section-heading mt-2">
            Real Projects.
            <br />
            <span className="text-gradient">Real Results.</span>
          </h2>
          <p className="section-subtitle mt-4">
            Enterprise-grade solutions we&apos;ve built for startups, businesses, and
            institutions across Africa and beyond.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-12 md:mt-16 grid md:grid-cols-2 gap-6"
        >
          {caseStudies.map((study) => (
            <motion.div
              key={study.title}
              variants={cardVariants}
              className="group relative rounded-2xl glass overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative p-6 md:p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="text-4xl flex-shrink-0">{study.image}</div>
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-gold transition-colors duration-300">
                      {study.title}
                    </h3>
                    <span className="text-xs text-muted uppercase tracking-wider mt-1 block">
                      Case Study
                    </span>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <h4 className="text-xs font-semibold text-gold uppercase tracking-wider mb-2">
                      The Challenge
                    </h4>
                    <p className="text-sm text-muted leading-relaxed">
                      {study.challenge}
                    </p>
                  </div>
                  <div className="border-t border-white/[0.03] pt-5">
                    <h4 className="text-xs font-semibold text-gold uppercase tracking-wider mb-2">
                      Our Solution
                    </h4>
                    <p className="text-sm text-muted leading-relaxed">
                      {study.solution}
                    </p>
                  </div>
                  <div className="border-t border-white/[0.03] pt-5">
                    <h4 className="text-xs font-semibold text-gold uppercase tracking-wider mb-2.5">
                      Technologies
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {study.tech.map((t) => (
                        <span
                          key={t}
                          className="px-3 py-1 rounded-md bg-white/[0.03] border border-white/[0.06] text-xs text-muted"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-white/[0.03] pt-5">
                    <h4 className="text-xs font-semibold text-gold uppercase tracking-wider mb-2">
                      Results
                    </h4>
                    <p className="text-sm text-white/80 font-medium leading-relaxed">
                      {study.results}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between">
                  <a
                    href="#"
                    className="text-sm text-gold hover:text-white transition-colors flex items-center gap-1.5 group"
                  >
                    <span>View Case Study</span>
                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </a>
                  <a
                    href="#"
                    className="text-sm text-muted hover:text-white transition-colors"
                  >
                    Live Demo ↗
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
