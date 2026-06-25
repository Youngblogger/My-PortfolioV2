"use client";

import { motion } from "framer-motion";

export default function Founder() {
  return (
    <section id="founder" className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-surface/50 via-transparent to-surface/50 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
          className="text-center"
        >
          <h2 className="section-heading">
            Meet The <span className="text-gradient">Founder</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }}
          className="mt-12 md:mt-16 max-w-4xl mx-auto"
        >
          <div className="glass rounded-3xl overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <div className="inline-block px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-xs text-gold font-semibold mb-4 w-fit">
                  FOUNDER & CEO
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  Uthman Abdulwahab
                </h3>
                <div className="space-y-1 text-muted text-sm">
                  <div>Full-Stack Developer</div>
                  <div>Software Engineer</div>
                  <div>Educator</div>
                  <div>Founder of CODEMAFIA</div>
                </div>
              </div>

              <div className="relative p-8 md:p-12 bg-gradient-to-br from-gold/5 to-transparent">
                <p className="text-white/80 leading-relaxed mb-6">
                  CODEMAFIA was born from a simple belief: that every African
                  developer deserves access to world-class software engineering
                  education and real industry opportunities.
                </p>
                <p className="text-muted leading-relaxed mb-6">
                  After years of building products for startups and enterprises,
                  I realized the missing piece wasn&apos;t talent — it was the right
                  ecosystem. An environment that combines structured learning with
                  real project experience and professional mentorship.
                </p>
                <p className="text-muted leading-relaxed">
                  CODEMAFIA is that ecosystem. A place where the next generation
                  of African software engineers will be built.
                </p>
                <div className="mt-6 pt-6 border-t border-white/5 flex gap-4">
                  {["LinkedIn", "GitHub", "X"].map((social) => (
                    <a
                      key={social}
                      href="#"
                      className="text-xs text-muted hover:text-gold transition-colors"
                    >
                      {social} →
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
