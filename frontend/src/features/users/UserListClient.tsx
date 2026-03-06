"use client";

import { useState, useMemo } from "react";
import { useReqResUsers } from "./useUsers";
import { useSavedUsers } from "./useUsers";
import { UserCard } from "./UserCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import type { ExternalUser } from "@/types";

interface UserListClientProps {
  initialSavedUsers: Array<{ id: number; externalId: number }>;
}

export function UserListClient({ initialSavedUsers }: UserListClientProps) {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: reqResData, isLoading: isLoadingReqRes } = useReqResUsers(page);
  const { data: savedUsers } = useSavedUsers();

  const savedUserIds = useMemo(() => {
    const source = savedUsers ?? initialSavedUsers;
    return new Set(source.map((u) => u.externalId));
  }, [savedUsers, initialSavedUsers]);

  const filteredUsers = useMemo(() => {
    if (!reqResData) return [];
    if (!searchQuery.trim()) return reqResData.users;

    const query = searchQuery.toLowerCase();
    return reqResData.users.filter(
      (user) =>
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
  }, [reqResData, searchQuery]);

  const totalPages = reqResData?.totalPages ?? 0;

  const handlePrevious = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  if (isLoadingReqRes) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-72" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="border border-border rounded-lg p-5 flex items-center gap-4">
              <Skeleton className="h-13 w-13 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!reqResData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load users</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <InputGroup className="w-full sm:w-80 h-10">
          <InputGroupInput
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <InputGroupAddon>
            <Search className="h-4 w-4" />
          </InputGroupAddon>
        </InputGroup>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-center py-16">
          <Search className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">
            No users found matching &ldquo;{searchQuery}&rdquo;
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user: ExternalUser) => (
            <UserCard
              key={user.id}
              user={user}
              isSaved={savedUserIds.has(user.id)}
            />
          ))}
        </div>
      )}

      {!searchQuery && totalPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={page === 1}
            size="icon"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={handleNext}
            disabled={page === totalPages}
            size="icon"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
