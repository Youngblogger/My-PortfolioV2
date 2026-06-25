"use client";

import { motion } from "framer-motion";

const services = [
  {
    title: "Web Application Development",
    description: "Full-stack web applications built with modern frameworks. React, Next.js, Node.js — deployed and scaled for production.",
    icon: "🌐",
    features: ["Custom web apps", "Progressive web apps", "Single-page applications", "Real-time applications"],
  },
  {
    title: "SaaS Development",
    description: "End-to-end SaaS platform development from concept to launch. Multi-tenant architecture, billing, and analytics included.",
    icon: "☁️",
    features: ["Multi-tenant platforms", "Subscription management", "API-first architecture", "Scalable infrastructure"],
  },
  {
    title: "Mobile App Development",
    description: "Cross-platform mobile applications for iOS and Android. React Native and Flutter development with native performance.",
    icon: "📱",
    features: ["Cross-platform apps", "Native modules", "App store deployment", "Push notifications"],
  },
  {
    title: "UI/UX Design",
    description: "World-class user interfaces and experiences. Research-driven design that converts visitors into customers.",
    icon: "🎨",
    features: ["User research", "Wireframing", "Prototyping", "Design systems"],
  },
  {
    title: "API Development",
    description: "Scalable RESTful and GraphQL APIs. Secure, documented, and built for high-traffic production environments.",
    icon: "🔌",
    features: ["REST & GraphQL APIs", "API documentation", "Authentication & auth", "Rate limiting"],
  },
  {
    title: "Technical Consulting",
    description: "Expert guidance on architecture, technology stack selection, team building, and engineering best practices.",
    icon: "💡",
    features: ["Architecture review", "Tech stack advice", "Code audits", "Performance optimization"],
  },
  {
    title: "Product Strategy",
    description: "From idea to product-market fit. We help you validate, build, and launch products that users love.",
    icon: "🎯",
    features: ["Market research", "MVP development", "Product roadmap", "Growth strategy"],
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
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function Hire() {
  return (
    <section id="hire" className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/30 to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
        >
          <span className="section-label">HIRE</span>
          <h2 className="section-heading mt-2">
            Build Your Next Product
            <br />
            <span className="text-gradient">With Us</span>
          </h2>
          <p className="section-subtitle mt-4">
            From concept to launch — we partner with startups and enterprises to
            build world-class digital products.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-12 md:mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {services.map((service) => (
            <motion.div
              key={service.title}
              variants={cardVariants}
              className="relative rounded-2xl glass glass-hover overflow-hidden p-6 md:p-8"
            >
              <div className="text-3xl mb-4">{service.icon}</div>
              <h3 className="text-lg font-bold text-white mb-2">
                {service.title}
              </h3>
              <p className="text-sm text-muted leading-relaxed mb-5">
                {service.description}
              </p>
              <ul className="space-y-2">
                {service.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-xs text-muted"
                  >
                    <span className="w-1 h-1 rounded-full bg-gold flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <div className="inline-block glass rounded-2xl p-8 md:p-10 max-w-2xl">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to start your project?
            </h3>
            <p className="text-muted mb-6">
              Book a free discovery call and let&apos;s discuss how we can bring
              your vision to life.
            </p>
            <a
              href="#"
              className="inline-block px-8 py-4 rounded-xl bg-gold-gradient text-background font-bold hover:shadow-gold transition-all duration-300"
            >
              Book A Discovery Call
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
