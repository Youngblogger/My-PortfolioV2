export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 overflow-hidden">
      <div
        className="absolute inset-0 bg-gradient-radial from-gold/5 via-transparent to-transparent pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, rgba(212,175,55,0.06) 0%, transparent 60%, transparent 100%)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />

      <div className="relative z-10 w-full max-w-md mx-auto text-center mb-8">
        <h1 className="text-2xl font-bold">
          <span className="text-gradient">CODEMAFIA</span>
        </h1>
        <p className="text-muted/60 text-xs mt-1">Engineering Excellence. Inspiring Innovation.</p>
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto">
        {children}
      </div>
    </div>
  );
}
