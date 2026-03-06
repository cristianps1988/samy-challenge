import { Suspense } from "react";
import { PostListServer } from "@/features/posts/PostListServer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface PostsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam) || 1;

  return (
    <div>
      <div className="mb-10 flex items-end justify-between pb-8 border-b-2 border-foreground">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-amber-600 uppercase mb-4">
            Editorial
          </p>
          <h1 className="font-display text-6xl font-bold tracking-tight text-foreground leading-none">
            Posts
          </h1>
          <p className="mt-3 text-muted-foreground text-sm">
            Browse, create, and manage posts
          </p>
        </div>
        <Link href="/posts/new">
          <Button className="rounded-full px-7 h-11 text-sm font-medium">
            New Post
          </Button>
        </Link>
      </div>
      <Suspense
        fallback={
          <div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-8 py-10 border-b border-border px-4 -mx-4">
                <Skeleton className="h-10 w-12 rounded shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3.5 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        }
      >
        <PostListServer page={page} />
      </Suspense>
    </div>
  );
}
