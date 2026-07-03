"use client";
export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-6">
      <div className="portal-card p-12 text-center max-w-md">
        <div className="text-5xl mb-4" aria-hidden="true">⚠️</div>
        <h2 className="text-xl font-bold text-[#101828] mb-2">Admin Error</h2>
        <p className="text-[#667085] text-sm mb-6">Something went wrong in the admin panel. Please try again.</p>
        <button onClick={reset} className="px-6 py-3 rounded-xl portal-primary-bg text-white font-bold text-sm hover:opacity-90 transition-all duration-300">
          Try Again
        </button>
      </div>
    </div>
  );
}
