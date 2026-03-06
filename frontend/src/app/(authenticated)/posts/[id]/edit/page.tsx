import { PostForm } from "@/features/posts/PostForm";
import { serverFetchPost } from "@/lib/server-api";
import { notFound } from "next/navigation";

interface EditPostPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;
  const postId = Number(id);
  const post = await serverFetchPost(postId);

  if (!post) notFound();

  return (
    <PostForm
      mode="edit"
      postId={postId}
      initialData={{ title: post.title, content: post.content, authorId: post.authorId }}
    />
  );
}
