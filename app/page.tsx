import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getEscrowContractId } from "@/lib/umbra";
import { truncateAddress } from "@/lib/format";

export default function HomePage() {
  const contractId = getEscrowContractId();

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Umbra Escrow Protocol</h1>
          <Badge variant="outline">v0.1</Badge>
        </div>
        <p className="text-neutral-600 dark:text-neutral-400 max-w-3xl">
          A trust-minimized escrow and dispute window protocol for autonomous machine-to-machine
          payments on Stellar. Buyers fund, sellers deliver, and disputes are adjudicated by chosen
          arbiters within normative time windows.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Public Explorer</CardTitle>
            <CardDescription>
              Inspect on-chain escrow states, ledger deadlines, and transition histories.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/"
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Browse escrows &rarr;
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verify Proofs</CardTitle>
            <CardDescription>
              Validate off-chain agreement terms, delivery proofs, and dispute reasons against
              on-chain SHA-256 hashes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/verify"
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Verify documents &rarr;
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Arbiter Console</CardTitle>
            <CardDescription>
              Authorized arbiters review contested deliveries and issue binding verdicts (refund,
              release, or split).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/arbiter"
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Review disputes &rarr;
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Testnet Deployment</CardTitle>
          <CardDescription>
            Live Soroban contract instance resolved dynamically from SDK configuration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 font-mono text-sm">
          <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
            <span className="text-neutral-500">Escrow Contract ID:</span>
            <span className="font-semibold">{truncateAddress(contractId, 10)}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
            <span className="text-neutral-500">Network:</span>
            <span>Stellar Testnet</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between py-2">
            <span className="text-neutral-500">Contract Mode:</span>
            <span>Single-arbiter resolution, normative dispute window</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
