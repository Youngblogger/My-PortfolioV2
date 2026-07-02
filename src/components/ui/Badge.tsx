interface BadgeProps {
  children: React.ReactNode;
  variant?: "gold" | "success" | "error" | "info";
  className?: string;
}

const variants = {
  gold: "bg-[#5B4CF0]/10 text-[#5B4CF0] border-[#5B4CF0]/20",
  success: "bg-green-500/10 text-green-400 border-green-500/20",
  error: "bg-red-500/10 text-red-400 border-red-500/20",
  info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

export function Badge({ children, variant = "gold", className = "" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
