"use client";

import { useState } from "react";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import type { WorkspaceActivityLogData } from "@/lib/api";

interface ActivityFeedProps {
  logs: WorkspaceActivityLogData[];
}

const ACTIVITY_ICONS: Record<string, string> = {
  payment_verified: "💳",
  balance_payment_verified: "💳",
  project_created: "🚀",
  project_kickoff: "🚀",
  invoice_generated: "📄",
  invoice_updated: "📄",
  milestone_completed: "✅",
  milestone_reviewed: "👀",
  file_uploaded: "📎",
  file_downloaded: "📥",
  message_sent: "💬",
  team_assigned: "👥",
  status_changed: "🔄",
  project_completed: "🎉",
  project_delivered: "📦",
  review_submitted: "⭐",
  revision_requested: "🔄",
  requirements_approved: "📋",
  discovery_call_completed: "📞",
  default: "📌",
};

function getActivityIcon(action: string): string {
  return ACTIVITY_ICONS[action] || ACTIVITY_ICONS.default;
}

export default function ActivityFeed({ logs }: ActivityFeedProps) {
  const [showAll, setShowAll] = useState(false);
  const displayLogs = showAll ? logs : logs.slice(0, 20);

  if (logs.length === 0) {
    return (
      <div className="glass rounded-2xl p-6 md:p-8">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Activity Log</h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-3 opacity-30">📋</div>
          <p className="text-sm text-muted">No activity recorded yet. Events will appear here as your project progresses.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Activity Log</h3>
        <span className="text-xs text-muted">{logs.length} events</span>
      </div>

      <div className="space-y-0" role="list" aria-label="Project activity feed">
        {displayLogs.map((entry, idx) => (
          <div key={entry.id} className="flex gap-4 pb-5 last:pb-0 relative" role="listitem">
            {idx < displayLogs.length - 1 && (
              <div className="absolute left-[11px] top-5 bottom-0 w-0.5 bg-white/10" aria-hidden="true" />
            )}
            <div
              className="w-[22px] h-[22px] rounded-full border-2 border-gold/30 bg-gold/10 flex items-center justify-center shrink-0 mt-0.5 text-xs"
              aria-hidden="true"
            >
              {getActivityIcon(entry.action)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm text-white capitalize font-medium">{entry.action.replace(/_/g, " ")}</p>
                {entry.user?.profile?.full_name && (
                  <span className="text-xs text-muted bg-white/5 px-1.5 py-0.5 rounded">{entry.user.profile.full_name}</span>
                )}
              </div>
              {entry.description && (
                <p className="text-xs text-muted/70 mt-0.5">{entry.description}</p>
              )}
              <p className="text-[11px] text-muted/50 mt-1" title={formatDate(entry.created_at)}>
                {formatRelativeTime(entry.created_at)}
              </p>
              {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                <div className="text-[10px] text-muted/40 mt-1 bg-white/5 p-2 rounded-lg max-w-md space-y-0.5">
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

      {logs.length > 20 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 text-xs text-gold hover:underline focus:outline-none focus:ring-2 focus:ring-gold/50 rounded px-2 py-1"
          aria-expanded={showAll}
        >
          {showAll ? "Show less" : `Show all ${logs.length} events`}
        </button>
      )}
    </div>
  );
}
