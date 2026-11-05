import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Umbra | Stellar Escrow & Dispute Window Protocol",
  description:
    "Open-source machine-to-machine escrow explorer, dispute filing, and arbiter console on Stellar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
        <header className="sticky top-0 z-50 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur">
          <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-6">
              <Link
                href="/"
                className="flex items-center space-x-2 font-bold text-lg tracking-tight"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white font-mono text-sm">
                  U
                </span>
                <span>Umbra</span>
              </Link>
              <nav className="hidden md:flex space-x-6 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                <Link
                  href="/"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Explorer
                </Link>
                <Link
                  href="/verify"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Verify Proofs
                </Link>
                <Link
                  href="/console"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Console
                </Link>
                <Link
                  href="/arbiter"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Arbiter
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Testnet
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 py-8">{children}</main>

        <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 py-6 text-sm text-neutral-500">
          <div className="container mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
            <p>Umbra Escrow & Dispute Window Protocol. Testnet-only.</p>
            <div className="flex space-x-4">
              <a
                href="https://github.com/umbra-escrow-and-dispute-window"
                target="_blank"
                rel="noreferrer"
                className="hover:text-neutral-800 dark:hover:text-neutral-200"
              >
                GitHub
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
