"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import PageHeader from "@/components/pages/PageHeader";
import { api, type ServiceData } from "@/lib/api";
import { useBooking } from "@/contexts/BookingContext";

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

const gradients: Record<string, string> = {
  "web-development": "from-blue-500/10 to-cyan-500/10",
  "saas-development": "from-purple-500/10 to-violet-500/10",
  "mobile-development": "from-green-500/10 to-emerald-500/10",
  "ui-ux-design": "from-orange-500/10 to-amber-500/10",
  "ai-solutions": "from-pink-500/10 to-rose-500/10",
};

export default function HirePage() {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const { setService } = useBooking();

  useEffect(() => {
    api.getServices().then((res) => {
      setServices(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader
        label="SERVICES"
        title="Build Your Next Product"
        highlight="With Us"
        description="From concept to launch — we partner with startups and enterprises to build world-class digital products."
      />

      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/50 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="glass rounded-2xl p-6 md:p-8 animate-pulse h-48" />
              ))}
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {services.map((service) => (
                <motion.div
                  key={service.id}
                  variants={cardVariants}
                  className="group relative rounded-2xl glass glass-hover overflow-hidden"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${gradients[service.slug] || "from-gold/5 to-gold/10"} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  />
                  <Link
                    href={`/hire/${service.slug}`}
                    onClick={() => setService({ id: service.id, slug: service.slug, title: service.title })}
                    className="relative block p-6 md:p-8"
                  >
                    <div className="text-3xl mb-4">{service.icon}</div>
                    <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                    <p className="text-muted text-sm leading-relaxed mb-6">
                      {service.short_description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="inline-block px-4 py-2 rounded-full glass text-sm text-gold font-semibold">
                        {service.starting_price_ngn > 0
                          ? `Starting ₦${service.starting_price_ngn.toLocaleString()}`
                          : "Custom Quote"}
                      </span>
                      <span className="text-xs text-muted">{service.project_types_count} project types</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
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
              Don&apos;t See What
              <br />
              <span className="text-gradient">You&apos;re Looking For?</span>
            </h2>
            <p className="text-lg md:text-xl text-muted mt-6 max-w-2xl mx-auto leading-relaxed">
              Every product is unique. Tell us about your vision and we&apos;ll craft a custom solution tailored to your needs.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
            className="mt-10"
          >
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                boxShadow: [
                  "0 0 0px rgba(212,175,55,0)",
                  "0 0 30px rgba(212,175,55,0.6)",
                  "0 0 0px rgba(212,175,55,0)",
                ],
              }}
              transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
            >
              <Link
                href="/hire/request-quote"
                className="inline-block px-8 py-4 rounded-xl bg-gold-gradient text-background font-bold text-base hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
              >
                ⚡ Request Custom Quote
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
