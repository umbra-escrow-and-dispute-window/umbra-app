"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected errors
    console.error("Umbra error boundary caught:", error);
  }, [error]);

  return (
    <div className="container mx-auto max-w-xl px-4 py-16">
      <Card className="border-red-200 dark:border-red-950">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">Something went wrong</CardTitle>
          <CardDescription>
            An unexpected error occurred while processing the request.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs font-mono p-3 rounded bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 break-all">
            {error.message || "Unknown error"}
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => (window.location.href = "/")}>
              Go to Home
            </Button>
            <Button size="sm" onClick={() => reset()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
