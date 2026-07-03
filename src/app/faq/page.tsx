"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import PageHeader from "@/components/pages/PageHeader";

const faqs = [
  {
    q: "What kind of projects do you take on?",
    a: "We build websites, web applications, dashboards, portals, e-commerce stores, booking platforms, MVPs, and internal business tools. If it involves writing code and solving a business problem, we're probably a good fit. If you're not sure, just reach out and we'll let you know.",
  },
  {
    q: "How long does a typical project take?",
    a: "A standard business website takes 2-4 weeks. Custom web applications and dashboards typically take 6-12 weeks depending on complexity. MVPs can be delivered in as little as 3-4 weeks. We'll give you a clear timeline during the proposal phase.",
  },
  {
    q: "Do you work with startups or only established businesses?",
    a: "Both. We work with founders who have an idea and need a technical partner to build it, as well as established organizations looking to build or improve their digital products. Our process adapts to your stage and needs.",
  },
  {
    q: "Can you redesign an existing website?",
    a: "Yes. We regularly take existing sites and redesign them — improving the visuals, performance, content structure, and user experience. We can work with your current tech stack or recommend a migration if it makes sense.",
  },
  {
    q: "How do I get started?",
    a: "Click 'Start a Project' and fill out the form. Tell us about what you need. We'll review it and get back to you within 24 hours with a clear next step — whether that's a discovery call, a proposal, or a quick yes/no on fit.",
  },
  {
    q: "Do you offer ongoing maintenance after launch?",
    a: "Yes. We provide maintenance and support packages to keep your site or application running smoothly — including security updates, performance monitoring, content updates, and feature enhancements.",
  },
  {
    q: "What technologies do you use?",
    a: "We use modern, battle-tested technologies: Next.js, React, TypeScript, Node.js, Laravel, Python, PostgreSQL, and more. We choose the right tools for each project based on requirements, not preferences.",
  },
  {
    q: "What does it cost to build a website or web application?",
    a: "It depends on scope and complexity. Business websites typically start from ₦250,000. Web applications and dashboards are custom-quoted based on requirements. We'll provide a detailed proposal after we understand your project.",
  },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <PageHeader
        label="FAQ"
        title="Frequently Asked"
        highlight="Questions"
        description="Common questions about working with CODEMAFIA. Have something else in mind? Reach out directly."
      />

      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/30 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-3"
          >
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="glass rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 md:p-8 text-left"
                  aria-expanded={openIndex === i}
                >
                  <span className="text-sm md:text-base font-semibold text-white pr-4">{faq.q}</span>
                  <motion.span
                    animate={{ rotate: openIndex === i ? 45 : 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="text-gold shrink-0 text-xl leading-none"
                  >
                    +
                  </motion.span>
                </button>
                <AnimatePresence>
                  {openIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 md:px-8 pb-6 md:pb-8">
                        <p className="text-muted text-sm leading-relaxed">{faq.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Still Have
              <br />
              <span className="text-gradient">Questions?</span>
            </h2>
            <p className="text-lg md:text-xl text-muted mt-6 max-w-2xl mx-auto leading-relaxed">
              Send us a message and we&apos;ll get back to you within 24 hours.
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
              href="/contact"
              className="px-8 py-4 rounded-xl bg-gold-gradient text-background font-bold text-base hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
            >
              Get in Touch
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
