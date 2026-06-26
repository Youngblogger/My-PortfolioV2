"use client";

import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

const services = [
  { id: "e-commerce", title: "E-Commerce Website", description: "Online store system with product catalog, cart, checkout, payment integration, admin dashboard, and inventory management.", icon: "🛒", price: "₦350,000 – ₦3,000,000", gradient: "from-blue-500/10 to-cyan-500/10" },
  { id: "lms", title: "LMS / Education Platform", description: "Learning management system with student dashboard, course system, video lessons, progress tracking, and certificates.", icon: "🎓", price: "₦400,000 – ₦3,500,000", gradient: "from-green-500/10 to-emerald-500/10" },
  { id: "business-website", title: "Business Website", description: "Corporate website with landing page, service pages, contact system, CMS, and SEO optimization.", icon: "🏢", price: "₦250,000 – ₦800,000", gradient: "from-purple-500/10 to-violet-500/10" },
  { id: "entertainment", title: "Entertainment Platform", description: "Media/streaming system with video/audio streaming, user profiles, content categories, and admin upload.", icon: "🎬", price: "₦500,000 – ₦4,000,000", gradient: "from-orange-500/10 to-amber-500/10" },
  { id: "saas", title: "SaaS Platform", description: "Custom SaaS product with authentication, dashboard UI, API architecture, subscription system, and RBAC.", icon: "☁️", price: "Custom (₦3,000,000+)", gradient: "from-pink-500/10 to-rose-500/10" },
  { id: "mvp", title: "Startup MVP Build", description: "MVP architecture, core feature development, rapid prototyping, and deployment setup for your startup idea.", icon: "🚀", price: "₦500,000 – ₦2,500,000", gradient: "from-yellow-500/10 to-orange-500/10" },
];

const includes: Record<string, string[]> = {
  "e-commerce": ["Product catalog management", "Shopping cart & checkout", "Payment gateway integration", "Admin dashboard", "Inventory management system", "Order management", "Customer accounts", "Mobile responsive design"],
  "lms": ["Student dashboard", "Course creation system", "Video lesson hosting", "Progress tracking", "Certificate generation", "Quiz & assessment system", "Student management", "Analytics & reporting"],
  "business-website": ["Custom landing page", "Service pages", "Contact form system", "Content management", "SEO optimization", "Google Analytics", "Social media integration", "Blog system"],
  "entertainment": ["Video/audio streaming", "User profile system", "Content categorization", "Admin upload panel", "Search & discovery", "Watch history", "User ratings", "Responsive design"],
  "saas": ["Authentication system", "Dashboard UI kit", "API architecture", "Subscription management", "Role-based access", "Database design", "Analytics system", "Documentation"],
  "mvp": ["MVP architecture design", "Core feature development", "Rapid prototyping", "Deployment setup", "Database setup", "Basic authentication", "API development", "Testing & QA"],
};

const upgrades = [
  { name: "AI Integration", description: "Add intelligent features powered by machine learning", price: "+₦150,000" },
  { name: "Mobile App Extension", description: "Native iOS and Android app for your platform", price: "+₦500,000" },
  { name: "Performance Optimization", description: "Advanced caching, CDN, and load time optimization", price: "+₦100,000" },
  { name: "Advanced Security Layer", description: "Penetration testing, audit logging, DDoS protection", price: "+₦200,000" },
  { name: "Admin Dashboard Upgrade", description: "Advanced analytics, custom reports, user management", price: "+₦150,000" },
  { name: "Automation Features", description: "Email automation, workflow triggers, scheduled tasks", price: "+₦120,000" },
  { name: "Analytics System", description: "Custom dashboards, user tracking, conversion funnels", price: "+₦100,000" },
];

const process = [
  { step: "01", title: "Discovery", description: "We learn about your business, goals, and requirements." },
  { step: "02", title: "Planning", description: "We design the architecture, UX, and project roadmap." },
  { step: "03", title: "Development", description: "We build your product in agile sprints with regular updates." },
  { step: "04", title: "Launch", description: "We deploy, test, and hand over your fully functional product." },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
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

export default function ServiceDetailPage() {
  const params = useParams();
  const service = services.find((s) => s.id === params.service);

  if (!service) {
    notFound();
  }

  const serviceIncludes = includes[service.id] ?? [];

  return (
    <>
      <section className="relative pt-20 pb-16 md:pt-24 md:pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-20"
            style={{ background: "radial-gradient(circle at 50% 50%, rgba(212,175,55,0.08) 0%, transparent 50%)" }}
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
          >
            <Link
              href="/hire"
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-gold transition-colors duration-300 mb-8"
            >
              ← Back to Services
            </Link>
            <div className="text-5xl mb-6">{service.icon}</div>
            <h1 className="section-heading max-w-4xl">
              {service.title}
            </h1>
            <p className="section-subtitle mt-4 max-w-2xl">
              {service.description}
            </p>
            <div className="inline-block mt-6 px-5 py-2.5 rounded-full glass text-sm text-gold font-semibold">
              {service.price}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/50 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            className="mb-12"
          >
            <span className="section-label">INCLUDED</span>
            <h2 className="section-heading mt-2">
              What&apos;s
              <br />
              <span className="text-gradient">Included</span>
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {serviceIncludes.map((item) => (
              <motion.div
                key={item}
                variants={fadeUp}
                className="glass rounded-2xl p-5 flex items-start gap-3"
              >
                <span className="text-gold shrink-0 mt-0.5">✓</span>
                <span className="text-sm text-white/80">{item}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            className="mb-12"
          >
            <span className="section-label">UPGRADES</span>
            <h2 className="section-heading mt-2">
              Optional
              <br />
              <span className="text-gradient">Upgrades</span>
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {upgrades.map((upgrade) => (
              <motion.div
                key={upgrade.name}
                variants={fadeUp}
                className="glass rounded-2xl p-6 md:p-8 gold-border/50 hover:gold-border transition-all duration-300"
              >
                <h3 className="text-lg font-bold text-white mb-2">{upgrade.name}</h3>
                <p className="text-muted text-sm leading-relaxed mb-4">{upgrade.description}</p>
                <span className="text-gold font-semibold text-sm">{upgrade.price}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/50 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            className="mb-12"
          >
            <span className="section-label">PROCESS</span>
            <h2 className="section-heading mt-2">
              Our
              <br />
              <span className="text-gradient">Process</span>
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-4 gap-5"
          >
            {process.map((phase) => (
              <motion.div
                key={phase.step}
                variants={fadeUp}
                className="glass rounded-2xl p-6 md:p-8"
              >
                <span className="text-4xl font-bold text-gold/30">{phase.step}</span>
                <h3 className="text-lg font-bold text-white mt-4 mb-3">{phase.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{phase.description}</p>
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
              Ready to Build Your
              <br />
              <span className="text-gradient">{service.title}?</span>
            </h2>
            <p className="text-lg md:text-xl text-muted mt-6 max-w-2xl mx-auto leading-relaxed">
              Let&apos;s discuss your project requirements and create something amazing together.
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
              href="/hire/request-quote"
              className="px-8 py-4 rounded-xl bg-gold-gradient text-background font-bold text-base hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
            >
              Request a Quote
            </Link>
            <Link
              href="/hire"
              className="px-8 py-4 rounded-xl border border-white/10 text-white font-bold text-base hover:bg-white/5 transition-all duration-300"
            >
              View All Services
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
