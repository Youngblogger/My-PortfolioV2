import Link from "next/link";
import { Button } from "./Button";

type IllustrationType = "projects" | "inbox" | "payments" | "search" | "activity" | "generic";

interface EmptyStateProps {
  icon?: string;
  illustration?: IllustrationType;
  title: string;
  description: string;
  action?: { label: string; href: string };
}

const illustrations: Record<IllustrationType, React.ReactNode> = {
  projects: (
    <svg className="w-16 h-16 mx-auto mb-4" viewBox="0 0 64 64" fill="none">
      <rect x="8" y="12" width="48" height="40" rx="4" stroke="#5B4CF0" strokeWidth="2" fill="#5B4CF0" fillOpacity="0.05" />
      <rect x="16" y="20" width="20" height="3" rx="1.5" fill="#5B4CF0" fillOpacity="0.3" />
      <rect x="16" y="28" width="14" height="3" rx="1.5" fill="#5B4CF0" fillOpacity="0.2" />
      <rect x="16" y="36" width="24" height="3" rx="1.5" fill="#5B4CF0" fillOpacity="0.15" />
      <circle cx="46" cy="46" r="12" fill="#5B4CF0" fillOpacity="0.08" stroke="#5B4CF0" strokeWidth="1.5" strokeDasharray="3 3" />
      <path d="M46 40v12M40 46h12" stroke="#5B4CF0" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  inbox: (
    <svg className="w-16 h-16 mx-auto mb-4" viewBox="0 0 64 64" fill="none">
      <rect x="6" y="14" width="52" height="36" rx="6" stroke="#5B4CF0" strokeWidth="2" fill="#5B4CF0" fillOpacity="0.05" />
      <path d="M6 26L28 42a6 6 0 008 0L58 26" stroke="#5B4CF0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="48" cy="18" r="10" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.5" />
      <path d="M48 14v4m0 4v.01" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  payments: (
    <svg className="w-16 h-16 mx-auto mb-4" viewBox="0 0 64 64" fill="none">
      <rect x="8" y="12" width="48" height="40" rx="4" stroke="#5B4CF0" strokeWidth="2" fill="#5B4CF0" fillOpacity="0.05" />
      <rect x="14" y="20" width="36" height="24" rx="2" stroke="#5B4CF0" strokeWidth="1.5" fill="#5B4CF0" fillOpacity="0.05" />
      <circle cx="32" cy="32" r="6" stroke="#22C55E" strokeWidth="2" fill="#22C55E" fillOpacity="0.1" />
      <path d="M29 32l2 2 4-4" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  search: (
    <svg className="w-16 h-16 mx-auto mb-4" viewBox="0 0 64 64" fill="none">
      <circle cx="26" cy="26" r="14" stroke="#5B4CF0" strokeWidth="2" fill="#5B4CF0" fillOpacity="0.05" />
      <path d="M36 36l10 10" stroke="#5B4CF0" strokeWidth="2" strokeLinecap="round" />
      <rect x="46" y="32" width="16" height="3" rx="1.5" fill="#5B4CF0" fillOpacity="0.2" transform="rotate(-45 46 32)" />
    </svg>
  ),
  activity: (
    <svg className="w-16 h-16 mx-auto mb-4" viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="20" stroke="#5B4CF0" strokeWidth="2" fill="#5B4CF0" fillOpacity="0.03" strokeDasharray="4 4" />
      <path d="M20 32l8 8 16-16" stroke="#5B4CF0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="32" cy="32" r="3" fill="#5B4CF0" />
    </svg>
  ),
  generic: (
    <svg className="w-16 h-16 mx-auto mb-4" viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="20" stroke="#5B4CF0" strokeWidth="2" fill="#5B4CF0" fillOpacity="0.05" />
      <path d="M24 32h16M32 24v16" stroke="#5B4CF0" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
};

export function EmptyState({ icon, illustration = "generic", title, description, action }: EmptyStateProps) {
  return (
    <div className="bg-white rounded-2xl p-12 text-center shadow-[0_10px_35px_rgba(16,24,40,0.06)] border border-[#ECEFF5]">
      {icon ? (
        <div className="text-5xl mb-4" aria-hidden="true">{icon}</div>
      ) : (
        illustrations[illustration]
      )}
      <h3 className="text-xl font-bold mb-2" style={{ color: "#101828" }}>{title}</h3>
      <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: "#98A2B3" }}>{description}</p>
      {action && (
        <Link href={action.href}>
          <Button>{action.label}</Button>
        </Link>
      )}
    </div>
  );
}
