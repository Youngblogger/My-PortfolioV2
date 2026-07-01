"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import type { WorkspaceMilestoneData, TimelineEventData } from "@/lib/api";

interface MergedEvent {
  id: string;
  type: "milestone" | "activity";
  title: string;
  description: string;
  timestamp: string;
  status: "completed" | "in_progress" | "pending";
  icon: string;
  user: { full_name: string | null } | null;
  metadata?: Record<string, unknown>;
}

interface DynamicTimelineProps {
  milestones: WorkspaceMilestoneData[];
  activityEvents: TimelineEventData[];
}

const MILESTONE_ICONS: Record<string, string> = {
  project_kickoff: "🚀",
  requirements_gathering: "📋",
  design: "🎨",
  development: "💻",
  testing: "🧪",
  review: "👀",
  deployment: "☁️",
  handover: "📦",
  default: "📌",
};

function getMilestoneIcon(title: string): string {
  const lower = title.toLowerCase();
  for (const [key, icon] of Object.entries(MILESTONE_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return MILESTONE_ICONS.default;
}

function getMilestoneStatus(status: string): MergedEvent["status"] {
  if (status === "completed") return "completed";
  if (status === "in_progress") return "in_progress";
  return "pending";
}

export default function DynamicTimeline({ milestones, activityEvents }: DynamicTimelineProps) {
  const mergedEvents: MergedEvent[] = useMemo(() => {
    const events: MergedEvent[] = [
      ...milestones.map((m) => ({
        id: `milestone-${m.id}`,
        type: "milestone" as const,
        title: m.title,
        description: m.description || "",
        timestamp: m.completed_at || m.created_at,
        status: getMilestoneStatus(m.status),
        icon: getMilestoneIcon(m.title),
        user: null as { full_name: string | null } | null,
        metadata: m.deliverables ? { deliverables: m.deliverables } as unknown as Record<string, unknown> : undefined,
      })),
      ...activityEvents.map((e, i) => ({
        id: `activity-${e.timestamp}-${i}`,
        type: "activity" as const,
        title: e.title,
        description: e.description,
        timestamp: e.timestamp,
        status: "completed" as const,
        icon: e.icon,
        user: e.user,
      })),
    ];

    events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return events;
  }, [milestones, activityEvents]);

  if (mergedEvents.length === 0) {
    return (
      <div className="glass rounded-2xl p-6 md:p-8">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Project Timeline</h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-3 opacity-30">📅</div>
          <p className="text-sm text-muted">No timeline events recorded yet. Events will appear here as your project progresses.</p>
        </div>
      </div>
    );
  }

  const completedCount = mergedEvents.filter((e) => e.status === "completed" || e.type === "activity").length;
  const progressPct = Math.round((completedCount / mergedEvents.length) * 100);

  return (
    <div className="glass rounded-2xl p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Project Timeline</h3>
        <span className="text-sm font-bold text-white">{completedCount}/{mergedEvents.length} events</span>
      </div>

      {progressPct > 0 && (
        <div className="mb-6">
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-gold to-green-400"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progressPct, 100)}%` }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              role="progressbar"
              aria-valuenow={progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      )}

      <div className="relative pl-10 space-y-0" role="list" aria-label="Project timeline">
        {mergedEvents.map((event, idx) => (
          <div key={event.id} className="relative pb-8 last:pb-0" role="listitem">
            {idx < mergedEvents.length - 1 && (
              <div
                className={`absolute left-[15px] top-6 bottom-0 w-0.5 ${
                  event.status === "completed"
                    ? "bg-gradient-to-b from-green-500/40 to-transparent"
                    : "bg-white/10"
                }`}
                aria-hidden="true"
              />
            )}
            <div
              className={`absolute left-0 top-1 w-[30px] h-[30px] rounded-full border-2 flex items-center justify-center text-sm ${
                event.status === "completed"
                  ? "border-green-500 bg-green-500/20"
                  : event.status === "in_progress"
                    ? "border-gold bg-gold/20"
                    : "border-white/10 bg-white/5"
              }`}
              aria-hidden="true"
            >
              {event.status === "completed" ? (
                <span className="text-green-400 text-xs">&#10003;</span>
              ) : event.status === "in_progress" ? (
                <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
              ) : (
                <span className="text-xs opacity-30">{event.icon}</span>
              )}
            </div>
            <div className="ml-4">
              <div className="flex items-center gap-2 flex-wrap">
                <p className={`text-sm font-medium ${event.status === "completed" ? "text-white" : event.status === "in_progress" ? "text-gold" : "text-muted/50"}`}>
                  {event.title}
                </p>
                {event.user?.full_name && (
                  <span className="text-[10px] text-muted bg-white/5 px-1.5 py-0.5 rounded">{event.user.full_name}</span>
                )}
                {event.type === "milestone" && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${
                    event.status === "completed" ? "bg-green-500/10 text-green-400" :
                    event.status === "in_progress" ? "bg-gold/10 text-gold" :
                    "bg-white/5 text-muted"
                  }`}>
                    {event.status === "pending" ? "upcoming" : event.status}
                  </span>
                )}
              </div>
              {event.description && (
                <p className="text-xs text-muted/70 mt-0.5">{event.description}</p>
              )}
              <p className="text-[11px] text-muted/50 mt-1" title={formatDate(event.timestamp)}>
                {formatRelativeTime(event.timestamp)}
              </p>
              {event.metadata ? (
                (() => {
                  const deliverables = (event.metadata as Record<string, unknown>).deliverables;
                  if (Array.isArray(deliverables)) {
                    return (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {deliverables.map((d, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-gold/5 text-gold border border-gold/10">
                            {String(d)}
                          </span>
                        ))}
                      </div>
                    );
                  }
                  return null;
                })()
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
