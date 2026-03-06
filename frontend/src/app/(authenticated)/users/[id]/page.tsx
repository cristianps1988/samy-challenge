import type { Metadata } from "next";
import { serverFetchReqResUser } from "@/lib/server-api";
import { UserDetail } from "@/features/users/UserDetail";
import { notFound } from "next/navigation";

interface UserPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: UserPageProps): Promise<Metadata> {
  const { id } = await params;
  const userId = parseInt(id, 10);

  try {
    const user = await serverFetchReqResUser(userId);

    return {
      title: `${user.firstName} ${user.lastName} | User & Posts Portal`,
      description: `View profile and posts by ${user.firstName} ${user.lastName}. Email: ${user.email}`,
    };
  } catch {
    return {
      title: "User Not Found | User & Posts Portal",
      description: "The requested user could not be found.",
    };
  }
}

export default async function UserPage({ params }: UserPageProps) {
  const { id } = await params;
  const userId = parseInt(id, 10);

  if (isNaN(userId)) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Invalid user ID</p>
      </div>
    );
  }

  let user;
  try {
    user = await serverFetchReqResUser(userId);
  } catch {
    notFound();
  }

  return <UserDetail userId={userId} initialUser={user!} />;
}
