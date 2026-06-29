import { Skeleton } from "@/components/ui/Skeleton";

export default function HireLoading() {
  return (
    <>
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="text-center mb-16 space-y-4">
          <Skeleton className="h-4 w-20 mx-auto" />
          <Skeleton className="h-10 w-[32rem] max-w-full mx-auto" />
          <Skeleton className="h-5 w-[24rem] max-w-full mx-auto" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl p-6 md:p-8 space-y-4">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-10 w-32" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
