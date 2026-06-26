"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import PageHeader from "@/components/pages/PageHeader";

const categories = ["All", "Full-Stack Development", "Artificial Intelligence", "Career Growth", "Software Architecture", "Freelancing", "Startup Building"];

const posts = [
  { slug: "building-production-apis-nextjs", category: "Full-Stack Development", title: "Building Production-Ready APIs with Next.js", excerpt: "A comprehensive guide to designing, building, and deploying scalable APIs using Next.js route handlers and modern backend patterns.", date: "Jun 15, 2026", readTime: "8 min read", gradient: "from-blue-500/10 to-cyan-500/10" },
  { slug: "integrating-llms-web-apps", category: "Artificial Intelligence", title: "Integrating LLMs Into Your Web Applications", excerpt: "Learn how to leverage large language models to add intelligent features to your web applications.", date: "Jun 10, 2026", readTime: "12 min read", gradient: "from-purple-500/10 to-pink-500/10" },
  { slug: "self-taught-to-software-engineer", category: "Career Growth", title: "From Self-Taught to Software Engineer: A Roadmap", excerpt: "A practical step-by-step guide to transitioning from self-taught developer to professional software engineer.", date: "Jun 5, 2026", readTime: "10 min read", gradient: "from-emerald-500/10 to-teal-500/10" },
  { slug: "microservices-vs-monoliths", category: "Software Architecture", title: "Microservices vs Monoliths: Making the Right Choice", excerpt: "An honest, practical comparison of microservices and monolithic architectures with real-world tradeoffs.", date: "May 28, 2026", readTime: "15 min read", gradient: "from-orange-500/10 to-amber-500/10" },
  { slug: "six-figure-freelance-business", category: "Freelancing", title: "How to Build a Six-Figure Freelance Development Business", excerpt: "Proven strategies for finding clients, pricing your services, and scaling your freelance development business.", date: "May 20, 2026", readTime: "7 min read", gradient: "from-rose-500/10 to-pink-500/10" },
  { slug: "validate-saas-idea", category: "Startup Building", title: "Validating Your SaaS Idea Before Writing Code", excerpt: "Save months of development time by learning how to validate your startup idea effectively before building a full product.", date: "May 12, 2026", readTime: "9 min read", gradient: "from-yellow-500/10 to-orange-500/10" },
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

export default function InsightsPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredPosts = activeCategory === "All"
    ? posts
    : posts.filter((post) => post.category === activeCategory);

  return (
    <>
      <PageHeader
        label="INSIGHTS"
        title="Thoughts, Tutorials &"
        highlight="Industry Knowledge"
        description="Deep dives into software engineering, AI, career growth, and building technology products."
      />

      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/30 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeCategory === category
                    ? "bg-gold-gradient text-background"
                    : "glass text-muted hover:text-white hover:border-white/20"
                }`}
              >
                {category}
              </button>
            ))}
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
            key={activeCategory}
          >
            <AnimatePresence mode="popLayout">
              {filteredPosts.map((post) => (
                <motion.div
                  key={post.slug}
                  variants={cardVariants}
                  layout
                  className="group relative rounded-2xl glass glass-hover overflow-hidden"
                >
                  <Link href="#" className="block">
                    <div className={`absolute inset-0 bg-gradient-to-br ${post.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    <div className="relative p-6 md:p-8">
                      <span className="inline-block text-xs font-semibold uppercase tracking-wider text-gold mb-3">
                        {post.category}
                      </span>
                      <h3 className="text-lg font-bold text-white mb-3 leading-snug group-hover:text-gold transition-colors duration-300">
                        {post.title}
                      </h3>
                      <p className="text-muted text-sm leading-relaxed mb-6">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted">
                        <span>{post.date}</span>
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredPosts.length === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-muted py-20"
            >
              No articles found in this category yet.
            </motion.p>
          )}
        </div>
      </section>
    </>
  );
}
