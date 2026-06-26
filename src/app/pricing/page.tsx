"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import PageHeader from "@/components/pages/PageHeader";

const pricingCategories = [
  {
    category: "Business Websites",
    items: [
      { name: "Personal Portfolio", price: "₦250,000 – ₦500,000" },
      { name: "Business Website", price: "₦350,000 – ₦800,000" },
      { name: "Corporate Website", price: "₦500,000 – ₦1,500,000" },
      { name: "School Portal", price: "₦600,000 – ₦2,000,000" },
      { name: "Church Website", price: "₦300,000 – ₦700,000" },
      { name: "News Website", price: "₦400,000 – ₦1,200,000" },
      { name: "NGO Website", price: "₦300,000 – ₦800,000" },
    ],
  },
  {
    category: "Ecommerce Solutions",
    items: [
      { name: "Single Vendor Store", price: "₦350,000 – ₦1,500,000" },
      { name: "Multi Vendor Marketplace", price: "₦800,000 – ₦3,000,000" },
      { name: "Digital Product Store", price: "₦400,000 – ₦1,200,000" },
    ],
  },
  {
    category: "SaaS Platforms",
    items: [
      { name: "CRM System", price: "Custom Quote" },
      { name: "ERP System", price: "Custom Quote" },
      { name: "Membership Platform", price: "₦1,000,000 – ₦2,500,000" },
      { name: "Learning Platform", price: "₦800,000 – ₦2,500,000" },
      { name: "Startup SaaS", price: "Custom Quote" },
    ],
  },
  {
    category: "Mobile Applications",
    items: [
      { name: "Business App", price: "₦500,000 – ₦1,500,000" },
      { name: "Ecommerce App", price: "₦800,000 – ₦2,500,000" },
      { name: "Marketplace App", price: "₦1,500,000 – ₦4,000,000" },
      { name: "Fintech App", price: "Custom Quote" },
    ],
  },
  {
    category: "Enterprise Solutions",
    items: [
      { name: "Custom Enterprise Solution", price: "Custom Quote" },
    ],
  },
];

const upgrades = [
  "SEO Optimization", "Blog System", "AI Chatbot", "Live Chat",
  "Analytics Setup", "Payment Gateway", "SMS Notifications", "Email Automation",
  "Multi-Language Support", "Mobile Companion App", "Dedicated Support",
];

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function PricingPage() {
  return (
    <>
      <PageHeader
        label="PRICING"
        title="Transparent"
        highlight="Pricing"
        description="Clear, upfront pricing for all our services. No hidden fees, no surprises."
      />

      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/30 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-12"
          >
            {pricingCategories.map((cat) => (
              <motion.div key={cat.category} variants={fadeUp}>
                <h2 className="text-2xl font-bold text-white mb-6">
                  {cat.category}
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cat.items.map((item) => (
                    <div key={item.name} className="glass rounded-2xl p-5 flex items-center justify-between hover:border-gold/20 transition-all duration-300">
                      <span className="text-sm text-white/90">{item.name}</span>
                      <span className="text-sm text-gold font-semibold ml-4 shrink-0">{item.price}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.02] to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
          >
            <h2 className="section-heading text-center mb-12">
              Optional <span className="text-gradient">Upgrades</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {upgrades.map((upgrade) => (
                <div key={upgrade} className="glass rounded-2xl p-4 text-center hover:border-gold/20 transition-all duration-300">
                  <span className="text-gold text-lg mb-2 block">+</span>
                  <span className="text-sm text-white/80">{upgrade}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/50 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
          >
            <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-6">
              Not Sure What You
              <br />
              <span className="text-gradient">Need?</span>
            </h2>
            <p className="text-muted mb-8 max-w-lg mx-auto">
              Tell us about your project and we&apos;ll recommend the best solution and provide a custom quote.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/hire/request-quote"
                className="px-8 py-4 rounded-xl bg-gold-gradient text-background font-bold text-base hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
              >
                Get a Custom Quote
              </Link>
              <Link
                href="/hire"
                className="px-8 py-4 rounded-xl border border-white/10 text-white font-bold text-base hover:bg-white/5 transition-all duration-300"
              >
                View All Services
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
