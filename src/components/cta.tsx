"use client";

import { motion } from "framer-motion";

export default function CTA() {
  return (
    <section id="cta" className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.02] to-transparent" />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
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
            Ready To Build
            <br />
            <span className="text-gradient">The Future?</span>
          </h2>
          <p className="text-lg md:text-xl text-muted mt-6 max-w-2xl mx-auto leading-relaxed">
            Explore our portfolio, partner with us, or start your next project
            with a team that delivers.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          <a
            href="/work"
            className="px-8 py-4 rounded-xl bg-gold-gradient text-background font-bold text-base hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
          >
            View Projects
          </a>
          <a
            href="/services"
            className="px-8 py-4 rounded-xl border border-white/10 text-white font-bold text-base hover:bg-white/5 transition-all duration-300"
          >
            Our Services
          </a>
        </motion.div>
      </div>
    </section>
  );
}
