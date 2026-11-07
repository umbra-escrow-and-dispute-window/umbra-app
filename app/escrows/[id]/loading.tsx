import React from "react";

export default function EscrowDetailLoading() {
  return (
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-4 w-28 bg-neutral-200 dark:bg-neutral-800 rounded" />
          <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-800 rounded" />
        </div>
        <div className="h-8 w-32 bg-neutral-200 dark:bg-neutral-800 rounded" />
      </div>

      <div className="h-28 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-56 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800" />
        <div className="h-56 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800" />
      </div>

      <div className="h-48 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800" />
    </div>
  );
}
