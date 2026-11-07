import React from "react";

export default function Loading() {
  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8 animate-pulse">
      <div className="h-8 w-64 bg-neutral-200 dark:bg-neutral-800 rounded" />
      <div className="h-4 w-96 bg-neutral-200 dark:bg-neutral-800 rounded" />

      <div className="h-96 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900/50 p-6" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-40 rounded-xl bg-neutral-100 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800" />
        <div className="h-40 rounded-xl bg-neutral-100 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800" />
        <div className="h-40 rounded-xl bg-neutral-100 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800" />
      </div>
    </div>
  );
}
