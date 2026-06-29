"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { api, type ServiceDetailData } from "@/lib/api";
import { useBooking } from "@/contexts/BookingContext";

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const gradients: Record<string, string> = {
  "web-development": "from-blue-500/10 to-cyan-500/10",
  "saas-development": "from-purple-500/10 to-violet-500/10",
  "mobile-development": "from-green-500/10 to-emerald-500/10",
  "ui-ux-design": "from-orange-500/10 to-amber-500/10",
  "ai-solutions": "from-pink-500/10 to-rose-500/10",
};

const serviceIcons: Record<string, string> = {
  "web-development": "🌐",
  "saas-development": "☁️",
  "mobile-development": "📱",
  "ui-ux-design": "🎨",
  "ai-solutions": "🤖",
};

export default function ServiceDetailPage() {
  const params = useParams();
  const serviceSlug = params.service as string;
  const [data, setData] = useState<ServiceDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const { setService } = useBooking();

  useEffect(() => {
    if (!serviceSlug) return;
    setLoading(true);
    api.getService(serviceSlug).then((res) => {
      setData(res.data);
      setService({ id: res.data.id, slug: res.data.slug, title: res.data.title });
      setLoading(false);
    }).catch(() => {
      setLoading(false);
      notFound();
    });
  }, [serviceSlug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl p-8 animate-pulse space-y-4">
          <div className="h-8 w-64 bg-white/10 rounded" />
          <div className="h-4 w-96 bg-white/10 rounded" />
          <div className="h-48 w-full bg-white/5 rounded" />
        </div>
      </div>
    );
  }

  if (!data) return notFound();

  return (
    <>
      <section className="relative pt-20 pb-16 md:pt-24 md:pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-20"
            style={{ background: `radial-gradient(circle at 50% 50%, rgba(212,175,55,0.08) 0%, transparent 50%)` }}
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
            <div className="flex items-center gap-6 mb-6">
              <div className="text-5xl">{data.icon || serviceIcons[data.slug] || "🚀"}</div>
              <div>
                <span className="section-label">{data.subtitle || "SERVICE"}</span>
                <h1 className="section-heading mt-1">
                  {data.title}
                </h1>
              </div>
            </div>
            <p className="section-subtitle mt-4 max-w-2xl">
              {data.description || data.short_description}
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <div className="glass rounded-xl px-5 py-3">
                <span className="text-xs text-muted uppercase tracking-wider">Starting From</span>
                <p className="text-xl font-bold text-gold mt-1">
                  {data.starting_price_ngn > 0 ? `₦${data.starting_price_ngn.toLocaleString()}` : "Custom Quote"}
                </p>
              </div>
              {data.estimated_delivery && (
                <div className="glass rounded-xl px-5 py-3">
                  <span className="text-xs text-muted uppercase tracking-wider">Typical Timeline</span>
                  <p className="text-xl font-bold text-white mt-1">{data.estimated_delivery}</p>
                </div>
              )}
              <div className="glass rounded-xl px-5 py-3">
                <span className="text-xs text-muted uppercase tracking-wider">Project Types</span>
                <p className="text-xl font-bold text-white mt-1">{data.project_types?.length || 0}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      {data.features && data.features.length > 0 && (
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
              <span className="section-label">CAPABILITIES</span>
              <h2 className="section-heading mt-2">
                What We <span className="text-gradient">Deliver</span>
              </h2>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {(data.features || []).map((f, i) => (
                <motion.div
                  key={f}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
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
            </div>
          </div>
        </section>
      )}

      {/* Project Types */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <span className="section-label">PROJECT TYPES</span>
            <h2 className="section-heading mt-2">
              Choose Your <span className="text-gradient">Project</span>
            </h2>
            <p className="section-subtitle mt-3">
              Browse our project categories and select the one that best fits your needs.
            </p>
          </motion.div>

          {data.project_types && data.project_types.length > 0 ? (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {data.project_types.map((pt) => (
                <motion.div key={pt.id} variants={fadeUp} className="h-full">
                  <Link
                    href={`/hire/${data.slug}/${pt.slug}`}
                    className="block glass rounded-2xl p-6 md:p-8 hover:border-gold/20 transition-all duration-300 cursor-pointer h-full group"
                  >
                    <div className="text-3xl mb-4">{pt.icon || "📋"}</div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-gold transition-colors">{pt.title}</h3>
                    <p className="text-muted text-sm leading-relaxed mb-4 line-clamp-2">{pt.short_description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gold font-semibold">
                        {pt.starting_price_ngn > 0 ? `₦${pt.starting_price_ngn.toLocaleString()}+` : "Custom"}
                      </span>
                      {pt.estimated_timeline && (
                        <span className="text-xs text-muted">{pt.estimated_timeline}</span>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="glass rounded-2xl p-12 text-center">
              <p className="text-muted mb-6">
                Project types are being configured for this service.
              </p>
              <Link
                href="/hire/request-quote"
                className="inline-block px-8 py-4 rounded-xl bg-gold-gradient text-background font-bold text-base hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
              >
                Request Custom Quote
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
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
              <span className="text-gradient">{data.title}?</span>
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
