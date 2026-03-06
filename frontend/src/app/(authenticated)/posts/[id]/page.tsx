import type { Metadata } from "next";
import { serverFetchPost } from "@/lib/server-api";
import { PostDetailServer } from "@/features/posts/PostDetailServer";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { notFound } from "next/navigation";

interface PostPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { id } = await params;
  const postId = Number(id);

  try {
    const post = await serverFetchPost(postId);

    if (!post) {
      return {
        title: "Post | User & Posts Portal",
        description: "",
      };
    }

    return {
      title: `${post.title} | User & Posts Portal`,
      description: post.content.slice(0, 160),
    };
  } catch {
    return {
      title: "Post Not Found | User & Posts Portal",
      description: "The requested post could not be found.",
    };
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;
  const postId = Number(id);

  try {
    const post = await serverFetchPost(postId);
    if (!post) return null;
  } catch {
    notFound();
  }

  return (
    <Suspense
      fallback={
        <div>
          <Skeleton className="h-4 w-24 mb-10" />
          <Skeleton className="h-3 w-16 mb-8" />
          <Skeleton className="h-14 w-3/4 mb-4" />
          <Skeleton className="h-4 w-32 mb-12" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      }
    >
      <PostDetailServer postId={postId} />
    </Suspense>
  );
}
