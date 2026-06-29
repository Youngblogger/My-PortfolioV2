import { cn } from "@/lib/utils";

interface ErrorMessageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  fullPage?: boolean;
}

export function ErrorMessage({
  title = "Something went wrong",
  message,
  onRetry,
  fullPage,
}: ErrorMessageProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center p-8",
      "bg-red-500/10 border border-red-500/20 rounded-2xl",
      fullPage && "fixed inset-0 z-50"
    )}>
      <div className="max-w-md">
        <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <h3 className="text-lg font-semibold text-red-400 mb-2">{title}</h3>
        {message && (
          <p className="text-red-400/70 text-sm mb-6">{message}</p>
        )}
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition-all duration-300 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
