"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { api, type ProjectDetailData, type ProjectTypeSummaryData } from "@/lib/api";
import { useBooking } from "@/contexts/BookingContext";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const processPhases = [
  { step: "01", title: "Discovery", desc: "We learn about your business, goals, and requirements." },
  { step: "02", title: "Planning", desc: "We design the architecture, UX, and project roadmap." },
  { step: "03", title: "Design", desc: "We create wireframes, mockups, and visual design." },
  { step: "04", title: "Development", desc: "We build your product in agile sprints with regular updates." },
  { step: "05", title: "Testing", desc: "We rigorously test for quality, security, and performance." },
  { step: "06", title: "Deployment", desc: "We deploy, configure, and go live." },
  { step: "07", title: "Support", desc: "We provide ongoing maintenance, updates, and support." },
];

const portfolioPlaceholders = [
  { title: "Dashboard Overview", desc: "Main admin interface with analytics and key metrics" },
  { title: "User Interface", desc: "Clean, intuitive user-facing pages and components" },
  { title: "Mobile Responsive", desc: "Fully responsive design across all devices" },
];

const reviewPlaceholders = [
  { name: "Sarah Johnson", role: "CTO, TechStart", text: "CODEMAFIA delivered beyond our expectations. The project was on time, on budget, and the quality is exceptional.", rating: 5 },
  { name: "Michael Adeyemi", role: "Founder, EduPro", text: "Working with CODEMAFIA was a seamless experience. Their team understood our vision and executed perfectly.", rating: 5 },
  { name: "Chioma Okafor", role: "CEO, GreenEnergy", text: "Professional, responsive, and technically brilliant. They built exactly what we needed.", rating: 5 },
];

export default function ProjectTypePage() {
  const { service: serviceSlug, project: projectSlug } = useParams<{ service: string; project: string }>();
  const router = useRouter();
  const [data, setData] = useState<ProjectDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [relatedProjects, setRelatedProjects] = useState<ProjectTypeSummaryData[]>([]);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { setProjectType, setPackage } = useBooking();

  useEffect(() => {
    fetch("/api/auth/user", { credentials: "include" })
      .then((res) => setIsAuthenticated(res.ok))
      .catch(() => setIsAuthenticated(false));
  }, []);

  useEffect(() => {
    if (!serviceSlug || !projectSlug) return;
    api.getProjectType(serviceSlug, projectSlug).then((res) => {
      setData(res.data);
      setProjectType({ id: res.data.id, slug: res.data.slug, title: res.data.title });
      const recommended = res.data.packages.find((p) => p.is_recommended);
      if (recommended) setSelectedPackageId(recommended.id);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
      notFound();
    });

    api.getService(serviceSlug).then((res) => {
      setRelatedProjects((res.data.project_types || []).filter((pt) => pt.slug !== projectSlug).slice(0, 3));
    }).catch(() => {});
  }, [serviceSlug, projectSlug]);

  const selectedPkg = useMemo(
    () => data?.packages.find((p) => p.id === selectedPackageId),
    [data, selectedPackageId]
  );

  const addOnsTotalNgn = 0;
  const grandTotalNgn = (selectedPkg?.price_ngn || 0) + addOnsTotalNgn;

  const handleGetStarted = () => {
    if (isAuthenticated) {
      document.getElementById("packages-section")?.scrollIntoView({ behavior: "smooth" });
    } else {
      setShowAuthGate(true);
    }
  };

  const handleContinue = () => {
    if (!selectedPackageId || !data) return;
    const pkg = data.packages.find((p) => p.id === selectedPackageId);
    if (!pkg) return;
    setPackage({ id: pkg.id, slug: pkg.slug, name: pkg.name, price_ngn: pkg.price_ngn, price_usd: pkg.price_usd });
    if (!isAuthenticated) {
      setShowAuthGate(true);
      return;
    }
    router.push(`/hire/${serviceSlug}/${projectSlug}/book`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl p-8 animate-pulse space-y-4">
          <div className="h-8 w-64 bg-white/10 rounded" />
          <div className="h-4 w-96 bg-white/10 rounded" />
          <div className="h-32 w-full bg-white/10 rounded" />
        </div>
      </div>
    );
  }

  if (!data) return notFound();

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/30 to-surface" />
          <motion.div
            className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)" }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <Link
              href={`/hire/${serviceSlug}`}
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-white transition-colors mb-8"
            >
              ← Back to {data.service.title}
            </Link>
            <div className="text-5xl mb-4">{data.icon || "📋"}</div>
            <span className="section-label">{data.service.title.toUpperCase()}</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mt-4 mb-6">
              {data.title}
            </h1>
            <p className="text-lg md:text-xl text-muted max-w-3xl leading-relaxed">
              {data.description || data.short_description}
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <div className="glass rounded-xl px-5 py-3">
                <span className="text-xs text-muted uppercase tracking-wider">Starting From</span>
                <p className="text-xl font-bold text-gold mt-1">
                  ₦{data.starting_price_ngn.toLocaleString()}
                </p>
              </div>
              <div className="glass rounded-xl px-5 py-3">
                <span className="text-xs text-muted uppercase tracking-wider">Estimated Timeline</span>
                <p className="text-xl font-bold text-white mt-1">{data.estimated_timeline || "Varies"}</p>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10"
            >
              <button
                onClick={handleGetStarted}
                className="px-8 py-4 rounded-xl bg-gold-gradient text-background font-bold text-base hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
              >
                Get Started — Choose a Package
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      {data.features && data.features.length > 0 && (
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="relative z-10 max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <span className="section-label">FEATURES</span>
              <h2 className="section-heading mt-2">
                What&apos;s <span className="text-gradient">Included</span>
              </h2>
            </motion.div>
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {data.features.map((f, i) => (
                <motion.div
                  key={f}
                  variants={fadeUp}
                  className="glass rounded-xl p-4 flex items-center gap-3"
                >
                  <span className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="text-white text-sm">{f}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Portfolio / Screenshots */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/30 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <span className="section-label">PORTFOLIO</span>
            <h2 className="section-heading mt-2">
              What We&apos;ve <span className="text-gradient">Built</span>
            </h2>
            <p className="section-subtitle mt-3">Preview the quality and craftsmanship we deliver.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {(data.portfolio_samples?.length ?? 0) > 0
              ? data.portfolio_samples!.map((sample: any, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    className="glass rounded-2xl overflow-hidden group cursor-pointer"
                  >
                    <div className="aspect-video bg-gradient-to-br from-gold/5 to-white/5 flex items-center justify-center">
                      <div className="text-4xl opacity-30">🖼</div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-muted">{sample}</p>
                    </div>
                  </motion.div>
                ))
              : portfolioPlaceholders.map((p, i) => (
                  <motion.div
                    key={p.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    className="glass rounded-2xl overflow-hidden group"
                  >
                    <div className="aspect-video bg-gradient-to-br from-gold/5 to-white/5 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                      <div className="text-center">
                        <div className="text-4xl mb-2 opacity-30">🖼</div>
                        <p className="text-xs text-muted">Screenshot</p>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm font-medium text-white">{p.title}</p>
                      <p className="text-xs text-muted mt-1">{p.desc}</p>
                    </div>
                  </motion.div>
                ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      {data.technologies && data.technologies.length > 0 && (
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="relative z-10 max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12 text-center"
            >
              <span className="section-label">TECHNOLOGY</span>
              <h2 className="section-heading mt-2">
                Built With <span className="text-gradient">Modern Stack</span>
              </h2>
            </motion.div>
            <div className="flex flex-wrap justify-center gap-3">
              {data.technologies.map((tech) => (
                <span
                  key={tech}
                  className="glass rounded-full px-5 py-2.5 text-sm text-white font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Deliverables */}
      {data.deliverables && data.deliverables.length > 0 && (
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/30 to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <span className="section-label">DELIVERABLES</span>
              <h2 className="section-heading mt-2">
                What You&apos;ll <span className="text-gradient">Receive</span>
              </h2>
            </motion.div>
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 gap-4"
            >
              {data.deliverables.map((d, i) => (
                <motion.div
                  key={d}
                  variants={fadeUp}
                  className="glass rounded-xl p-5 flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold text-sm">
                    {i + 1}
                  </div>
                  <span className="text-white">{d}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Development Process */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/30 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <span className="section-label">PROCESS</span>
            <h2 className="section-heading mt-2">
              Our Development <span className="text-gradient">Process</span>
            </h2>
            <p className="section-subtitle mt-3">
              A proven methodology to ensure quality, transparency, and timely delivery.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            {processPhases.map((phase, i) => (
              <motion.div
                key={phase.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className="glass rounded-2xl p-6"
              >
                <span className="text-4xl font-bold text-gold/20">{phase.step}</span>
                <h3 className="text-lg font-bold text-white mt-3 mb-2">{phase.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{phase.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section id="packages-section" className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/30 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <span className="section-label">PACKAGES</span>
            <h2 className="section-heading mt-2">
              Choose Your <span className="text-gradient">Package</span>
            </h2>
            <p className="section-subtitle mt-3">
              Select the engagement level that best fits your needs and budget.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto"
          >
            {data.packages.map((pkg) => (
              <motion.div
                key={pkg.id}
                whileHover={{ y: -4 }}
                onClick={() => setSelectedPackageId(pkg.id)}
                className={`relative glass rounded-2xl p-6 md:p-8 cursor-pointer transition-all duration-300 ${
                  selectedPackageId === pkg.id ? "gold-border ring-1 ring-gold/30" : "hover:border-white/10"
                } ${pkg.is_recommended ? "md:scale-105" : ""}`}
              >
                {pkg.is_recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gold-gradient text-background text-xs font-bold uppercase tracking-wider">
                    Recommended
                  </div>
                )}
                <div className="text-center mb-6 pt-2">
                  <h3 className="text-lg font-bold text-white">{pkg.name}</h3>
                  <p className="text-xs text-muted mt-1">{pkg.description}</p>
                  <div className="text-3xl font-bold text-gold mt-3">
                    ₦{pkg.price_ngn.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted mt-1">{pkg.estimated_timeline}</div>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {(pkg.features || []).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted">
                      <span className="text-gold shrink-0 mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="text-xs text-muted text-center border-t border-white/10 pt-4">
                  {pkg.revision_count} revisions · {pkg.support_period} support
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 text-center"
          >
            <button
              onClick={handleContinue}
              disabled={!selectedPackageId}
              className="inline-block px-10 py-4 rounded-xl bg-gold-gradient text-background font-bold text-base hover:shadow-gold hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {selectedPkg
                ? `Continue with ${selectedPkg.name} — ₦${grandTotalNgn.toLocaleString()}`
                : "Select a Package to Continue"}
            </button>
            <p className="text-xs text-muted mt-3">Next: Customize with add-ons and requirements</p>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      {data.faqs && data.faqs.length > 0 && (
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="relative z-10 max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12 text-center"
            >
              <span className="section-label">FAQ</span>
              <h2 className="section-heading mt-2">
                Frequently Asked <span className="text-gradient">Questions</span>
              </h2>
            </motion.div>
            <div className="max-w-3xl mx-auto space-y-3">
              {data.faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                >
                  <button
                    onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                    className="w-full glass rounded-2xl p-5 text-left hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-white font-semibold">{faq.q}</h3>
                      <svg
                        className={`w-5 h-5 text-gold shrink-0 transition-transform duration-300 ${faqOpen === i ? "rotate-180" : ""}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    {faqOpen === i && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="text-muted text-sm leading-relaxed mt-3"
                      >
                        {faq.a}
                      </motion.p>
                    )}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/30 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <span className="section-label">TESTIMONIALS</span>
            <h2 className="section-heading mt-2">
              What Our <span className="text-gradient">Clients Say</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {reviewPlaceholders.map((review, i) => (
              <motion.div
                key={review.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: review.rating }).map((_, j) => (
                    <svg key={j} className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-muted text-sm leading-relaxed mb-4">&ldquo;{review.text}&rdquo;</p>
                <div>
                  <p className="text-white font-semibold text-sm">{review.name}</p>
                  <p className="text-xs text-muted">{review.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="relative z-10 max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <span className="section-label">RELATED</span>
              <h2 className="section-heading mt-2">
                Similar <span className="text-gradient">Projects</span>
              </h2>
            </motion.div>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-5"
            >
              {relatedProjects.map((rp) => (
                <motion.div key={rp.id} variants={fadeUp} className="h-full">
                  <Link
                    href={`/hire/${serviceSlug}/${rp.slug}`}
                    className="block glass rounded-2xl p-6 hover:border-gold/20 transition-all duration-300 h-full group"
                  >
                    <div className="text-2xl mb-3">{rp.icon || "📋"}</div>
                    <h3 className="text-white font-bold mb-2 group-hover:text-gold transition-colors">{rp.title}</h3>
                    <p className="text-muted text-sm leading-relaxed line-clamp-2">{rp.short_description}</p>
                    <div className="mt-4 text-sm text-gold font-semibold">
                      ₦{rp.starting_price_ngn.toLocaleString()}+
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.02] to-transparent" />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
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
              <span className="text-gradient">{data.title}?</span>
            </h2>
            <p className="text-lg md:text-xl text-muted mt-6 max-w-2xl mx-auto leading-relaxed">
              Let&apos;s discuss your project. Get a free consultation and custom proposal.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <button
              onClick={() => document.getElementById("packages-section")?.scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-4 rounded-xl bg-gold-gradient text-background font-bold text-base hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
            >
              Choose a Package
            </button>
            <Link
              href="/hire/request-quote"
              className="px-8 py-4 rounded-xl border border-white/10 text-white font-bold text-base hover:bg-white/5 transition-all duration-300"
            >
              Request Custom Quote
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Auth Gate Overlay */}
      {showAuthGate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowAuthGate(false)} />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative glass rounded-2xl p-8 md:p-10 max-w-md w-full text-center"
          >
            <button
              onClick={() => setShowAuthGate(false)}
              className="absolute top-4 right-4 text-muted hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="text-4xl mb-4">🔐</div>
            <h2 className="text-2xl font-bold text-white">Continue Your Project Request</h2>
            <p className="text-muted mt-3 leading-relaxed">
              To continue, please create your client account or sign in if you already have one.
            </p>
            <div className="mt-8 space-y-3">
              <Link
                href={`/auth/register?redirect=${encodeURIComponent(`/hire/${serviceSlug}/${projectSlug}`)}`}
                className="block w-full px-6 py-3.5 rounded-xl bg-gold-gradient text-background font-bold text-sm hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
              >
                Create Client Account
              </Link>
              <Link
                href={`/auth/login?redirect=${encodeURIComponent(`/hire/${serviceSlug}/${projectSlug}`)}`}
                className="block w-full px-6 py-3.5 rounded-xl border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition-all duration-300"
              >
                Already a Client? Login
              </Link>
            </div>
            <p className="text-xs text-muted mt-4">
              After signing in, you&apos;ll return here to continue your project request.
            </p>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
