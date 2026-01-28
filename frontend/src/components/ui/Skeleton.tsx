export interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`shimmer rounded ${className}`} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="flex gap-4 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
      {/* Image skeleton */}
      <Skeleton className="w-24 h-24 rounded-lg" />

      <div className="flex-1 space-y-3">
        {/* Title skeleton */}
        <Skeleton className="h-6 w-3/4" />

        {/* Brand skeleton */}
        <Skeleton className="h-4 w-1/2" />

        {/* Button skeleton */}
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>
    </div>
  );
}

export function StoreCardSkeleton() {
  return (
    <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
      <div className="flex justify-between items-center mb-4">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
    </div>
  );
}
