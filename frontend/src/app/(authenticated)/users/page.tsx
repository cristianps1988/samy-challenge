import { Suspense } from "react";
import { UserListServer } from "@/features/users/UserListServer";
import { Skeleton } from "@/components/ui/skeleton";

interface UsersPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam) || 1;

  return (
    <div>
      <div className="mb-10 pb-8 border-b-2 border-foreground">
        <p className="text-xs font-semibold tracking-[0.2em] text-amber-600 uppercase mb-4">
          Directory
        </p>
        <h1 className="font-display text-6xl font-bold tracking-tight text-foreground leading-none">
          Users
        </h1>
        <p className="mt-3 text-muted-foreground text-sm">
          Browse and import users from ReqRes API
        </p>
      </div>
      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-10 w-72" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="border border-border rounded-lg p-5 flex items-center gap-4">
                  <Skeleton className="h-13 w-13 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        }
      >
        <UserListServer page={page} />
      </Suspense>
    </div>
  );
}
