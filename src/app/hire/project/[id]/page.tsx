"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { api, type WorkspaceDataResponse, type WorkspaceMilestoneData, type WorkspaceActivityLogData, type ServiceFileData, type ServiceMessageData, type ProjectReviewData, type TimelineEventData } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { formatDate, formatCurrency, formatFileSize, getDaysRemaining, formatRelativeTime } from "@/lib/utils";
import ProjectSummaryCards from "@/components/project/ProjectSummaryCards";
import NextActionPanel from "@/components/project/NextActionPanel";
import DynamicTimeline from "@/components/project/DynamicTimeline";
import ActivityFeed from "@/components/project/ActivityFeed";
import SectionSkeleton from "@/components/project/SectionSkeleton";
import PaymentStatusCard from "@/components/project/PaymentStatusCard";
import BalancePaymentSection from "@/components/project/BalancePaymentSection";

const TABS = ["Overview", "Timeline", "Team", "Files", "Messages", "Payments", "Review", "Delivery", "Activity"] as const;

const PROJECT_STATUS_LABELS: Record<string, string> = {
  pending_review: "Pending Review",
  requirements_reviewed: "Requirements Reviewed",
  clarification_needed: "Clarification Needed",
  ready_for_kickoff: "Ready for Kickoff",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

function getProjectStatusIdx(status: string): number {
  const order = ["pending_review", "requirements_reviewed", "clarification_needed", "ready_for_kickoff", "in_progress"];
  const idx = order.indexOf(status);
  return idx >= 0 ? idx : status === "completed" ? 5 : status === "cancelled" ? -1 : 0;
}

function getPaymentBadgeVariant(status: string): "gold" | "success" | "error" | "info" {
  const map: Record<string, "gold" | "success" | "error" | "info"> = {
    paid: "success",
    partially_paid: "gold",
    pending: "info",
    pending_payment: "info",
    failed: "error",
    refunded: "info",
    cancelled: "error",
  };
  return map[status] || "info";
}

function getProjectStatusVariant(status: string): "gold" | "success" | "error" | "info" {
  const map: Record<string, "gold" | "success" | "error" | "info"> = {
    pending_review: "gold",
    requirements_reviewed: "info",
    clarification_needed: "error",
    ready_for_kickoff: "info",
    in_progress: "gold",
    completed: "success",
    cancelled: "error",
  };
  return map[status] || "info";
}

function getMilestoneStatusIcon(status: string) {
  if (status === "completed") return <span className="text-green-400 text-xs">&#10003;</span>;
  if (status === "in_progress") return <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />;
  return <span className="w-1.5 h-1.5 rounded-full bg-white/20" />;
}

function getMilestoneStatusStyle(status: string) {
  if (status === "completed") return "border-green-500 bg-green-500/20";
  if (status === "in_progress") return "border-gold bg-gold/20";
  return "border-white/10 bg-white/5";
}

function getConnectorColor(milestones: WorkspaceMilestoneData[], idx: number) {
  if (idx >= milestones.length - 1) return "bg-white/10";
  const current = milestones[idx]?.status;
  const next = milestones[idx + 1]?.status;
  if (current === "completed" && next === "completed") return "bg-green-500/40";
  if (current === "completed") return "bg-green-500/40";
  return "bg-white/10";
}

interface SectionProps {
  w: WorkspaceDataResponse;
  milestones: WorkspaceMilestoneData[];
  completedMilestones: number;
  totalMilestones: number;
  milestoneProgress: number;
  totalPaid: number;
  balance: number;
  projectStatusIdx: number;
  timelineEvents?: TimelineEventData[];
  onRefresh?: () => void;
  tabId?: string;
}

function OverviewSection({ w, milestones, completedMilestones, totalMilestones, milestoneProgress, totalPaid, balance, projectStatusIdx, timelineEvents, onRefresh }: SectionProps) {
  const invoice = w.invoices?.[0];
  const firstInvoiceNumber = invoice?.invoice_number;

  const pm = w.projectManager;
  const pendingReview = milestones.filter((m) => m.review_status === "pending").length > 0;

  const currentMilestone = useMemo(() => {
    const inProgress = milestones.find((m) => m.status === "in_progress");
    if (inProgress) return inProgress;
    const nextPending = milestones.find((m) => m.status === "pending" || m.status === "locked");
    return nextPending || null;
  }, [milestones]);

  const estimatedDeliveryDate = useMemo(() => {
    if (w.completed_at) return null;
    if (currentMilestone?.due_date) return currentMilestone.due_date;
    if (w.kickoff_at) {
      const kickoff = new Date(w.kickoff_at);
      kickoff.setDate(kickoff.getDate() + 60);
      return kickoff.toISOString();
    }
    return null;
  }, [w.completed_at, w.kickoff_at, currentMilestone]);

  return (
    <div className="space-y-6">
      {/* Project Summary Cards */}
      <ProjectSummaryCards
        projectStatus={w.project_status}
        paymentStatus={w.payment_status}
        paymentType={w.payment_type}
        totalNgn={w.total_ngn}
        amountPaidNgn={w.amount_paid_ngn}
        balanceNgn={w.balance_ngn}
        estimatedDelivery={estimatedDeliveryDate}
        completedAt={w.completed_at}
        updatedAt={w.created_at}
      />

      {/* Balance Payment Section */}
      {w.is_partially_paid && (
        <BalancePaymentSection
          orderId={w.id}
          balanceNgn={w.balance_ngn}
          totalNgn={w.total_ngn}
          amountPaidNgn={w.amount_paid_ngn}
          invoiceNumber={firstInvoiceNumber}
          onPaymentSuccess={onRefresh}
        />
      )}

      {/* Fully Paid Banner */}
      {w.is_fully_paid && w.project_status !== "completed" && w.project_status !== "delivered" && (
        <div className="glass rounded-2xl p-6 md:p-8 border border-green-500/20">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <h3 className="text-lg font-bold text-white">Payment Received Successfully</h3>
              <p className="text-sm text-muted mt-1">
                Your project has been fully paid. Our team is completing the final work. Downloads will become available once the project has been completed.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Next Action Panel */}
      <NextActionPanel
        projectStatus={w.project_status}
        paymentStatus={w.payment_status}
        isFullyPaid={w.is_fully_paid}
        isPartiallyPaid={w.is_partially_paid}
        isDownloadAllowed={w.is_download_allowed}
        balanceNgn={w.balance_ngn}
        hasPendingReview={pendingReview}
        onScrollToFiles={() => document.getElementById("section-files")?.scrollIntoView({ behavior: "smooth" })}
        onScrollToPay={() => document.getElementById("section-payments")?.scrollIntoView({ behavior: "smooth" })}
      />

      {/* Estimated Completion + Progress */}
      <div className="grid sm:grid-cols-2 gap-6">
        {/* Progress */}
        <div className="glass rounded-2xl p-6 md:p-8">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Project Progress</h3>
          <div className="flex items-center gap-4 mb-3">
            <div className="flex-1 h-3 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-gold to-green-400"
                initial={{ width: 0 }}
                whileInView={{ width: `${milestoneProgress}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                role="progressbar"
                aria-valuenow={milestoneProgress}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <span className="text-2xl font-bold text-white">{milestoneProgress}%</span>
          </div>
          <div className="flex flex-wrap gap-3 text-xs">
            <span className="text-green-400">&#9679; {completedMilestones} completed</span>
            <span className="text-gold">&#9679; {milestones.filter((m) => m.status === "in_progress").length} in progress</span>
            <span className="text-muted">&#9679; {totalMilestones - completedMilestones} remaining</span>
          </div>
        </div>

        {/* Estimated Completion */}
        {!w.completed_at && (
          <div className="glass rounded-2xl p-6 md:p-8">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Estimated Completion</h3>
            {estimatedDeliveryDate ? (
              <>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-bold text-white">{getDaysRemaining(estimatedDeliveryDate)}</span>
                  <span className="text-sm text-muted">days remaining</span>
                </div>
                <p className="text-xs text-muted mb-3">Target: {formatDate(estimatedDeliveryDate)}</p>
              </>
            ) : (
              <p className="text-sm text-muted mb-3">Awaiting timeline confirmation from project team.</p>
            )}
            {currentMilestone && (
              <div className="bg-white/5 rounded-xl p-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted">Current</span>
                  <span className="text-gold font-medium capitalize">{currentMilestone.status.replace(/_/g, " ")}</span>
                </div>
                <p className="text-sm text-white font-medium">{currentMilestone.title}</p>
                {currentMilestone.description && (
                  <p className="text-xs text-muted/70">{currentMilestone.description}</p>
                )}
              </div>
            )}
          </div>
        )}
        {w.completed_at && (
          <div className="glass rounded-2xl p-6 md:p-8 border border-green-500/20">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Completed</h3>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🎉</span>
              <div>
                <span className="text-2xl font-bold text-white">100%</span>
                <p className="text-xs text-green-400">Project completed on {formatDate(w.completed_at)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Assigned Team */}
      <div className="glass rounded-2xl p-6 md:p-8">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Assigned Team</h3>
        {pm ? (
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold text-lg shrink-0 overflow-hidden">
              {pm.profile?.avatar_url ? (
                <img src={pm.profile.avatar_url} alt={pm.profile.full_name || "PM"} className="w-full h-full object-cover" />
              ) : (
                (pm.profile?.full_name || "PM").charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <p className="text-white font-semibold">{pm.profile?.full_name || "Project Manager"}</p>
              <p className="text-xs text-muted">Project Manager &middot; Your dedicated point of contact</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-2xl mx-auto mb-3" aria-hidden="true">👥</div>
            <p className="text-sm text-white font-medium">Team Being Assembled</p>
            <p className="text-xs text-muted mt-1">We are putting together the best team for your project. You will be notified once assignments are made.</p>
          </div>
        )}
      </div>

      {/* Dynamic Timeline */}
      <DynamicTimeline milestones={milestones} activityEvents={timelineEvents || []} />

      {/* Service & Package info */}
      <div className="glass rounded-2xl p-6 md:p-8">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Service &amp; Package</h3>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted">Service</span>
            <p className="text-white font-medium mt-0.5">{w.service.title}</p>
          </div>
          <div>
            <span className="text-muted">Project Type</span>
            <p className="text-white font-medium mt-0.5">{w.projectType.title}</p>
          </div>
          <div>
            <span className="text-muted">Package</span>
            <p className="text-white font-medium mt-0.5">{w.package.name}</p>
          </div>
          <div>
            <span className="text-muted">Total Amount</span>
            <p className="text-gold font-bold mt-0.5 text-lg">{formatCurrency(w.total_ngn)}</p>
          </div>
        </div>
      </div>

      {/* Add-ons */}
      {w.addOns && w.addOns.length > 0 && (
        <div className="glass rounded-2xl p-6 md:p-8">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Add-Ons</h3>
          <div className="space-y-2">
            {w.addOns.map((addon) => (
              <div key={addon.id} className="flex justify-between text-sm py-1">
                <span className="text-white">{addon.name}</span>
                <span className="text-gold">{formatCurrency(addon.price_ngn)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Billing info */}
      {w.billing_details && Object.keys(w.billing_details).length > 0 && (
        <div className="glass rounded-2xl p-6 md:p-8">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Billing Information</h3>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            {Object.entries(w.billing_details as Record<string, unknown>).filter(([, val]) => val).map(([key, val]) => (
              <div key={key}>
                <span className="text-muted capitalize">{key.replace(/_/g, " ")}</span>
                <p className="text-white mt-0.5">{String(val)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Project Timeline Info */}
      <div className="glass rounded-2xl p-6 md:p-8">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Project Timeline</h3>
        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-muted">Order Created</span>
            <p className="text-white mt-0.5">{formatDate(w.created_at)}</p>
          </div>
          <div>
            <span className="text-muted">Kickoff</span>
            <p className="text-white mt-0.5">{w.kickoff_at ? formatDate(w.kickoff_at) : "Not yet scheduled"}</p>
          </div>
          <div>
            <span className="text-muted">Completed</span>
            <p className="text-white mt-0.5">{w.completed_at ? formatDate(w.completed_at) : "In progress"}</p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="glass rounded-2xl p-6 md:p-8">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Quick Actions</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {w.receipts.length > 0 && (
            <button
              onClick={() => {
                const receipt = w.receipts[0];
                api.downloadServiceReceipt(w.id, receipt.id).then((res) => {
                  const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `receipt-${receipt.receipt_number}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                });
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-sm text-white font-medium text-left"
            >
              <span className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold text-base">&#128196;</span>
              Download Receipt
            </button>
          )}
          {w.invoices.length > 0 && (
            <button
              onClick={() => {
                const invoice = w.invoices[0];
                api.downloadServiceInvoice(w.id, invoice.id).then((res) => {
                  const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `invoice-${invoice.invoice_number}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                });
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-sm text-white font-medium text-left"
            >
              <span className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold text-base">&#128179;</span>
              Download Invoice
            </button>
          )}
          {w.is_download_allowed && (
            <Link
              href="#section-files"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("section-files")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gold/10 hover:bg-gold/20 transition-all text-sm text-white font-medium"
            >
              <span className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 text-base">&#128229;</span>
              Download Files
            </Link>
          )}
          <Link
            href="/hire/discovery-call"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-sm text-white font-medium"
          >
            <span className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold text-base">&#128222;</span>
            Schedule Call
          </Link>
          <Link
            href="/notifications"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-sm text-white font-medium"
          >
            <span className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold text-base">&#128276;</span>
            Notifications
          </Link>
        </div>
      </div>
    </div>
  );
}

function TimelineSection({ w, milestones, completedMilestones, totalMilestones, milestoneProgress, totalPaid, balance, projectStatusIdx, timelineEvents }: SectionProps) {
  return (
    <div className="space-y-6">
      {/* Dynamic Timeline */}
      <DynamicTimeline milestones={milestones} activityEvents={timelineEvents || []} />
    </div>
  );
}

function TeamSection({ w, milestones, completedMilestones, totalMilestones, milestoneProgress, totalPaid, balance, projectStatusIdx }: SectionProps) {
  const pm = w.projectManager;
  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6 md:p-8">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Assigned Team</h3>
        {pm ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
              <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold text-lg shrink-0 overflow-hidden">
                {pm.profile?.avatar_url ? (
                  <img src={pm.profile.avatar_url} alt={pm.profile.full_name || "PM"} className="w-full h-full object-cover" />
                ) : (
                  (pm.profile?.full_name || "PM").charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <p className="text-white font-semibold">{pm.profile?.full_name || "Project Manager"}</p>
                <p className="text-xs text-muted">Project Manager</p>
                <p className="text-xs text-muted/60 mt-0.5">Your dedicated point of contact for this project</p>
              </div>
            </div>
            <div className="text-center py-4 bg-white/5 rounded-xl">
              <p className="text-sm text-muted">Additional team members will be visible here once assigned.</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-3xl mx-auto mb-4" aria-hidden="true">👥</div>
            <h3 className="text-lg font-bold text-white mb-2">Team Being Assembled</h3>
            <p className="text-muted text-sm max-w-md mx-auto">
              We are putting together the best team for your project. You will be notified once your project manager and team members are assigned.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function FilesSection({ w, milestones, completedMilestones, totalMilestones, milestoneProgress, totalPaid, balance, projectStatusIdx }: SectionProps) {
  const [files, setFiles] = useState<ServiceFileData[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileCategories = [
    { value: "", label: "All Files" },
    { value: "client_files", label: "Client Files" },
    { value: "design", label: "Design Files" },
    { value: "development", label: "Development Files" },
    { value: "testing", label: "Testing Files" },
    { value: "final_deliverables", label: "Final Deliverables" },
    { value: "other", label: "Other" },
  ];

  const fetchFiles = async () => {
    setLoadingFiles(true);
    try {
      const res = await api.getProjectFiles(w.id, category || undefined, sort);
      setFiles(res.data);
    } catch {} finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => { fetchFiles(); }, [w.id, category, sort]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await api.uploadProjectFile(w.id, file, "client_files");
      fetchFiles();
    } catch {} finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDownload = async (file: ServiceFileData) => {
    try {
      const res = await api.downloadProjectFile(w.id, file.id);
      const blob = await (res as unknown as Response).blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm("Delete this file?")) return;
    try {
      await api.deleteProjectFile(w.id, fileId);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    } catch {}
  };

  const canDownload = w.is_download_allowed;

  return (
    <div className="glass rounded-2xl p-6 md:p-8">
      {!canDownload && w.is_fully_paid && (
        <div className="mb-6 p-4 rounded-xl bg-gold/5 border border-gold/10">
          <p className="text-xs text-gold">
            Your project has been fully paid and is awaiting completion. Downloads will be available once the project is marked as completed.
          </p>
        </div>
      )}
      {!canDownload && !w.is_fully_paid && (
        <div className="mb-6 p-4 rounded-xl bg-gold/5 border border-gold/10">
          <p className="text-xs text-gold">
            Project downloads are unavailable. Your project must be fully paid and marked as completed before downloads are enabled.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Project Files</h3>
        <div className="flex items-center gap-3">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "newest" | "oldest")}
            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-gold/50"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
          <input ref={fileInputRef} type="file" onChange={handleUpload} className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="text-xs px-3 py-1.5 rounded-lg bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20 transition-all"
          >
            {uploading ? "Uploading..." : "Upload File"}
          </button>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {fileCategories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
              category === cat.value
                ? "bg-gold/10 text-gold border-gold/30"
                : "bg-white/5 text-muted border-white/10 hover:text-white"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loadingFiles ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <div className="w-8 h-8 rounded-lg bg-white/10 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-white/10 rounded w-3/4" />
                <div className="h-2.5 bg-white/10 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-3 opacity-30">📁</div>
          <p className="text-sm text-muted">No files yet. Upload your project requirements, brand assets, or any supporting documents.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <div key={file.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
              <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0 text-sm">📎</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{file.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
                  <span className="px-1.5 py-0.5 rounded text-[10px] border bg-white/5">{file.category.replace(/_/g, " ")}</span>
                  <span>{formatFileSize(file.size)}</span>
                  <span>{formatDate(file.created_at)}</span>
                </div>
              </div>
              <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {canDownload && (
                  <button onClick={() => handleDownload(file)} className="text-xs px-2 py-1 rounded bg-white/5 text-muted hover:text-white">Download</button>
                )}
                {file.category !== "delivery" && (
                  <button onClick={() => handleDelete(file.id)} className="text-xs px-2 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20">Delete</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-muted/50 mt-4">Files you upload are sent directly to your project team. Maximum file size: 100MB.</p>
    </div>
  );
}

function MessagesSection({ w, milestones, completedMilestones, totalMilestones, milestoneProgress, totalPaid, balance, projectStatusIdx }: SectionProps) {
  const [msgs, setMsgs] = useState<ServiceMessageData[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    setLoadingMsgs(true);
    try {
      const res = await api.getProjectMessages(w.id);
      setMsgs(res.data);
    } catch {} finally {
      setLoadingMsgs(false);
    }
  };

  useEffect(() => { fetchMessages(); }, []);

  useEffect(() => {
    if (msgs.length > 0 && bottomRef.current) {
      const parent = bottomRef.current.parentElement;
      if (parent && parent.scrollHeight > parent.clientHeight) {
        parent.scrollTop = parent.scrollHeight;
      }
    }
  }, [msgs]);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      const res = await api.sendProjectMessage(w.id, text);
      setMsgs((prev) => [...prev, res.data]);
      setText("");
    } catch {} finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="glass rounded-2xl p-6 md:p-8 flex flex-col h-[500px]">
      <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4 shrink-0">Project Discussion</h3>
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {loadingMsgs ? (
          <p className="text-sm text-muted">Loading messages...</p>
        ) : msgs.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3 opacity-30">💬</div>
            <p className="text-sm text-muted">No messages yet. Start a conversation with your project team.</p>
          </div>
        ) : (
          msgs.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.is_mine ? "flex-row-reverse" : ""}`}>
              <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center shrink-0 text-xs font-bold text-gold">
                {msg.user?.full_name?.charAt(0) || "?"}
              </div>
              <div className={`max-w-[75%] ${msg.is_mine ? "items-end" : ""} flex flex-col`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-white/80">{msg.user?.full_name || "Unknown"}</span>
                  {msg.is_important && <span className="text-[10px] text-gold">📌</span>}
                  <span className="text-[10px] text-muted">{formatDate(msg.created_at)}</span>
                </div>
                <div className={`rounded-2xl px-4 py-2.5 text-sm ${msg.is_mine ? "bg-gold/10 text-white rounded-tr-sm" : "bg-white/10 text-white/90 rounded-tl-sm"}`}>
                  {msg.message}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2 shrink-0">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Enter to send)"
          rows={1}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-muted focus:outline-none focus:border-gold/50 resize-none"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="px-4 py-2 rounded-xl bg-gold-gradient text-background font-bold text-sm hover:shadow-gold transition-all disabled:opacity-50"
        >
          {sending ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}

function PaymentsSection({ w, milestones, completedMilestones, totalMilestones, milestoneProgress, totalPaid, balance, projectStatusIdx }: SectionProps) {
  const invoice = w.invoices?.[0];
  const pendingPayments = w.is_partially_paid;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="glass rounded-2xl p-6 md:p-8">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Payment Summary</h3>
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 rounded-xl bg-white/5">
            <div className="text-xs text-muted mb-1">Total</div>
            <div className="text-xl font-bold text-white">{formatCurrency(w.total_ngn)}</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-white/5">
            <div className="text-xs text-muted mb-1">Paid</div>
            <div className="text-xl font-bold text-green-400">{formatCurrency(w.amount_paid_ngn || totalPaid)}</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-white/5">
            <div className="text-xs text-muted mb-1">Outstanding</div>
            <div className="text-xl font-bold text-gold">{formatCurrency(w.balance_ngn || balance)}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-white/5">
            <span className="text-muted">Payment Status</span>
            <p className="text-white font-semibold mt-0.5 capitalize">
              {w.payment_status === "partially_paid" ? "Partially Paid" : w.payment_status === "paid" || w.payment_status === "completed" ? "Fully Paid" : w.payment_status.replace(/_/g, " ")}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-white/5">
            <span className="text-muted">Payment Type</span>
            <p className="text-white font-semibold mt-0.5 capitalize">{w.payment_type === "full" ? "Full Payment" : "50% Deposit"}</p>
          </div>
          <div className="p-3 rounded-lg bg-white/5">
            <span className="text-muted">Last Payment</span>
            <p className="text-white font-semibold mt-0.5">{w.last_payment_date ? formatDate(w.last_payment_date) : "N/A"}</p>
          </div>
          {invoice && (
            <div className="p-3 rounded-lg bg-white/5">
              <span className="text-muted">Invoice #</span>
              <p className="text-white font-semibold mt-0.5 font-mono text-[11px]">{invoice.invoice_number}</p>
            </div>
          )}
        </div>
      </div>

      {/* Balance Payment CTA */}
      {pendingPayments && w.balance_ngn > 0 && (
        <div className="glass rounded-2xl p-6 md:p-8 border border-gold/20">
          <div className="flex items-start gap-4 flex-col sm:flex-row sm:items-center">
            <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center shrink-0 text-2xl">💰</div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white">Upcoming Payment Required</h3>
              <p className="text-sm text-muted mt-1">
                Outstanding balance of <span className="text-gold font-bold">{formatCurrency(w.balance_ngn)}</span> needs to be paid to complete your project.
              </p>
            </div>
            <button
              onClick={() => document.getElementById("section-overview")?.scrollIntoView({ behavior: "smooth" })}
              className="shrink-0 px-6 py-2.5 rounded-xl bg-gold-gradient text-background font-bold text-sm hover:shadow-gold transition-all"
            >
              Pay {formatCurrency(w.balance_ngn)} Now
            </button>
          </div>
        </div>
      )}

      {/* Receipts */}
      <div className="glass rounded-2xl p-6 md:p-8">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Receipts</h3>
        {w.receipts.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-3xl mb-2 opacity-30">🧾</div>
            <p className="text-sm text-muted">No receipts yet. Receipts will appear here after payments are processed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted border-b border-white/10">
                  <th className="text-left pb-3 font-medium">Receipt #</th>
                  <th className="text-left pb-3 font-medium">Amount</th>
                  <th className="text-left pb-3 font-medium">Gateway</th>
                  <th className="text-left pb-3 font-medium">Status</th>
                  <th className="text-left pb-3 font-medium">Date</th>
                  <th className="text-left pb-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {w.receipts.map((r) => (
                  <tr key={r.id} className="border-b border-white/5">
                    <td className="py-3 text-white font-mono">{r.receipt_number}</td>
                    <td className="py-3 text-white">{formatCurrency(r.amount_ngn)}</td>
                    <td className="py-3 text-muted capitalize">{r.payment_gateway}</td>
                    <td className="py-3">
                      <Badge variant={getPaymentBadgeVariant(r.status)}>{r.status}</Badge>
                    </td>
                    <td className="py-3 text-muted">{formatDate(r.created_at)}</td>
                    <td className="py-3">
                      <button
                        onClick={async () => {
                          try {
                            const res = await api.downloadServiceReceipt(w.id, r.id);
                            const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `receipt-${r.receipt_number}.json`;
                            a.click();
                            URL.revokeObjectURL(url);
                          } catch {}
                        }}
                        className="text-xs text-gold hover:underline"
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoices */}
      <div className="glass rounded-2xl p-6 md:p-8">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Invoices</h3>
        {w.invoices.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-3xl mb-2 opacity-30">📄</div>
            <p className="text-sm text-muted">No invoices generated yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted border-b border-white/10">
                  <th className="text-left pb-3 font-medium">Invoice #</th>
                  <th className="text-left pb-3 font-medium">Amount</th>
                  <th className="text-left pb-3 font-medium">Paid</th>
                  <th className="text-left pb-3 font-medium">Balance</th>
                  <th className="text-left pb-3 font-medium">Status</th>
                  <th className="text-left pb-3 font-medium">Date</th>
                  <th className="text-left pb-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {w.invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-white/5">
                    <td className="py-3 text-white font-mono">{inv.invoice_number}</td>
                    <td className="py-3 text-white">{formatCurrency(inv.total_ngn)}</td>
                    <td className="py-3 text-green-400">{formatCurrency(inv.amount_paid_ngn)}</td>
                    <td className="py-3 text-gold">{formatCurrency(inv.balance_ngn)}</td>
                    <td className="py-3">
                      <Badge variant={getPaymentBadgeVariant(inv.status)}>{inv.status}</Badge>
                    </td>
                    <td className="py-3 text-muted">{formatDate(inv.created_at)}</td>
                    <td className="py-3">
                      <button
                        onClick={async () => {
                          try {
                            const res = await api.downloadServiceInvoice(w.id, inv.id);
                            const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `invoice-${inv.invoice_number}.json`;
                            a.click();
                            URL.revokeObjectURL(url);
                          } catch {}
                        }}
                        className="text-xs text-gold hover:underline"
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment history */}
      <div className="glass rounded-2xl p-6 md:p-8">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Payment History</h3>
        {w.payments.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-3xl mb-2 opacity-30">💳</div>
            <p className="text-sm text-muted">No payments recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted border-b border-white/10">
                  <th className="text-left pb-3 font-medium">Reference</th>
                  <th className="text-left pb-3 font-medium">Amount</th>
                  <th className="text-left pb-3 font-medium">Gateway</th>
                  <th className="text-left pb-3 font-medium">Status</th>
                  <th className="text-left pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {w.payments.map((p) => (
                  <tr key={p.id} className="border-b border-white/5">
                    <td className="py-3 text-white font-mono text-xs">{p.reference}</td>
                    <td className="py-3 text-white">{formatCurrency(p.amount_ngn)}</td>
                    <td className="py-3 text-muted capitalize">{p.gateway}</td>
                    <td className="py-3">
                      <Badge variant={getPaymentBadgeVariant(p.status)}>{p.status}</Badge>
                    </td>
                    <td className="py-3 text-muted">{formatDate(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewSection({ w, milestones, completedMilestones, totalMilestones, milestoneProgress, totalPaid, balance, projectStatusIdx }: SectionProps) {
  const pendingReview = milestones.filter((m) => m.review_status === "pending");
  const completedMs = milestones.filter((m) => m.status === "completed");
  const isCompleted = w.project_status === "completed";
  const [existingReview, setExistingReview] = useState<ProjectReviewData | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [allowShowcase, setAllowShowcase] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (isCompleted) {
      (async () => {
        setReviewLoading(true);
        try {
          const res = await api.getProjectReview(w.id);
          setExistingReview(res.data);
        } catch {
          setExistingReview(null);
        } finally {
          setReviewLoading(false);
        }
      })();
    }
  }, [isCompleted, w.id]);

  const handleApprove = async (milestoneId: string) => {
    setActionLoading(milestoneId);
    try {
      await api.approveMilestone(w.id, milestoneId);
      setTimeout(() => window.location.reload(), 500);
    } catch (err) {
      console.error("Approve failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRequestChanges = async (milestoneId: string) => {
    const feedback = prompt("Describe the changes you'd like to request:");
    if (!feedback?.trim()) return;
    setActionLoading(milestoneId);
    try {
      await api.requestMilestoneChanges(w.id, milestoneId, feedback);
      setTimeout(() => window.location.reload(), 500);
    } catch (err) {
      console.error("Request changes failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmitReview = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    try {
      const res = await api.submitProjectReview(w.id, { rating, review: reviewText || undefined, allow_showcase: allowShowcase });
      setExistingReview(res.data);
      setSubmitted(true);
    } catch (err) {
      console.error("Submit review failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {isCompleted && (
        <div className="glass rounded-2xl p-6 md:p-8 border border-green-500/20">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🎉</span>
            <h3 className="text-lg font-bold text-white">Project Completed</h3>
          </div>
          <p className="text-sm text-muted">
            This project was completed on {w.completed_at ? formatDate(w.completed_at) : "recently"}.
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            {w.invoices.length > 0 && (
              <button
                onClick={async () => {
                  const inv = w.invoices[0];
                  try {
                    const res = await api.downloadServiceInvoice(w.id, inv.id);
                    const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a"); a.href = url; a.download = `invoice-${inv.invoice_number}.json`; a.click();
                    URL.revokeObjectURL(url);
                  } catch {}
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20 transition-all"
              >
                Download Invoice
              </button>
            )}
            {w.receipts.length > 0 && (
              <button
                onClick={async () => {
                  const rec = w.receipts[0];
                  try {
                    const res = await api.downloadServiceReceipt(w.id, rec.id);
                    const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a"); a.href = url; a.download = `receipt-${rec.receipt_number}.json`; a.click();
                    URL.revokeObjectURL(url);
                  } catch {}
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20 transition-all"
              >
                Download Receipt
              </button>
            )}
          </div>
        </div>
      )}

      {/* Milestone Review */}
      {pendingReview.length > 0 && (
        <div className="glass rounded-2xl p-6 md:p-8 border border-gold/20">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Ready for Review</h3>
          <div className="space-y-4">
            {pendingReview.map((ms) => (
              <div key={ms.id} className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">📋</span>
                  <p className="text-sm font-semibold text-white">{ms.title}</p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gold/10 text-gold border border-gold/20">Pending Review</span>
                </div>
                {ms.description && <p className="text-xs text-muted/70 mb-3">{ms.description}</p>}
                {ms.deliverables && ms.deliverables.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {ms.deliverables.map((d, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-gold/5 text-gold border border-gold/10">{d}</span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(ms.id)}
                    disabled={actionLoading === ms.id}
                    className="text-xs px-4 py-2 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-all disabled:opacity-50"
                  >
                    {actionLoading === ms.id ? "..." : "Approve"}
                  </button>
                  <button
                    onClick={() => handleRequestChanges(ms.id)}
                    disabled={actionLoading === ms.id}
                    className="text-xs px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-50"
                  >
                    Request Changes
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pendingReview.length === 0 && !isCompleted && (
        <div className="glass rounded-2xl p-6 md:p-8">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Reviews</h3>
          <div className="text-center py-8">
            <div className="text-4xl mb-3 opacity-30">📋</div>
            <p className="text-sm text-muted">No milestones pending review. You'll be notified when your project team requests a review.</p>
          </div>
        </div>
      )}

      {/* Rating & Review */}
      {isCompleted && !reviewLoading && (
        <div className="glass rounded-2xl p-6 md:p-8">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Submit Your Review</h3>
          {existingReview || submitted ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-3">⭐</div>
              <p className="text-sm text-white font-semibold">Thank you for your review!</p>
              {existingReview && (
                <div className="mt-3">
                  <div className="flex justify-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className={`text-lg ${star <= existingReview.rating ? "text-gold" : "text-white/20"}`}>★</span>
                    ))}
                  </div>
                  {existingReview.review && <p className="text-sm text-muted max-w-md mx-auto">{existingReview.review}</p>}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted mb-3">Rate your experience with this project</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`text-3xl transition-all hover:scale-110 ${star <= rating ? "text-gold" : "text-white/20"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your experience with this project (optional)..."
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-muted focus:outline-none focus:border-gold/50 resize-none"
              />
              <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowShowcase}
                  onChange={(e) => setAllowShowcase(e.target.checked)}
                  className="rounded bg-white/5 border-white/10"
                />
                Allow CODEMAFIA to showcase this project in our portfolio
              </label>
              <div className="flex justify-end">
                <button
                  onClick={handleSubmitReview}
                  disabled={rating === 0 || submitting}
                  className="px-6 py-2 rounded-xl bg-gold-gradient text-background font-bold text-sm hover:shadow-gold transition-all disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DeliverySection({ w, milestones, completedMilestones, totalMilestones, milestoneProgress, totalPaid, balance, projectStatusIdx }: SectionProps) {
  const [items, setItems] = useState<ServiceFileData[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const canDownload = w.can_download_delivery || w.is_download_allowed;
  const totalSize = useMemo(() => items.reduce((sum, i) => sum + (i.size || 0), 0), [items]);

  useEffect(() => {
    if (!canDownload) {
      setLoadingItems(false);
      return;
    }
    (async () => {
      try {
        const res = await api.getProjectDeliveryItems(w.id);
        setItems(res.data);
      } catch {} finally {
        setLoadingItems(false);
      }
    })();
  }, [w.id, canDownload]);

  const handleDownload = async (item: ServiceFileData) => {
    if (!item.has_file) return;
    try {
      const res = await api.downloadProjectFile(w.id, item.id);
      const blob = await (res as unknown as Response).blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = item.name;
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
  };

  return (
    <div className="glass rounded-2xl p-6 md:p-8">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Final Deliverables</h3>
        {items.length > 0 && canDownload && (
          <span className="text-xs text-muted">{items.length} file{items.length !== 1 ? "s" : ""} &middot; {formatFileSize(totalSize)}</span>
        )}
      </div>

      {!canDownload && (
        <div className="p-4 rounded-xl bg-gold/5 border border-gold/10 mb-4">
          <p className="text-xs text-gold">
            {w.is_fully_paid
              ? "Your project has been fully paid and is awaiting completion. Deliverables will be available once the project is completed."
              : "Project downloads are currently unavailable. Your project must be fully paid and marked as completed before downloads are enabled."}
          </p>
        </div>
      )}

      {!canDownload ? null : loadingItems ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-4 p-4 rounded-xl bg-white/5">
              <div className="w-10 h-10 rounded-lg bg-white/10" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-white/10 rounded w-3/4" />
                <div className="h-2.5 bg-white/10 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-3 opacity-30">📦</div>
          <p className="text-sm text-muted">No final deliverables published yet. They will appear here once your project team publishes them.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl bg-green-500/5 border border-green-500/10">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0 text-lg">
                {item.has_file ? "📦" : "🔗"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-white">{item.name}</p>
                  {item.type && (
                    <span className="text-[10px] text-muted bg-white/5 px-1.5 py-0.5 rounded">{item.type}</span>
                  )}
                </div>
                {item.description && <p className="text-xs text-muted/70 mt-0.5">{item.description}</p>}
                <div className="flex items-center gap-3 text-xs text-muted mt-1">
                  <span>{formatDate(item.created_at)}</span>
                  {item.size > 0 && <span>{formatFileSize(item.size)}</span>}
                </div>
              </div>
              {item.has_file && (
                <button
                  onClick={() => handleDownload(item)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-all"
                >
                  Download
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ActivitySection({ w, milestones, completedMilestones, totalMilestones, milestoneProgress, totalPaid, balance, projectStatusIdx }: SectionProps) {
  return <ActivityFeed logs={w.activityLogs} />;
}

export default function ProjectWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [workspace, setWorkspace] = useState<WorkspaceDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Overview");
  const [timelineEvents, setTimelineEvents] = useState<TimelineEventData[]>([]);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const loadWorkspace = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.getServiceOrderWorkspace(id);
      setWorkspace(res.data);
      return res.data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load project workspace";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadTimeline = useCallback(async (orderId: string) => {
    try {
      const res = await api.getServiceOrderTimeline(orderId);
      setTimelineEvents(res.data);
    } catch {
      // non-critical
    }
  }, []);

  const refreshWorkspace = useCallback(async () => {
    const w = await loadWorkspace();
    if (w) loadTimeline(w.id);
  }, [loadWorkspace, loadTimeline]);

  useEffect(() => {
    loadWorkspace().then((w) => {
      if (w) loadTimeline(w.id);
    });
  }, [loadWorkspace, loadTimeline]);

  const scrollTo = useCallback((tab: (typeof TABS)[number]) => {
    setActiveTab(tab);
    const el = sectionRefs.current[tab];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    TABS.map((tab) => {
      const el = sectionRefs.current[tab];
      if (!el) return null;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) setActiveTab(tab);
          });
        },
        { rootMargin: "-100px 0px -60% 0px", threshold: 0 }
      );
      observer.observe(el);
      observers.push(observer);
      return observer;
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [workspace]);

  const w = workspace!;
  const projectStatusIdx = w ? getProjectStatusIdx(w.project_status) : -1;

  const milestones = w?.milestones || [];
  const completedMilestones = milestones.filter((m) => m.status === "completed").length;
  const totalMilestones = milestones.length;
  const milestoneProgress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  const totalPaid = (w?.payments || [])
    .filter((p) => p.status === "success" || p.status === "completed")
    .reduce((sum, p) => sum + p.amount_ngn, 0);
  const balance = w ? w.total_ngn - totalPaid : 0;

  if (loading) return <PageLoader />;
  if (error) {
    return (
      <section className="relative pt-32 pb-20 px-6 min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl p-12 text-center max-w-md mx-auto">
          <div className="text-4xl mb-4" aria-hidden="true">&#9888;</div>
          <h2 className="text-xl font-bold text-white mb-2">Failed to Load Project</h2>
          <p className="text-muted text-sm mb-6">{error}</p>
          <button
            onClick={() => router.refresh()}
            className="px-6 py-3 rounded-xl bg-gold-gradient text-background font-bold text-sm hover:shadow-gold transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }
  if (!w) {
    return (
      <section className="relative pt-32 pb-20 px-6 min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl p-12 text-center max-w-md mx-auto">
          <div className="text-4xl mb-4" aria-hidden="true">&#128270;</div>
          <h2 className="text-xl font-bold text-white mb-2">Project Not Found</h2>
          <p className="text-muted text-sm mb-6">This project doesn&apos;t exist or you don&apos;t have access.</p>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 rounded-xl bg-gold-gradient text-background font-bold text-sm hover:shadow-gold transition-all duration-300"
          >
            Back to Dashboard
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="relative pt-24 pb-20 min-h-screen overflow-hidden">
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-white transition-colors mb-1"
          >
            &larr; Back to Dashboard
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-white">{w.project_name || w.projectType.title}</h1>
            <Badge variant={getProjectStatusVariant(w.project_status)}>
              {PROJECT_STATUS_LABELS[w.project_status] || w.project_status.replace(/_/g, " ")}
            </Badge>
            <Badge variant={getPaymentBadgeVariant(w.payment_status)}>
              {w.payment_status === "partially_paid" ? "Deposit Paid" : w.payment_status.replace(/_/g, " ")}
            </Badge>
            {w.project_number && (
              <span className="text-xs text-muted font-mono">{w.project_number}</span>
            )}
            <span className="text-xs text-muted font-mono">#{w.order_number}</span>
          </div>
        </motion.div>

        {/* Mobile tabs */}
        <div className="md:hidden overflow-x-auto mb-6 -mx-6 px-6">
          <div className="flex gap-2 min-w-max pb-2 border-b border-white/10">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => scrollTo(tab)}
                className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-gold/10 text-gold border border-gold/20"
                    : "text-muted hover:text-white border border-transparent"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <nav className="hidden md:flex flex-col gap-1 w-56 shrink-0 self-start">
            <div className="sticky top-28 space-y-1">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => scrollTo(tab)}
                  aria-current={activeTab === tab ? "true" : undefined}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab
                      ? "bg-gold/10 text-gold border-l-2 border-gold"
                      : "text-muted hover:text-white hover:bg-white/5 border-l-2 border-transparent"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </nav>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-12">
            {TABS.map((tab) => (
              <div
                key={tab}
                ref={(el) => { sectionRefs.current[tab] = el; }}
                id={`section-${tab.toLowerCase().replace(/\s+/g, "-")}`}
                className="scroll-mt-28"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-xl font-bold text-white mb-6 hidden md:block">{tab}</h2>
                  {tab === "Overview" && <OverviewSection w={w} milestones={milestones} completedMilestones={completedMilestones} totalMilestones={totalMilestones} milestoneProgress={milestoneProgress} totalPaid={totalPaid} balance={balance} projectStatusIdx={projectStatusIdx} timelineEvents={timelineEvents} onRefresh={refreshWorkspace} />}
                  {tab === "Timeline" && <TimelineSection w={w} milestones={milestones} completedMilestones={completedMilestones} totalMilestones={totalMilestones} milestoneProgress={milestoneProgress} totalPaid={totalPaid} balance={balance} projectStatusIdx={projectStatusIdx} timelineEvents={timelineEvents} />}
                  {tab === "Team" && <TeamSection w={w} milestones={milestones} completedMilestones={completedMilestones} totalMilestones={totalMilestones} milestoneProgress={milestoneProgress} totalPaid={totalPaid} balance={balance} projectStatusIdx={projectStatusIdx} />}
                  {tab === "Files" && <FilesSection w={w} milestones={milestones} completedMilestones={completedMilestones} totalMilestones={totalMilestones} milestoneProgress={milestoneProgress} totalPaid={totalPaid} balance={balance} projectStatusIdx={projectStatusIdx} />}
                  {tab === "Messages" && <MessagesSection w={w} milestones={milestones} completedMilestones={completedMilestones} totalMilestones={totalMilestones} milestoneProgress={milestoneProgress} totalPaid={totalPaid} balance={balance} projectStatusIdx={projectStatusIdx} />}
                  {tab === "Payments" && <PaymentsSection w={w} milestones={milestones} completedMilestones={completedMilestones} totalMilestones={totalMilestones} milestoneProgress={milestoneProgress} totalPaid={totalPaid} balance={balance} projectStatusIdx={projectStatusIdx} />}
                  {tab === "Review" && <ReviewSection w={w} milestones={milestones} completedMilestones={completedMilestones} totalMilestones={totalMilestones} milestoneProgress={milestoneProgress} totalPaid={totalPaid} balance={balance} projectStatusIdx={projectStatusIdx} />}
                  {tab === "Delivery" && <DeliverySection w={w} milestones={milestones} completedMilestones={completedMilestones} totalMilestones={totalMilestones} milestoneProgress={milestoneProgress} totalPaid={totalPaid} balance={balance} projectStatusIdx={projectStatusIdx} />}
                  {tab === "Activity" && <ActivitySection w={w} milestones={milestones} completedMilestones={completedMilestones} totalMilestones={totalMilestones} milestoneProgress={milestoneProgress} totalPaid={totalPaid} balance={balance} projectStatusIdx={projectStatusIdx} />}
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}