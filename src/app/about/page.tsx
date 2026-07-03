"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const ecosystemItems = [
  { label: "Software Engineering", desc: "Modern, scalable software systems" },
  { label: "Product Development", desc: "From concept to production-ready" },
  { label: "Artificial Intelligence", desc: "Intelligent automation & LLMs" },
  { label: "Marketplace", desc: "Connecting talent with opportunity" },
  { label: "Technical Consulting", desc: "Architecture, strategy & transformation" },
  { label: "Community", desc: "Collaboration, mentorship & growth" },
];

const principles = [
  { title: "Build with Purpose", desc: "Every line of code serves a clear goal." },
  { title: "Quality Over Quantity", desc: "We prioritise craftsmanship over volume." },
  { title: "Continuous Learning", desc: "Engineering is a discipline of constant growth." },
  { title: "Innovation Through Simplicity", desc: "The best solutions are often the simplest." },
  { title: "Security by Design", desc: "Security is never an afterthought." },
  { title: "Long-Term Impact", desc: "We build systems built to outlast us." },
];

const stats = [
  { value: "2,000+", label: "Students Trained" },
  { value: "100+", label: "Products Built" },
  { value: "500+", label: "Projects Delivered" },
  { value: "50+", label: "Businesses Supported" },
  { value: "12", label: "Engineering Programs" },
  { value: "10,000+", label: "Community Members" },
  { value: "20+", label: "Technology Partnerships" },
];

const workflow = [
  { step: "01", title: "Discover", desc: "We begin by understanding your business, users, goals, and technical challenges." },
  { step: "02", title: "Architect", desc: "We design scalable systems, define technical requirements, and establish a clear execution strategy." },
  { step: "03", title: "Build", desc: "Using modern engineering practices, we develop secure, maintainable, and high-performance software." },
  { step: "04", title: "Launch", desc: "We deploy production-ready applications with comprehensive testing, monitoring, and optimization." },
  { step: "05", title: "Scale", desc: "Technology never stands still. We continue improving, supporting, and evolving every solution." },
];

const ecosystemCards = [
  {
    emoji: "💻",
    title: "Software Engineering",
    desc: "We design and develop modern software systems including SaaS platforms, enterprise applications, business management systems, customer portals, marketplace platforms, learning management systems, FinTech products, and internal business tools. Every solution is engineered for scalability, maintainability, security, and long-term growth.",
  },
  {
    emoji: "🚀",
    title: "Product Development",
    desc: "From concept validation to deployment, we partner with startups, founders, and organizations to transform ideas into production-ready digital products. Whether building an MVP or scaling an existing platform, we focus on execution, quality, and measurable business outcomes.",
  },
  {
    emoji: "🤖",
    title: "Artificial Intelligence",
    desc: "We integrate intelligent technologies into modern businesses through AI-powered applications, automation, large language models, intelligent agents, and data-driven decision-making.",
  },
  {
    emoji: "☁",
    title: "Technical Consulting",
    desc: "Helping organizations make better technology decisions through software architecture, engineering strategy, cloud infrastructure planning, code quality assessments, and digital transformation.",
  },
  {
    emoji: "🌍",
    title: "Community & Ecosystem",
    desc: "CODEMAFIA exists to strengthen the technology ecosystem by creating opportunities for collaboration, mentorship, learning, innovation, and continuous professional growth.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* ──────── HERO ──────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-gold/[0.03]" />
          <motion.div
            className="absolute top-1/4 left-1/4 w-[800px] h-[800px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 60%)" }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(212,175,55,0.04) 0%, transparent 60%)" }}
            animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "linear-gradient(rgba(212,175,55,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.3) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20 w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl"
          >
            <span className="section-label">About CODEMAFIA</span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mt-4">
              Building the Digital Future Through{" "}
              <span className="text-gradient">Engineering, Education & Innovation.</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted mt-6 max-w-2xl leading-relaxed">
              CODEMAFIA is a technology ecosystem where ambitious ideas become scalable products,
              aspiring developers become world-class engineers, and businesses gain the technical
              expertise needed to build with confidence.
            </p>
            <div className="flex flex-wrap gap-4 mt-10">
              <Link
                href="/hire"
                className="px-8 py-4 rounded-xl bg-gold-gradient text-background font-bold text-base hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
              >
                Build With Us
              </Link>

            </div>
          </motion.div>
        </div>
      </section>

      {/* ──────── WHO WE ARE ──────── */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.015] to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="max-w-3xl"
          >
            <span className="section-label">Who We Are</span>
            <h2 className="section-heading mt-2">
              More Than a <span className="text-gradient">Software Company</span>
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-2 gap-6 mt-12"
          >
            {[
              "Technology is evolving faster than ever. Businesses need reliable engineering partners. Developers need practical education. Startups need experienced builders. Communities need places where innovation can grow. CODEMAFIA was built to bring all of these together.",
              "We are an engineering-first technology ecosystem dedicated to designing software, developing talent, solving business challenges, and creating digital products that make meaningful impact. Our work extends beyond writing code. We engineer solutions. We educate future innovators. We help businesses scale. We build products that solve real-world problems.",
            ].map((text, i) => (
              <motion.div key={i} variants={cardUp} className="glass rounded-2xl p-8 md:p-10">
                <p className="text-white/80 leading-relaxed text-base md:text-lg">{text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ──────── WHAT WE BUILD ──────── */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/20 to-transparent pointer-events-none" />
          <motion.div
            className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 60%)" }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <span className="section-label">What We Build</span>
            <h2 className="section-heading mt-2">
              Our <span className="text-gradient">Ecosystem</span>
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {ecosystemCards.map((card) => (
              <motion.div
                key={card.title}
                variants={cardUp}
                className="group relative rounded-2xl glass glass-hover overflow-hidden p-6 md:p-8"
              >
                <div className="text-3xl mb-4">{card.emoji}</div>
                <h3 className="text-lg font-bold text-white mb-3">{card.title}</h3>
                <p className="text-white/80 text-sm leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ──────── WHY WE EXIST / MISSION / VISION ──────── */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.015] to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="max-w-3xl mb-16"
          >
            <span className="section-label">Why We Exist</span>
            <h2 className="section-heading mt-2">
              Engineering Opportunities Through{" "}
              <span className="text-gradient">Technology</span>
            </h2>
            <p className="section-subtitle mt-4">
              Technology should create opportunities—not barriers. Every application we build,
              every student we train, every business we support, and every product we launch
              contributes toward a larger mission: creating technology that improves lives,
              strengthens businesses, and empowers the next generation of innovators.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-2 gap-6"
          >
            <motion.div variants={cardUp} className="glass rounded-2xl p-8 md:p-10">
              <span className="section-label">Our Mission</span>
              <h3 className="text-2xl md:text-3xl font-bold text-white mt-2 mb-4">
                To engineer exceptional software, develop world-class technology talent,
                and empower businesses with innovative digital solutions that create lasting value.
              </h3>
            </motion.div>
            <motion.div variants={cardUp} className="glass rounded-2xl p-8 md:p-10">
              <span className="section-label">Our Vision</span>
              <h3 className="text-2xl md:text-3xl font-bold text-white mt-2 mb-4">
                To become Africa&apos;s leading engineering ecosystem—recognised globally for
                building transformative technology, developing exceptional software engineers,
                and delivering products that shape the future.
              </h3>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ──────── HOW WE EXECUTE ──────── */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/20 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <span className="section-label">How We Execute</span>
            <h2 className="section-heading mt-2">
              Our Engineering <span className="text-gradient">Workflow</span>
            </h2>
          </motion.div>

          <div className="relative max-w-4xl mx-auto">
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-white/5 -translate-x-1/2" />

            {workflow.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className={`relative flex flex-col md:flex-row items-start gap-6 mb-12 last:mb-0 ${
                  i % 2 === 0 ? "" : "md:flex-row-reverse"
                }`}
              >
                <div className="hidden md:block flex-1" />
                <div className="absolute left-8 md:left-1/2 w-10 h-10 rounded-full bg-gold-gradient flex items-center justify-center text-sm font-bold text-background -translate-x-1/2 ring-4 ring-background z-10">
                  {item.step}
                </div>
                <div className={`flex-1 pl-16 md:pl-0 ${i % 2 === 0 ? "md:text-right md:pr-14" : "md:pl-14"}`}>
                  <h3 className="text-xl font-bold text-white">{item.title}</h3>
                  <p className="text-muted text-sm leading-relaxed mt-2">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── WHY ORGANISATIONS CHOOSE US ──────── */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.015] to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <span className="section-label">Why Choose Us</span>
            <h2 className="section-heading mt-2">
              Built on <span className="text-gradient">Engineering Principles</span>
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {[
              {
                title: "Engineering First",
                desc: "Every solution is built using proven software engineering principles—not shortcuts.",
              },
              {
                title: "Execution Focused",
                desc: "Ideas only matter when they become working products. Execution is where we excel.",
              },
              {
                title: "Modern Technology",
                desc: "React, Next.js, Node.js, Laravel, Python, Go, AI, Cloud, Mobile—modern tools selected for performance and scalability.",
              },
              {
                title: "Long-Term Thinking",
                desc: "We don't build software for today. We engineer systems designed to grow with tomorrow.",
              },
              {
                title: "Continuous Learning",
                desc: "Every project is an opportunity to grow. We stay at the forefront of technology through constant learning and improvement.",
              },
              {
                title: "Partnership Over Projects",
                desc: "We build relationships—not one-time engagements. Our success is measured by the long-term success of the people and organisations we work with.",
              },
            ].map((item) => (
              <motion.div
                key={item.title}
                variants={cardUp}
                className="glass rounded-2xl p-6 md:p-8"
              >
                <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ──────── THE ECOSYSTEM ──────── */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/20 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <span className="section-label">The Ecosystem</span>
            <h2 className="section-heading mt-2">
              A Connected <span className="text-gradient">Technology Stack</span>
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="max-w-3xl mx-auto"
          >
            <div className="glass rounded-2xl p-8 md:p-12 text-center mb-6">
              <span className="text-4xl font-bold text-gradient">CODEMAFIA</span>
            </div>
            <div className="relative flex flex-col items-center gap-3">
              {ecosystemItems.map((item, i) => (
                <motion.div
                  key={item.label}
                  variants={cardUp}
                  className="glass rounded-xl px-8 py-4 w-full max-w-md text-center hover:border-gold/30 transition-all duration-300"
                >
                  <span className="text-white font-semibold">{item.label}</span>
                  <span className="text-muted text-sm block mt-1">{item.desc}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ──────── ENGINEERING PRINCIPLES ──────── */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.015] to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <span className="section-label">Our Principles</span>
            <h2 className="section-heading mt-2">
              Engineering <span className="text-gradient">Values</span>
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {principles.map((p) => (
              <motion.div
                key={p.title}
                variants={cardUp}
                className="glass rounded-2xl p-6 md:p-8 text-center"
              >
                <h3 className="text-lg font-bold text-white mb-2">{p.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ──────── IMPACT STATS ──────── */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/20 to-transparent pointer-events-none" />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(212,175,55,0.04) 0%, transparent 60%)" }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <span className="section-label">Our Impact</span>
            <h2 className="section-heading mt-2">
              By the <span className="text-gradient">Numbers</span>
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
          >
            {stats.map((s) => (
              <motion.div
                key={s.label}
                variants={cardUp}
                className="glass rounded-2xl p-6 md:p-8 text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">{s.value}</div>
                <div className="text-muted text-sm">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ──────── LOOKING AHEAD ──────── */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.015] to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="max-w-3xl mx-auto text-center"
          >
            <span className="section-label">Looking Ahead</span>
            <h2 className="section-heading mt-2">
              Building <span className="text-gradient">What&apos;s Next</span>
            </h2>
            <p className="section-subtitle mt-6 mx-auto">
              Technology never stops evolving—and neither do we. As CODEMAFIA grows, we remain
              committed to exploring emerging technologies, developing innovative products,
              expanding engineering education, and helping organizations solve increasingly
              complex challenges.
            </p>
            <div className="mt-8 space-y-2">
              <p className="text-white text-lg font-semibold">Our ambition is simple:</p>
              <p className="text-muted">Build technology that creates opportunities.</p>
              <p className="text-muted">Develop engineers who create impact.</p>
              <p className="text-muted">Create products that shape the future.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ──────── FINAL CTA ──────── */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/30 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Let&apos;s Build Something{" "}
              <span className="text-gradient">Meaningful</span>
            </h2>
            <p className="text-lg md:text-xl text-muted mt-6 max-w-2xl mx-auto leading-relaxed">
              Whether you&apos;re an entrepreneur with an idea, a business planning its next digital
              transformation, or an aspiring software engineer ready to build a successful career,
              CODEMAFIA provides the expertise, technology, and ecosystem to help you succeed.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <Link
              href="/hire"
              className="px-8 py-4 rounded-xl bg-gold-gradient text-background font-bold text-base hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
            >
              Start Your Project
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
