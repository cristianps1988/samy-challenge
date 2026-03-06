"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSavedUsers, useImportUser, useDeleteSavedUser, useUserPosts } from "./useUsers";
import type { ExternalUser } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Check, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";

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
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{title}&quot;? This action cannot be undone.
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
import { Skeleton } from "@/components/ui/skeleton";

interface UserDetailProps {
  userId: number;
  initialUser: ExternalUser;
}

export function UserDetail({ userId, initialUser }: UserDetailProps) {
  const router = useRouter();
  const { data: savedUsers } = useSavedUsers();
  const importUser = useImportUser();
  const deleteSavedUser = useDeleteSavedUser();

  const savedUserIds = useMemo(
    () => new Set(savedUsers?.map((u) => u.externalId) ?? []),
    [savedUsers]
  );
  const isSaved = savedUserIds.has(userId);

  const user: ExternalUser = initialUser;
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const savedUser = savedUsers?.find((u) => u.externalId === userId);
  const { data: userPosts, isLoading: isLoadingPosts } = useUserPosts(
    savedUser?.id ?? 0
  );

  const handleImport = async () => {
    if (isSaved) return;
    try {
      await importUser.mutateAsync(userId);
      toast.success("User imported successfully");
    } catch {
      toast.error("Failed to import user. Please try again.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSavedUser.mutateAsync(savedUser?.id ?? 0);
      setIsDeleteDialogOpen(false);
      toast.success("User deleted successfully");
    } catch {
      toast.error("Failed to delete user. Please try again.");
    }
  };

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to users
      </button>

      <div className="mb-16 pb-12 border-b-2 border-foreground">
        <div className="flex items-start justify-between gap-4 mb-10">
          <p className="text-xs font-semibold tracking-[0.2em] text-amber-600 uppercase">
            Profile
          </p>
          {isSaved ? (
            <button
              onClick={() => setIsDeleteDialogOpen(true)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete user
            </button>
          ) : (
            <Button
              onClick={handleImport}
              disabled={importUser.isPending}
              className="rounded-full px-7 h-11 text-sm font-medium gap-2"
            >
              {importUser.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Import to Database
            </Button>
          )}
        </div>

        <div className="flex items-center gap-6">
          <Image
            src={user.avatar}
            alt={`${user.firstName} ${user.lastName}`}
            width={112}
            height={112}
            className="w-28 h-28 rounded-full object-cover shrink-0"
          />
          <div>
            <h1 className="font-display text-5xl font-bold tracking-tight text-foreground leading-tight">
              {user.firstName} {user.lastName}
            </h1>
            <p className="mt-2 text-base text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-12 mt-12 pt-8 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">User ID</p>
            <p className="font-medium tabular-nums">#{user.id}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Status</p>
            {isSaved ? (
              <span className="flex items-center gap-1.5 text-sm font-medium text-amber-700">
                <Check className="h-3.5 w-3.5" />
                Saved to DB
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">Not imported</span>
            )}
          </div>
        </div>
      </div>

      {isSaved && (
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-amber-600 uppercase mb-3">
            Writing
          </p>
          <h2 className="font-display text-2xl font-bold tracking-tight mb-8">
            Posts by {user.firstName}
          </h2>

          {isLoadingPosts ? (
            <div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-6 py-10 border-b border-border">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3.5 w-full" />
                    <Skeleton className="h-3.5 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : userPosts && userPosts.length > 0 ? (
            <div>
              {userPosts.map((post) => (
                <Link key={post.id} href={`/posts/${post.id}`} className="group block">
                  <div className="relative py-10 border-b border-border transition-colors duration-200 group-hover:bg-amber-50/50 px-4 -mx-4">
                    <h3 className="font-display text-[1.15rem] font-semibold leading-snug text-foreground group-hover:text-amber-700 transition-colors duration-200 mb-3">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {post.content}
                    </p>
                    <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-amber-500 scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-center" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center border-t border-border">
              <p className="text-muted-foreground text-sm">No posts yet</p>
            </div>
          )}
        </div>
      )}

      <DeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        title={`${user.firstName} ${user.lastName}`}
        disabled={deleteSavedUser.isPending}
      />
    </div>
  );
}
