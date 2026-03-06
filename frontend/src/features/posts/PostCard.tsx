import { PostWithAuthor } from "@/types";
import Link from "next/link";
import Image from "next/image";

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

interface PostCardProps {
  post: PostWithAuthor;
  index: number;
}

export function PostCard({ post, index }: PostCardProps) {
  return (
    <Link href={`/posts/${post.id}`} className="group block">
      <div className="relative flex items-start gap-8 py-10 border-b border-border transition-colors duration-200 group-hover:bg-amber-50/50 px-4 -mx-4">
        <span className="font-display text-5xl font-bold text-foreground/[0.06] select-none shrink-0 leading-none w-12 text-right pt-1">
          {String(index + 1).padStart(2, "0")}
        </span>

        <div className="flex-1 min-w-0">
          <h3 className="font-display text-[1.2rem] font-semibold leading-snug text-foreground group-hover:text-amber-700 transition-colors duration-200 mb-3">
            {post.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {post.content}
          </p>
        </div>

        <div className="shrink-0 flex flex-col items-end gap-1.5 pt-0.5 min-w-[140px]">
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground/70">
              {post.author.firstName} {post.author.lastName}
            </span>
            <Image
              src={post.author.avatar}
              alt={post.author.firstName}
              width={24}
              height={24}
              className="w-6 h-6 rounded-full object-cover"
            />
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">
            {formatRelativeDate(post.createdAt)}
          </span>
        </div>

        <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-amber-500 scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-center" />
      </div>
    </Link>
  );
}
