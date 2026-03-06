"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreatePost, useUpdatePost, usePost } from "./usePosts";
import { useSavedUsers } from "../users/useUsers";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Loader2 } from "lucide-react";
import { User } from "@/types";
import { toast } from "sonner";
import Link from "next/link";

interface PostFormData {
  title: string;
  content: string;
  authorId: number;
}

interface PostFormProps {
  initialData?: Partial<PostFormData>;
  mode: "create" | "edit";
  postId?: number;
}

export function PostForm({ initialData, mode, postId }: PostFormProps) {
  const router = useRouter();
  const { data: users, isLoading: isLoadingUsers } = useSavedUsers();
  const { data: existingPost, isLoading: isLoadingPost } = usePost(mode === "edit" && postId ? postId : 0);

  const createPostMutation = useCreatePost();
  const updatePostMutation = useUpdatePost();

  const [formData, setFormData] = useState<PostFormData>(() => {
    if (mode === "edit" && existingPost) {
      return {
        title: existingPost.title,
        content: existingPost.content,
        authorId: existingPost.authorId ?? 0,
      };
    }
    return {
      title: initialData?.title ?? "",
      content: initialData?.content ?? "",
      authorId: initialData?.authorId ?? 0,
    };
  });

  const [errors, setErrors] = useState<Partial<Record<keyof PostFormData, string>>>({});

  const isSubmitting = createPostMutation.isPending || updatePostMutation.isPending;
  const isLoadingData = isLoadingUsers || (mode === "edit" && isLoadingPost && !initialData);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof PostFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
    } else if (formData.content.length < 10) {
      newErrors.content = "Content must be at least 10 characters";
    }

    if (formData.authorId === 0) {
      newErrors.authorId = "Author is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      if (mode === "create") {
        await createPostMutation.mutateAsync(formData);
        toast.success("Post created successfully");
        router.push("/posts");
      } else if (mode === "edit" && postId) {
        await updatePostMutation.mutateAsync({
          id: postId,
          data: {
            title: formData.title,
            content: formData.content,
          },
        });
        toast.success("Post updated successfully");
        router.push(`/posts/${postId}`);
      }
    } catch {
      toast.error("Failed to save post. Please try again.");
    }
  };

  const handleChange = (field: keyof PostFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (isLoadingData) {
    return (
      <div>
        <Skeleton className="h-4 w-24 mb-10" />
        <Skeleton className="h-3 w-16 mb-6" />
        <Skeleton className="h-10 w-full mb-8" />
        <Skeleton className="h-3 w-16 mb-6" />
        <Skeleton className="h-40 w-full mb-8" />
        <Skeleton className="h-3 w-16 mb-6" />
        <Skeleton className="h-10 w-full mb-10" />
        <Skeleton className="h-10 w-32" />
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {mode === "create" ? "Back to posts" : "Back to post"}
      </button>

      <div className="mb-10 pb-10 border-b-2 border-foreground">
        <p className="text-xs font-semibold tracking-[0.2em] text-amber-600 uppercase mb-3">
          {mode === "create" ? "New article" : "Edit article"}
        </p>
        <h1 className="font-display text-5xl font-bold tracking-tight text-foreground leading-tight">
          {mode === "create" ? "Create Post" : "Edit Post"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-10">
        <div>
          <label htmlFor="title" className="block text-xs font-semibold tracking-[0.15em] text-muted-foreground uppercase mb-3">
            Title
          </label>
          <input
            id="title"
            type="text"
            placeholder="Enter post title..."
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            disabled={isSubmitting}
            className="w-full border-0 border-b border-border bg-transparent pb-3 text-xl font-medium placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground transition-colors"
          />
          {errors.title && <p className="text-sm text-destructive mt-2">{errors.title}</p>}
        </div>

        <div>
          <label htmlFor="content" className="block text-xs font-semibold tracking-[0.15em] text-muted-foreground uppercase mb-3">
            Content
          </label>
          <textarea
            id="content"
            placeholder="Write your post content..."
            value={formData.content}
            onChange={(e) => handleChange("content", e.target.value)}
            disabled={isSubmitting}
            rows={10}
            className="w-full border-0 border-b border-border bg-transparent pb-3 text-base leading-relaxed placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground transition-colors resize-none"
          />
          {errors.content && <p className="text-sm text-destructive mt-2">{errors.content}</p>}
        </div>

        {mode === "create" && (
          <div>
            <label htmlFor="author" className="block text-xs font-semibold tracking-[0.15em] text-muted-foreground uppercase mb-3">
              Author
            </label>
            <select
              id="author"
              value={formData.authorId}
              onChange={(e) => setFormData((prev) => ({ ...prev, authorId: parseInt(e.target.value, 10) }))}
              disabled={isSubmitting}
              className="w-full border-0 border-b border-border bg-transparent pb-3 text-base focus:outline-none focus:border-foreground transition-colors"
            >
              <option value={0}>Select an author...</option>
              {users?.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} ({user.email})
                </option>
              ))}
            </select>
            {errors.authorId && <p className="text-sm text-destructive mt-2">{errors.authorId}</p>}
            {users && users.length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                No authors available.{" "}
                <Link href="/users" className="text-amber-600 hover:underline">
                  Import users first
                </Link>
              </p>
            )}
          </div>
        )}

        <div className="flex items-center gap-4 pt-2">
          <Button
            type="submit"
            disabled={isSubmitting || (mode === "create" && (!users || users.length === 0))}
            className="rounded-full px-8 h-11 text-sm font-medium gap-2"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? "Saving..." : mode === "create" ? "Publish Post" : "Save Changes"}
          </Button>
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
