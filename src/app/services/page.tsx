"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const featuredServices = [
  {
    id: "websites",
    number: "01",
    label: "WEBSITES",
    headline: ["Websites That Work", "for Your Brand"],
    summary:
      "A business website is your most important marketing asset. We design and build professional, fast-loading websites that represent your brand clearly and convert visitors into customers \u2014 whether you need a company site, a marketing page, or a multi-page brand platform.",
    includes: [
      "Custom design & branding",
      "Responsive on all devices",
      "Content management system",
      "Contact forms & lead capture",
      "Analytics & SEO foundation",
    ],
    for: "Companies, SMEs, professional service firms, and organizations that need a professional web presence.",
    slug: "web-development",
  },
  {
    id: "web-apps",
    number: "02",
    label: "WEB APPLICATIONS",
    headline: ["Built for Your", "Business, Not Someone Else\u2019s"],
    summary:
      "Off-the-shelf software rarely fits perfectly. We build custom web applications \u2014 internal tools, customer-facing platforms, business software, and operational systems \u2014 tailored to your exact workflows, rules, and goals.",
    includes: [
      "Requirements & technical specification",
      "Custom architecture design",
      "Full-stack development",
      "Authentication & user management",
      "API development & integrations",
    ],
    for: "Startups building their first product, growing companies that have outgrown spreadsheets, and organizations needing custom software.",
    slug: "saas-development",
  },
  {
    id: "dashboards",
    number: "03",
    label: "DASHBOARDS & PORTALS",
    headline: ["See Your Business", "More Clearly"],
    summary:
      "Dashboards and portals turn raw data into useful information. We build admin interfaces, client portals, analytics dashboards, and internal management systems that give you and your team real-time visibility, control, and efficiency.",
    includes: [
      "Custom dashboard design",
      "Real-time data visualization",
      "User roles & permissions",
      "Client-facing portal interfaces",
      "Reporting & export tools",
    ],
    for: "Operations teams, organizations that want to give clients self-service access, and management teams that need better reporting.",
    slug: "ui-ux-design",
  },
  {
    id: "ecommerce",
    number: "04",
    label: "E-COMMERCE",
    headline: ["Stores That Sell,", "Not Just Show"],
    summary:
      "We build online stores and e-commerce platforms designed to convert visitors into customers \u2014 from single-brand stores to multi-vendor marketplaces. Product management, checkout, payments, and logistics \u2014 all built to scale as you grow.",
    includes: [
      "Product catalog & inventory management",
      "Shopping cart & checkout flow",
      "Payment gateway integration",
      "Order management & tracking",
      "Customer accounts & admin dashboard",
    ],
    for: "Retail businesses moving online, brands launching direct-to-consumer stores, and founders building marketplace platforms.",
    slug: "web-development",
  },
];

const industries = [
  { name: "E-Commerce & Retail", icon: "🛒" },
  { name: "Fintech & Financial Services", icon: "📊" },
  { name: "Education & E-Learning", icon: "📚" },
  { name: "Healthcare & Wellness", icon: "🏥" },
  { name: "Professional Services", icon: "⚖️" },
  { name: "Media & Content Platforms", icon: "🎬" },
];

const supportingServices = [
  {
    title: "Booking & Service Platforms",
    desc: "Let clients book, pay, and manage appointments or services online. Integrated with calendars, payments, and automated notifications.",
    slug: "web-development",
  },
  {
    title: "Landing Pages & Campaign Sites",
    desc: "High-conversion, single-purpose pages for product launches, events, marketing campaigns, and lead generation. Fast, focused, optimized.",
    slug: "web-development",
  },
  {
    title: "Website Redesigns & Rebuilds",
    desc: "Your existing site deserves a second chance. We redesign and rebuild \u2014 improving visuals, performance, content structure, and user experience.",
    slug: "web-development",
  },
  {
    title: "Support, Maintenance & Improvements",
    desc: "Ongoing technical care after launch. Security updates, performance monitoring, bug fixes, feature additions, and technical support.",
    slug: "technical-consulting",
  },
];

const faqs = [
  {
    q: "How much does a website or web application cost?",
    a: "Every project is different, so we give fixed-price quotes based on your specific requirements. Business websites typically start around \u20A6250,000. Custom web applications and dashboards are quoted individually. We'll give you a clear price in the proposal \u2014 no hidden fees, no surprises.",
  },
  {
    q: "How long does it take to build a project?",
    a: "A standard business website takes 2\u20134 weeks. Custom web applications and dashboards typically take 6\u201312 weeks, depending on complexity. MVPs can be delivered in 3\u20134 weeks. We'll include a realistic timeline in your proposal.",
  },
  {
    q: "Do you work with clients who don't have a technical brief?",
    a: "Yes \u2014 most of our clients don't. That's our job. Tell us what problem you're trying to solve and who it's for, and we'll help define the requirements, scope, and technical approach.",
  },
  {
    q: "What happens after the project is launched?",
    a: "We offer ongoing support and maintenance packages \u2014 security updates, performance monitoring, feature additions, and technical support. You're not on your own after launch.",
  },
  {
    q: "Can you work with our existing team or agency?",
    a: "Yes. We frequently collaborate with in-house teams, designers, and other agencies. We can take on specific development work or serve as your full technical partner.",
  },
  {
    q: "How do we get started?",
    a: "Click 'Start a Project' and fill out the form. We'll review it and get back to you within 24 hours with a clear next step \u2014 whether that's a discovery call, a detailed proposal, or a quick yes or no on fit.",
  },
];

const VisualBlock = ({
  index,
  align,
}: {
  index: number;
  align: "left" | "right";
}) => {
  const configs = [
    {
      gradient: "from-gold/20 via-amber-500/10 to-transparent",
      accent: "rgba(212,175,55,0.12)",
    },
    {
      gradient: "from-blue-500/20 via-cyan-500/10 to-transparent",
      accent: "rgba(59,130,246,0.12)",
    },
    {
      gradient: "from-purple-500/20 via-violet-500/10 to-transparent",
      accent: "rgba(139,92,246,0.12)",
    },
    {
      gradient: "from-emerald-500/20 via-green-500/10 to-transparent",
      accent: "rgba(16,185,129,0.12)",
    },
  ];
  const cfg = configs[index % configs.length];

  const gradientClass = `bg-gradient-to-br ${cfg.gradient}`;

  return (
    <div className={`relative h-full min-h-[280px] md:min-h-[400px] rounded-2xl overflow-hidden ${gradientClass}`}>
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 40%, rgba(255,255,255,0.3) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
        style={{
          background: `radial-gradient(circle, ${cfg.accent} 0%, transparent 70%)`,
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className={`absolute ${align === "right" ? "top-8 right-8" : "top-8 left-8"}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.06 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
          <circle cx="60" cy="60" r="58" stroke="currentColor" strokeWidth="1" className="text-white" />
          <circle cx="60" cy="60" r="40" stroke="currentColor" strokeWidth="1" className="text-white" />
          <circle cx="60" cy="60" r="20" stroke="currentColor" strokeWidth="1" className="text-white" />
        </svg>
      </motion.div>
    </div>
  );
};

export default function ServicesPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      {/* Hero */}
      <section className="relative pt-20 pb-16 md:pt-24 md:pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-20"
            style={{ background: "radial-gradient(circle at 50% 50%, rgba(212,175,55,0.08) 0%, transparent 50%)" }}
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl"
          >
            <span className="section-label">SERVICES</span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mt-4">
              What We Build
              <br />
              <span className="text-gradient">Digital Products for Your Business</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted mt-6 max-w-2xl leading-relaxed">
              We design and build websites, web applications, dashboards, and digital platforms for
              businesses, startups, and organizations. Every project is custom-built from the ground up
              &mdash; no templates, no shortcuts, no black boxes.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Capability Strip */}
      <section className="relative py-12 md:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/50 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-10"
          >
            <span className="section-label">OUR CAPABILITIES</span>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="flex flex-wrap justify-center gap-3"
          >
            {[
              "Business Websites",
              "Web Applications",
              "Dashboards & Portals",
              "E-Commerce Stores",
              "Booking Platforms",
              "Landing Pages",
              "Redesigns & Rebuilds",
              "Support & Maintenance",
            ].map((cap) => (
              <motion.span
                key={cap}
                variants={cardUp}
                className="px-4 py-2.5 rounded-xl glass text-sm text-white/80 font-medium hover:text-gold transition-colors duration-300 cursor-default"
              >
                {cap}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Services */}
      {featuredServices.map((service, idx) => (
        <section
          key={service.id}
          className="relative py-20 md:py-28 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/20 to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-7xl mx-auto px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="mb-8"
            >
              <span className="section-label">
                {service.number} // {service.label}
              </span>
            </motion.div>

            <div
              className={`flex flex-col ${
                idx % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              } gap-8 md:gap-12 items-center`}
            >
              {/* Text side */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={stagger}
                className="flex-1 w-full"
              >
                <motion.h2
                  variants={fadeUp}
                  className="text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight"
                >
                  {service.headline[0]}
                  <br />
                  <span className="text-gradient">{service.headline[1]}</span>
                </motion.h2>

                <motion.p
                  variants={fadeUp}
                  className="text-muted text-base md:text-lg leading-relaxed mt-6 max-w-xl"
                >
                  {service.summary}
                </motion.p>

                <motion.ul
                  variants={stagger}
                  className="mt-6 space-y-2.5"
                >
                  {service.includes.map((item) => (
                    <motion.li
                      key={item}
                      variants={fadeUp}
                      className="flex items-center gap-3 text-sm text-white/70"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                      {item}
                    </motion.li>
                  ))}
                </motion.ul>

                <motion.p
                  variants={fadeUp}
                  className="text-sm text-gold/70 mt-6 max-w-lg leading-relaxed"
                >
                  <span className="font-semibold text-gold/90">Best for</span>{" "}
                  {service.for}
                </motion.p>

                <motion.div
                  variants={fadeUp}
                  className="flex flex-wrap gap-4 mt-8"
                >
                  <Link
                    href="/start-project"
                    className="px-6 py-3 rounded-xl bg-gold-gradient text-background font-bold text-sm hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
                  >
                    Start a Project
                  </Link>
                  <Link
                    href="/work"
                    className="px-6 py-3 rounded-xl border border-white/10 text-white font-semibold text-sm hover:bg-white/5 transition-all duration-300"
                  >
                    See Related Work &rarr;
                  </Link>
                </motion.div>
              </motion.div>

              {/* Visual side */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="flex-1 w-full"
              >
                <VisualBlock index={idx} align={idx % 2 === 0 ? "right" : "left"} />
              </motion.div>
            </div>
          </div>
        </section>
      ))}

      {/* Who We Build For */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.015] to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <span className="section-label">WHO WE WORK WITH</span>
            <h2 className="section-heading mt-2">
              Startups, SMEs, and Organizations
              <br />
              <span className="text-gradient">Across Industries</span>
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
          >
            {industries.map((ind) => (
              <motion.div
                key={ind.name}
                variants={cardUp}
                className="glass rounded-2xl p-6 md:p-8 text-center"
              >
                <div className="text-3xl mb-3">{ind.icon}</div>
                <div className="text-sm text-white/80 font-medium leading-snug">
                  {ind.name}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Supporting Services */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/20 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-14"
          >
            <span className="section-label">ALSO AVAILABLE</span>
            <h2 className="section-heading mt-2">
              More Ways We Can <span className="text-gradient">Help</span>
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {supportingServices.map((s) => (
              <motion.div
                key={s.title}
                variants={cardUp}
                className="glass rounded-2xl p-6 md:p-8"
              >
                <h3 className="text-base font-bold text-white mb-3">
                  {s.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed mb-6">
                  {s.desc}
                </p>
                <Link
                  href="/start-project"
                  className="text-sm text-gold font-semibold hover:text-white transition-colors"
                >
                  Start a Project &rarr;
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Process */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.02] to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <span className="section-label">HOW WE DELIVER</span>
            <h2 className="section-heading mt-2">
              A Clear Engagement
              <br />
              <span className="text-gradient">From Start to Launch</span>
            </h2>
            <p className="section-subtitle mt-4 mx-auto">
              No ambiguity, no surprises. Here&apos;s what working with CODEMAFIA looks like.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-5">
            {[
              {
                step: "01",
                title: "Discovery & Proposal",
                desc: "We learn about your business, goals, and requirements. Within 5 days, you get a written proposal with scope, timeline, and fixed price.",
              },
              {
                step: "02",
                title: "Design & Architecture",
                desc: "We map out the user experience, visual direction, and system architecture. You review and approve before we write a line of production code.",
              },
              {
                step: "03",
                title: "Build & Iterate",
                desc: "We build in weekly sprints with regular updates. You see the product taking shape and give feedback at every milestone.",
              },
              {
                step: "04",
                title: "Launch & Beyond",
                desc: "We deploy, test, monitor, and hand over. Then we stay on board for support, updates, and continued improvements.",
              },
            ].map((phase, idx) => (
              <motion.div
                key={phase.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: idx * 0.12,
                  ease: [0.16, 1, 0.3, 1] as const,
                }}
                className="glass rounded-2xl p-6 md:p-8 text-center relative"
              >
                {idx < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-2.5 w-5 h-[1px] bg-gold/30" />
                )}
                <div className="text-3xl font-bold text-gold mb-3">
                  {phase.step}
                </div>
                <h3 className="text-base font-bold text-white mb-3">
                  {phase.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  {phase.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/20 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-14"
          >
            <span className="section-label">COMMON QUESTIONS</span>
            <h2 className="section-heading mt-2">
              Questions About Working
              <br />
              <span className="text-gradient">With a Development Studio</span>
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="space-y-3"
          >
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                variants={cardUp}
                className="glass rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 md:p-8 text-left"
                  aria-expanded={openFaq === i}
                >
                  <span className="text-sm md:text-base font-semibold text-white pr-4">
                    {faq.q}
                  </span>
                  <motion.span
                    animate={{ rotate: openFaq === i ? 45 : 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="text-gold shrink-0 text-xl leading-none"
                  >
                    +
                  </motion.span>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 md:px-8 pb-6 md:pb-8">
                        <p className="text-muted text-sm leading-relaxed">
                          {faq.a}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-10"
          >
            <Link
              href="/faq"
              className="px-6 py-3 rounded-xl border border-white/10 text-white font-semibold text-sm hover:bg-white/5 hover:border-white/20 transition-all duration-300 inline-block"
            >
              Read All FAQs &rarr;
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.02] to-transparent" />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)",
            }}
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
              Ready to Build?
              <br />
              <span className="text-gradient">Let&apos;s Talk About Your Project.</span>
            </h2>
            <p className="text-lg md:text-xl text-muted mt-6 max-w-2xl mx-auto leading-relaxed">
              Tell us what you need. We&apos;ll get back to you within 24 hours with a clear
              next step.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.6,
              delay: 0.2,
              ease: [0.16, 1, 0.3, 1] as const,
            }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <Link
              href="/start-project"
              className="px-8 py-4 rounded-xl bg-gold-gradient text-background font-bold text-base hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
            >
              Start a Project
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 rounded-xl border border-white/10 text-white font-bold text-base hover:bg-white/5 hover:border-white/20 transition-all duration-300"
            >
              Get in Touch
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
