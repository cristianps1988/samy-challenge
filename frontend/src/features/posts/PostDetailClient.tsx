"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDeletePost } from "./usePosts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import type { PostWithAuthor } from "@/types";

const DeleteDialog = dynamic(
  () => import("@/components/ui/dialog").then((mod) => {
    const {
      Dialog,
      DialogContent,
      DialogDescription,
      DialogFooter,
      DialogHeader,
      DialogTitle,
    } = mod;
    return function DeleteDialog({
      open,
      onOpenChange,
      onConfirm,
      title,
      disabled,
    }: {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      onConfirm: () => void;
      title: string;
      disabled: boolean;
    }) {
      return (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Post</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &ldquo;{title}&rdquo;? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={disabled}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={onConfirm} disabled={disabled}>
                {disabled ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };
  }),
  { ssr: false }
);

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface PostDetailClientProps {
  initialPost: PostWithAuthor | undefined;
}

export function PostDetailClient({ initialPost }: PostDetailClientProps) {
  const router = useRouter();
  const deletePostMutation = useDeletePost();
  const [post, setPost] = useState(initialPost);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const formattedDate = useMemo(
    () => ({
      createdAt: post ? formatDate(post.createdAt) : "",
      updatedAt: post ? formatDate(post.updatedAt) : "",
    }),
    [post]
  );

  if (!post) return null;

  const handleDelete = async () => {
    try {
      await deletePostMutation.mutateAsync(post.id);
      setIsDeleteDialogOpen(false);
      toast.success("Post deleted successfully");
      router.push("/posts");
    } catch {
      toast.error("Failed to delete post. Please try again.");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-10">
        <Link
          href="/posts"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to posts
        </Link>
        <div className="flex items-center gap-3">
          <Link href={`/posts/${post.id}/edit`}>
            <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
          </Link>
          <button
            onClick={() => setIsDeleteDialogOpen(true)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>

      <div className="mb-12 pb-12 border-b-2 border-foreground">
        <p className="text-xs font-semibold tracking-[0.2em] text-amber-600 uppercase mb-8">
          Article
        </p>
        <h1 className="font-display text-5xl font-bold tracking-tight text-foreground leading-tight mb-5">
          {post.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {formattedDate.createdAt}
          {post.updatedAt !== post.createdAt && (
            <span className="ml-2 text-muted-foreground/60">· edited {formattedDate.updatedAt}</span>
          )}
        </p>
      </div>

      <div className="mb-16">
        <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90">
          {post.content}
        </p>
      </div>

      <div className="pt-10 border-t border-border">
        <p className="text-xs font-semibold tracking-[0.2em] text-amber-600 uppercase mb-6">
          Author
        </p>
        <Link href={`/users/${post.author.externalId}`}>
          <div className="flex items-center gap-5 group">
            <Image
              src={post.author.avatar}
              alt={`${post.author.firstName} ${post.author.lastName}`}
              width={56}
              height={56}
              className="w-14 h-14 rounded-full object-cover shrink-0"
            />
            <div>
              <p className="font-semibold text-base group-hover:text-amber-700 transition-colors">
                {post.author.firstName} {post.author.lastName}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">{post.author.email}</p>
            </div>
          </div>
        </Link>
      </div>

      <DeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        title={post.title}
        disabled={deletePostMutation.isPending}
      />
    </div>
  );
}
