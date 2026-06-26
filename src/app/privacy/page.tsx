"use client";

import { motion } from "framer-motion";
import PageHeader from "@/components/pages/PageHeader";

const sections = [
  {
    title: "1. Introduction",
    content: (
      <>
        <p className="mb-4">Welcome to <strong>CODEMAFIA.NG</strong> (&ldquo;we,&rdquo; &ldquo;our,&rdquo; &ldquo;us&rdquo;).</p>
        <p className="mb-4">This Privacy Policy explains how we collect, use, and protect your information when you use our website, services, academy, blog, and related platforms.</p>
        <p className="mb-4">By using CODEMAFIA.NG, you agree to the practices described in this policy.</p>
        <p>We respect your privacy and are committed to protecting your personal data.</p>
      </>
    ),
  },
  {
    title: "2. Information We Collect",
    content: (
      <>
        <p className="mb-4">We collect information to improve your experience and deliver better services.</p>
        <p className="mb-2 font-semibold text-white">A. Information You Provide</p>
        <p className="mb-4">When you interact with CODEMAFIA.NG, you may provide:</p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>Name</li>
          <li>Email address</li>
          <li>Phone number</li>
          <li>Project or consultation details</li>
          <li>Messages sent through contact forms</li>
          <li>Academy registration details (if applicable)</li>
        </ul>
        <p className="mb-2 font-semibold text-white">B. Automatically Collected Information</p>
        <p className="mb-4">When you use our platform, we may automatically collect:</p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>IP address</li>
          <li>Device type</li>
          <li>Browser type</li>
          <li>Pages visited</li>
          <li>Time spent on pages</li>
          <li>General usage analytics</li>
        </ul>
        <p className="mb-4">This helps us understand how users interact with our platform.</p>
        <p className="mb-2 font-semibold text-white">C. Cookies and Tracking</p>
        <p className="mb-4">We may use cookies and similar technologies to:</p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>Improve user experience</li>
          <li>Analyze traffic</li>
          <li>Remember user preferences</li>
          <li>Optimize performance</li>
        </ul>
        <p>You can disable cookies in your browser settings if you prefer.</p>
      </>
    ),
  },
  {
    title: "3. How We Use Your Information",
    content: (
      <>
        <p className="mb-4">We use your information to:</p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>Provide and improve our services</li>
          <li>Respond to inquiries and messages</li>
          <li>Manage academy access and user accounts</li>
          <li>Process project and consultation requests</li>
          <li>Improve website performance and user experience</li>
          <li>Send important updates or notifications</li>
        </ul>
        <p>We do <strong>not sell your personal data</strong>.</p>
      </>
    ),
  },
  {
    title: "4. Data Sharing",
    content: (
      <>
        <p className="mb-4">We only share your data in limited situations:</p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>With trusted service providers (e.g., hosting, analytics tools)</li>
          <li>When required by law or legal process</li>
          <li>To protect our rights, safety, or users</li>
        </ul>
        <p>We do not share your personal information with third parties for marketing purposes.</p>
      </>
    ),
  },
  {
    title: "5. Data Security",
    content: (
      <>
        <p className="mb-4">We take reasonable steps to protect your information.</p>
        <p className="mb-4">This includes:</p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>Secure servers</li>
          <li>Access control measures</li>
          <li>Encrypted communication where possible</li>
        </ul>
        <p>However, no system is 100% secure, and we cannot guarantee absolute security.</p>
      </>
    ),
  },
  {
    title: "6. User Rights",
    content: (
      <>
        <p className="mb-4">Depending on your location, you may have rights to:</p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>Access your personal data</li>
          <li>Request corrections</li>
          <li>Request deletion of your data</li>
          <li>Opt out of communications</li>
        </ul>
        <p>To make a request, contact us at: <a href="mailto:admin@codemafia.ng" className="text-gold hover:underline">admin@codemafia.ng</a></p>
      </>
    ),
  },
  {
    title: "7. Third-Party Services",
    content: (
      <>
        <p className="mb-4">CODEMAFIA.NG may use third-party tools such as:</p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>Analytics services</li>
          <li>Hosting providers</li>
          <li>Payment processors</li>
          <li>Communication tools</li>
        </ul>
        <p className="mb-4">These services operate under their own privacy policies.</p>
        <p>We are not responsible for their practices.</p>
      </>
    ),
  },
  {
    title: "8. Data Retention",
    content: (
      <>
        <p className="mb-4">We retain your data only as long as necessary to:</p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>Provide services</li>
          <li>Comply with legal obligations</li>
          <li>Maintain business operations</li>
        </ul>
        <p>You may request deletion of your data at any time.</p>
      </>
    ),
  },
  {
    title: "9. Children&rsquo;s Privacy",
    content: (
      <>
        <p className="mb-4">CODEMAFIA.NG is not intended for children under the age of 13 (or applicable digital consent age in your region).</p>
        <p>We do not knowingly collect data from children.</p>
      </>
    ),
  },
  {
    title: "10. International Users",
    content: (
      <p>If you access CODEMAFIA.NG from outside our operating country, you agree that your data may be processed in countries where data protection laws may differ.</p>
    ),
  },
  {
    title: "11. Changes to This Policy",
    content: (
      <>
        <p className="mb-4">We may update this Privacy Policy from time to time.</p>
        <p className="mb-4">When we do:</p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>We will update the &ldquo;Last Updated&rdquo; date</li>
          <li>Continued use of the platform means you accept the changes</li>
        </ul>
      </>
    ),
  },
  {
    title: "12. Contact Us",
    content: (
      <>
        <p className="mb-4">If you have any questions about this Privacy Policy, you can contact us:</p>
        <p className="mb-2">📧 Email: <a href="mailto:admin@codemafia.ng" className="text-gold hover:underline">admin@codemafia.ng</a></p>
        <p>🌐 Website: <a href="https://codemafia.ng" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">https://codemafia.ng</a></p>
      </>
    ),
  },
  {
    title: "Last Updated",
    content: <p>January 2026</p>,
  },
  {
    title: "Final Note",
    content: (
      <>
        <p className="mb-4">Your privacy matters to us.</p>
        <p>CODEMAFIA.NG is built to be a safe, transparent, and trustworthy ecosystem for learning, building, and growing in technology.</p>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        label="PRIVACY"
        title="Privacy"
        highlight="Policy"
        description="Last updated: January 2026."
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
          </motion.div>
        </div>
      </section>
    </>
  );
}
