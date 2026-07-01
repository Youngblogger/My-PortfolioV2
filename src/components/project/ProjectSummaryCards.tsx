"use client";

import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils";

interface ProjectSummaryCardsProps {
  projectStatus: string;
  paymentStatus: string;
  paymentType: string;
  totalNgn: number;
  amountPaidNgn: number;
  balanceNgn: number;
  estimatedDelivery: string | null;
  completedAt: string | null;
  updatedAt: string;
}

const PROJECT_PHASE_LABELS: Record<string, string> = {
  pending_review: "Planning & Review",
  requirements_reviewed: "Requirements Defined",
  clarification_needed: "Clarification",
  ready_for_kickoff: "Ready to Start",
  in_progress: "Active Development",
  awaiting_feedback: "Awaiting Your Feedback",
  awaiting_payment: "Awaiting Payment",
  awaiting_completion: "Finalizing",
  completed: "Completed",
  delivered: "Delivered",
  archived: "Archived",
};

export default function ProjectSummaryCards({
  projectStatus,
  paymentStatus,
  paymentType,
  totalNgn,
  amountPaidNgn,
  balanceNgn,
  estimatedDelivery,
  completedAt,
  updatedAt,
}: ProjectSummaryCardsProps) {
  const cards = [
    {
      label: "Project Status",
      value: PROJECT_PHASE_LABELS[projectStatus] || projectStatus.replace(/_/g, " "),
      color: projectStatus === "completed" || projectStatus === "delivered" ? "text-green-400" : "text-white",
    },
    {
      label: "Current Phase",
      value: PROJECT_PHASE_LABELS[projectStatus] || projectStatus.replace(/_/g, " "),
      color: "text-gold",
    },
    {
      label: "Amount Paid",
      value: formatCurrency(amountPaidNgn),
      color: "text-green-400",
    },
    {
      label: "Remaining Balance",
      value: balanceNgn > 0 ? formatCurrency(balanceNgn) : "---",
      color: balanceNgn > 0 ? "text-gold" : "text-muted",
    },
    {
      label: "Estimated Delivery",
      value: estimatedDelivery ? formatDate(estimatedDelivery) : completedAt ? formatDate(completedAt) : "Not set",
      color: estimatedDelivery || completedAt ? "text-white" : "text-muted",
    },
    {
      label: "Last Updated",
      value: formatRelativeTime(updatedAt),
      color: "text-white",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card) => (
        <div key={card.label} className="glass rounded-xl p-3 md:p-4">
          <div className="text-[10px] md:text-xs text-muted uppercase tracking-wider mb-1">{card.label}</div>
          <div className={`text-sm md:text-base font-bold ${card.color} leading-tight`}>{card.value}</div>
        </div>
      ))}
    </div>
  );
}
