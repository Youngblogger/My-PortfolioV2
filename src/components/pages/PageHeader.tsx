"use client";

import { motion } from "framer-motion";

interface PageHeaderProps {
  label: string;
  title: string;
  highlight?: string;
  description: string;
}

export default function PageHeader({ label, title, highlight, description }: PageHeaderProps) {
  return (
    <section className="relative pt-20 pb-16 md:pt-24 md:pb-20 overflow-hidden">
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(212,175,55,0.08) 0%, transparent 50%)",
          }}
        />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="section-label">{label}</span>
          <h1 className="section-heading mt-2 max-w-4xl mx-auto">
            {title}
            {highlight && (
              <>
                {" "}
                <span className="text-gradient">{highlight}</span>
              </>
            )}
          </h1>
          <p className="section-subtitle mt-4 mx-auto">{description}</p>
        </motion.div>
      </div>
    </section>
  );
}
