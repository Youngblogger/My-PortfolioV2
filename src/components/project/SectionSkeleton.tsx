"use client";

interface SectionSkeletonProps {
  lines?: number;
  hasProgress?: boolean;
}

export default function SectionSkeleton({ lines = 3, hasProgress = false }: SectionSkeletonProps) {
  return (
    <div className="glass rounded-2xl p-6 md:p-8 animate-pulse" role="status" aria-label="Loading section">
      <div className="h-4 w-32 bg-white/10 rounded mb-6" />
      {hasProgress && (
        <div className="h-2.5 bg-white/10 rounded-full mb-6 w-full" />
      )}
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-white/10 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-white/10 rounded w-3/4" />
            <div className="h-2.5 bg-white/10 rounded w-1/2" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}
