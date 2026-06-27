"use client";

import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

const stacks = [
  { id: "frontend", title: "Frontend Engineering", description: "Master React, Next.js, and modern frontend frameworks. Build responsive, accessible, and performant web applications.", icon: "🖥", duration: "12 weeks", level: "Beginner to Advanced", students: "2,500+", gradient: "from-blue-500/10 to-cyan-500/10", skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"], outcomes: ["Frontend Developer", "UI Engineer", "React Specialist"] },
  { id: "backend", title: "Backend Engineering", description: "Design scalable APIs, microservices, and serverless architectures using Node.js, Python, and Go.", icon: "⚙", duration: "14 weeks", level: "Intermediate to Advanced", students: "1,800+", gradient: "from-green-500/10 to-emerald-500/10", skills: ["Node.js", "Python", "PostgreSQL", "Redis", "Docker"], outcomes: ["Backend Developer", "API Engineer", "DevOps Engineer"] },
  { id: "fullstack", title: "Full-Stack Development", description: "Become a complete developer. Master both frontend and backend to build production-ready applications end-to-end.", icon: "🚀", duration: "20 weeks", level: "All Levels", students: "3,200+", gradient: "from-purple-500/10 to-violet-500/10", skills: ["React", "Next.js", "Node.js", "TypeScript", "PostgreSQL"], outcomes: ["Full-Stack Developer", "Software Engineer", "Tech Lead"] },
  { id: "mobile", title: "Mobile Development", description: "Build cross-platform mobile apps with React Native and Flutter. Deploy to both iOS and Android stores.", icon: "📱", duration: "14 weeks", level: "Intermediate", students: "1,200+", gradient: "from-orange-500/10 to-amber-500/10", skills: ["React Native", "Flutter", "TypeScript", "Firebase", "App Store"], outcomes: ["Mobile Developer", "React Native Engineer", "Flutter Developer"] },
  { id: "ai", title: "AI Engineering", description: "Dive into machine learning, LLMs, and AI-powered applications. Build intelligent systems that solve real problems.", icon: "🤖", duration: "16 weeks", level: "Advanced", students: "1,500+", gradient: "from-pink-500/10 to-rose-500/10", skills: ["Python", "TensorFlow", "LangChain", "OpenAI", "Vector DBs"], outcomes: ["AI Engineer", "ML Engineer", "Data Scientist"] },
];

const roadmaps: Record<string, { phase: string; title: string; items: string[] }[]> = {
  frontend: [
    { phase: "Phase 1", title: "Web Fundamentals", items: ["HTML/CSS mastery", "JavaScript deep dive", "Git & version control", "Terminal & workflows"] },
    { phase: "Phase 2", title: "React Ecosystem", items: ["React fundamentals", "Hooks & state management", "Next.js framework", "API integration"] },
    { phase: "Phase 3", title: "Production Engineering", items: ["Testing & debugging", "Performance optimization", "Deployment & CI/CD", "Monitoring & analytics"] },
    { phase: "Phase 4", title: "Career Launch", items: ["Portfolio building", "Technical interviews", "Freelance foundations", "Job placement support"] },
  ],
  backend: [
    { phase: "Phase 1", title: "Backend Fundamentals", items: ["Node.js & Express", "Python basics", "Database design", "API fundamentals"] },
    { phase: "Phase 2", title: "Advanced Backend", items: ["Microservices", "GraphQL", "Message queues", "Caching strategies"] },
    { phase: "Phase 3", title: "DevOps & Cloud", items: ["Docker & containers", "AWS/GCP deployment", "CI/CD pipelines", "Infrastructure as code"] },
    { phase: "Phase 4", title: "Career Launch", items: ["System design", "Security best practices", "Technical interviews", "Job placement"] },
  ],
  fullstack: [
    { phase: "Phase 1", title: "Frontend Core", items: ["React & TypeScript", "Next.js framework", "Tailwind CSS", "Framer Motion"] },
    { phase: "Phase 2", title: "Backend Core", items: ["Node.js & APIs", "Database management", "Authentication", "File storage"] },
    { phase: "Phase 3", title: "Full-Stack Production", items: ["Real-time features", "Payment integration", "Testing strategy", "Deployment pipeline"] },
    { phase: "Phase 4", title: "Career Launch", items: ["Full-stack portfolio", "System design", "Technical leadership", "Job placement"] },
  ],
  mobile: [
    { phase: "Phase 1", title: "Mobile Fundamentals", items: ["JavaScript/TypeScript", "React Native basics", "UI components", "Navigation"] },
    { phase: "Phase 2", title: "Advanced Mobile", items: ["State management", "Native modules", "Animations", "Offline support"] },
    { phase: "Phase 3", title: "Production Mobile", items: ["App store deployment", "Push notifications", "Performance tuning", "Analytics"] },
    { phase: "Phase 4", title: "Career Launch", items: ["App portfolio", "Freelance mobile dev", "Technical interviews", "Job placement"] },
  ],
  ai: [
    { phase: "Phase 1", title: "AI Fundamentals", items: ["Python for ML", "Linear algebra & stats", "Data processing", "ML algorithms"] },
    { phase: "Phase 2", title: "Deep Learning", items: ["Neural networks", "TensorFlow/PyTorch", "LLMs & Transformers", "LangChain"] },
    { phase: "Phase 3", title: "AI Production", items: ["Model deployment", "RAG systems", "AI agents", "Monitoring & evaluation"] },
    { phase: "Phase 4", title: "Career Launch", items: ["AI portfolio", "Research skills", "Technical interviews", "Job placement"] },
  ],
};

const testimonials = [
  { name: "Aisha M.", role: "Full-Stack Developer", text: "This program transformed my career. Within 6 months I went from basics to building production apps." },
  { name: "Chidi O.", role: "Software Engineer", text: "The structured curriculum and hands-on approach gave me confidence to tackle complex challenges." },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function StackDetailPage() {
  const params = useParams();
  const stack = stacks.find((s) => s.id === params.stack);

  if (!stack) {
    notFound();
  }

  const roadmap = roadmaps[stack.id] ?? [];
  const pricingTiers = [
    { name: "Starter", price: "₦150,000", features: ["Full course access", "Self-paced learning", "Community support"] },
    { name: "Standard", price: "₦250,000", features: ["Everything in Starter", "Live sessions", "1-on-1 mentorship", "Code reviews"] },
    { name: "Pro Mentorship", price: "₦350,000", features: ["Everything in Standard", "Dedicated mentor", "Job placement", "Lifetime access"] },
  ];

  return (
    <>
      <section className="relative pt-20 pb-16 md:pt-24 md:pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-20"
            style={{ background: "radial-gradient(circle at 50% 50%, rgba(212,175,55,0.08) 0%, transparent 50%)" }}
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
          >
            <Link
              href="/academy"
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-gold transition-colors duration-300 mb-8"
            >
              ← Back to Academy
            </Link>
            <div className="text-5xl mb-6">{stack.icon}</div>
            <h1 className="section-heading max-w-4xl">
              {stack.title}
            </h1>
            <p className="section-subtitle mt-4 max-w-2xl">
              {stack.description}
            </p>
            <div className="flex flex-wrap gap-3 mt-8 text-sm text-muted">
              <span className="px-4 py-2 rounded-full glass">🎓 {stack.students} students</span>
              <span className="px-4 py-2 rounded-full glass">⏱ {stack.duration}</span>
              <span className="px-4 py-2 rounded-full glass">📊 {stack.level}</span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/50 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            className="mb-16"
          >
            <span className="section-label">CURRICULUM</span>
            <h2 className="section-heading mt-2">
              Your Learning
              <br />
              <span className="text-gradient">Roadmap</span>
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {roadmap.map((phase) => (
              <motion.div
                key={phase.phase}
                variants={fadeUp}
                className="glass rounded-2xl p-6 md:p-8"
              >
                <span className="text-xs font-bold uppercase tracking-wider text-gold">
                  {phase.phase}
                </span>
                <h3 className="text-lg font-bold text-white mt-2 mb-4">
                  {phase.title}
                </h3>
                <ul className="space-y-2.5">
                  {phase.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted">
                      <span className="text-gold mt-0.5 shrink-0">▸</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            className="mb-12"
          >
            <span className="section-label">TOOLS</span>
            <h2 className="section-heading mt-2">
              Technologies
              <br />
              <span className="text-gradient">You&apos;ll Master</span>
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-wrap gap-3"
          >
            {stack.skills.map((skill) => (
              <motion.span
                key={skill}
                variants={fadeUp}
                className="px-5 py-3 rounded-xl glass text-sm font-medium text-white/90 hover:gold-border transition-colors duration-300"
              >
                {skill}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/50 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            className="mb-12"
          >
            <span className="section-label">SHOWCASE</span>
            <h2 className="section-heading mt-2">
              What You&apos;ll
              <br />
              <span className="text-gradient">Build</span>
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-3 gap-5"
          >
            {[
              { title: "Portfolio Project", desc: "A production-ready application showcasing your mastery of the stack." },
              { title: "Team Collaboration", desc: "Work on real-world projects in teams using industry workflows." },
              { title: "Capstone Project", desc: "Build and deploy a complete solution from ideation to launch." },
            ].map((project) => (
              <motion.div
                key={project.title}
                variants={fadeUp}
                className="glass rounded-2xl p-6 md:p-8"
              >
                <div className="text-2xl mb-4">📂</div>
                <h3 className="text-lg font-bold text-white mb-2">{project.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{project.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            className="mb-12"
          >
            <span className="section-label">OUTCOMES</span>
            <h2 className="section-heading mt-2">
              Your Career
              <br />
              <span className="text-gradient">Starts Here</span>
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-3 gap-5"
          >
            {stack.outcomes.map((outcome) => (
              <motion.div
                key={outcome}
                variants={fadeUp}
                className="glass rounded-2xl p-6 md:p-8 text-center"
              >
                <div className="text-3xl mb-4">🎯</div>
                <h3 className="text-lg font-bold text-white">{outcome}</h3>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="mt-16 grid md:grid-cols-2 gap-5"
          >
            {testimonials.map((t) => (
              <motion.div
                key={t.name}
                variants={fadeUp}
                className="glass rounded-2xl p-6 md:p-8"
              >
                <div className="text-gold text-2xl mb-4">"</div>
                <p className="text-white/80 text-sm leading-relaxed mb-6">
                  {t.text}
                </p>
                <div>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-muted text-xs">{t.role}</p>
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
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-3 gap-5"
          >
            {[
              { icon: "👨‍🏫", title: "Industry Mentors", desc: "Learn from senior engineers who work at top companies and bring real-world experience to every lesson." },
              { icon: "📋", title: "Structured Curriculum", desc: "A carefully designed path from fundamentals to production-ready skills. No more tutorial hell." },
              { icon: "🚀", title: "Project-Based Learning", desc: "Build real projects throughout the course. Graduate with a portfolio that proves your skills." },
              { icon: "👥", title: "Community Support", desc: "Join a community of passionate developers. Get help, share knowledge, and network with peers." },
              { icon: "🎯", title: "Career Coaching", desc: "Resume review, interview prep, and job placement support to launch your career." },
              { icon: "📜", title: "Industry Certification", desc: "Earn a recognized certificate upon completion that validates your expertise to employers." },
            ].map((benefit) => (
              <motion.div
                key={benefit.title}
                variants={fadeUp}
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
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            className="mb-12 text-center"
          >
            <span className="section-label">FAQ</span>
            <h2 className="section-heading mt-2">
              Frequently Asked
              <br />
              <span className="text-gradient">Questions</span>
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-3xl mx-auto space-y-4"
          >
            {[
              { q: "Do I need prior coding experience?", a: "No. Our programs are designed for all levels. We have beginner-friendly tracks and advanced paths for experienced developers." },
              { q: "How long does the program take?", a: `The ${stack.title} program runs for ${stack.duration}. You can learn at your own pace with lifetime access to all materials.` },
              { q: "What kind of support will I receive?", a: "You'll have access to mentors, teaching assistants, and a vibrant community. Standard and Pro plans include 1-on-1 mentorship sessions." },
               { q: "Is there job placement assistance?", a: "Yes. Our Pro Mentorship plan includes resume review, interview preparation, and job placement assistance with our partner companies." },
             ].map((faq) => (
              <motion.div
                key={faq.q}
                variants={fadeUp}
                className="glass rounded-2xl p-6 md:p-8"
              >
                <h3 className="text-white font-semibold text-base mb-3">{faq.q}</h3>
                <p className="text-muted text-sm leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/50 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            className="mb-12 text-center"
          >
            <span className="section-label">PRICING</span>
            <h2 className="section-heading mt-2">
              Choose Your
              <br />
              <span className="text-gradient">Investment</span>
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto"
          >
            {pricingTiers.map((tier) => (
              <motion.div
                key={tier.name}
                variants={fadeUp}
                className={`glass rounded-2xl p-6 md:p-8 ${tier.name === "Standard" ? "gold-border" : ""}`}
              >
                <h3 className="text-lg font-bold text-white mb-2">{tier.name}</h3>
                <div className="text-3xl font-bold text-white mb-6">{tier.price}</div>
                <ul className="space-y-2.5 mb-8">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted">
                      <span className="text-gold shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
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

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Ready to Master
              <br />
              <span className="text-gradient">{stack.title}?</span>
            </h2>
            <p className="text-lg md:text-xl text-muted mt-6 max-w-2xl mx-auto leading-relaxed">
              Join thousands of successful developers who started their journey with CODEMAFIA Academy.
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
              href={`/academy/checkout/${stack.id}`}
              className="inline-block px-8 py-4 rounded-xl bg-gold-gradient text-background font-bold text-base hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
            >
              Enroll Now
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
