"use client";

import { formatDate } from "@/lib/utils";

interface TimelineItem {
  icon: string;
  title: string;
  description: string;
  timestamp: string;
  user: { full_name: string | null } | null;
}

interface ProjectTimelineProps {
  events: TimelineItem[];
}

const TIMELINE_ICONS: Record<string, string> = {
  payment: "💳",
  rocket: "🚀",
  receipt: "📄",
  checklist: "📋",
  refresh: "🔄",
  check_circle: "✅",
  download: "📥",
  celebration: "🎉",
  delivery: "📦",
  account_balance: "💰",
  info: "📌",
};

export default function ProjectTimeline({ events }: ProjectTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="glass rounded-2xl p-6 md:p-8">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Project Timeline</h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-3 opacity-30">📅</div>
          <p className="text-sm text-muted">No timeline events recorded yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6 md:p-8">
      <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-6">Project Timeline</h3>
      <div className="relative pl-10 space-y-0">
        {events.map((event, idx) => (
          <div key={`${event.timestamp}-${idx}`} className="relative pb-8 last:pb-0">
            {idx < events.length - 1 && (
              <div className="absolute left-[15px] top-6 bottom-0 w-0.5 bg-gradient-to-b from-gold/40 to-transparent" />
            )}
            <div className="absolute left-0 top-1 w-[30px] h-[30px] rounded-full bg-gold/10 border-2 border-gold/30 flex items-center justify-center text-sm">
              {TIMELINE_ICONS[event.icon] || "📌"}
            </div>
            <div className="ml-4">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-white capitalize">
                  {event.title.replace(/_/g, " ")}
                </p>
                {event.user?.full_name && (
                  <span className="text-[10px] text-muted bg-white/5 px-1.5 py-0.5 rounded">
                    {event.user.full_name}
                  </span>
                )}
              </div>
              {event.description && (
                <p className="text-xs text-muted/70 mt-0.5">{event.description}</p>
              )}
              <p className="text-[11px] text-muted/50 mt-1">{formatDate(event.timestamp)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
