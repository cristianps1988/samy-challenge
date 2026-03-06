"use client";

import { Suspense } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Skeleton } from "@/components/ui/skeleton";

export function AuthenticatedContent({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<Skeleton className="h-16 w-full" />}>
        <Navbar />
      </Suspense>
      <main className="container mx-auto px-6 py-10">
        {children}
      </main>
    </div>
  );
}
