"use client";

import { motion } from "framer-motion";
import PageHeader from "@/components/pages/PageHeader";

const sections = [
  {
    title: "1. Introduction",
    content: (
      <>
        <p className="mb-4">Welcome to <strong>CODEMAFIA.NG</strong> (&ldquo;we,&rdquo; &ldquo;our,&rdquo; &ldquo;us&rdquo;).</p>
        <p className="mb-4">These Terms of Service govern your use of our website, platform, services, academy, and related products.</p>
        <p className="mb-4">By accessing or using CODEMAFIA.NG, you agree to these terms. If you do not agree, please do not use the platform.</p>
        <p>Our goal is simple — to provide a powerful ecosystem for learning, building, and delivering modern digital solutions.</p>
      </>
    ),
  },
  {
    title: "2. What CODEMAFIA.NG Is",
    content: (
      <>
        <p className="mb-4">CODEMAFIA.NG is a digital ecosystem that includes:</p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>A Developer Academy (learning platform)</li>
          <li>A Projects Showcase (portfolio and case studies)</li>
          <li>A Services Platform (web, SaaS, mobile, and AI development)</li>
          <li>A Blog &amp; Insights system</li>
          <li>A contact and consultation system</li>
        </ul>
        <p>We exist to help individuals and businesses learn, build, and scale in technology.</p>
      </>
    ),
  },
  {
    title: "3. Eligibility",
    content: (
      <>
        <p className="mb-4">To use CODEMAFIA.NG, you must:</p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>Be at least 13 years old, or the legal digital consent age in your country</li>
          <li>Provide accurate information when required</li>
          <li>Use the platform in a lawful and respectful manner</li>
        </ul>
        <p>If you are using CODEMAFIA.NG on behalf of a business, you confirm that you have authority to do so.</p>
      </>
    ),
  },
  {
    title: "4. User Responsibility",
    content: (
      <>
        <p className="mb-4">When using our platform, you agree:</p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>Not to misuse, copy, or exploit our content or systems</li>
          <li>Not to attempt to hack, disrupt, or damage the platform</li>
          <li>Not to use the platform for illegal or harmful activities</li>
          <li>To respect intellectual property rights</li>
        </ul>
        <p>You are responsible for how you use the information, services, and resources provided.</p>
      </>
    ),
  },
  {
    title: "5. Academy & Learning Content",
    content: (
      <>
        <p className="mb-4">Our Academy provides educational content designed for learning and skill development.</p>
        <p className="mb-4">We do not guarantee:</p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>Job placement</li>
          <li>Income results</li>
          <li>Specific learning outcomes</li>
        </ul>
        <p>Your progress depends on your effort, consistency, and application of knowledge.</p>
      </>
    ),
  },
  {
    title: "6. Services & Client Work",
    content: (
      <>
        <p className="mb-4">CODEMAFIA.NG may offer services such as:</p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>Web development</li>
          <li>SaaS development</li>
          <li>Mobile app development</li>
          <li>UI/UX design</li>
          <li>Technical consulting</li>
        </ul>
        <p className="mb-4">All service agreements are handled individually and may include:</p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>Scope of work</li>
          <li>Pricing</li>
          <li>Delivery timelines</li>
          <li>Revision terms</li>
        </ul>
        <p>We reserve the right to accept or decline any project.</p>
      </>
    ),
  },
  {
    title: "7. Payments",
    content: (
      <>
        <p className="mb-4">Where applicable:</p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>Payments must be made according to agreed terms</li>
          <li>Some services may require upfront payment or deposits</li>
          <li>All payments are non-refundable unless stated otherwise in a specific agreement</li>
        </ul>
        <p>Failure to complete payment may result in suspension of services.</p>
      </>
    ),
  },
  {
    title: "8. Intellectual Property",
    content: (
      <>
        <p className="mb-4">All content on CODEMAFIA.NG, including:</p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>Text</li>
          <li>Code</li>
          <li>Designs</li>
          <li>Branding</li>
          <li>Logos</li>
          <li>Educational materials</li>
        </ul>
        <p className="mb-4">belongs to CODEMAFIA.NG unless otherwise stated.</p>
        <p>You may not copy, redistribute, or resell any part of the platform without permission.</p>
      </>
    ),
  },
  {
    title: "9. Third-Party Links",
    content: (
      <>
        <p className="mb-4">CODEMAFIA.NG may contain links to third-party websites or tools.</p>
        <p className="mb-4">We are not responsible for:</p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>Their content</li>
          <li>Their policies</li>
          <li>Their actions</li>
        </ul>
        <p>Use them at your own discretion.</p>
      </>
    ),
  },
  {
    title: "10. Limitation of Liability",
    content: (
      <>
        <p className="mb-4">CODEMAFIA.NG is provided &ldquo;as is.&rdquo;</p>
        <p className="mb-4">We are not liable for:</p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>Loss of data</li>
          <li>Business losses</li>
          <li>Service interruptions</li>
          <li>Technical issues beyond our control</li>
        </ul>
        <p>We do our best to maintain a stable and reliable platform, but we cannot guarantee it will always be error-free.</p>
      </>
    ),
  },
  {
    title: "11. Termination",
    content: (
      <>
        <p className="mb-4">We reserve the right to:</p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>Suspend or terminate access</li>
          <li>Remove content or accounts</li>
          <li>Restrict usage</li>
        </ul>
        <p>if any user violates these terms or misuses the platform.</p>
      </>
    ),
  },
  {
    title: "12. Modifications",
    content: (
      <>
        <p className="mb-4">We may update these Terms of Service from time to time.</p>
        <p className="mb-4">When changes are made:</p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>We will update the &ldquo;Last Updated&rdquo; date</li>
          <li>Continued use of the platform means you accept the changes</li>
        </ul>
      </>
    ),
  },
  {
    title: "13. Governing Principles",
    content: (
      <p>These Terms are governed by fair use, professional conduct, and applicable laws within your operating region. We aim to maintain transparency, fairness, and trust in all interactions.</p>
    ),
  },
  {
    title: "14. Contact",
    content: (
      <>
        <p className="mb-4">If you have questions about these Terms, you can contact us:</p>
        <p className="mb-2">📧 Email: <a href="mailto:admin@codemafia.ng" className="text-gold hover:underline">admin@codemafia.ng</a></p>
        <p>🌐 Website: <a href="https://codemafia.ng" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">https://codemafia.ng</a></p>
      </>
    ),
  },
  {
    title: "Last Updated",
    content: <p>July 2026</p>,
  },
  {
    title: "Final Note",
    content: (
      <>
        <p className="mb-4">CODEMAFIA.NG is built on trust, learning, and innovation.</p>
        <p>By using this platform, you agree to grow with us — responsibly, professionally, and with purpose.</p>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <>
      <PageHeader
        label="TERMS"
        title="Terms of"
        highlight="Service"
        description="Last updated: July 2026."
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
            {sections.map((section, i) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                className="glass rounded-2xl p-6 md:p-8"
              >
                <h2 className="text-lg font-bold text-white mb-3">{section.title}</h2>
                <div className="text-muted leading-relaxed text-sm">{section.content}</div>
              </motion.div>
            ))}
            <p className="text-center text-xs text-muted pt-4 border-t border-white/5">
              CODEMAFIA.NG is built on trust, learning, and innovation.
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}
