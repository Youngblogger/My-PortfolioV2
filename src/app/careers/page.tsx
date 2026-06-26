"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import PageHeader from "@/components/pages/PageHeader";

const openings = [
  {
    title: "Full-Stack Developer (Intern)",
    type: "Internship",
    location: "Remote",
    description: "Build real-world projects while learning from senior engineers. Perfect for academy graduates or self-taught developers looking for industry experience.",
  },
  {
    title: "Frontend Developer",
    type: "Full-Time",
    location: "Lagos / Remote",
    description: "Build beautiful, performant user interfaces using React, Next.js, and modern frontend tools. Work on client projects and internal products.",
  },
  {
    title: "Backend Developer",
    type: "Full-Time",
    location: "Lagos / Remote",
    description: "Design and build scalable APIs, microservices, and database architectures. Work with Node.js, Python, and cloud infrastructure.",
  },
  {
    title: "Community Manager",
    type: "Part-Time",
    location: "Remote",
    description: "Manage our growing developer community. Organize events, moderate discussions, and help members connect and grow.",
  },
  {
    title: "Technical Writer",
    type: "Contract",
    location: "Remote",
    description: "Create tutorials, documentation, and blog posts about software development, AI, and technology trends.",
  },
  {
    title: "UI/UX Designer",
    type: "Contract",
    location: "Remote",
    description: "Design intuitive, beautiful interfaces for web and mobile applications. Work with our development team to bring designs to life.",
  },
];

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

export default function CareersPage() {
  return (
    <>
      <PageHeader
        label="CAREERS"
        title="Join the"
        highlight="CODEMAFIA Team"
        description="Help us build Africa's next generation of software engineers. We're looking for passionate people to join our mission."
      />

      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/30 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6 mb-20">
            <div className="glass rounded-2xl p-8 text-center">
              <div className="text-3xl font-bold text-gold mb-2">Remote</div>
              <p className="text-sm text-muted">Work from anywhere</p>
            </div>
            <div className="glass rounded-2xl p-8 text-center">
              <div className="text-3xl font-bold text-gold mb-2">Growth</div>
              <p className="text-sm text-muted">Continuous learning</p>
            </div>
            <div className="glass rounded-2xl p-8 text-center">
              <div className="text-3xl font-bold text-gold mb-2">Impact</div>
              <p className="text-sm text-muted">Build Africa&apos;s future</p>
            </div>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-4"
          >
            <h2 className="section-heading mb-8">
              Open <span className="text-gradient">Positions</span>
            </h2>

            {openings.map((job) => (
              <motion.div
                key={job.title}
                variants={cardVariants}
                className="glass rounded-2xl p-6 md:p-8 hover:border-gold/20 transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-white">{job.title}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gold/10 text-gold border border-gold/20">
                        {job.type}
                      </span>
                    </div>
                    <p className="text-sm text-muted mb-1">{job.location}</p>
                    <p className="text-sm text-white/70 mt-2">{job.description}</p>
                  </div>
                  <Link
                    href="/contact"
                    className="shrink-0 px-6 py-3 rounded-xl bg-gold-gradient text-background font-semibold text-sm hover:shadow-gold hover:scale-[1.02] transition-all duration-300 text-center"
                  >
                    Apply Now
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            className="mt-20 glass rounded-2xl p-8 md:p-10 text-center"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Don&apos;t See a Role That Fits?
            </h2>
            <p className="text-muted max-w-xl mx-auto mb-6">
              We&apos;re always looking for talented people. Send us your resume and we&apos;ll keep you in mind for future opportunities.
            </p>
            <Link
              href="/contact"
              className="inline-block px-8 py-4 rounded-xl bg-gold-gradient text-background font-bold text-base hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
            >
              Send Your Resume
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
