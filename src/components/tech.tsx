"use client";

import { motion } from "framer-motion";

const technologies = [
  { name: "React", icon: "⚛️", color: "from-blue-400/20 to-cyan-400/20" },
  { name: "Next.js", icon: "▲", color: "from-white/20 to-gray-400/20" },
  { name: "TypeScript", icon: "TS", color: "from-blue-500/20 to-indigo-500/20" },
  { name: "Node.js", icon: "🟢", color: "from-green-400/20 to-emerald-400/20" },
  { name: "Supabase", icon: "⚡", color: "from-green-500/20 to-teal-400/20" },
  { name: "PostgreSQL", icon: "🐘", color: "from-blue-600/20 to-cyan-400/20" },
  { name: "Tailwind CSS", icon: "🌊", color: "from-cyan-400/20 to-blue-400/20" },
  { name: "Docker", icon: "🐳", color: "from-blue-400/20 to-sky-400/20" },
  { name: "AWS", icon: "☁️", color: "from-orange-400/20 to-yellow-400/20" },
  { name: "GitHub", icon: "🐙", color: "from-gray-400/20 to-white/20" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function Tech() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/30 to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
          className="text-center"
        >
          <h2 className="section-heading">
            Powered By{" "}
            <span className="text-gradient">Modern Technology</span>
          </h2>
          <p className="section-subtitle mt-4 mx-auto">
            We build with the most advanced and battle-tested technologies in the
            industry.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-12 md:mt-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
        >
          {technologies.map((tech) => (
            <motion.div
              key={tech.name}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -4 }}
              className="relative group rounded-2xl glass overflow-hidden p-6 text-center cursor-default"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${tech.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />
              <div className="relative">
                <div className="text-3xl mb-3">{tech.icon}</div>
                <div className="text-sm font-semibold text-white">
                  {tech.name}
                </div>
              </div>
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/0 group-hover:ring-gold/30 transition-all duration-500" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
