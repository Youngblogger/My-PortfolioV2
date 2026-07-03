"use client";

import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

const projects = [
  {
    id: "marketplace-platform",
    title: "Marketplace Platform",
    category: "E-Commerce",
    summary: "A multi-vendor marketplace connecting artisans across Africa with global buyers.",
    tags: ["Next.js", "Node.js", "PostgreSQL"],
    gradient: "from-blue-500/20 via-cyan-500/10 to-transparent",
    isConcept: true,
    overview:
      "This concept platform demonstrates how we would design and build a multi-vendor marketplace connecting African artisans with international buyers. It showcases vendor management, multi-currency payment processing, real-time inventory, and order fulfillment across thousands of sellers.",
    challenge:
      "The challenge was designing a system that could handle thousands of vendors each managing their own inventory, while processing payments across multiple currencies and regions &mdash; all while maintaining real-time accuracy and 99.9% uptime.",
    solution:
      "We architected a microservices-based platform with event-driven inventory synchronization, an escrow payment system for buyer protection, and AI-powered product recommendations. The vendor dashboard was designed to be simple enough for artisans with minimal technical experience while providing powerful management capabilities.",
    scope: [
      "Multi-vendor marketplace platform with individual vendor storefronts",
      "Vendor dashboard for inventory, orders, and analytics",
      "Multi-currency payment processing with escrow system",
      "Real-time inventory management across 10,000+ SKUs",
      "AI-powered product recommendations and search",
    ],
    features: [
      {
        title: "Vendor Dashboard",
        desc: "Sellers manage products, track orders, and view sales analytics from a single interface.",
      },
      {
        title: "Escrow Payments",
        desc: "Funds are held securely until buyers confirm receipt, protecting both parties.",
      },
      {
        title: "Real-time Inventory",
        desc: "Stock levels update instantly across all vendor storefronts as orders are placed.",
      },
      {
        title: "Multi-currency Support",
        desc: "Buyers pay in their local currency; vendors receive payouts in theirs.",
      },
    ],
    design:
      "The platform uses a clean, product-focused design that puts vendor products front and center. The browsing experience prioritizes discovery, with smart categorization, visual search, and personalized recommendations. The vendor dashboard emphasizes clarity &mdash; giving sellers the information they need at a glance without overwhelming them.",
    technical: [
      {
        decision: "Event-driven architecture with message queue",
        rationale:
          "Inventory updates, order events, and payment notifications need to propagate across services instantly without blocking or polling.",
      },
      {
        decision: "CQRS pattern for read/write separation",
        rationale:
          "Product browsing requires fast reads across thousands of listings, while order processing needs transactional write integrity. Separating these concerns optimizes for both.",
      },
      {
        decision: "Escrow payment flow with idempotency keys",
        rationale:
          "Payment processing across multiple gateways requires guaranteed exactly-once execution to prevent double-charging or lost transactions.",
      },
    ],
    results: [
      "10,000+ vendors onboarded",
      "50,000+ monthly transactions",
      "99.9% uptime SLA maintained",
      "40% reduction in cart abandonment",
    ],
  },
  {
    id: "fintech-dashboard",
    title: "Fintech Dashboard",
    category: "Dashboard",
    summary: "An enterprise financial analytics dashboard processing millions in daily transactions.",
    tags: ["Next.js", "TypeScript", "Supabase"],
    gradient: "from-purple-500/20 via-violet-500/10 to-transparent",
    isConcept: true,
    overview:
      "This concept financial dashboard demonstrates how we approach building real-time analytics platforms for fintech companies. It processes transaction data at scale, providing fraud detection, regulatory reporting, and interactive data visualization for financial operations teams.",
    challenge:
      "Financial dashboards require processing millions of transactions in real-time while maintaining strict accuracy, supporting multi-currency reporting, and surfacing anomalies before they become problems &mdash; all within a compliance-ready framework.",
    solution:
      "We built a real-time data visualization platform with streaming data pipelines, automated fraud detection alerts, multi-currency aggregation, and customizable reporting. The interface was designed to help financial analysts spot trends and issues immediately.",
    scope: [
      "Real-time transaction monitoring dashboard",
      "Multi-currency financial aggregation and reporting",
      "Automated fraud detection alert system",
      "Regulatory compliance reporting engine",
      "Customizable data visualization and export tools",
    ],
    features: [
      {
        title: "Real-time Data Pipeline",
        desc: "Transactions appear in the dashboard within seconds of processing, with live aggregation across currencies.",
      },
      {
        title: "Fraud Detection Alerts",
        desc: "ML-powered anomaly detection flags suspicious transactions and surfaces them for review.",
      },
      {
        title: "Compliance Reporting",
        desc: "Automated report generation for regulatory requirements, with audit trail and data export.",
      },
      {
        title: "Interactive Visualizations",
        desc: "Analysts can drill into data, filter by date range, currency, and transaction type, and export custom views.",
      },
    ],
    design:
      "The dashboard uses a data-dense but clear visual hierarchy designed for financial operators who need to make decisions quickly. Key metrics are always visible, alerts are prominently surfaced, and the interface supports both high-level overviews and granular transaction-level investigation.",
    technical: [
      {
        decision: "Stream processing with Kafka",
        rationale:
          "Transaction data arrives continuously and must be processed, aggregated, and served in real-time without batch delays.",
      },
      {
        decision: "Columnar database for analytics queries",
        rationale:
          "Aggregation queries across millions of rows execute in milliseconds rather than minutes with columnar storage optimized for read-heavy analytics workloads.",
      },
      {
        decision: "Microservices for modular compliance",
        rationale:
          "Different regulatory requirements (AML, KYC, reporting) can be updated independently without affecting core transaction processing.",
      },
    ],
    results: [
      "40% faster decision-making for analysts",
      "$2M+ in fraud prevented annually",
      "Enterprise-wide adoption across teams",
      "99.99% data accuracy maintained",
    ],
  },
  {
    id: "restaurant-platform",
    title: "Restaurant Ordering Platform",
    category: "Platform",
    summary: "A complete digital ordering ecosystem for a multi-branch restaurant chain.",
    tags: ["React Native", "Node.js", "MongoDB"],
    gradient: "from-orange-500/20 via-amber-500/10 to-transparent",
    isConcept: true,
    overview:
      "This concept platform was designed to show how a restaurant chain can digitize their entire ordering and operations flow &mdash; from customer-facing online ordering and QR code menus to kitchen display systems and delivery logistics.",
    challenge:
      "Restaurants need a unified system that handles online orders, in-store QR ordering, kitchen ticket management, delivery dispatch, and multi-branch administration &mdash; all while keeping the customer experience fast and seamless.",
    solution:
      "We created a white-label platform with QR code menus for dine-in customers, online ordering for takeout and delivery, a kitchen display system for real-time order tracking, and a central admin panel for managing multiple branches.",
    scope: [
      "Online ordering website and mobile-optimized interface",
      "QR code menu system for dine-in customers",
      "Kitchen display system with real-time order routing",
      "Delivery route optimization and dispatching",
      "Multi-branch management and reporting",
    ],
    features: [
      {
        title: "QR Code Menus",
        desc: "Dine-in customers scan, browse, and order from their phones. No app download needed.",
      },
      {
        title: "Kitchen Display System",
        desc: "Orders appear on kitchen screens in real-time with priority sorting and preparation tracking.",
      },
      {
        title: "Delivery Optimization",
        desc: "Routes are calculated in real-time based on order locations, traffic, and driver availability.",
      },
      {
        title: "Branch Management",
        desc: "Central admin dashboard for menu updates, pricing, staffing, and performance across all locations.",
      },
    ],
    design:
      "The customer experience prioritizes speed &mdash; complete an order in under 30 seconds. The kitchen interface uses clear visual status indicators so staff can prioritize and track orders at a glance. The admin dashboard consolidates data from all branches into a single, clear view.",
    technical: [
      {
        decision: "Real-time order flow with WebSockets",
        rationale:
          "Orders must move from customer → kitchen → delivery with zero delay. WebSockets enable instant push updates without polling.",
      },
      {
        decision: "White-label architecture per branch",
        rationale:
          "Each branch can have its own branding and menu while sharing the same core platform and backend infrastructure.",
      },
      {
        decision: "Route optimization engine",
        rationale:
          "Delivery times and costs decrease significantly when orders are batched and routes are calculated algorithmically rather than manually.",
      },
    ],
    results: [
      "300% increase in online orders",
      "60% reduction in customer wait times",
      "4 branches onboarded on a single platform",
      "25% revenue increase per location",
    ],
  },
  {
    id: "lms-platform",
    title: "Learning Management System",
    category: "Web Application",
    summary: "A comprehensive LMS supporting 10,000+ concurrent students.",
    tags: ["React", "Python", "Django"],
    gradient: "from-green-500/20 via-emerald-500/10 to-transparent",
    isConcept: true,
    overview:
      "This concept LMS demonstrates how we build scalable educational platforms. It supports live coding environments, video streaming, progress tracking, automated grading, and peer collaboration &mdash; designed for institutions that need to deliver technical education at scale.",
    challenge:
      "Educational platforms serving technical courses need to support thousands of concurrent users, provide live coding environments that work in the browser, stream video reliably, and automate assessment without sacrificing quality.",
    solution:
      "We designed a micro-frontend architecture with WebSocket-powered real-time features, containerized coding environments launched on demand, adaptive video streaming, and an automated grading engine that evaluates code submissions.",
    scope: [
      "Course management and curriculum builder",
      "Live coding environment with in-browser execution",
      "Video streaming with progress tracking",
      "Automated code grading and assessment engine",
      "Peer review and collaborative learning features",
    ],
    features: [
      {
        title: "Live Coding Environment",
        desc: "Students write and run code directly in the browser with real-time feedback and instructor monitoring.",
      },
      {
        title: "Automated Grading",
        desc: "Code submissions are evaluated instantly against test cases with detailed feedback on errors and improvements.",
      },
      {
        title: "Progress Tracking",
        desc: "Students and instructors see granular progress data &mdash; completed modules, time spent, and assessment scores.",
      },
      {
        title: "Peer Collaboration",
        desc: "Pair programming, code reviews, and group project spaces enable collaborative learning at scale.",
      },
    ],
    design:
      "The platform balances a clean, distraction-free learning environment with powerful tools for instructors. Students see their progress clearly and can navigate between courses, assignments, and coding environments without context switching. Instructors get dashboard-level visibility into class performance.",
    technical: [
      {
        decision: "Micro-frontends for independent scaling",
        rationale:
          "The coding environment, video streaming, and course content have different scaling requirements. Independent deployment allows each to scale without affecting others.",
      },
      {
        decision: "Containerized code execution",
        rationale:
          "Running untrusted student code requires isolated environments. Containers provide security while enabling full-language execution.",
      },
      {
        decision: "CDN-optimized video delivery",
        rationale:
          "Video content is the most bandwidth-intensive component. CDN distribution ensures smooth streaming regardless of student location.",
      },
    ],
    results: [
      "8,000+ active students supported",
      "95% course completion rate",
      "4.8/5 average student rating",
      "50% reduction in student churn",
    ],
  },
  {
    id: "ai-content-platform",
    title: "AI Content Platform",
    category: "Web Application",
    summary: "An AI-powered content generation platform for businesses.",
    tags: ["Next.js", "Python", "FastAPI"],
    gradient: "from-pink-500/20 via-rose-500/10 to-transparent",
    isConcept: true,
    overview:
      "This concept platform showcases how we integrate large language models into practical business tools. It generates marketing copy, blog posts, and social media content at scale &mdash; with brand voice customization, multi-language support, and performance analytics.",
    challenge:
      "Businesses need content at scale, but generic AI tools produce generic output. The challenge was building a platform that generates high-quality, on-brand content while giving users control over tone, style, and structure.",
    solution:
      "We built an LLM-powered platform with custom fine-tuning for African markets and business contexts, brand voice profiles that maintain consistency across all output, multi-language generation, and analytics that show content performance.",
    scope: [
      "AI-powered content generation engine",
      "Brand voice customization and management",
      "Multi-language content generation",
      "Content calendar and scheduling",
      "Performance analytics and optimization insights",
    ],
    features: [
      {
        title: "Brand Voice Profiles",
        desc: "Configure tone, style, vocabulary, and structure. Every piece of content matches your brand consistently.",
      },
      {
        title: "Multi-language Generation",
        desc: "Create content in multiple languages with cultural context awareness, not just translation.",
      },
      {
        title: "Content Calendar",
        desc: "Plan, schedule, and auto-generate content across channels with topic suggestions and timing optimization.",
      },
      {
        title: "Performance Analytics",
        desc: "Track which content performs best and get AI-powered recommendations for improvement.",
      },
    ],
    design:
      "The platform uses a clean editorial interface that feels familiar to content creators. The AI feels like an assistant rather than a replacement &mdash; generating drafts that users can refine, customize, and approve. The analytics dashboard connects content production directly to business outcomes.",
    technical: [
      {
        decision: "LLM orchestration with prompt chaining",
        rationale:
          "Complex content generation is broken into stages (outline → draft → polish) with different models and parameters optimized for each step.",
      },
      {
        decision: "Fine-tuning pipeline for brand adaptation",
        rationale:
          "Generic LLMs need adaptation for specific brand voices. A fine-tuning pipeline allows continuous improvement based on user feedback and corrections.",
      },
      {
        decision: "Multi-model routing",
        rationale:
          "Different content types benefit from different models. A routing layer selects the optimal model for each task based on cost, quality, and speed requirements.",
      },
    ],
    results: [
      "5,000+ business users onboarded",
      "1M+ content pieces generated",
      "85% user satisfaction rate",
      "45% reduction in content production time",
    ],
  },
  {
    id: "saas-analytics",
    title: "SaaS Analytics Tool",
    category: "Dashboard",
    summary: "A multi-tenant analytics platform for SMEs across Africa.",
    tags: ["React", "Node.js", "PostgreSQL"],
    gradient: "from-yellow-500/20 via-orange-500/10 to-transparent",
    isConcept: true,
    overview:
      "This concept analytics platform was designed to bring enterprise-grade business intelligence to small and medium enterprises. It provides customizable dashboards, automated reporting, predictive analytics, and self-service data exploration &mdash; all in a multi-tenant SaaS model.",
    challenge:
      "SMEs need data insights but cannot afford dedicated analytics teams or enterprise BI tools. The challenge was building a platform powerful enough for serious analysis while simple enough for non-technical business owners to use daily.",
    solution:
      "We designed a scalable multi-tenant analytics infrastructure with pre-built dashboard templates, drag-and-drop customization, automated report scheduling, and ML-powered predictive insights &mdash; packaged as an affordable subscription service.",
    scope: [
      "Multi-tenant analytics platform with data isolation",
      "Customizable dashboard builder with templates",
      "Automated report generation and scheduling",
      "Predictive analytics powered by machine learning",
      "Self-service data import and exploration tools",
    ],
    features: [
      {
        title: "Dashboard Builder",
        desc: "Drag-and-drop interface for creating custom dashboards from pre-built widgets and data sources.",
      },
      {
        title: "Automated Reporting",
        desc: "Schedule daily, weekly, or monthly reports delivered via email with key metrics and trends.",
      },
      {
        title: "Predictive Insights",
        desc: "ML models identify trends, forecast metrics, and alert users to anomalies before they become problems.",
      },
      {
        title: "Self-service Data Import",
        desc: "Connect data sources via API, CSV upload, or direct integration &mdash; no technical support needed.",
      },
    ],
    design:
      "The platform prioritizes getting users to value quickly. Pre-built dashboard templates for common business types (retail, services, e-commerce) mean users see useful data within minutes of signing up. The interface hides complexity until users need it, making powerful analytics accessible to non-technical teams.",
    technical: [
      {
        decision: "Multi-tenant data isolation with row-level security",
        rationale:
          "Each tenant's data must be completely isolated for privacy and security while sharing the same infrastructure for cost efficiency.",
      },
      {
        decision: "Real-time aggregation with materialized views",
        rationale:
          "Dashboards need to display up-to-date metrics without querying raw transaction tables on every load. Materialized views pre-compute aggregations for instant retrieval.",
      },
      {
        decision: "Self-service analytics with query builder",
        rationale:
          "Non-technical users need to explore data without writing SQL. A visual query builder translates drag-and-drop interactions into optimized database queries.",
      },
    ],
    results: [
      "500+ business subscribers",
      "99.99% data accuracy maintained",
      "60% faster reporting vs. manual processes",
      "NPS score of 72 from user surveys",
    ],
  },
];

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

const VisualBlock = ({ gradient }: { gradient: string }) => {
  const gradientClass = `bg-gradient-to-br ${gradient}`;
  return (
    <div className={`relative h-full min-h-[300px] md:min-h-[450px] rounded-2xl overflow-hidden ${gradientClass}`}>
      <div
        className="absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage:
          "radial-gradient(circle at 30% 40%, rgba(255,255,255,0.3) 1px, transparent 1px)",
        backgroundSize: "30px 30px",
      }}
    />
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }}
    />
    <motion.div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
      style={{
        background:
          "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)",
      }}
      animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    />
  </div>
  );
};

export default function CaseStudyPage() {
  const params = useParams();
  const project = projects.find((p) => p.id === params.slug);

  if (!project) {
    notFound();
  }

  const related = projects
    .filter((p) => p.category === project.category && p.id !== project.id)
    .slice(0, 3);

  return (
    <>
      {/* Hero */}
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
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
          >
            <Link
              href="/work"
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-gold transition-colors duration-300 mb-8"
            >
              &larr; Back to All Projects
            </Link>

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
              <div className="flex-1 w-full">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="px-2.5 py-1 rounded-lg bg-gold/10 text-gold text-[11px] uppercase tracking-wider font-semibold">
                    {project.category}
                  </span>
                  {project.isConcept && (
                    <span className="px-2.5 py-1 rounded-lg border border-gold/30 text-gold/70 text-[11px] uppercase tracking-wider font-medium">
                      Concept Project
                    </span>
                  )}
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight">
                  {project.title}
                </h1>
                <p className="text-base sm:text-lg text-muted mt-4 max-w-xl leading-relaxed">
                  {project.summary}
                </p>

                <div className="flex flex-wrap gap-2 mt-6">
                  {project.tags.map((t) => (
                    <span
                      key={t}
                      className="px-3 py-1.5 rounded-lg glass text-xs text-muted"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <Link
                  href="/start-project"
                  className="inline-block mt-8 px-6 py-3 rounded-xl bg-gold-gradient text-background font-bold text-sm hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
                >
                  Start a Similar Project &rarr;
                </Link>
              </div>

              <div className="flex-1 w-full">
                <VisualBlock gradient={project.gradient} />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Overview */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/30 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <span className="section-label">OVERVIEW</span>
            <h2 className="section-heading mt-2">
              Project <span className="text-gradient">Overview</span>
            </h2>
            <p className="text-white/80 text-base md:text-lg leading-relaxed mt-6 max-w-3xl">
              {project.overview}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Challenge */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mb-10"
          >
            <span className="section-label">CHALLENGE</span>
            <h2 className="section-heading mt-2">
              What Needed to Be <span className="text-gradient">Solved</span>
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeUp}
          >
            <div className="glass rounded-2xl p-8 md:p-10">
              <p className="text-white/80 text-base md:text-lg leading-relaxed">
                {project.challenge}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Solution */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/30 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mb-10"
          >
            <span className="section-label">SOLUTION</span>
            <h2 className="section-heading mt-2">
              How We <span className="text-gradient">Built It</span>
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeUp}
          >
            <div className="glass rounded-2xl p-8 md:p-10">
              <p className="text-white/80 text-base md:text-lg leading-relaxed">
                {project.solution}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Scope */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mb-10"
          >
            <span className="section-label">SCOPE</span>
            <h2 className="section-heading mt-2">
              What We Designed &amp; <span className="text-gradient">Built</span>
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="space-y-4"
          >
            {project.scope.map((item) => (
              <motion.div
                key={item}
                variants={fadeUp}
                className="flex items-center gap-4"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                <span className="text-white/80 text-base">{item}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/30 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-14"
          >
            <span className="section-label">FEATURES</span>
            <h2 className="section-heading mt-2">
              Key Product <span className="text-gradient">Capabilities</span>
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {project.features.map((f) => (
              <motion.div
                key={f.title}
                variants={cardUp}
                className="glass rounded-2xl p-6 md:p-8"
              >
                <h3 className="text-base font-bold text-white mb-3">{f.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Design */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mb-10"
          >
            <span className="section-label">DESIGN</span>
            <h2 className="section-heading mt-2">
              Design &amp; User <span className="text-gradient">Experience</span>
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeUp}
          >
            <div className="glass rounded-2xl p-8 md:p-10">
              <p className="text-white/80 text-base md:text-lg leading-relaxed">
                {project.design}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Technical */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/30 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mb-10"
          >
            <span className="section-label">TECHNOLOGY</span>
            <h2 className="section-heading mt-2">
              Technical <span className="text-gradient">Architecture</span>
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="space-y-4"
          >
            {project.technical.map((t) => (
              <motion.div
                key={t.decision}
                variants={cardUp}
                className="glass rounded-2xl p-6 md:p-8"
              >
                <div className="flex items-start gap-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0 mt-2.5" />
                  <div>
                    <h3 className="text-base font-bold text-white mb-1">
                      {t.decision}
                    </h3>
                    <p className="text-sm text-muted leading-relaxed">
                      {t.rationale}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Results */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mb-10"
          >
            <span className="section-label">RESULTS</span>
            <h2 className="section-heading mt-2">
              Results &amp; <span className="text-gradient">Impact</span>
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="grid sm:grid-cols-2 gap-4"
          >
            {project.results.map((r) => (
              <motion.div
                key={r}
                variants={cardUp}
                className="glass rounded-2xl p-5 flex items-start gap-3"
              >
                <span className="text-gold shrink-0 mt-0.5 text-sm">&#10003;</span>
                <span className="text-white/80 text-sm">{r}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Related Projects */}
      {related.length > 0 && (
        <section className="relative py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.015] to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-7xl mx-auto px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="text-center mb-14"
            >
              <span className="section-label">RELATED</span>
              <h2 className="section-heading mt-2">
                More {project.category}{" "}
                <span className="text-gradient">Projects</span>
              </h2>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={stagger}
              className="grid md:grid-cols-3 gap-5"
            >
              {related.map((rp) => (
                <motion.div
                  key={rp.id}
                  variants={cardUp}
                  className="group relative rounded-2xl glass glass-hover overflow-hidden"
                >
                  <Link href={`/work/${rp.id}`} className="block">
                    <div className={`h-28 bg-gradient-to-br ${rp.gradient} overflow-hidden`}>
                      <div
                        className="absolute inset-0 opacity-[0.04]"
                        style={{
                          backgroundImage:
                            "radial-gradient(circle at 30% 40%, rgba(255,255,255,0.3) 1px, transparent 1px)",
                          backgroundSize: "20px 20px",
                        }}
                      />
                    </div>
                    <div className="p-6 md:p-8">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-gold/10 text-gold text-[11px] uppercase tracking-wider font-semibold mb-3">
                        {rp.category}
                      </span>
                      <h3 className="text-base font-bold text-white mb-2 group-hover:text-gold transition-colors">
                        {rp.title}
                      </h3>
                      <p className="text-muted text-sm leading-relaxed mb-4">
                        {rp.summary}
                      </p>
                      <span className="text-sm text-gold font-semibold group-hover:text-white transition-colors">
                        View Case Study &rarr;
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.02] to-transparent" />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)",
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
              Interested in a
              <br />
              <span className="text-gradient">Similar Build?</span>
            </h2>
            <p className="text-lg md:text-xl text-muted mt-6 max-w-2xl mx-auto leading-relaxed">
              Let&apos;s talk about your project. We&apos;ll help you figure out the best
              approach.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.6,
              delay: 0.2,
              ease: [0.16, 1, 0.3, 1] as const,
            }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <Link
              href="/start-project"
              className="px-8 py-4 rounded-xl bg-gold-gradient text-background font-bold text-base hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
            >
              Start a Project
            </Link>
            <Link
              href="/work"
              className="px-8 py-4 rounded-xl border border-white/10 text-white font-bold text-base hover:bg-white/5 hover:border-white/20 transition-all duration-300"
            >
              View All Work
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
