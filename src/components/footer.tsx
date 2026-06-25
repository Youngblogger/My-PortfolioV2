const footerSections = [
  {
    title: "Academy",
    links: [
      { label: "Frontend Engineering", href: "#" },
      { label: "Backend Engineering", href: "#" },
      { label: "Full-Stack Development", href: "#" },
      { label: "Mobile Development", href: "#" },
      { label: "AI Engineering", href: "#" },
    ],
  },
  {
    title: "Projects",
    links: [
      { label: "Marketplace Platform", href: "#" },
      { label: "Learning Management System", href: "#" },
      { label: "Fintech Dashboard", href: "#" },
      { label: "Restaurant Platform", href: "#" },
      { label: "AI Applications", href: "#" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Web Development", href: "#" },
      { label: "SaaS Development", href: "#" },
      { label: "Mobile Apps", href: "#" },
      { label: "UI/UX Design", href: "#" },
      { label: "Technical Consulting", href: "#" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "Blog", href: "#" },
      { label: "Community", href: "#" },
      { label: "About", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Careers", href: "#" },
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
              {["LinkedIn", "GitHub", "X", "YouTube"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-9 h-9 rounded-lg glass flex items-center justify-center text-xs text-muted hover:text-gold hover:border-gold/30 hover:shadow-[0_0_15px_rgba(212,175,55,0.06)] transition-all duration-300"
                  aria-label={social}
                >
                  {social[0]}
                </a>
              ))}
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
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
