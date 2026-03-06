"use client";

import { ErrorBoundary } from "@/components/ui/error-boundary";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <ErrorBoundary error={error} reset={reset} showBackHome className="bg-transparent" />
        </div>
      </div>
    </div>
  );
}
