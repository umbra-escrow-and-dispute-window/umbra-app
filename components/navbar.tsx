import React from "react";
import Link from "next/link";
import { Badge } from "./ui/badge";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-neutral-100">
              Umbra<span className="text-blue-500">.</span>
            </span>
            <span className="hidden text-xs text-neutral-400 sm:inline-block">
              Escrow & Dispute Window
            </span>
          </Link>

          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link href="/" className="text-neutral-300 transition-colors hover:text-white">
              Explorer
            </Link>
            <Link href="/console" className="text-neutral-300 transition-colors hover:text-white">
              Console
            </Link>
            <Link href="/arbiter" className="text-neutral-300 transition-colors hover:text-white">
              Arbiter
            </Link>
            <Link href="/verify" className="text-neutral-300 transition-colors hover:text-white">
              Verifier
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-neutral-700 text-neutral-300">
            Stellar Testnet
          </Badge>
        </div>
      </div>
    </header>
  );
}
