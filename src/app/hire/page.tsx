"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import PageHeader from "@/components/pages/PageHeader";
import { api, type ServiceData } from "@/lib/api";
import { useBooking } from "@/contexts/BookingContext";

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

const gradients: Record<string, string> = {
  "web-development": "from-blue-500/10 to-cyan-500/10",
  "saas-development": "from-purple-500/10 to-violet-500/10",
  "mobile-development": "from-green-500/10 to-emerald-500/10",
  "ui-ux-design": "from-orange-500/10 to-amber-500/10",
  "ai-solutions": "from-pink-500/10 to-rose-500/10",
};

const serviceIcons: Record<string, string> = {
  "web-development": "🌐",
  "saas-development": "☁️",
  "mobile-development": "📱",
  "ui-ux-design": "🎨",
  "ai-solutions": "🤖",
};

const techTags: Record<string, string[]> = {
  "web-development": ["React", "Next.js", "Laravel", "Tailwind", "TypeScript", "PostgreSQL"],
  "saas-development": ["React", "Node.js", "PostgreSQL", "Redis", "AWS", "Stripe"],
  "mobile-development": ["React Native", "Flutter", "Firebase", "App Store", "Play Store"],
  "ui-ux-design": ["Figma", "Adobe XD", "Framer", "Design Systems", "Prototyping"],
  "ai-solutions": ["Python", "TensorFlow", "PyTorch", "OpenAI", "NLP", "Computer Vision"],
};

const fallbackServices: ServiceData[] = [
  { id: "1", slug: "web-development", title: "Web Development", subtitle: null, short_description: "Full-stack web applications built with modern frameworks. React, Next.js, Node.js — deployed and scaled for production.", icon: "🌐", image_url: null, starting_price_ngn: 250000, starting_price_usd: 0, estimated_delivery: null, features: null, project_types_count: 12 },
  { id: "2", slug: "saas-development", title: "SaaS Development", subtitle: null, short_description: "End-to-end SaaS platform development from concept to launch. Multi-tenant architecture, billing, and analytics included.", icon: "☁️", image_url: null, starting_price_ngn: 0, starting_price_usd: 0, estimated_delivery: null, features: null, project_types_count: 8 },
  { id: "3", slug: "mobile-development", title: "Mobile App Development", subtitle: null, short_description: "Cross-platform mobile applications for iOS and Android. React Native and Flutter development with native performance.", icon: "📱", image_url: null, starting_price_ngn: 500000, starting_price_usd: 0, estimated_delivery: null, features: null, project_types_count: 6 },
  { id: "4", slug: "ui-ux-design", title: "UI/UX Design", subtitle: null, short_description: "World-class user interfaces and experiences. Research-driven design that converts visitors into customers.", icon: "🎨", image_url: null, starting_price_ngn: 150000, starting_price_usd: 0, estimated_delivery: null, features: null, project_types_count: 15 },
  { id: "5", slug: "ai-solutions", title: "AI Engineering", subtitle: null, short_description: "Custom AI solutions, LLM integrations, and machine learning models tailored to your business needs.", icon: "🤖", image_url: null, starting_price_ngn: 0, starting_price_usd: 0, estimated_delivery: null, features: null, project_types_count: 4 },
];

export default function HirePage() {
  const [services, setServices] = useState<ServiceData[]>(fallbackServices);
  const [loading, setLoading] = useState(true);
  const { setService } = useBooking();

  useEffect(() => {
    api.getServices().then((res) => {
      if (res.data && res.data.length > 0) {
        setServices(res.data);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader
        label="SERVICES"
        title="Build Your Next Digital Product"
        highlight="With CODEMAFIA"
        description="From concept to launch — we partner with startups, SMEs, and enterprises to design, build, deploy, and support world-class digital products."
      />

      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/50 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="glass rounded-2xl p-6 md:p-8 animate-pulse">
                  <div className="h-12 w-12 bg-white/5 rounded-xl mb-4" />
                  <div className="h-6 w-40 bg-white/10 rounded mb-3" />
                  <div className="h-4 w-full bg-white/5 rounded mb-2" />
                  <div className="h-4 w-3/4 bg-white/5 rounded mb-6" />
                  <div className="flex gap-2">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="h-6 w-16 bg-white/5 rounded-full" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {services.map((service) => (
                <motion.div
                  key={service.id}
                  variants={cardVariants}
                  className="group relative rounded-2xl glass glass-hover overflow-hidden"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${gradients[service.slug] || "from-gold/5 to-gold/10"} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  />
                  <Link
                    href={`/hire/${service.slug}`}
                    onClick={() => setService({ id: service.id, slug: service.slug, title: service.title })}
                    className="relative block p-6 md:p-8"
                  >
                    <div className="flex items-start justify-between mb-5">
                      <div className="text-3xl">{service.icon || serviceIcons[service.slug] || "🚀"}</div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 text-xs text-muted">
                        {service.project_types_count} projects
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{service.title}</h3>
                    <p className="text-muted text-sm leading-relaxed mb-5 line-clamp-2">
                      {service.short_description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {(techTags[service.slug] || []).slice(0, 4).map((tech) => (
                        <span
                          key={tech}
                          className="px-2.5 py-1 rounded-full bg-white/5 text-[11px] text-muted font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <span className="text-sm text-gold font-semibold">
                        {service.starting_price_ngn > 0
                          ? `From ₦${service.starting_price_ngn.toLocaleString()}`
                          : "Custom Quote"}
                      </span>
                      <span className="text-xs text-muted group-hover:text-white transition-colors">
                        View Details →
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/30 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { label: "Projects Delivered", value: "50+" },
              { label: "Technologies Mastered", value: "20+" },
              { label: "Industries Served", value: "10+" },
              { label: "Client Retention", value: "98%" },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="glass rounded-2xl p-6 text-center"
              >
                <div className="text-3xl font-bold text-gold mb-1">{stat.value}</div>
                <div className="text-sm text-muted">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.02] to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <span className="section-label">HOW IT WORKS</span>
            <h2 className="section-heading mt-2">
              Our Engagement <span className="text-gradient">Process</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-5 gap-4">
            {[
              { step: "01", title: "Discovery", desc: "We learn about your business, goals, and requirements." },
              { step: "02", title: "Proposal", desc: "We design the solution, timeline, and investment estimate." },
              { step: "03", title: "Development", desc: "We build your product in agile sprints with regular updates." },
              { step: "04", title: "Launch", desc: "We deploy, test, and hand over your fully functional product." },
              { step: "05", title: "Support", desc: "We provide ongoing maintenance, updates, and support." },
            ].map((phase) => (
              <motion.div
                key={phase.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: Number(phase.step) * 0.1 }}
                className="glass rounded-2xl p-6 md:p-8 text-center"
              >
                <span className="text-4xl font-bold text-gold/30">{phase.step}</span>
                <h3 className="text-lg font-bold text-white mt-4 mb-2">{phase.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{phase.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
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

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Don&apos;t See What
              <br />
              <span className="text-gradient">You&apos;re Looking For?</span>
            </h2>
            <p className="text-lg md:text-xl text-muted mt-6 max-w-2xl mx-auto leading-relaxed">
              Every product is unique. Tell us about your vision and we&apos;ll craft a custom solution tailored to your needs.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
            className="mt-10"
          >
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                boxShadow: [
                  "0 0 0px rgba(212,175,55,0)",
                  "0 0 30px rgba(212,175,55,0.6)",
                  "0 0 0px rgba(212,175,55,0)",
                ],
              }}
              transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
            >
              <Link
                href="/hire/request-quote"
                className="inline-block px-10 py-4 rounded-xl bg-gold-gradient text-background font-bold text-base hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
              >
                ⚡ Request Custom Quote
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
