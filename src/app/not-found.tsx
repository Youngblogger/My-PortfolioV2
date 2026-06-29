import Link from "next/link";
export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen px-6">
      <div className="text-center max-w-md">
        <h1 className="text-8xl font-bold text-gradient mb-4">404</h1>
        <h2 className="text-2xl font-bold text-white mb-2">Page Not Found</h2>
        <p className="text-muted text-sm mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link href="/" className="inline-block px-8 py-4 rounded-xl bg-gold-gradient text-background font-bold text-base hover:shadow-gold transition-all duration-300">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
