
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const StrainEditSkeleton = () => {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center gap-2 mb-2 sm:mb-4">
        <Skeleton className="h-4 w-4 sm:h-5 sm:w-5" />
        <Skeleton className="h-5 sm:h-6 w-48" />
      </div>

      {/* Form cards skeleton */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <Skeleton className="h-4 sm:h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <Skeleton className="h-4 sm:h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 sm:h-32 w-full" />
        </CardContent>
      </Card>

      {/* Action buttons skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t gap-3 sm:gap-0">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2 w-full sm:w-auto">
          <Skeleton className="h-9 w-20 sm:w-24" />
          <Skeleton className="h-9 w-28 sm:w-32" />
        </div>
      </div>
    </div>
  );
};

export default StrainEditSkeleton;
