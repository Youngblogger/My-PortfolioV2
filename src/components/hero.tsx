"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const stats = [
  { value: "10,000+", label: "Students" },
  { value: "100+", label: "Projects" },
  { value: "50+", label: "Clients" },
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

function CodeSnippet({ text, index }: { text: string; index: number }) {
  return (
    <motion.div
      className="absolute text-[10px] md:text-xs font-mono text-muted/30 whitespace-nowrap"
      style={{
        left: `${10 + (index % 4) * 25}%`,
        top: `${20 + (index % 3) * 30}%`,
      }}
      animate={{
        y: [0, -15, 0],
        opacity: [0.15, 0.3, 0.15],
      }}
      transition={{
        duration: 8 + index,
        repeat: Infinity,
        delay: index * 0.7,
        ease: "easeInOut",
      }}
    >
      {text}
    </motion.div>
  );
}

export default function Hero() {
  const codeLines = [
    "const future = await build();",
    "import { AI } from 'codemafia';",
    "function innovate() { return true; }",
    "npm install success",
    "git commit -m 'built africa'",
    "deploy --production",
    "class Engineer extends Human",
    "while(alive) { learn(); }",
    "export default excellence",
    "new CODEMAFIA().launch()",
    "async function buildAfrica()",
    "const dev = new Developer();",
  ];

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <AnimatedGrid />
      <FloatingParticles />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background pointer-events-none" />

      {codeLines.map((line, i) => (
        <CodeSnippet key={i} text={line} index={i} />
      ))}

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
        >
          <span className="section-label">CODEMAFIA ECOSYSTEM</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] as const }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold leading-[0.9] tracking-tight mt-6"
        >
          <span className="block">BUILDING AFRICA&apos;S</span>
          <span className="block text-gradient">NEXT GENERATION</span>
          <span className="block">OF SOFTWARE ENGINEERS</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
          className="mt-8 text-xl md:text-2xl text-muted max-w-2xl mx-auto leading-relaxed"
        >
          <span className="text-gold font-semibold">Learn.</span>{" "}
          <span className="text-gold font-semibold">Build.</span>{" "}
          <span className="text-gold font-semibold">Launch.</span>
          <br />
          Master modern software development, build real-world products, and work
          with industry professionals.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] as const }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          <a
            href="#learn"
            className="px-8 py-4 rounded-xl bg-gold-gradient text-background font-bold text-base hover:shadow-gold transition-all duration-300"
          >
            Join Academy
          </a>
          <a
            href="#build"
            className="px-8 py-4 rounded-xl border border-white/10 text-white font-bold text-base hover:bg-white/5 transition-all duration-300"
          >
            Explore Projects
          </a>
          <a
            href="#hire"
            className="px-8 py-4 rounded-xl border border-white/10 text-white font-bold text-base hover:bg-white/5 transition-all duration-300"
          >
            Hire Us
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] as const }}
          className="mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 max-w-3xl mx-auto"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-gold">
                {stat.value}
              </div>
              <div className="text-sm text-muted mt-1">{stat.label}</div>
            </div>
          ))}
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
