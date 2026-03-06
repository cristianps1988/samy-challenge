import { serverFetchPost } from "@/lib/server-api";
import { PostDetailClient } from "./PostDetailClient";

interface PostDetailServerProps {
  postId: number;
}

export async function PostDetailServer({ postId }: PostDetailServerProps) {
  const post = await serverFetchPost(postId);

  return <PostDetailClient initialPost={post ?? undefined} />;
}
