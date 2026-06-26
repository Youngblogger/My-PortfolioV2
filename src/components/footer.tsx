const footerSections = [
  {
    title: "Academy",
    links: [
      { label: "Frontend Engineering", href: "/academy/frontend" },
      { label: "Backend Engineering", href: "/academy/backend" },
      { label: "Full-Stack Development", href: "/academy/fullstack" },
      { label: "Mobile Development", href: "/academy/mobile" },
      { label: "AI Engineering", href: "/academy/ai" },
    ],
  },
  {
    title: "Projects",
    links: [
      { label: "Marketplace Platform", href: "/projects/marketplace-platform" },
      { label: "Learning Management System", href: "/projects/lms-platform" },
      { label: "Fintech Dashboard", href: "/projects/fintech-dashboard" },
      { label: "Restaurant Platform", href: "/projects/restaurant-platform" },
      { label: "AI Applications", href: "/projects/ai-content-platform" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Web Development", href: "/hire/web-development" },
      { label: "SaaS Development", href: "/hire/saas-development" },
      { label: "Mobile Apps", href: "/hire/mobile-apps" },
      { label: "UI/UX Design", href: "/hire/ui-ux-design" },
      { label: "Technical Consulting", href: "/hire/technical-consulting" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "Blog", href: "/insights" },
      { label: "Community", href: "/community" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Careers", href: "/careers" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5">
      <div className="absolute inset-0 bg-gradient-to-b from-surface/50 to-background pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 md:py-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-1">
            <a href="#" className="flex items-center gap-2 group mb-4">
              <div className="w-8 h-8 rounded-lg bg-gold-gradient flex items-center justify-center">
                <span className="text-background font-bold text-sm">C</span>
              </div>
              <span className="text-white font-bold text-xl tracking-tight">
                CODEMAFIA
              </span>
            </a>
            <p className="text-sm text-muted leading-relaxed mb-6">
              Building Africa&apos;s next generation of software engineers through
              world-class education and real-world project experience.
            </p>
            <div className="flex gap-3">
              {["LinkedIn", "GitHub", "X", "YouTube"].map((social) => {
                const urls: Record<string, string> = {
                  LinkedIn: "https://linkedin.com/company/codemafia",
                  GitHub: "https://github.com/codemafia",
                  X: "https://x.com/codemafia",
                  YouTube: "https://youtube.com/@codemafia",
                };
                return (
                  <a
                    key={social}
                    href={urls[social]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg glass flex items-center justify-center text-xs text-muted hover:text-gold hover:border-gold/30 hover:shadow-[0_0_15px_rgba(212,175,55,0.06)] transition-all duration-300"
                    aria-label={social}
                  >
                    {social[0]}
                  </a>
                );
              })}
            </div>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-xs font-semibold text-gold uppercase tracking-wider mb-4">
                {section.title}
              </h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted hover:text-white transition-colors duration-300"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted">
            &copy; {new Date().getFullYear()} CODEMAFIA. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-muted">
            <a href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
