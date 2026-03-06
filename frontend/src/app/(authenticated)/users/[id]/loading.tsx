import { Skeleton } from "@/components/ui/skeleton";

export default function UserLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-40" />
      <div className="p-8 border rounded-lg">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-shrink-0">
            <Skeleton className="w-48 h-48 rounded-full" />
          </div>
          <div className="flex-1 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-5 w-48" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-16 mt-1" />
              </div>
              <div>
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-20 mt-1" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 border rounded-lg space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
