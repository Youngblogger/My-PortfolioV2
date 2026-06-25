"use client";

import { motion } from "framer-motion";

const posts = [
  {
    category: "Full-Stack Development",
    title: "Building Production-Ready APIs with Next.js",
    excerpt: "A comprehensive guide to designing, building, and deploying scalable APIs using Next.js route handlers and modern backend patterns.",
    date: "Jun 15, 2026",
    readTime: "8 min read",
    gradient: "from-blue-500/10 to-cyan-500/10",
  },
  {
    category: "Artificial Intelligence",
    title: "Integrating LLMs Into Your Web Applications",
    excerpt: "Learn how to leverage large language models to add intelligent features to your web applications — from chatbots to content generation.",
    date: "Jun 10, 2026",
    readTime: "12 min read",
    gradient: "from-purple-500/10 to-pink-500/10",
  },
  {
    category: "Career Growth",
    title: "From Self-Taught to Software Engineer: A Roadmap",
    excerpt: "A practical step-by-step guide to transitioning from self-taught developer to professional software engineer in today&apos;s competitive market.",
    date: "Jun 5, 2026",
    readTime: "10 min read",
    gradient: "from-emerald-500/10 to-teal-500/10",
  },
  {
    category: "Software Architecture",
    title: "Microservices vs Monoliths: Making the Right Choice",
    excerpt: "An honest, practical comparison of microservices and monolithic architectures with real-world tradeoffs and decision frameworks.",
    date: "May 28, 2026",
    readTime: "15 min read",
    gradient: "from-orange-500/10 to-amber-500/10",
  },
  {
    category: "Freelancing",
    title: "How to Build a Six-Figure Freelance Development Business",
    excerpt: "Proven strategies for finding clients, pricing your services, and scaling your freelance development business beyond hourly billing.",
    date: "May 20, 2026",
    readTime: "7 min read",
    gradient: "from-rose-500/10 to-pink-500/10",
  },
  {
    category: "Startup Building",
    title: "Validating Your SaaS Idea Before Writing Code",
    excerpt: "Save months of development time by learning how to validate your startup idea effectively before building a full product.",
    date: "May 12, 2026",
    readTime: "9 min read",
    gradient: "from-yellow-500/10 to-orange-500/10",
  },
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

export default function Insights() {
  return (
    <section id="insights" className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-surface/50 via-transparent to-surface/50 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
        >
          <span className="section-label">INSIGHTS</span>
          <h2 className="section-heading mt-2">
            Thoughts, Tutorials &{" "}
            <span className="text-gradient">Industry Knowledge</span>
          </h2>
          <p className="section-subtitle mt-4">
            Deep dives into software engineering, AI, career growth, and
            building technology products.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-12 md:mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {posts.map((post) => (
            <motion.article
              key={post.title}
              variants={cardVariants}
              className="group relative rounded-2xl glass overflow-hidden cursor-pointer"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${post.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />
              <div className="relative p-6 md:p-8">
                <div className="flex items-center gap-3 text-xs text-muted mb-4">
                  <span className="px-2.5 py-1 rounded-full bg-gold/10 text-gold border border-gold/20">
                    {post.category}
                  </span>
                  <span>{post.readTime}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-gold transition-colors duration-300 leading-snug">
                  {post.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed mb-4">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-xs text-muted">{post.date}</span>
                  <span className="text-xs text-gold group-hover:translate-x-1 transition-transform duration-300">
                    Read More →
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 text-center"
        >
          <a
            href="#"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-all duration-300"
          >
            View All Articles
            <span>→</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
