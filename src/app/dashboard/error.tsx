"use client";
export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-6">
      <div className="glass rounded-2xl p-12 text-center max-w-md">
        <div className="text-5xl mb-4" aria-hidden="true">⚠️</div>
        <h2 className="text-xl font-bold text-white mb-2">Dashboard Error</h2>
        <p className="text-muted text-sm mb-6">Something went wrong in your dashboard. Please try again.</p>
        <button onClick={reset} className="px-6 py-3 rounded-xl bg-gold-gradient text-background font-bold text-sm hover:shadow-gold transition-all duration-300">
          Try Again
        </button>
      </div>
    </div>
  );
}
