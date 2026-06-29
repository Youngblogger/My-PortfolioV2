import Link from "next/link";
import { Button } from "./Button";

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: { label: string; href: string };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="glass rounded-2xl p-12 text-center">
      <div className="text-5xl mb-4" aria-hidden="true">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-muted text-sm mb-6 max-w-md mx-auto">{description}</p>
      {action && (
        <Link href={action.href}>
          <Button>{action.label}</Button>
        </Link>
      )}
    </div>
  );
}
