"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { api, type ProjectDetailData } from "@/lib/api";
import { useBooking } from "@/contexts/BookingContext";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function ProjectTypePage() {
  const { service: serviceSlug, project: projectSlug } = useParams<{ service: string; project: string }>();
  const router = useRouter();
  const [data, setData] = useState<ProjectDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const { state, setProjectType, setPackage } = useBooking();

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
  }, [serviceSlug, projectSlug]);

  const selectedPkg = data?.packages.find((p) => p.id === selectedPackageId);

  const handleContinue = () => {
    if (!selectedPackageId || !data) return;
    const pkg = data.packages.find((p) => p.id === selectedPackageId);
    if (!pkg) return;
    setPackage({ id: pkg.id, slug: pkg.slug, name: pkg.name, price_ngn: pkg.price_ngn, price_usd: pkg.price_usd });
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
            className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full"
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
            <span className="section-label">{data.service.title.toUpperCase()}</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mt-4 mb-6">
              {data.title}
            </h1>
            <p className="text-lg md:text-xl text-muted max-w-3xl leading-relaxed">
              {data.description}
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.features.map((f, i) => (
                <motion.div
                  key={f}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                  className="glass rounded-xl p-4 flex items-center gap-3"
                >
                  <span className="text-gold shrink-0">✓</span>
                  <span className="text-white text-sm">{f}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Technology Stack */}
      {data.technologies && data.technologies.length > 0 && (
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
            <div className="grid md:grid-cols-2 gap-4">
              {data.deliverables.map((d, i) => (
                <motion.div
                  key={d}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                  className="glass rounded-xl p-5 flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold text-sm">
                    {i + 1}
                  </div>
                  <span className="text-white">{d}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Packages */}
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
            <span className="section-label">PACKAGES</span>
            <h2 className="section-heading mt-2">
              Choose Your <span className="text-gradient">Package</span>
            </h2>
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
                  <div className="text-3xl font-bold text-gold mt-3">
                    ₦{pkg.price_ngn.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted mt-1">{pkg.estimated_timeline}</div>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {pkg.features?.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted">
                      <span className="text-gold shrink-0 mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="text-xs text-muted text-center">
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
              Continue to Customize →
            </button>
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
            <div className="max-w-3xl mx-auto space-y-4">
              {data.faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="glass rounded-2xl p-6"
                >
                  <h3 className="text-white font-semibold mb-2">{faq.q}</h3>
                  <p className="text-muted text-sm leading-relaxed">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
