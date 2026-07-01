"use client";

import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

interface NextActionPanelProps {
  projectStatus: string;
  paymentStatus: string;
  isFullyPaid: boolean;
  isPartiallyPaid: boolean;
  isDownloadAllowed: boolean;
  balanceNgn: number;
  hasPendingReview: boolean;
  onScrollToFiles?: () => void;
  onScrollToPay?: () => void;
}

interface Action {
  icon: string;
  title: string;
  description: string;
  cta: string;
  href?: string;
  onClick?: () => void;
  variant: "gold" | "green" | "info" | "muted";
}

export default function NextActionPanel({
  projectStatus,
  paymentStatus,
  isFullyPaid,
  isPartiallyPaid,
  isDownloadAllowed,
  balanceNgn,
  hasPendingReview,
  onScrollToFiles,
  onScrollToPay,
}: NextActionPanelProps) {
  const getAction = (): Action | null => {
    if (isPartiallyPaid && balanceNgn > 0) {
      return {
        icon: "💰",
        title: "Pay Remaining Balance",
        description: `You have an outstanding balance of ${formatCurrency(balanceNgn)}. Complete your payment to unlock project delivery.`,
        cta: `Pay ${formatCurrency(balanceNgn)} Now`,
        onClick: onScrollToPay,
        variant: "gold",
      };
    }

    if (hasPendingReview) {
      return {
        icon: "📋",
        title: "Review Pending Items",
        description: "One or more milestones are waiting for your review. Please review and approve or request changes.",
        cta: "Review Now",
        onClick: () => document.getElementById("section-review")?.scrollIntoView({ behavior: "smooth" }),
        variant: "gold",
      };
    }

    if (isFullyPaid && (projectStatus === "completed" || projectStatus === "delivered") && isDownloadAllowed) {
      return {
        icon: "📥",
        title: "Files Ready for Download",
        description: "Your project files are ready. Download your deliverables now.",
        cta: "Download Files",
        onClick: onScrollToFiles,
        variant: "green",
      };
    }

    if (isFullyPaid && projectStatus === "awaiting_completion") {
      return {
        icon: "⏳",
        title: "Waiting for Development",
        description: "Your payment has been received. Our team is completing the final work.",
        cta: "View Timeline",
        onClick: () => document.getElementById("section-timeline")?.scrollIntoView({ behavior: "smooth" }),
        variant: "info",
      };
    }

    if (isFullyPaid && projectStatus === "in_progress") {
      return {
        icon: "🚀",
        title: "Project In Progress",
        description: "Your project is actively being developed. We'll notify you when there are updates.",
        cta: "View Progress",
        onClick: () => document.getElementById("section-timeline")?.scrollIntoView({ behavior: "smooth" }),
        variant: "info",
      };
    }

    if (isFullyPaid && !isDownloadAllowed) {
      return {
        icon: "⏳",
        title: "Awaiting Project Completion",
        description: "Your project has been fully paid. Downloads will be available once the project is completed.",
        cta: "View Timeline",
        onClick: () => document.getElementById("section-timeline")?.scrollIntoView({ behavior: "smooth" }),
        variant: "info",
      };
    }

    if (projectStatus === "completed" || projectStatus === "delivered") {
      return {
        icon: "🎉",
        title: "Project Completed",
        description: "Your project has been completed. Thank you for working with CODEMAFIA!",
        cta: "Leave a Review",
        href: "#section-review",
        variant: "green",
      };
    }

    if (projectStatus === "pending_review") {
      return {
        icon: "🕐",
        title: "Project Under Review",
        description: "Your project is being reviewed by our team. We'll get back to you shortly.",
        cta: "Contact Team",
        onClick: () => document.getElementById("section-messages")?.scrollIntoView({ behavior: "smooth" }),
        variant: "info",
      };
    }

    return {
      icon: "📌",
      title: "Project Active",
      description: "Check the timeline and milestones for the latest updates on your project.",
      cta: "View Details",
      onClick: () => document.getElementById("section-overview")?.scrollIntoView({ behavior: "smooth" }),
      variant: "muted",
    };
  };

  const action = getAction();
  if (!action) return null;

  const variantStyles = {
    gold: "border-gold/20 bg-gold/5",
    green: "border-green-500/20 bg-green-500/5",
    info: "border-blue-500/20 bg-blue-500/5",
    muted: "border-white/5 bg-white/5",
  };

  const ctaStyles = {
    gold: "bg-gold-gradient text-background hover:shadow-gold",
    green: "bg-green-500 text-white hover:bg-green-600",
    info: "bg-white/10 text-white hover:bg-white/20",
    muted: "bg-white/5 text-muted hover:text-white",
  };

  return (
    <div className={`glass rounded-2xl p-6 md:p-8 border ${variantStyles[action.variant]}`}>
      <div className="flex items-start gap-4 flex-col sm:flex-row sm:items-center">
        <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center shrink-0 text-2xl">
          {action.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-white">{action.title}</h3>
          <p className="text-sm text-muted mt-1">{action.description}</p>
        </div>
        {action.href ? (
          <Link
            href={action.href}
            className={`shrink-0 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${ctaStyles[action.variant]}`}
          >
            {action.cta}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className={`shrink-0 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${ctaStyles[action.variant]}`}
          >
            {action.cta}
          </button>
        )}
      </div>
    </div>
  );
}
