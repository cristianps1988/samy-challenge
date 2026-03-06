"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePosts } from "./usePosts";
import { PostCard } from "./PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import Link from "next/link";
import type { PaginatedResponse, PostWithAuthor } from "@/types";

interface PostListProps {
  initialPage?: number;
}

export function PostList({ initialPage = 1 }: PostListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [page, setPage] = useState(initialPage);
  const [serverData, setServerData] = useState<{ data: PostWithAuthor[]; meta: PaginatedResponse<PostWithAuthor>["meta"] } | null>(null);
  const limit = 10;

  const { data, isLoading, error } = usePosts(page, limit, { enabled: !serverData });

  const displayData = serverData || data;
  const totalPages = displayData?.meta.totalPages ?? 0;

  const updatePage = useCallback((newPage: number) => {
    setPage(newPage);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`?${params.toString()}`);
  }, [router, searchParams]);

  const handlePrevious = useCallback(() => {
    if (page > 1) {
      updatePage(page - 1);
    }
  }, [page, updatePage]);

  const handleNext = useCallback(() => {
    if (page < totalPages) {
      updatePage(page + 1);
    }
  }, [page, totalPages, updatePage]);

  if (isLoading) {
    return (
      <div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-start gap-8 py-10 border-b border-border px-4 -mx-4">
            <Skeleton className="h-10 w-12 rounded shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-1/2" />
            </div>
            <div className="shrink-0 flex flex-col items-end gap-2 min-w-35">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Failed to load posts</p>
      </div>
    );
  }

  if (!displayData || displayData.data.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No posts yet</p>
        <Link href="/posts/new">
          <Button variant="outline" className="mt-4">
            Create your first post
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {displayData.data.map((post, i) => (
        <PostCard key={post.id} post={post} index={i} />
      ))}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={page === 1}
            size="icon"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={handleNext}
            disabled={page === totalPages}
            size="icon"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
