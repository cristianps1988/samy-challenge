"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/AuthProvider";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, isMounted } = useAuth();

  useEffect(() => {
    if (isLoading || !isMounted) return;

    if (isAuthenticated) {
      router.replace("/users");
    } else {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, isMounted, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Skeleton className="h-16 w-64" />
    </div>
  );
}
