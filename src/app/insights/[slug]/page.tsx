"use client";

import { useParams, notFound } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import PageHeader from "@/components/pages/PageHeader";

const posts = [
  {
    slug: "building-production-apis-nextjs",
    category: "Full-Stack Development",
    title: "Building Production-Ready APIs with Next.js",
    content: "Next.js has evolved far beyond a simple React framework. With its route handlers, middleware, and edge runtime, it's now a powerful backend platform. In this article, we'll explore how to design, build, and deploy production-ready APIs using Next.js.\n\n## Why Next.js for APIs?\n\nNext.js provides a unified development experience where your frontend and backend live in the same codebase. This reduces context switching, simplifies deployment, and allows you to share types and utilities between client and server.\n\n## Route Handlers\n\nRoute handlers are the foundation of API routes in Next.js. They support all HTTP methods, dynamic routes, and middleware integration.\n\n## Database Integration\n\nConnect to any database using your preferred ORM. We'll look at Prisma, Drizzle, and raw SQL approaches.\n\n## Authentication\n\nImplement JWT-based authentication, OAuth providers, or session-based auth using NextAuth.js.\n\n## Deployment\n\nDeploy your Next.js API to Vercel, Docker, or any Node.js hosting platform with minimal configuration.",
    date: "Jun 15, 2026",
    readTime: "8 min read",
    author: "CODEMAFIA Team",
  },
  {
    slug: "integrating-llms-web-apps",
    category: "Artificial Intelligence",
    title: "Integrating LLMs Into Your Web Applications",
    content: "Large Language Models are transforming how users interact with software. This guide covers practical approaches to integrating LLMs into your web applications.\n\n## Choosing an LLM Provider\n\nCompare OpenAI, Anthropic, Google, and open-source models for different use cases and budgets.\n\n## Prompt Engineering\n\nCraft effective prompts that produce consistent, high-quality outputs from LLMs.\n\n## Streaming Responses\n\nImplement real-time streaming of LLM responses for a better user experience using Server-Sent Events.\n\n## Cost Optimization\n\nStrategies to reduce API costs while maintaining quality, including caching, batching, and model selection.",
    date: "Jun 10, 2026",
    readTime: "12 min read",
    author: "CODEMAFIA Team",
  },
  {
    slug: "self-taught-to-software-engineer",
    category: "Career Growth",
    title: "From Self-Taught to Software Engineer: A Roadmap",
    content: "Transitioning from self-taught developer to professional software engineer is challenging but achievable. Here's your roadmap.\n\n## Build a Foundation\n\nMaster the fundamentals: data structures, algorithms, and design patterns. These are non-negotiable for professional roles.\n\n## Create Projects\n\nBuild real projects that demonstrate your skills. Quality over quantity — one well-architected project is better than five tutorial clones.\n\n## Contribute to Open Source\n\nOpen source contributions are a fantastic way to gain experience, work with senior developers, and build your portfolio.\n\n## Network Strategically\n\nConnect with developers, attend meetups, and engage in communities. Most opportunities come through relationships.\n\n## Prepare for Interviews\n\nPractice coding challenges, system design discussions, and behavioral questions. Structured preparation makes the difference.",
    date: "Jun 5, 2026",
    readTime: "10 min read",
    author: "CODEMAFIA Team",
  },
  {
    slug: "microservices-vs-monoliths",
    category: "Software Architecture",
    title: "Microservices vs Monoliths: Making the Right Choice",
    content: "The architecture debate continues. Here's an honest, practical comparison to help you decide.\n\n## When Monoliths Win\n\nFor most startups and small teams, a well-structured monolith is the right choice. It's simpler to develop, deploy, and debug.\n\n## When Microservices Shine\n\nAs your team and codebase grow, microservices offer independent scaling, team autonomy, and deployment flexibility.\n\n## The Modular Monolith\n\nA middle ground that gives you the best of both worlds — clear module boundaries without distributed system complexity.\n\n## Migration Strategy\n\nIf you need to move from monolith to microservices, do it incrementally. Extract one service at a time based on business need.",
    date: "May 28, 2026",
    readTime: "15 min read",
    author: "CODEMAFIA Team",
  },
  {
    slug: "six-figure-freelance-business",
    category: "Freelancing",
    title: "How to Build a Six-Figure Freelance Development Business",
    content: "Freelancing offers freedom, but building a sustainable high-income business requires strategy.\n\n## Find Your Niche\n\nSpecializing in a specific technology or industry lets you charge premium rates and stand out from generalist developers.\n\n## Build a Sales System\n\nMost freelancers fail because they don't have a consistent client acquisition process. Build a system that generates leads predictably.\n\n## Price for Value\n\nStop charging by the hour. Price your services based on the value you deliver to the client's business.\n\n## Deliver Excellence\n\nHappy clients are your best marketing channel. Over-deliver on quality and communication to generate referrals.\n\n## Scale Beyond Yourself\n\nEventually, build a team or agency to take on larger projects and serve more clients.",
    date: "May 20, 2026",
    readTime: "7 min read",
    author: "CODEMAFIA Team",
  },
  {
    slug: "validate-saas-idea",
    category: "Startup Building",
    title: "Validating Your SaaS Idea Before Writing Code",
    content: "Save months of development time by validating your idea before building.\n\n## Identify a Real Problem\n\nThe best SaaS products solve painful, urgent problems that people are already paying to solve.\n\n## Talk to Potential Customers\n\nBefore writing a single line of code, have 20-30 conversations with your target audience. Understand their workflow and pain points.\n\n## Build a Landing Page\n\nCreate a simple landing page describing your product with a waitlist signup. Measure conversion rates.\n\n## Create a MVP\n\nBuild the smallest possible version of your product that delivers core value. Launch it to your waitlist and gather feedback.\n\n## Measure and Iterate\n\nUse analytics and user feedback to guide your product decisions. Let data, not assumptions, drive development.",
    date: "May 12, 2026",
    readTime: "9 min read",
    author: "CODEMAFIA Team",
  },
];

export default function BlogPostPage() {
  const params = useParams();
  const post = posts.find((p) => p.slug === params.slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <section className="relative pt-20 pb-16 md:pt-24 md:pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-20"
            style={{ background: "radial-gradient(circle at 50% 50%, rgba(212,175,55,0.08) 0%, transparent 50%)" }}
          />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
          >
            <Link
              href="/insights"
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-gold transition-colors duration-300 mb-8"
            >
              ← Back to Blog
            </Link>
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-gold mb-4">
              {post.category}
            </span>
            <h1 className="section-heading max-w-4xl">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted mt-6">
              <span>{post.author}</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span>{post.date}</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span>{post.readTime}</span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/30 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="prose prose-invert max-w-none"
          >
            {post.content.split("\n\n").map((paragraph, i) => {
              if (paragraph.startsWith("## ")) {
                return (
                  <h2 key={i} className="text-2xl font-bold text-white mt-12 mb-4">
                    {paragraph.replace("## ", "")}
                  </h2>
                );
              }
              return (
                <p key={i} className="text-white/80 leading-relaxed mb-6">
                  {paragraph}
                </p>
              );
            })}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 pt-12 border-t border-white/5"
          >
            <div className="glass rounded-2xl p-8 text-center">
              <h3 className="text-xl font-bold text-white mb-3">Ready to Start Building?</h3>
              <p className="text-muted text-sm mb-6 max-w-md mx-auto">
                Let&apos;s work together to bring your next project to life.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/start-project"
                  className="px-6 py-3 rounded-xl bg-gold-gradient text-background font-semibold text-sm hover:shadow-gold transition-all duration-300"
                >
                  Start a Project
                </Link>
                <Link
                  href="/work"
                  className="px-6 py-3 rounded-xl border border-white/10 text-white font-semibold text-sm hover:bg-white/5 transition-all duration-300"
                >
                  View Projects
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
