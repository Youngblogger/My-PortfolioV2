"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import PageHeader from "@/components/pages/PageHeader";

const plans = [
  { name: "Starter", price: "₦150,000", period: "one-time", description: "Perfect for self-motivated learners who want structured curriculum access.", features: ["Full course access", "Self-paced learning", "Project templates", "Community access", "Certificate of completion"], cta: "Get Started", popular: false },
  { name: "Standard", price: "₦350,000", period: "one-time", description: "Best value for serious learners who want mentorship and live support.", features: ["Everything in Starter", "Weekly live sessions", "1-on-1 mentorship", "Code reviews", "Career guidance", "Priority support"], cta: "Most Popular", popular: true },
  { name: "Pro Mentorship", price: "₦650,000", period: "one-time", description: "Full immersion with dedicated mentor, job placement support, and lifetime access.", features: ["Everything in Standard", "Dedicated mentor", "Resume & portfolio review", "Interview preparation", "Job placement assistance", "Lifetime access", "Alumni network"], cta: "Go Pro", popular: false },
];

const faqs = [
  { q: "Can I switch plans later?", a: "Yes, you can upgrade your plan at any time. The difference in price will be prorated based on your current progress. Downgrading is available after your current cycle ends." },
  { q: "Is there a money-back guarantee?", a: "Absolutely. We offer a 14-day money-back guarantee on all plans. If you're not satisfied, we'll refund your payment in full — no questions asked." },
  { q: "What payment methods are accepted?", a: "We accept all major credit/debit cards, bank transfers, and mobile money options. For the Pro Mentorship plan, we also offer flexible installment arrangements." },
  { q: "Do you offer scholarships?", a: "Yes, we have a limited number of merit-based and need-based scholarships each cohort. Applications open 6 weeks before each cohort start date." },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
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

const fadeUpVariants = {
  hidden: { opacity: 0, y: 20 },
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
        title="Choose Your"
        highlight="Learning Path"
        description="Invest in your future with flexible plans designed for every stage of your journey."
      />

      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/50 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-3 gap-6 items-start"
          >
            {plans.map((plan) => (
              <motion.div
                key={plan.name}
                variants={cardVariants}
                className={`relative rounded-2xl overflow-hidden ${
                  plan.popular ? "gold-border" : "border border-white/5"
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0">
                    <div className="bg-gold-gradient text-background text-xs font-bold uppercase tracking-wider py-2 text-center">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className={`glass p-8 ${plan.popular ? "pt-14" : ""}`}>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-white">
                      {plan.price}
                    </span>
                    <span className="text-muted text-sm ml-2">
                      {plan.period}
                    </span>
                  </div>
                  <p className="text-muted text-sm leading-relaxed mb-8">
                    {plan.description}
                  </p>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm text-white/80">
                        <span className="text-gold mt-0.5 shrink-0">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/academy/frontend/enroll"
                    className={`block w-full text-center px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                      plan.popular
                        ? "bg-gold-gradient text-background hover:shadow-gold"
                        : "border border-white/10 text-white hover:bg-white/5"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/50 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            className="text-center mb-16"
          >
            <span className="section-label">FAQ</span>
            <h2 className="section-heading mt-2">
              Frequently Asked
              <br />
              <span className="text-gradient">Questions</span>
            </h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-4"
          >
            {faqs.map((faq) => (
              <motion.div
                key={faq.q}
                variants={fadeUpVariants}
                className="glass rounded-2xl p-6"
              >
                <h3 className="text-white font-semibold text-base mb-3">
                  {faq.q}
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  {faq.a}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}
