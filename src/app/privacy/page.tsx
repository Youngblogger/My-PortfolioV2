"use client";

import { motion } from "framer-motion";
import PageHeader from "@/components/pages/PageHeader";

const sections = [
  { title: "Information We Collect", content: "We collect information you provide directly to us, including your name, email address, phone number, and any other information you choose to share when filling out forms on our website." },
  { title: "How We Use Your Information", content: "We use the information we collect to respond to your inquiries, provide our services, improve our website, send updates about our programs, and comply with legal obligations." },
  { title: "Data Protection", content: "We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure." },
  { title: "Cookies", content: "We use cookies and similar tracking technologies to enhance your experience on our website. You can control cookie preferences through your browser settings." },
  { title: "Third-Party Services", content: "We may share your information with trusted third-party service providers who assist us in operating our website and services, subject to confidentiality agreements." },
  { title: "Your Rights", content: "You have the right to access, update, or delete your personal information. Contact us at privacy@codemafia.ng to exercise these rights." },
  { title: "Changes to This Policy", content: "We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page." },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        label="PRIVACY"
        title="Privacy"
        highlight="Policy"
        description="How we collect, use, and protect your personal information."
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
              Last updated: June 2026. This Privacy Policy describes how CODEMAFIA collects, uses, and protects your personal information.
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
