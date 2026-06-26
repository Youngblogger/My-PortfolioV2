"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import PageHeader from "@/components/pages/PageHeader";

const stacks = [
  { id: "frontend", title: "Frontend Engineering", description: "Master React, Next.js, and modern frontend frameworks. Build responsive, accessible, and performant web applications.", icon: "🖥", duration: "12 weeks", level: "Beginner to Advanced", students: "2,500+", gradient: "from-blue-500/10 to-cyan-500/10", skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"], outcomes: ["Frontend Developer", "UI Engineer", "React Specialist"] },
  { id: "backend", title: "Backend Engineering", description: "Design scalable APIs, microservices, and serverless architectures using Node.js, Python, and Go.", icon: "⚙", duration: "14 weeks", level: "Intermediate to Advanced", students: "1,800+", gradient: "from-green-500/10 to-emerald-500/10", skills: ["Node.js", "Python", "PostgreSQL", "Redis", "Docker"], outcomes: ["Backend Developer", "API Engineer", "DevOps Engineer"] },
  { id: "fullstack", title: "Full-Stack Development", description: "Become a complete developer. Master both frontend and backend to build production-ready applications end-to-end.", icon: "🚀", duration: "20 weeks", level: "All Levels", students: "3,200+", gradient: "from-purple-500/10 to-violet-500/10", skills: ["React", "Next.js", "Node.js", "TypeScript", "PostgreSQL"], outcomes: ["Full-Stack Developer", "Software Engineer", "Tech Lead"] },
  { id: "mobile", title: "Mobile Development", description: "Build cross-platform mobile apps with React Native and Flutter. Deploy to both iOS and Android stores.", icon: "📱", duration: "14 weeks", level: "Intermediate", students: "1,200+", gradient: "from-orange-500/10 to-amber-500/10", skills: ["React Native", "Flutter", "TypeScript", "Firebase", "App Store"], outcomes: ["Mobile Developer", "React Native Engineer", "Flutter Developer"] },
  { id: "ai", title: "AI Engineering", description: "Dive into machine learning, LLMs, and AI-powered applications. Build intelligent systems that solve real problems.", icon: "🤖", duration: "16 weeks", level: "Advanced", students: "1,500+", gradient: "from-pink-500/10 to-rose-500/10", skills: ["Python", "TensorFlow", "LangChain", "OpenAI", "Vector DBs"], outcomes: ["AI Engineer", "ML Engineer", "Data Scientist"] },
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

export default function AcademyPage() {
  return (
    <>
      <PageHeader
        label="ACADEMY"
        title="Master Modern"
        highlight="Software Development"
        description="Industry-led courses designed to take you from beginner to production-ready engineer."
      />

      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/50 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {stacks.map((stack) => (
              <motion.div
                key={stack.id}
                variants={cardVariants}
                className="group relative rounded-2xl glass glass-hover overflow-hidden"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${stack.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />
                <div className="relative p-6 md:p-8">
                  <div className="text-3xl mb-4">{stack.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {stack.title}
                  </h3>
                  <p className="text-muted text-sm leading-relaxed mb-6">
                    {stack.description}
                  </p>

                  <div className="flex flex-wrap gap-3 text-xs text-muted">
                    <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
                      🎓 {stack.students}
                    </span>
                    <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
                      ⏱ {stack.duration}
                    </span>
                    <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
                      📊 {stack.level}
                    </span>
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/5">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {stack.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 rounded-md bg-white/5 text-xs text-muted"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="space-y-1.5 mb-6">
                      <p className="text-xs text-muted uppercase tracking-wider font-semibold">
                        Career Outcomes
                      </p>
                      {stack.outcomes.map((outcome) => (
                        <div key={outcome} className="flex items-center gap-2 text-sm text-white/80">
                          <span className="text-gold">▸</span>
                          {outcome}
                        </div>
                      ))}
                    </div>

                    <Link
                      href={`/academy/${stack.id}`}
                      className="text-sm text-gold hover:text-white transition-colors duration-300 flex items-center gap-1 group/link"
                    >
                      View Program
                      <span className="transition-transform duration-300 group-hover/link:translate-x-1">→</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/30 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            className="text-center mb-16"
          >
            <span className="section-label">WHY CODEMAFIA</span>
            <h2 className="section-heading mt-2">
              Why Learn With <span className="text-gradient">Us</span>
            </h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-3 gap-5"
          >
            {[
              { icon: "👨‍🏫", title: "Industry Mentors", desc: "Learn from senior engineers who bring real-world experience to every lesson." },
              { icon: "📋", title: "Structured Curriculum", desc: "A carefully designed path from fundamentals to production-ready skills." },
              { icon: "🚀", title: "Project-Based Learning", desc: "Build real projects throughout the course. Graduate with a portfolio." },
              { icon: "👥", title: "Community Support", desc: "Join a community of passionate developers. Network with peers." },
              { icon: "🎯", title: "Career Coaching", desc: "Resume review, interview prep, and job placement support." },
              { icon: "📜", title: "Industry Certification", desc: "Earn a recognized certificate upon completion." },
            ].map((benefit) => (
              <motion.div
                key={benefit.title}
                variants={cardVariants}
                className="glass rounded-2xl p-6 md:p-8 text-center"
              >
                <div className="text-3xl mb-4">{benefit.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{benefit.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative py-20 md:py-28 overflow-hidden">
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
            <span className="section-label">TESTIMONIALS</span>
            <h2 className="section-heading mt-2">
              Student <span className="text-gradient">Success Stories</span>
            </h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-3 gap-5"
          >
            {[
              { name: "Chioma O.", role: "Frontend Developer", text: "CODEMAFIA transformed my career. The structured curriculum and mentorship helped me land my first developer role within 3 months.", initials: "CO" },
              { name: "Samuel A.", role: "Full-Stack Developer", text: "I built more in 12 weeks than I did in 2 years of self-learning. The project-based approach made all the difference.", initials: "SA" },
              { name: "Blessing E.", role: "AI Engineer", text: "The AI Engineering track is incredible. Learning LLMs and building actual AI products gave me skills in high demand.", initials: "BE" },
            ].map((t) => (
              <motion.div
                key={t.name}
                variants={cardVariants}
                className="glass rounded-2xl p-6 md:p-8"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-full bg-gold-gradient flex items-center justify-center text-sm font-bold text-background">
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    <div className="text-xs text-muted">{t.role}</div>
                  </div>
                </div>
                <p className="text-sm text-muted leading-relaxed">&ldquo;{t.text}&rdquo;</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/30 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            className="text-center mb-16"
          >
            <span className="section-label">FAQ</span>
            <h2 className="section-heading mt-2">
              Frequently Asked <span className="text-gradient">Questions</span>
            </h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-3xl mx-auto space-y-4"
          >
            {[
              { q: "Do I need prior coding experience?", a: "No. Our programs are designed for all levels. We have beginner-friendly tracks and advanced paths for experienced developers." },
              { q: "How long are the programs?", a: "Programs range from 12 to 20 weeks depending on the track. You can learn at your own pace with lifetime access to all materials." },
              { q: "What kind of support will I receive?", a: "You'll have access to mentors, teaching assistants, and a vibrant community. Standard and Pro plans include 1-on-1 mentorship." },
               { q: "Is there job placement assistance?", a: "Yes. Our Pro Mentorship plan includes resume review, interview preparation, and job placement assistance with partner companies." },
             ].map((faq) => (
              <motion.div
                key={faq.q}
                variants={cardVariants}
                className="glass rounded-2xl p-6 md:p-8"
              >
                <h3 className="text-white font-semibold text-base mb-3">{faq.q}</h3>
                <p className="text-muted text-sm leading-relaxed">{faq.a}</p>
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
            style={{
              background: "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)",
            }}
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
              Not Sure Where To
              <br />
              <span className="text-gradient">Start?</span>
            </h2>
            <p className="text-lg md:text-xl text-muted mt-6 max-w-2xl mx-auto leading-relaxed">
              Browse our complete catalog of programs and find the perfect path for your career goals.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
            className="mt-10"
          >
            <Link
              href="/academy/pricing"
              className="inline-block px-8 py-4 rounded-xl bg-gold-gradient text-background font-bold text-base hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
            >
              Browse All Programs
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
