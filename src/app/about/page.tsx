"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import PageHeader from "@/components/pages/PageHeader";

const timeline = [
  { year: "2020", title: "The Beginning", description: "CODEMAFIA was founded with a vision to bridge the gap between African developers and global opportunities." },
  { year: "2021", title: "First Cohort", description: "Launched our first training cohort with 50 students. 90% completion rate and 15 job placements." },
  { year: "2022", title: "Agency Launch", description: "Expanded into software services, building products for startups and enterprises across Africa." },
  { year: "2023", title: "Community Growth", description: "Crossed 5,000 community members. Launched mentorship program and live events series." },
  { year: "2024", title: "Platform Evolution", description: "Launched the CODEMAFIA platform with integrated learning, projects, and hiring ecosystem." },
  { year: "2025+", title: "Global Expansion", description: "Expanding into new markets with partnerships across Africa, Europe, and North America." },
];

const values = [
  { title: "Excellence", description: "We demand the highest standards in every line of code we write and every engineer we train.", icon: "🎯" },
  { title: "Impact", description: "Every project we build and every engineer we train must create measurable, positive change.", icon: "🚀" },
  { title: "Community", description: "We believe in the power of collective growth. Our success is measured by our community's success.", icon: "🤝" },
  { title: "Innovation", description: "We stay at the cutting edge of technology, constantly evolving our curriculum and services.", icon: "💡" },
];

const team = [
  { name: "Uthman Abdulwahab", role: "Founder & Full-Stack Engineer", bio: "Full-stack developer, software engineer, and educator passionate about building scalable digital products, empowering aspiring developers, and helping businesses transform ideas into impactful technology solutions." },
  { name: "Areas of Expertise", role: "", bio: "Full-Stack Web Development • SaaS Platforms & Web Applications • Marketplace Systems • Mobile App Backends • UI/UX Implementation • Technical Consulting — delivering modern, scalable, and user-focused software solutions across multiple industries." },
  { name: "Mission & Vision", role: "", bio: "To build high-quality digital products while helping develop the next generation of African software engineers through practical learning, real-world projects, and technology-driven innovation." },
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

export default function AboutPage() {
  return (
    <>
      <PageHeader
        label="ABOUT"
        title="Building Africa's"
        highlight="Tech Future"
        description="CODEMAFIA is a premium technology company and education ecosystem on a mission to build Africa's next generation of software engineers."
      />

      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/30 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
            className="grid md:grid-cols-2 gap-6"
          >
            <div className="glass rounded-2xl p-8 md:p-10">
              <span className="section-label">Our Mission</span>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Building Africa&apos;s Engineering Capacity
              </h3>
              <p className="text-muted leading-relaxed">
                We are on a mission to train, mentor, and deploy 10,000 world-class
                software engineers from Africa by 2030. Through our academy, agency,
                and community, we create pathways for African developers to compete
                and excel on the global stage.
              </p>
            </div>
            <div className="glass rounded-2xl p-8 md:p-10">
              <span className="section-label">Our Vision</span>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                A Continent of Tech Leaders
              </h3>
              <p className="text-muted leading-relaxed">
                We envision a future where African software engineers are leading
                innovation globally — building the products, companies, and
                infrastructure that power the digital economy.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
            className="glass rounded-2xl p-8 md:p-10 mt-6"
          >
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="w-20 h-20 rounded-full bg-gold-gradient flex items-center justify-center text-3xl font-bold text-background shrink-0">
                UA
              </div>
              <div>
                <span className="section-label">Founder</span>
                <h3 className="text-xl font-bold text-white mb-2">
                  Uthman Abdulwahab
                </h3>
                <p className="text-muted leading-relaxed">
                  Full-stack developer, software engineer, and educator with a passion
                  for building products and people. Uthman founded CODEMAFIA to create
                  the platform he wished existed when he started his own journey into
                  software engineering.
                </p>
              </div>
            </div>
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
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            className="text-center mb-16"
          >
            <h2 className="section-heading">
              Our <span className="text-gradient">Values</span>
            </h2>
            <p className="section-subtitle mt-4 mx-auto">
              The principles that guide everything we build and teach.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {values.map((value) => (
              <motion.div
                key={value.title}
                variants={cardVariants}
                className="group relative rounded-2xl glass glass-hover overflow-hidden p-6 md:p-8 text-center"
              >
                <div className="relative">
                  <div className="text-4xl mb-4">{value.icon}</div>
                  <h3 className="text-lg font-bold text-white mb-3">{value.title}</h3>
                  <p className="text-muted text-sm leading-relaxed">{value.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/30 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            className="text-center mb-16"
          >
            <h2 className="section-heading">
              Our <span className="text-gradient">Journey</span>
            </h2>
            <p className="section-subtitle mt-4 mx-auto">
              From a bold idea to a thriving ecosystem — the CODEMAFIA story.
            </p>
          </motion.div>

          <div className="relative max-w-4xl mx-auto">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-white/10 -translate-x-1/2" />

            {timeline.map((item, index) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] as const }}
                className={`relative flex flex-col md:flex-row items-start gap-6 mb-12 last:mb-0 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                <div className="hidden md:block flex-1" />
                <div className="absolute left-4 md:left-1/2 w-3 h-3 rounded-full bg-gold -translate-x-1/2 mt-1.5 ring-4 ring-background z-10" />
                <div className={`flex-1 pl-10 md:pl-0 ${index % 2 === 0 ? "md:text-right md:pr-10" : "md:pl-10"}`}>
                  <span className="text-sm font-bold text-gold">{item.year}</span>
                  <h3 className="text-lg font-bold text-white mt-1">{item.title}</h3>
                  <p className="text-muted text-sm leading-relaxed mt-2">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
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
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            className="text-center mb-16"
          >
            <h2 className="section-heading">
              Meet The <span className="text-gradient">Founder</span>
            </h2>
            <p className="section-subtitle mt-4 mx-auto">
              The builder behind the CODEMAFIA ecosystem — creating digital products, training future software engineers, and helping businesses bring ideas to life through technology.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto"
          >
            {team.map((member, idx) => (
              <motion.div
                key={member.name + idx}
                variants={cardVariants}
                className="group relative rounded-2xl glass glass-hover overflow-hidden p-6 md:p-8 text-center"
              >
                <div className="relative">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gold-gradient flex items-center justify-center text-2xl font-bold text-background mb-5">
                    {member.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{member.name}</h3>
                  <p className="text-sm text-gold mb-3">{member.role}</p>
                  <p className="text-muted text-sm leading-relaxed">{member.bio}</p>
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
              Ready To Be Part Of
              <br />
              <span className="text-gradient">The Future?</span>
            </h2>
            <p className="text-lg md:text-xl text-muted mt-6 max-w-2xl mx-auto leading-relaxed">
              Whether you want to learn, build, or hire — CODEMAFIA is your platform for growth.
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
              href="/academy"
              className="px-8 py-4 rounded-xl bg-gold-gradient text-background font-bold text-base hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
            >
              Join Academy
            </Link>
            <Link
              href="/hire"
              className="px-8 py-4 rounded-xl border border-white/10 text-white font-bold text-base hover:bg-white/5 hover:border-white/20 transition-all duration-300"
            >
              Hire Us
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
