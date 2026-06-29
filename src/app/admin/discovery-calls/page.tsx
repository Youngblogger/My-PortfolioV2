"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api, type DiscoveryCallAdminData } from "@/lib/api";
import { cn, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

const statusFilters = ["all", "pending", "approved", "completed", "cancelled"] as const;

const statusVariant: Record<string, "gold" | "success" | "error" | "info"> = {
  pending: "gold",
  approved: "info",
  completed: "success",
  cancelled: "error",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

export default function AdminDiscoveryCallsPage() {
  const [calls, setCalls] = useState<DiscoveryCallAdminData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [meetingLinks, setMeetingLinks] = useState<Record<string, string>>({});
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getAdminDiscoveryCalls();
        if (!mounted) return;
        setCalls(res.data || []);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load discovery calls");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  async function handleAction(id: string, status: string) {
    setUpdatingId(id);
    try {
      const payload: { status: string; meeting_link?: string; admin_notes?: string } = { status };
      const link = meetingLinks[id]?.trim();
      const notes = adminNotes[id]?.trim();
      if (link) payload.meeting_link = link;
      if (notes) payload.admin_notes = notes;
      await api.updateDiscoveryCall(id, payload);
      setCalls((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status, meeting_link: link || c.meeting_link } : c))
      );
    } catch (err) {
      console.error("Failed to update discovery call:", err);
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleSaveMeetingLink(id: string) {
    const link = meetingLinks[id]?.trim();
    if (!link) return;
    setUpdatingId(id);
    try {
      await api.updateDiscoveryCall(id, { status: "approved", meeting_link: link });
      setCalls((prev) =>
        prev.map((c) => (c.id === id ? { ...c, meeting_link: link, status: "approved" } : c))
      );
    } catch (err) {
      console.error("Failed to save meeting link:", err);
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleSaveNotes(id: string) {
    const notes = adminNotes[id]?.trim();
    setUpdatingId(id);
    try {
      await api.updateDiscoveryCall(id, { status: "approved", admin_notes: notes });
    } catch (err) {
      console.error("Failed to save notes:", err);
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered = activeFilter === "all"
    ? calls
    : calls.filter((c) => c.status === activeFilter);

  return (
    <div>
      <div className="mb-8">
        <span className="section-label">DISCOVERY CALLS</span>
        <h1 className="text-2xl md:text-3xl font-bold text-white mt-1">
          Discovery Call Management
        </h1>
        <p className="text-muted text-sm mt-1">
          Review, approve, and manage all discovery call requests.
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-white/10 pb-4">
        {statusFilters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={cn(
              "text-sm font-medium px-3 py-1.5 rounded-lg transition-all",
              activeFilter === filter
                ? "text-gold bg-gold/10"
                : "text-muted hover:text-white"
            )}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
            {filter !== "all" && (
              <span className="ml-1.5 text-xs opacity-60">
                ({calls.filter((c) => c.status === filter).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorMessage
          title="Failed to Load Discovery Calls"
          message={error}
          onRetry={() => window.location.reload()}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="📞"
          title="No discovery calls found"
          description={
            activeFilter === "all"
              ? "Discovery call requests will appear here once clients submit them."
              : `No calls with status "${activeFilter}". Try a different filter.`
          }
        />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {filtered.map((call) => (
            <motion.div
              key={call.id}
              variants={rowVariants}
              className="glass rounded-2xl p-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-white font-semibold">{call.client}</h3>
                    <span className="text-xs text-muted">{call.email}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted">
                    <span>
                      {formatDate(call.preferred_date)} at {call.preferred_time}
                    </span>
                    <span className="capitalize">{call.meeting_type.replace("_", " ")}</span>
                    {call.meeting_link && (
                      <a
                        href={call.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gold hover:underline"
                      >
                        Meeting Link
                      </a>
                    )}
                  </div>
                  {call.project_summary && (
                    <p className="text-sm text-white/70 line-clamp-2">{call.project_summary}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-muted">
                    <span>Created: {formatDate(call.created_at)}</span>
                    <Badge variant={statusVariant[call.status] || "info"}>
                      {call.status.charAt(0).toUpperCase() + call.status.slice(1)}
                    </Badge>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {call.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction(call.id, "approved")}
                        loading={updatingId === call.id}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction(call.id, "cancelled")}
                        loading={updatingId === call.id}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                  {call.status === "approved" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction(call.id, "completed")}
                        loading={updatingId === call.id}
                      >
                        Complete
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction(call.id, "cancelled")}
                        loading={updatingId === call.id}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                  {(call.status === "completed" || call.status === "cancelled") && (
                    <span className="text-xs text-muted italic">No further actions</span>
                  )}
                </div>
              </div>

              {/* Meeting Link Input */}
              {call.status !== "cancelled" && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <Input
                        placeholder="Add meeting link..."
                        value={meetingLinks[call.id] ?? call.meeting_link ?? ""}
                        onChange={(e) =>
                          setMeetingLinks((p) => ({ ...p, [call.id]: e.target.value }))
                        }
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleSaveMeetingLink(call.id)}
                      loading={updatingId === call.id}
                      disabled={!meetingLinks[call.id]?.trim()}
                    >
                      Save Link
                    </Button>
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              <div className="mt-4">
                <button
                  onClick={() =>
                    setExpandedNotes((prev) => {
                      const next = new Set(prev);
                      if (next.has(call.id)) next.delete(call.id);
                      else next.add(call.id);
                      return next;
                    })
                  }
                  className="flex items-center gap-2 text-sm text-muted hover:text-white transition-colors"
                >
                  <svg
                    className={cn("w-4 h-4 transition-transform", expandedNotes.has(call.id) && "rotate-90")}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Admin Notes
                </button>
                {expandedNotes.has(call.id) && (
                  <div className="mt-3 flex items-end gap-3">
                    <div className="flex-1">
                      <textarea
                        placeholder="Add internal notes..."
                        value={adminNotes[call.id] ?? ""}
                        onChange={(e) =>
                          setAdminNotes((p) => ({ ...p, [call.id]: e.target.value }))
                        }
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted/50 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all duration-300 resize-none text-sm"
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleSaveNotes(call.id)}
                      loading={updatingId === call.id}
                    >
                      Save Notes
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
