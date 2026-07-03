"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const stats = [
  { value: "100+", label: "Projects Delivered" },
  { value: "50+", label: "Clients Served" },
  { value: "8+", label: "Industries" },
  { value: "5+", label: "Years Experience" },
];

function AnimatedGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(212,175,55,0.15) 0%, transparent 50%)",
        }}
      />
    </div>
  );
}

function FloatingParticles() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="absolute inset-0 overflow-hidden pointer-events-none" />;

  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 10,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-gold/20"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <AnimatedGrid />
      <FloatingParticles />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center pt-16 md:pt-0">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
        >
          <span className="section-label">FULL-STACK DEVELOPMENT STUDIO</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] as const }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.05] sm:leading-[1.0] tracking-tight mt-6 text-balance"
        >
          <span className="block">We Build Websites,</span>
          <span className="block text-gradient">Web Apps & Digital</span>
          <span className="block">Platforms for Businesses</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
          className="mt-8 text-lg md:text-xl text-muted max-w-3xl mx-auto leading-relaxed"
        >
          CODEMAFIA partners with founders, startups, and organizations to design, build, and launch custom digital products — from business websites to dashboards, portals, and full-scale web applications.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] as const }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          <a
            href="/start-project"
            className="px-8 py-4 rounded-xl bg-gold-gradient text-background font-bold text-base hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
          >
            Start a Project
          </a>
          <a
            href="/work"
            className="px-8 py-4 rounded-xl border border-white/10 text-white font-bold text-base hover:bg-white/5 hover:border-white/20 transition-all duration-300"
          >
            View Our Work
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] as const }}
          className="mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center rounded-xl border border-white/[0.04] bg-white/[0.02] py-5 px-3"
            >
              <div className="text-2xl md:text-3xl font-bold text-gold">
                {stat.value}
              </div>
              <div className="text-xs md:text-sm text-muted mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9, ease: [0.16, 1, 0.3, 1] as const }}
          className="mt-8 text-sm text-muted"
        >
          Trusted by startups, SMEs, and organizations across Africa
        </motion.div>
      </div>
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/10 flex items-start justify-center p-1.5">
          <div className="w-1 h-3 rounded-full bg-gold/50" />
        </div>
      </motion.div>
    </section>
  );
}
