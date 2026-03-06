import { serverFetchPosts } from "@/lib/server-api";
import { PostListClient } from "./PostListClient";

interface PostListServerProps {
  page: number;
}

export async function PostListServer({ page }: PostListServerProps) {
  const initialData = await serverFetchPosts(page);

  return <PostListClient initialData={initialData} />;
}
