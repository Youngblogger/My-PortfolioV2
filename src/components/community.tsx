"use client";

import { motion } from "framer-motion";

const features = [
  {
    title: "Developer Discussions",
    description: "Join technical conversations with fellow developers. Share knowledge, ask questions, and solve problems together.",
    icon: "💬",
  },
  {
    title: "Student Groups",
    description: "Connect with peers in your learning track. Study together, review code, and build projects as a team.",
    icon: "👥",
  },
  {
    title: "Live Events",
    description: "Attend workshops, hackathons, and tech talks hosted by industry professionals from leading companies.",
    icon: "🎯",
  },
  {
    title: "Coding Challenges",
    description: "Test your skills with weekly coding challenges and compete on leaderboards with developers across Africa.",
    icon: "🏆",
  },
  {
    title: "Mentorship Program",
    description: "Get paired with experienced engineers who guide your learning journey and help you achieve your career goals.",
    icon: "🌟",
  },
  {
    title: "Networking",
    description: "Build professional connections with developers, founders, and tech leaders across the African ecosystem.",
    icon: "🔗",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function Community() {
  return (
    <section id="community" className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/30 to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
          className="text-center"
        >
          <h2 className="section-heading">
            Join The <span className="text-gradient">CODEMAFIA</span> Community
          </h2>
          <p className="section-subtitle mt-4 mx-auto">
            A thriving ecosystem of developers, learners, and innovators building
            the future of African technology.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-12 md:mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              className="relative rounded-2xl glass glass-hover overflow-hidden p-6 md:p-8"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-bold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const, delay: 0.2 }}
          className="mt-12 text-center"
        >
          <a
            href="#"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gold-gradient text-background font-bold hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
          >
            Join Community Free
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
