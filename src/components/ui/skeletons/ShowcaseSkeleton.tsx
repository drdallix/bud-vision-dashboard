
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

const ShowcaseSkeleton = () => {
  return (
    <div className="space-y-4">
      {/* Header card skeleton */}
      <Card className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
        </div>
      </Card>

      {/* Effects and Flavors skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-3 space-y-2">
          <Skeleton className="h-5 w-20" />
          <div className="flex flex-wrap gap-1">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-18 rounded-full" />
          </div>
        </Card>
        <Card className="p-3 space-y-2">
          <Skeleton className="h-5 w-20" />
          <div className="flex flex-wrap gap-1">
            <Skeleton className="h-6 w-14 rounded-full" />
            <Skeleton className="h-6 w-18 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </Card>
      </div>

      {/* Controls skeleton */}
      <div className="flex items-center justify-center gap-3 p-3 rounded-lg">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
};

export default ShowcaseSkeleton;
