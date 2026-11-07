import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container mx-auto max-w-lg px-4 py-24 text-center space-y-4">
      <h2 className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">
        404
      </h2>
      <p className="text-lg font-semibold text-neutral-700 dark:text-neutral-300">
        Escrow Not Found
      </p>
      <p className="text-sm text-neutral-500 max-w-md mx-auto">
        The requested escrow record or page does not exist on this network or may have been pruned.
      </p>
      <div className="pt-4">
        <Link href="/">
          <Button>Return to Explorer</Button>
        </Link>
      </div>
    </div>
  );
}
