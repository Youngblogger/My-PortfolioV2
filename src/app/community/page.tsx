"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import PageHeader from "@/components/pages/PageHeader";

const features = [
  { title: "Developer Discussions", description: "Join technical conversations with fellow developers. Share knowledge, ask questions, and solve problems together.", icon: "💬", gradient: "from-blue-500/10 to-cyan-500/10" },
  { title: "Student Groups", description: "Connect with peers in your learning track. Study together, review code, and build projects as a team.", icon: "👥", gradient: "from-green-500/10 to-emerald-500/10" },
  { title: "Live Events", description: "Attend workshops, hackathons, and tech talks hosted by industry professionals from leading companies.", icon: "🎯", gradient: "from-purple-500/10 to-violet-500/10" },
  { title: "Coding Challenges", description: "Test your skills with weekly coding challenges and compete on leaderboards with developers across Africa.", icon: "🏆", gradient: "from-orange-500/10 to-amber-500/10" },
  { title: "Mentorship Program", description: "Get paired with experienced engineers who guide your learning journey and help you achieve your career goals.", icon: "🌟", gradient: "from-pink-500/10 to-rose-500/10" },
  { title: "Networking", description: "Build professional connections with developers, founders, and tech leaders across the African ecosystem.", icon: "🔗", gradient: "from-yellow-500/10 to-orange-500/10" },
];

const stats = [
  { value: "5,000+", label: "Community Members" },
  { value: "200+", label: "Live Events" },
  { value: "50+", label: "Mentors" },
  { value: "30+", label: "Countries" },
];

const events = [
  { title: "Building APIs with Next.js", date: "July 15, 2026", type: "Workshop" },
  { title: "Hackathon: Fintech Edition", date: "August 1-3, 2026", type: "Hackathon" },
  { title: "Career Talk: Landing Your First Dev Job", date: "July 22, 2026", type: "Talk" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
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

export default function CommunityPage() {
  return (
    <>
      <PageHeader
        label="COMMUNITY"
        title="Join The"
        highlight="CODEMAFIA Community"
        description="A thriving ecosystem of developers, learners, and innovators building the future of African technology."
      />

      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/30 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-20"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center rounded-xl glass p-6">
                <div className="text-2xl md:text-3xl font-bold text-gold">{stat.value}</div>
                <div className="text-sm text-muted mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                className="group relative rounded-2xl glass glass-hover overflow-hidden p-6 md:p-8"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative">
                  <div className="text-3xl mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-muted text-sm leading-relaxed">{feature.description}</p>
                </div>
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

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            className="text-center mb-12"
          >
            <h2 className="section-heading">
              Upcoming <span className="text-gradient">Events</span>
            </h2>
            <p className="section-subtitle mt-4 mx-auto">
              Join us for workshops, hackathons, and talks from industry professionals.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto"
          >
            {events.map((event) => (
              <motion.div
                key={event.title}
                variants={cardVariants}
                className="group relative rounded-2xl glass glass-hover overflow-hidden p-6"
              >
                <div className="relative">
                  <span className="inline-block text-xs font-semibold uppercase tracking-wider text-gold mb-3">
                    {event.type}
                  </span>
                  <h3 className="text-base font-bold text-white mb-2">{event.title}</h3>
                  <p className="text-sm text-muted">{event.date}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/50 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Ready To Join
              <br />
              <span className="text-gradient">The Movement?</span>
            </h2>
            <p className="text-lg md:text-xl text-muted mt-6 max-w-2xl mx-auto leading-relaxed">
              Become part of Africa&apos;s fastest growing developer community. Learn, build, and grow together.
            </p>
          </motion.div>


        </div>
      </section>
    </>
  );
}
