import { serverFetchSavedUsers } from "@/lib/server-api";
import { UserListClient } from "./UserListClient";

interface UserListServerProps {
  page: number;
}

export async function UserListServer({ page }: UserListServerProps) {
  const savedUsers = await serverFetchSavedUsers();

  return <UserListClient initialSavedUsers={savedUsers} />;
}
