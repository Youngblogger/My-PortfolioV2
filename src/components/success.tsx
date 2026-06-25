"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const testimonials = [
  {
    name: "Aisha Mohammed",
    role: "Full-Stack Developer at Flutterwave",
    content:
      "CODEMAFIA transformed my career. Within 6 months of joining, I went from knowing basic HTML to building production applications. The mentorship and real-world projects were invaluable.",
    achievement: "Hired at Flutterwave",
    image: "AM",
  },
  {
    name: "Chidi Okonkwo",
    role: "Software Engineer at Paystack",
    content:
      "The structured curriculum and hands-on approach at CODEMAFIA gave me the confidence to tackle complex engineering challenges. I credit my career transition to their program.",
    achievement: "Senior Engineer at Paystack",
    image: "CO",
  },
  {
    name: "Fatima Bello",
    role: "Product Manager at Andela",
    content:
      "CODEMAFIA&apos;s project-based learning approach is unmatched. I built a portfolio of real products during the program, which directly led to my product management role.",
    achievement: "PM at Andela",
    image: "FB",
  },
  {
    name: "Samuel Adeyemi",
    role: "Founder of TechLagos",
    content:
      "The CODEMAFIA community connected me with co-founders and early customers for my startup. It&apos;s more than an academy — it&apos;s an ecosystem that launches careers and companies.",
    achievement: "Founded TechLagos",
    image: "SA",
  },
];

export default function Success() {
  const [active, setActive] = useState(0);

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-surface/30 via-transparent to-surface/30 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
          className="text-center"
        >
          <h2 className="section-heading">
            Student <span className="text-gradient">Success Stories</span>
          </h2>
          <p className="section-subtitle mt-4 mx-auto">
            From beginners to professional engineers — see how CODEMAFIA has
            transformed careers across Africa.
          </p>
        </motion.div>

        <div className="mt-12 md:mt-16 grid lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-2 space-y-3">
            {testimonials.map((t, i) => (
              <button
                key={t.name}
                onClick={() => setActive(i)}
                className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
                  active === i
                    ? "glass gold-border"
                    : "hover:bg-white/[0.02]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${
                      active === i
                        ? "bg-gold-gradient text-background"
                        : "bg-white/10 text-white"
                    }`}
                  >
                    {t.image}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {t.name}
                    </div>
                    <div className="text-xs text-muted">{t.role}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }}
                className="glass rounded-2xl p-8 md:p-10"
              >
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-gold text-2xl">"</span>
                  <span className="text-xs text-gold uppercase tracking-wider font-semibold">
                    Success Story
                  </span>
                </div>
                <p className="text-lg text-white/80 leading-relaxed mb-6">
                  {testimonials[active].content}
                </p>
                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <div>
                    <div className="font-semibold text-white">
                      {testimonials[active].name}
                    </div>
                    <div className="text-sm text-muted">
                      {testimonials[active].role}
                    </div>
                  </div>
                  <div className="px-4 py-2 rounded-lg bg-gold/10 border border-gold/20">
                    <span className="text-xs text-gold font-semibold">
                      {testimonials[active].achievement}
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
