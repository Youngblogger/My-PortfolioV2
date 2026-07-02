export function LoadingSpinner({ size = "md", className = "", style }: { size?: "sm" | "md" | "lg"; className?: string; style?: React.CSSProperties }) {
  const sizes = { sm: "h-5 w-5", md: "h-8 w-8", lg: "h-12 w-12" };

  return (
    <svg className={`animate-spin ${sizes[size]} ${className}`} style={style} viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" className="mx-auto" style={{ color: "#5B4CF0" }} />
        <p className="text-sm" style={{ color: "#98A2B3" }}>Loading...</p>
      </div>
    </div>
  );
}
