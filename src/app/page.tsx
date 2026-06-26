"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Hero from "@/components/hero";
import Tech from "@/components/tech";

const pillars = [
  { title: "Learn", description: "Master modern software development with industry-led courses.", href: "/academy", icon: "📚" },
  { title: "Build", description: "Explore real-world projects and case studies.", href: "/projects", icon: "🛠" },
  { title: "Hire", description: "Partner with us to build your next digital product.", href: "/hire", icon: "🤝" },
  { title: "Join", description: "Be part of a thriving developer community.", href: "/community", icon: "🌐" },
  { title: "Insights", description: "Deep dives into tech, career growth, and more.", href: "/insights", icon: "📝" },
];

const programs = [
  { id: "frontend", title: "Frontend Engineering", description: "Master React, Next.js, and modern frontend frameworks to build stunning user interfaces.", icon: "🖥", gradient: "from-blue-500/10 to-cyan-500/10" },
  { id: "fullstack", title: "Full-Stack Development", description: "Become a complete developer capable of building production-ready applications end-to-end.", icon: "🚀", gradient: "from-purple-500/10 to-violet-500/10" },
  { id: "ai", title: "AI Engineering", description: "Dive into machine learning, LLMs, and AI-powered applications that solve real problems.", icon: "🤖", gradient: "from-pink-500/10 to-rose-500/10" },
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
            <span className="section-label">Ecosystem</span>
            <h2 className="section-heading">
              The Complete <span className="text-gradient">Platform</span>
            </h2>
            <p className="section-subtitle mt-4 mx-auto">
              Everything you need to learn, build, and grow as a software engineer — all in one ecosystem.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-5 gap-4"
          >
            {pillars.map((pillar) => (
              <motion.div
                key={pillar.title}
                variants={cardVariants}
                className="group relative rounded-2xl glass glass-hover overflow-hidden"
              >
                <Link href={pillar.href} className="block p-6 md:p-8 text-center">
                  <div className="text-3xl mb-3">{pillar.icon}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{pillar.title}</h3>
                  <p className="text-muted text-sm leading-relaxed">{pillar.description}</p>
                </Link>
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
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            className="text-center mb-16"
          >
            <span className="section-label">Programs</span>
            <h2 className="section-heading">
              Featured <span className="text-gradient">Programs</span>
            </h2>
            <p className="section-subtitle mt-4 mx-auto">
              Industry-led tracks designed to take you from beginner to production-ready engineer.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-3 gap-5"
          >
            {programs.map((program) => (
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
        </div>
      </section>

      <Tech />

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
              Get Started
            </Link>
            <Link
              href="/community"
              className="px-8 py-4 rounded-xl border border-white/10 text-white font-bold text-base hover:bg-white/5 hover:border-white/20 transition-all duration-300"
            >
              Join Community
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
