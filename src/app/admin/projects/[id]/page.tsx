"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import type {
  AdminProjectDetailData,
  AdminMilestoneData,
  WorkspaceActivityLogData,
  AdminNoteData,
  WorkspaceInvoiceData,
  WorkspacePaymentData,
  WorkspaceReceiptData,
} from "@/lib/api";
import FilesTab from "./FilesTab";
import DiscussionTab from "./DiscussionTab";
import DeliveryTab from "./DeliveryTab";

type Tab = "overview" | "milestones" | "timeline" | "notes" | "files" | "discussion" | "delivery" | "payments" | "invoice" | "receipt" | "settings";

const tabs: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "milestones", label: "Milestones" },
  { key: "timeline", label: "Timeline" },
  { key: "notes", label: "Internal Notes" },
  { key: "files", label: "Files" },
  { key: "discussion", label: "Discussion" },
  { key: "delivery", label: "Delivery" },
  { key: "payments", label: "Payments" },
  { key: "invoice", label: "Invoice" },
  { key: "receipt", label: "Receipt" },
  { key: "settings", label: "Settings" },
];

const statusLabels: Record<string, string> = {
  pending_review: "Pending Review",
  requirements_reviewed: "Requirements Reviewed",
  in_progress: "In Progress",
  on_hold: "On Hold",
  blocked: "Blocked",
  completed: "Completed",
  cancelled: "Cancelled",
};

const statusVariants: Record<string, "gold" | "success" | "error" | "info"> = {
  pending_review: "gold",
  requirements_reviewed: "info",
  in_progress: "success",
  on_hold: "gold",
  blocked: "error",
  completed: "success",
  cancelled: "error",
};

const priorityVariants: Record<string, "gold" | "success" | "error" | "info"> = {
  low: "info",
  normal: "gold",
  high: "error",
  urgent: "error",
};

export default function AdminProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [project, setProject] = useState<AdminProjectDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [saving, setSaving] = useState(false);

  const fetchProject = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAdminProject(id);
      setProject(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load project");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="portal-card rounded-2xl p-6 space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorMessage title="Failed to Load Project" message={error} onRetry={fetchProject} />;
  }

  if (!project) return null;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push("/admin/projects")}
          className="text-xs text-[#667085] hover:text-white transition-colors mb-2 flex items-center gap-1"
        >
          ← Back to Projects
        </button>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {project.project_name}
              </h1>
              <Badge variant={statusVariants[project.project_status] || "info"}>
                {statusLabels[project.project_status] || project.project_status}
              </Badge>
            </div>
            <p className="text-[#667085] text-sm mt-1">
              {project.project_number || project.order_number}
              {project.client && <span> &mdash; {project.client.full_name}</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="portal-card rounded-2xl p-4 md:p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[#667085]">Progress</span>
          <span className="text-sm font-semibold text-white">{project.progress.progress}%</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#5B4CF0] rounded-full transition-all duration-500"
            style={{ width: `${project.progress.progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-[#667085]">
            {project.progress.completed} of {project.progress.total} milestones completed
          </span>
          {project.progress.current_milestone && (
            <span className="text-xs text-[#667085]">
              Current: {project.progress.current_milestone}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-6 border-b border-[#ECEFF5] pb-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "text-sm font-medium px-4 py-2 rounded-t-lg transition-all whitespace-nowrap",
              activeTab === tab.key
                ? "text-[#5B4CF0] border-b-2 border-gold"
                : "text-[#667085] hover:text-white"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === "overview" && <OverviewTab project={project} />}
        {activeTab === "milestones" && (
          <MilestonesTab
            milestones={project.milestones}
            onRefresh={fetchProject}
          />
        )}
        {activeTab === "timeline" && <TimelineTab projectId={id} />}
        {activeTab === "notes" && (
          <NotesTab
            projectId={id}
            initialNotes={project.internalNotes}
            onRefresh={fetchProject}
          />
        )}
        {activeTab === "payments" && <PaymentsTab payments={project.payments} />}
        {activeTab === "invoice" && <InvoiceTab invoices={project.invoices} projectId={id} />}
        {activeTab === "receipt" && <ReceiptTab receipts={project.receipts} projectId={id} />}
        {activeTab === "files" && <FilesTab projectId={id} />}
        {activeTab === "discussion" && <DiscussionTab projectId={id} />}
        {activeTab === "delivery" && <DeliveryTab projectId={id} />}
        {activeTab === "settings" && (
          <SettingsTab project={project} onRefresh={fetchProject} />
        )}
      </motion.div>
    </div>
  );
}

// ─── Overview Tab ──────────────────────────────────────────────────

function OverviewTab({ project }: { project: AdminProjectDetailData }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="portal-card rounded-2xl p-6 md:p-8 space-y-5">
        <h3 className="text-sm font-semibold text-[#667085] uppercase tracking-wider">Project Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <InfoRow label="Project Name" value={project.project_name} />
          <InfoRow label="Project Number" value={project.project_number || "—"} />
          <InfoRow label="Order Number" value={project.order_number} />
          <InfoRow label="Status" value={statusLabels[project.project_status] || project.project_status} />
          <InfoRow label="Payment Status" value={project.payment_status} />
          <InfoRow label="Priority" value={project.priority} />
          <InfoRow label="Created" value={formatDate(project.created_at)} />
          <InfoRow label="Start Date" value={project.project_created_at ? formatDate(project.project_created_at) : "—"} />
          <InfoRow label="Kickoff" value={project.kickoff_at ? formatDate(project.kickoff_at) : "—"} />
          <InfoRow label="Completed" value={project.completed_at ? formatDate(project.completed_at) : "—"} />
        </div>
        {project.notes && (
          <div>
            <p className="text-xs text-[#667085] mb-1">Notes</p>
            <p className="text-sm text-[#667085]">{project.notes}</p>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="portal-card rounded-2xl p-6 md:p-8 space-y-4">
          <h3 className="text-sm font-semibold text-[#667085] uppercase tracking-wider">Client Information</h3>
          {project.client ? (
            <div className="space-y-3">
              <InfoRow label="Name" value={project.client.full_name || "—"} />
              <InfoRow label="Email" value={project.client.email} />
              <InfoRow label="Phone" value={project.client.phone || "—"} />
              <InfoRow label="Company" value={project.client.company || "—"} />
            </div>
          ) : (
            <p className="text-sm text-[#667085]">No client data</p>
          )}
        </div>

        <div className="portal-card rounded-2xl p-6 md:p-8 space-y-4">
          <h3 className="text-sm font-semibold text-[#667085] uppercase tracking-wider">Service Details</h3>
          <InfoRow label="Service" value={project.service?.title || "—"} />
          <InfoRow label="Project Type" value={project.projectType?.title || "—"} />
          <InfoRow label="Package" value={project.package?.name || "—"} />
          <InfoRow label="Add-ons" value={project.addOns.length > 0 ? project.addOns.map((a) => a.name).join(", ") : "None"} />
        </div>

        <div className="portal-card rounded-2xl p-6 md:p-8 space-y-4">
          <h3 className="text-sm font-semibold text-[#667085] uppercase tracking-wider">Budget & Payments</h3>
          <InfoRow label="Total Budget" value={formatCurrency(project.total_ngn)} />
          <InfoRow label="Amount Paid" value={formatCurrency(project.amount_paid_ngn)} />
          <InfoRow label="Balance" value={formatCurrency(project.balance_ngn)} />
          <InfoRow label="Project Manager" value={project.projectManager?.full_name || "Not assigned"} />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[#667085]">{label}</p>
      <p className="text-sm text-[#667085] font-medium">{value}</p>
    </div>
  );
}

// ─── Milestones Tab ────────────────────────────────────────────────

function MilestonesTab({ milestones, onRefresh }: { milestones: AdminMilestoneData[]; onRefresh: () => void }) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function handleAction(milestoneId: string, action: string) {
    setActionLoading(`${milestoneId}_${action}`);
    try {
      await api.milestoneAction(milestoneId, action);
      onRefresh();
    } catch (err) {
      console.error("Milestone action failed:", err);
    } finally {
      setActionLoading(null);
    }
  }

  const msVariants: Record<string, "gold" | "success" | "error" | "info"> = {
    pending: "info",
    in_progress: "gold",
    completed: "success",
    delayed: "error",
    blocked: "error",
    cancelled: "error",
  };

  const [reviewActionLoading, setReviewActionLoading] = useState<string | null>(null);

  async function handleRequestReview(milestone: AdminMilestoneData) {
    setReviewActionLoading(milestone.id);
    try {
      await api.requestMilestoneReview(milestone.id);
      onRefresh();
    } catch (err) {
      console.error("Request review failed:", err);
    } finally {
      setReviewActionLoading(null);
    }
  }

  const actions = (status: string, milestone: AdminMilestoneData): { key: string; label: string; isReview?: boolean }[] => {
    if (status === "pending") return [{ key: "start", label: "Start" }];
    if (status === "in_progress")
      return [
        { key: "complete", label: "Complete" },
        { key: "delay", label: "Delay" },
        { key: "block", label: "Block" },
      ];
    if (status === "completed") {
      const acts: { key: string; label: string; isReview?: boolean }[] = [{ key: "reopen", label: "Reopen" }];
      if (!milestone.review_requested_at) {
        acts.unshift({ key: "request-review", label: "Request Review", isReview: true });
      }
      return acts;
    }
    if (status === "delayed" || status === "blocked")
      return [
        { key: "start", label: "Resume" },
        { key: "cancel", label: "Cancel" },
      ];
    if (status === "cancelled") return [{ key: "reopen", label: "Reopen" }];
    return [];
  };

  return (
    <div className="portal-card rounded-2xl p-6 md:p-8">
      <h3 className="text-sm font-semibold text-[#667085] uppercase tracking-wider mb-6">Milestones</h3>
      <div className="space-y-3">
        {milestones.map((ms, idx) => (
          <div
            key={ms.id}
            className={cn(
              "flex items-start gap-4 p-4 rounded-xl transition-all",
              ms.status === "completed"
                ? "bg-green-500/5 border border-green-500/10"
                : ms.status === "in_progress"
                ? "bg-[#5B4CF0]/5 border border-[#5B4CF0]/10"
                : ms.status === "delayed" || ms.status === "blocked"
                ? "bg-red-500/5 border border-red-500/10"
                : "bg-gray-50"
            )}
          >
            {/* Step Number */}
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold border-2 mt-0.5"
              style={{
                borderColor:
                  ms.status === "completed" ? "rgb(34 197 94)" :
                  ms.status === "in_progress" ? "rgb(234 179 8)" :
                  ms.status === "delayed" || ms.status === "blocked" ? "rgb(239 68 68)" :
                  "rgba(255,255,255,0.2)",
                color:
                  ms.status === "completed" ? "rgb(34 197 94)" :
                  ms.status === "in_progress" ? "rgb(234 179 8)" :
                  ms.status === "delayed" || ms.status === "blocked" ? "rgb(239 68 68)" :
                  "rgba(255,255,255,0.4)",
              }}
            >
              {ms.sort_order}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-white">{ms.title}</p>
                <Badge variant={msVariants[ms.status] || "info"}>
                  {ms.status.replace(/_/g, " ")}
                </Badge>
              </div>
              {ms.description && (
                <p className="text-xs text-[#667085]/70 mt-1">{ms.description}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-xs text-[#667085] flex-wrap">
                {ms.due_date && <span>Due: {formatDate(ms.due_date)}</span>}
                {ms.completed_at && <span>Completed: {formatDate(ms.completed_at)}</span>}
                {ms.completion_notes && <span className="italic">{ms.completion_notes}</span>}
                {ms.review_status && (
                  <Badge variant={ms.review_status === "approved" ? "success" : ms.review_status === "changes_requested" ? "error" : "gold"}>
                    Review: {ms.review_status.replace(/_/g, " ")}
                  </Badge>
                )}
                {ms.review_feedback && <span className="italic text-[#5B4CF0]">Feedback: "{ms.review_feedback}"</span>}
              </div>
              {ms.deliverables && ms.deliverables.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {ms.deliverables.map((d, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-[#5B4CF0]/10 text-[#5B4CF0]/70 border border-[#5B4CF0]/10">
                      {d}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-1 shrink-0">
              {actions(ms.status, ms).map((act) => (
                act.isReview ? (
                  <Button
                    key={act.key}
                    size="sm"
                    variant="primary"
                    disabled={reviewActionLoading === ms.id}
                    onClick={() => handleRequestReview(ms)}
                    className="text-[10px] px-2 py-1"
                  >
                    {reviewActionLoading === ms.id ? "..." : act.label}
                  </Button>
                ) : (
                  <Button
                    key={act.key}
                    size="sm"
                    variant="secondary"
                    disabled={actionLoading === `${ms.id}_${act.key}`}
                    onClick={() => handleAction(ms.id, act.key)}
                    className="text-[10px] px-2 py-1"
                  >
                    {actionLoading === `${ms.id}_${act.key}` ? "..." : act.label}
                  </Button>
                )
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Timeline Tab ──────────────────────────────────────────────────

function TimelineTab({ projectId }: { projectId: string }) {
  const [logs, setLogs] = useState<WorkspaceActivityLogData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getProjectActivity(projectId);
        setLogs(res.data.data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [projectId]);

  if (loading) {
    return (
      <div className="portal-card rounded-2xl p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="portal-card rounded-2xl p-6 md:p-8">
      <h3 className="text-sm font-semibold text-[#667085] uppercase tracking-wider mb-6">Activity Timeline</h3>
      {logs.length === 0 ? (
        <p className="text-sm text-[#667085]">No activity recorded yet.</p>
      ) : (
        <div className="space-y-0">
          {logs.map((entry, idx) => (
            <div key={entry.id} className="flex gap-4 pb-6 last:pb-0 relative">
              {idx < logs.length - 1 && (
                <div className="absolute left-[7px] top-4 bottom-0 w-0.5 bg-gray-100" />
              )}
              <div className="w-[14px] h-[14px] rounded-full border-2 border-[#5B4CF0]/30 bg-[#5B4CF0]/10 shrink-0 mt-1" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-[#101828] capitalize">{entry.action.replace(/_/g, " ")}</p>
                  {entry.user?.profile?.full_name && (
                    <span className="text-xs text-[#667085]">by {entry.user.profile.full_name}</span>
                  )}
                </div>
                {entry.description && (
                  <p className="text-xs text-[#667085]/70 mt-0.5">{entry.description}</p>
                )}
                <p className="text-xs text-[#667085] mt-0.5">{formatDate(entry.created_at)}</p>
                {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                  <div className="text-[10px] text-[#667085]/40 mt-1 bg-gray-50 p-2 rounded-lg max-w-md space-y-0.5">
                    {Object.entries(entry.metadata).map(([key, val]) => (
                      <div key={key} className="flex gap-2">
                        <span className="capitalize shrink-0">{key.replace(/_/g, " ")}:</span>
                        <span className="truncate">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Internal Notes Tab ───────────────────────────────────────────

function NotesTab({ projectId, initialNotes, onRefresh }: {
  projectId: string;
  initialNotes: AdminNoteData[];
  onRefresh: () => void;
}) {
  const [notes, setNotes] = useState<AdminNoteData[]>(initialNotes);
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  async function handleCreate() {
    if (!content.trim()) return;
    setSaving(true);
    try {
      const res = await api.createProjectNote(projectId, content);
      setNotes((prev) => [res.data, ...prev]);
      setContent("");
    } catch (err) {
      console.error("Failed to create note:", err);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(noteId: string) {
    if (!editContent.trim()) return;
    setSaving(true);
    try {
      const res = await api.updateProjectNote(noteId, editContent);
      setNotes((prev) => prev.map((n) => (n.id === noteId ? res.data : n)));
      setEditingId(null);
      setEditContent("");
    } catch (err) {
      console.error("Failed to update note:", err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(noteId: string) {
    if (!confirm("Delete this note?")) return;
    try {
      await api.deleteProjectNote(noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  }

  return (
    <div className="portal-card rounded-2xl p-6 md:p-8">
      <h3 className="text-sm font-semibold text-[#667085] uppercase tracking-wider mb-4">Internal Notes</h3>

      {/* New Note */}
      <div className="mb-6 space-y-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write an internal note (Markdown supported)..."
          rows={4}
          className="w-full bg-gray-50 border border-[#ECEFF5] rounded-xl p-3 text-sm text-[#101828] placeholder:text-[#667085] focus:outline-none focus:border-[#5B4CF0]/50 resize-none"
        />
        <div className="flex justify-end">
          <Button size="sm" disabled={!content.trim() || saving} onClick={handleCreate}>
            {saving ? "Saving..." : "Add Note"}
          </Button>
        </div>
      </div>

      {/* Notes List */}
      {notes.length === 0 ? (
        <p className="text-sm text-[#667085]">No internal notes yet.</p>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div key={note.id} className="bg-gray-50 rounded-xl p-4">
              {editingId === note.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={4}
                    className="w-full bg-gray-50 border border-[#ECEFF5] rounded-xl p-3 text-sm text-[#101828] focus:outline-none focus:border-[#5B4CF0]/50 resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                    <Button size="sm" disabled={!editContent.trim() || saving} onClick={() => handleUpdate(note.id)}>
                      {saving ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="prose prose-sm prose-invert max-w-none whitespace-pre-wrap text-sm text-[#667085]">
                        {note.content}
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-[#667085]">
                        {note.user && <span>by {note.user.full_name}</span>}
                        <span>{formatDate(note.created_at)}</span>
                        {note.edit_history && note.edit_history.length > 0 && (
                          <span className="italic">(edited {note.edit_history.length} time{note.edit_history.length > 1 ? "s" : ""})</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setEditingId(note.id);
                          setEditContent(note.content);
                        }}
                        className="text-[10px] px-2 py-1 rounded bg-gray-50 text-[#667085] hover:text-white"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="text-[10px] px-2 py-1 rounded bg-gray-50 text-red-400 hover:bg-red-500/10"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Payments Tab ──────────────────────────────────────────────────

function PaymentsTab({ payments }: { payments: WorkspacePaymentData[] }) {
  if (payments.length === 0) {
    return (
      <div className="portal-card rounded-2xl p-6 md:p-8">
        <h3 className="text-sm font-semibold text-[#667085] uppercase tracking-wider mb-4">Payments</h3>
        <p className="text-sm text-[#667085]">No payments recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="portal-card rounded-2xl p-6 md:p-8">
      <h3 className="text-sm font-semibold text-[#667085] uppercase tracking-wider mb-4">Payments</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#ECEFF5]">
              <th className="text-left text-xs font-semibold text-[#667085] uppercase tracking-wider px-4 py-3">Reference</th>
              <th className="text-left text-xs font-semibold text-[#667085] uppercase tracking-wider px-4 py-3">Gateway</th>
              <th className="text-right text-xs font-semibold text-[#667085] uppercase tracking-wider px-4 py-3">Amount</th>
              <th className="text-left text-xs font-semibold text-[#667085] uppercase tracking-wider px-4 py-3">Type</th>
              <th className="text-left text-xs font-semibold text-[#667085] uppercase tracking-wider px-4 py-3">Status</th>
              <th className="text-left text-xs font-semibold text-[#667085] uppercase tracking-wider px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-[#ECEFF5] hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm text-[#667085] font-mono">{p.reference}</td>
                <td className="px-4 py-3 text-sm text-[#667085] capitalize">{p.gateway}</td>
                <td className="px-4 py-3 text-sm text-right text-[#101828] font-semibold">{formatCurrency(p.amount_ngn)}</td>
                <td className="px-4 py-3 text-sm text-[#667085] capitalize">{p.payment_type}</td>
                <td className="px-4 py-3">
                  <Badge variant={p.status === "completed" || p.status === "success" ? "success" : "gold"}>
                    {p.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-[#667085]">{formatDate(p.paid_at || p.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Invoice Tab ──────────────────────────────────────────────────

function InvoiceTab({ invoices, projectId }: { invoices: WorkspaceInvoiceData[]; projectId: string }) {
  if (invoices.length === 0) {
    return (
      <div className="portal-card rounded-2xl p-6 md:p-8">
        <h3 className="text-sm font-semibold text-[#667085] uppercase tracking-wider mb-4">Invoice</h3>
        <p className="text-sm text-[#667085]">No invoices generated yet.</p>
      </div>
    );
  }

  return (
    <div className="portal-card rounded-2xl p-6 md:p-8">
      <h3 className="text-sm font-semibold text-[#667085] uppercase tracking-wider mb-4">Invoice</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#ECEFF5]">
              <th className="text-left text-xs font-semibold text-[#667085] uppercase tracking-wider px-4 py-3">Invoice #</th>
              <th className="text-left text-xs font-semibold text-[#667085] uppercase tracking-wider px-4 py-3">Status</th>
              <th className="text-right text-xs font-semibold text-[#667085] uppercase tracking-wider px-4 py-3">Total</th>
              <th className="text-right text-xs font-semibold text-[#667085] uppercase tracking-wider px-4 py-3">Paid</th>
              <th className="text-right text-xs font-semibold text-[#667085] uppercase tracking-wider px-4 py-3">Balance</th>
              <th className="text-left text-xs font-semibold text-[#667085] uppercase tracking-wider px-4 py-3">Date</th>
              <th className="text-right text-xs font-semibold text-[#667085] uppercase tracking-wider px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b border-[#ECEFF5] hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm text-[#667085] font-mono">{inv.invoice_number}</td>
                <td className="px-4 py-3">
                  <Badge variant={inv.status === "paid" ? "success" : inv.status === "partially_paid" ? "gold" : "info"}>
                    {inv.status.replace(/_/g, " ")}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-right text-[#101828] font-semibold">{formatCurrency(inv.total_ngn)}</td>
                <td className="px-4 py-3 text-sm text-right text-green-400">{formatCurrency(inv.amount_paid_ngn)}</td>
                <td className="px-4 py-3 text-sm text-right text-red-400">{formatCurrency(inv.balance_ngn)}</td>
                <td className="px-4 py-3 text-sm text-[#667085]">{formatDate(inv.paid_at || inv.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => window.open(`/hire/project/${projectId}?invoice=${inv.id}`, "_blank")}
                    className="text-[10px]"
                  >
                    Preview
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Receipt Tab ──────────────────────────────────────────────────

function ReceiptTab({ receipts, projectId }: { receipts: WorkspaceReceiptData[]; projectId: string }) {
  if (receipts.length === 0) {
    return (
      <div className="portal-card rounded-2xl p-6 md:p-8">
        <h3 className="text-sm font-semibold text-[#667085] uppercase tracking-wider mb-4">Receipt</h3>
        <p className="text-sm text-[#667085]">No receipts generated yet.</p>
      </div>
    );
  }

  return (
    <div className="portal-card rounded-2xl p-6 md:p-8">
      <h3 className="text-sm font-semibold text-[#667085] uppercase tracking-wider mb-4">Receipt</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#ECEFF5]">
              <th className="text-left text-xs font-semibold text-[#667085] uppercase tracking-wider px-4 py-3">Receipt #</th>
              <th className="text-left text-xs font-semibold text-[#667085] uppercase tracking-wider px-4 py-3">Gateway</th>
              <th className="text-right text-xs font-semibold text-[#667085] uppercase tracking-wider px-4 py-3">Amount</th>
              <th className="text-left text-xs font-semibold text-[#667085] uppercase tracking-wider px-4 py-3">Currency</th>
              <th className="text-left text-xs font-semibold text-[#667085] uppercase tracking-wider px-4 py-3">Status</th>
              <th className="text-left text-xs font-semibold text-[#667085] uppercase tracking-wider px-4 py-3">Date</th>
              <th className="text-right text-xs font-semibold text-[#667085] uppercase tracking-wider px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {receipts.map((r) => (
              <tr key={r.id} className="border-b border-[#ECEFF5] hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm text-[#667085] font-mono">{r.receipt_number}</td>
                <td className="px-4 py-3 text-sm text-[#667085] capitalize">{r.payment_gateway}</td>
                <td className="px-4 py-3 text-sm text-right text-[#101828] font-semibold">{formatCurrency(r.amount_ngn)}</td>
                <td className="px-4 py-3 text-sm text-[#667085]">{r.currency}</td>
                <td className="px-4 py-3">
                  <Badge variant={r.status === "completed" ? "success" : "gold"}>{r.status}</Badge>
                </td>
                <td className="px-4 py-3 text-sm text-[#667085]">{formatDate(r.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => window.open(`/hire/project/${projectId}?receipt=${r.id}`, "_blank")}
                    className="text-[10px]"
                  >
                    Preview
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────

function SettingsTab({ project, onRefresh }: { project: AdminProjectDetailData; onRefresh: () => void }) {
  const [priority, setPriority] = useState(project.priority);
  const [notes, setNotes] = useState(project.notes || "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await api.updateAdminProject(project.id, { priority, notes });
      onRefresh();
    } catch (err) {
      console.error("Failed to update project:", err);
    } finally {
      setSaving(false);
    }
  }

  const statuses = [
    { value: "pending_review", label: "Pending Review" },
    { value: "requirements_reviewed", label: "Requirements Reviewed" },
    { value: "in_progress", label: "In Progress" },
    { value: "on_hold", label: "On Hold" },
    { value: "blocked", label: "Blocked" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  async function handleStatusChange(newStatus: string) {
    const reason = prompt(`Reason for changing status to "${newStatus}"? (optional)`);
    try {
      await api.changeProjectStatus(project.id, newStatus, reason || undefined);
      onRefresh();
    } catch (err) {
      console.error("Failed to change status:", err);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="portal-card rounded-2xl p-6 md:p-8 space-y-6">
        <h3 className="text-sm font-semibold text-[#667085] uppercase tracking-wider">Project Settings</h3>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-[#667085] block mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-gray-50 border border-[#ECEFF5] rounded-xl px-3 py-2 text-sm text-[#101828] focus:outline-none focus:border-[#5B4CF0]/50"
            >
              <option value="low" className="bg-surface">Low</option>
              <option value="normal" className="bg-surface">Normal</option>
              <option value="high" className="bg-surface">High</option>
              <option value="urgent" className="bg-surface">Urgent</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-[#667085] block mb-1">Admin Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full bg-gray-50 border border-[#ECEFF5] rounded-xl p-3 text-sm text-[#101828] placeholder:text-[#667085] focus:outline-none focus:border-[#5B4CF0]/50 resize-none"
              placeholder="Internal admin notes..."
            />
          </div>

          <Button disabled={saving} onClick={handleSave} className="w-full">
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>

      <div className="portal-card rounded-2xl p-6 md:p-8 space-y-6">
        <h3 className="text-sm font-semibold text-[#667085] uppercase tracking-wider">Project Status</h3>
        <p className="text-xs text-[#667085]">
          Current: <span className="text-white font-medium">{statusLabels[project.project_status] || project.project_status}</span>
        </p>
        <div className="grid grid-cols-2 gap-2">
          {statuses
            .filter((s) => s.value !== project.project_status)
            .map((s) => (
              <Button
                key={s.value}
                size="sm"
                variant="secondary"
                onClick={() => handleStatusChange(s.value)}
              >
                {s.label}
              </Button>
            ))}
        </div>
      </div>
    </div>
  );
}
