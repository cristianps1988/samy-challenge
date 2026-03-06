"use client";

import { useEffect } from "react";
import { Button } from "./button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
  showBackHome?: boolean;
  className?: string;
}

export function ErrorBoundary({
  error,
  reset,
  showBackHome = true,
  className = "",
}: ErrorBoundaryProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className={`min-h-screen flex items-center justify-center bg-muted/30 p-4 ${className}`}>
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <AlertCircle className="h-16 w-16 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Something went wrong</h2>
          <p className="text-muted-foreground">
            {error.message || "An unexpected error occurred"}
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset}>Try again</Button>
          {showBackHome && (
            <Button variant="outline" asChild>
              <Link href="/">Go home</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
