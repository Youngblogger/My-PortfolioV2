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
    <div className="bg-white rounded-2xl p-12 text-center shadow-[0_10px_35px_rgba(16,24,40,0.06)] border border-[#ECEFF5]">
      <div className="text-5xl mb-4" aria-hidden="true">{icon}</div>
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
