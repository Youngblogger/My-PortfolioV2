import Image from "next/image";

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
            <a href="/" className="flex flex-col mb-4">
              <span className="flex items-center gap-2">
                <Image src="/CodemafiaLogo.png" alt="CODEMAFIA" width={144} height={36} className="w-28 sm:w-32 md:w-36 h-auto" unoptimized />
              </span>
              <span className="text-[11px] text-muted/50 leading-tight mt-0.5">
                Learn the Skill. Build the Future.
              </span>
            </a>
            <div className="flex gap-3">
              {[
                { label: "LinkedIn", url: "https://linkedin.com/in/codemafia", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
                { label: "GitHub", url: "https://github.com/youngblogger", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg> },
                { label: "X", url: "https://x.com/codemafia", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
                { label: "YouTube", url: "https://youtube.com/@codemafia", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg glass flex items-center justify-center text-muted hover:text-gold hover:border-gold/30 hover:shadow-[0_0_15px_rgba(212,175,55,0.06)] transition-all duration-300"
                  aria-label={social.label}
                >
                  {social.icon}
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
