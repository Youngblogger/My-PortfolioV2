"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import PageHeader from "@/components/pages/PageHeader";

const projects = [
  { id: "marketplace-platform", title: "Marketplace Platform", description: "A scalable multi-vendor marketplace connecting artisans across Africa with global buyers.", icon: "🛒", tech: ["Next.js", "Node.js", "PostgreSQL", "Redis", "AWS"], results: "10,000+ vendors, 50,000+ monthly transactions", gradient: "from-blue-500/10 to-cyan-500/10" },
  { id: "lms-platform", title: "Learning Management System", description: "A comprehensive LMS for CODEMAFIA Academy supporting 10,000+ concurrent students.", icon: "📚", tech: ["React", "Python", "Django", "WebSocket", "Docker"], results: "8,000+ active students, 95% completion rate", gradient: "from-green-500/10 to-emerald-500/10" },
  { id: "fintech-dashboard", title: "Fintech Dashboard", description: "An enterprise financial analytics dashboard processing millions in daily transactions.", icon: "📊", tech: ["TypeScript", "Next.js", "Supabase", "D3.js", "Tailwind"], results: "40% faster decisions, $2M+ fraud prevented", gradient: "from-purple-500/10 to-violet-500/10" },
  { id: "restaurant-platform", title: "Restaurant Ordering Platform", description: "A complete digital ordering ecosystem with online ordering, table management, and delivery logistics.", icon: "🍽", tech: ["React Native", "Node.js", "MongoDB", "Socket.io", "GCP"], results: "300% increase in online orders, 60% less wait time", gradient: "from-orange-500/10 to-amber-500/10" },
  { id: "ai-content-platform", title: "AI Content Platform", description: "An AI-powered content generation platform for marketing copy, blogs, and social media at scale.", icon: "🤖", tech: ["Next.js", "Python", "FastAPI", "LangChain", "OpenAI"], results: "5,000+ business users, 1M+ content pieces", gradient: "from-pink-500/10 to-rose-500/10" },
  { id: "saas-analytics", title: "SaaS Analytics Tool", description: "A multi-tenant analytics platform providing real-time business intelligence for SMEs across Africa.", icon: "📈", tech: ["React", "Node.js", "PostgreSQL", "Kafka", "Docker"], results: "500+ subscribers, 99.99% data accuracy", gradient: "from-yellow-500/10 to-orange-500/10" },
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

export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        label="PROJECTS"
        title="Real Projects."
        highlight="Real Results."
        description="Enterprise-grade solutions we've built for startups, businesses, and institutions across Africa."
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
            {projects.map((project) => (
              <motion.div
                key={project.id}
                variants={cardVariants}
                className="group relative rounded-2xl glass glass-hover overflow-hidden"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />
                <Link href={`/projects/${project.id}`} className="relative block p-6 md:p-8">
                  <div className="text-3xl mb-4">{project.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {project.title}
                  </h3>
                  <p className="text-muted text-sm leading-relaxed mb-6">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.tech.map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-1 rounded-md bg-white/5 text-xs text-muted"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 text-sm text-gold font-semibold">
                      <span>📈</span>
                      {project.results}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}
