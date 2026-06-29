import { Badge } from "./Badge";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusMap: Record<string, "info" | "gold" | "success" | "error"> = {
  draft: "info",
  sent: "gold",
  viewed: "gold",
  approved: "success",
  rejected: "error",
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const variant = statusMap[status] || "info";
  return (
    <Badge variant={variant} className={className}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
