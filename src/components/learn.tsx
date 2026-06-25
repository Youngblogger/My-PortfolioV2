"use client";

import { motion } from "framer-motion";

const courses = [
  {
    title: "Frontend Engineering",
    description: "Master modern frontend frameworks like React, Next.js, and Vue. Build responsive, accessible, and performant web applications.",
    icon: "🖥",
    students: "2,500+",
    duration: "12 weeks",
    level: "Beginner to Advanced",
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    title: "Backend Engineering",
    description: "Design and build scalable APIs, microservices, and serverless architectures using Node.js, Python, and Go.",
    icon: "⚙",
    students: "1,800+",
    duration: "14 weeks",
    level: "Intermediate to Advanced",
    color: "from-green-500/20 to-emerald-500/20",
  },
  {
    title: "Full-Stack Development",
    description: "Become a complete developer. Master both frontend and backend to build production-ready applications end-to-end.",
    icon: "🚀",
    students: "3,200+",
    duration: "20 weeks",
    level: "All Levels",
    color: "from-purple-500/20 to-violet-500/20",
  },
  {
    title: "Mobile Development",
    description: "Build cross-platform mobile apps with React Native and Flutter. Deploy to both iOS and App Store.",
    icon: "📱",
    students: "1,200+",
    duration: "14 weeks",
    level: "Intermediate",
    color: "from-orange-500/20 to-amber-500/20",
  },
  {
    title: "AI Engineering",
    description: "Dive into machine learning, LLMs, and AI-powered applications. Build intelligent systems that solve real problems.",
    icon: "🤖",
    students: "1,500+",
    duration: "16 weeks",
    level: "Advanced",
    color: "from-pink-500/20 to-rose-500/20",
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

export default function Learn() {
  return (
    <section id="learn" className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/50 to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
        >
          <span className="section-label">LEARN</span>
          <h2 className="section-heading mt-2">
            Master Modern
            <br />
            <span className="text-gradient">Software Development</span>
          </h2>
          <p className="section-subtitle mt-4">
            Industry-led courses designed to take you from beginner to
            production-ready engineer.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-12 md:mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {courses.map((course) => (
            <motion.div
              key={course.title}
              variants={cardVariants}
              className="group relative rounded-2xl glass glass-hover overflow-hidden"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${course.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />
              <div className="relative p-6 md:p-8">
                <div className="text-3xl mb-4">{course.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {course.title}
                </h3>
                <p className="text-muted text-sm leading-relaxed mb-6">
                  {course.description}
                </p>
                <div className="flex flex-wrap gap-3 text-xs text-muted">
                  <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
                    🎓 {course.students}
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
                    ⏱ {course.duration}
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
                    📊 {course.level}
                  </span>
                </div>
                <div className="mt-6 pt-6 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted">Course Progress</span>
                    <span className="text-xs text-gold">85%</span>
                  </div>
                  <div className="mt-2 h-1 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full w-[85%] rounded-full bg-gold-gradient" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          <motion.div
            variants={cardVariants}
            className="relative rounded-2xl glass glass-hover overflow-hidden flex items-center justify-center p-8 md:col-span-1 lg:col-span-1"
          >
            <div className="text-center">
              <div className="text-4xl mb-4">+</div>
              <h3 className="text-lg font-bold text-white mb-2">
                View All Programs
              </h3>
              <p className="text-muted text-sm">
                Explore our complete course catalog
              </p>
              <a
                href="#"
                className="inline-block mt-4 px-6 py-2.5 rounded-lg bg-gold-gradient text-background font-semibold text-sm hover:shadow-gold transition-all duration-300"
              >
                Browse All →
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
