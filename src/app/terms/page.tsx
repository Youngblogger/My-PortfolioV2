"use client";

import { motion } from "framer-motion";
import PageHeader from "@/components/pages/PageHeader";

const sections = [
  { title: "Acceptance of Terms", content: "By accessing or using CODEMAFIA.NG, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services." },
  { title: "Services Description", content: "CODEMAFIA provides a technology education ecosystem including an academy, development agency services, project portfolio showcase, and community platform." },
  { title: "User Obligations", content: "You agree to use our services lawfully, provide accurate information, and not engage in any activity that disrupts or interferes with our platform." },
  { title: "Intellectual Property", content: "All content, trademarks, and intellectual property on CODEMAFIA.NG are owned by or licensed to CODEMAFIA. You may not reproduce, distribute, or modify our content without written permission." },
  { title: "Payment Terms", content: "Payments for academy programs and development services are subject to the specific terms agreed upon at the time of purchase or engagement." },
  { title: "Limitation of Liability", content: "CODEMAFIA shall not be liable for any indirect, incidental, or consequential damages arising from your use of our services." },
  { title: "Termination", content: "We reserve the right to terminate or suspend access to our services at our discretion, without prior notice, for conduct that we believe violates these terms." },
  { title: "Contact", content: "For questions about these terms, please contact us at legal@codemafia.ng." },
];

export default function TermsPage() {
  return (
    <>
      <PageHeader
        label="TERMS"
        title="Terms of"
        highlight="Service"
        description="The terms and conditions governing your use of CODEMAFIA.NG."
      />

      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/30 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <p className="text-muted leading-relaxed">
              Last updated: June 2026. These Terms of Service govern your use of the CODEMAFIA website and services.
            </p>

            {sections.map((section, i) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                className="glass rounded-2xl p-6 md:p-8"
              >
                <h2 className="text-lg font-bold text-white mb-3">{section.title}</h2>
                <p className="text-muted leading-relaxed text-sm">{section.content}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}
