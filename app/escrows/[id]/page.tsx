import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TtlExtensionButton } from "@/components/ttl-extension-button";
import { clientStore } from "@/lib/client-umbra";
import {
  formatStroops,
  truncateAddress,
  truncateHash,
  formatTimestamp,
  formatDuration,
  formatArbiterInfo,
  getStateBadgeVariant,
  getTimeRemaining,
} from "@/lib/format";

interface EscrowDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function EscrowDetailPage({ params }: EscrowDetailPageProps) {
  const { id } = await params;
  const escrow = clientStore.getEscrow(id);

  if (!escrow) {
    notFound();
  }

  const nowTimestamp = BigInt(Math.floor(Date.now() / 1000));
  const disputeDeadline = escrow.deliveredAt
    ? escrow.deliveredAt + escrow.disputeWindow
    : undefined;
  const disputeCountdown = disputeDeadline ? getTimeRemaining(disputeDeadline, nowTimestamp) : null;

  const confirmDeadline = escrow.deliveredAt
    ? escrow.deliveredAt + escrow.confirmWindow
    : undefined;
  const confirmCountdown = confirmDeadline ? getTimeRemaining(confirmDeadline, nowTimestamp) : null;

  // Lifecycle progression stages
  const isFunded = escrow.state !== "Created";
  const isDelivered =
    escrow.state === "Delivered" ||
    escrow.state === "Disputed" ||
    escrow.state === "Released" ||
    escrow.state === "ResolvedBuyer" ||
    escrow.state === "ResolvedSeller" ||
    escrow.state === "ResolvedSplit";
  const isTerminal =
    escrow.state === "Released" ||
    escrow.state === "Refunded" ||
    escrow.state === "ResolvedBuyer" ||
    escrow.state === "ResolvedSeller" ||
    escrow.state === "ResolvedSplit";

  return (
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header and Back Link */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/"
            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline mb-2 inline-block"
          >
            &larr; Back to Directory
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Escrow #{escrow.id}</h1>
            <Badge variant={getStateBadgeVariant(escrow.state)}>{escrow.state}</Badge>
          </div>
          <div className="mt-2">
            <TtlExtensionButton escrowId={escrow.id} initialLedgers={escrow.ttlLedgers} />
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs text-neutral-500 uppercase tracking-wider font-medium">
            Escrow Amount
          </p>
          <p className="text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
            {formatStroops(escrow.amount)} XLM
          </p>
        </div>
      </div>

      {/* Progress Stepper */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Lifecycle Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
            <div
              className={`p-3 rounded-lg border ${
                isFunded
                  ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-semibold"
                  : "border-neutral-200 dark:border-neutral-800 text-neutral-400"
              }`}
            >
              <div className="text-xs uppercase">Step 1</div>
              <div className="text-sm mt-1">Funded</div>
            </div>

            <div
              className={`p-3 rounded-lg border ${
                isDelivered
                  ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-semibold"
                  : "border-neutral-200 dark:border-neutral-800 text-neutral-400"
              }`}
            >
              <div className="text-xs uppercase">Step 2</div>
              <div className="text-sm mt-1">Delivered</div>
            </div>

            <div
              className={`p-3 rounded-lg border ${
                escrow.state === "Disputed"
                  ? "border-red-500 bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-400 font-semibold"
                  : isDelivered && !isTerminal
                    ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 font-semibold"
                    : "border-neutral-200 dark:border-neutral-800 text-neutral-400"
              }`}
            >
              <div className="text-xs uppercase">Step 3</div>
              <div className="text-sm mt-1">
                {escrow.state === "Disputed" ? "Dispute Active" : "Review Window"}
              </div>
            </div>

            <div
              className={`p-3 rounded-lg border ${
                isTerminal
                  ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 font-semibold"
                  : "border-neutral-200 dark:border-neutral-800 text-neutral-400"
              }`}
            >
              <div className="text-xs uppercase">Step 4</div>
              <div className="text-sm mt-1">Settled</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Parties and Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Parties & Arbiter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm font-mono">
            <div>
              <p className="text-xs text-neutral-500 uppercase font-sans">Buyer Public Key</p>
              <p className="font-semibold text-neutral-800 dark:text-neutral-200 break-all mt-0.5">
                {escrow.buyer}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 uppercase font-sans">Seller Public Key</p>
              <p className="font-semibold text-neutral-800 dark:text-neutral-200 break-all mt-0.5">
                {escrow.seller}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 uppercase font-sans">Asset Contract</p>
              <p className="font-semibold text-neutral-800 dark:text-neutral-200 break-all mt-0.5">
                {escrow.asset}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 uppercase font-sans">Arbiter Setup</p>
              <p className="font-semibold font-sans text-neutral-800 dark:text-neutral-200 mt-0.5">
                {formatArbiterInfo(escrow.arbiter)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Deadlines and Countdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Deadlines & Timers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="text-xs text-neutral-500 uppercase">Deliver-By Deadline</p>
              <p className="font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5">
                {formatTimestamp(escrow.deliverBy)}
              </p>
            </div>

            <div>
              <p className="text-xs text-neutral-500 uppercase">Confirm Window</p>
              <div className="flex items-center justify-between mt-0.5">
                <span>{formatDuration(escrow.confirmWindow)}</span>
                {confirmCountdown && (
                  <span className="text-xs font-mono text-neutral-400">
                    {confirmCountdown.expired
                      ? "Elapsed"
                      : `${confirmCountdown.formatted} remaining`}
                  </span>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs text-neutral-500 uppercase">Dispute Window</p>
              <div className="flex items-center justify-between mt-0.5">
                <span>{formatDuration(escrow.disputeWindow)}</span>
                {disputeCountdown && (
                  <span className="text-xs font-mono text-neutral-400">
                    {disputeCountdown.expired
                      ? "Elapsed"
                      : `${disputeCountdown.formatted} remaining`}
                  </span>
                )}
              </div>
            </div>

            {escrow.deliveredAt && (
              <div>
                <p className="text-xs text-neutral-500 uppercase">Delivered At</p>
                <p className="font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5">
                  {formatTimestamp(escrow.deliveredAt)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Astrolabe Reputation Record */}
      {isTerminal && (
        <Card className="border-purple-200 dark:border-purple-900 bg-purple-50/20 dark:bg-purple-950/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <span>Astrolabe On-Chain Attestation</span>
                <Badge variant="outline" className="text-purple-600 dark:text-purple-300">
                  Topic: [astrolabe, record, #{escrow.id}]
                </Badge>
              </CardTitle>
            </div>
            <CardDescription>
              Permanent machine-verifiable reputation record emitted on terminal settlement.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <span className="font-sans text-neutral-500 uppercase">Outcome State</span>
              <p className="font-semibold text-sm mt-1">{escrow.state}</p>
            </div>
            <div className="p-3 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <span className="font-sans text-neutral-500 uppercase">Volume Tier</span>
              <p className="font-semibold text-sm mt-1">Tier Bucket #2 (&le; 1,000 XLM)</p>
            </div>
            <div className="p-3 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <span className="font-sans text-neutral-500 uppercase">Storage Lease TTL</span>
              <p className="font-semibold text-sm mt-1">
                {escrow.ttlLedgers?.toLocaleString() ?? "518,400"} Ledgers
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Off-Chain Document Hashes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Off-Chain Hashes (SHA-256)</CardTitle>
          <CardDescription>
            Cryptographic hashes stored on Stellar ledger representing off-chain agreements and
            evidence.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 font-mono text-xs">
          <div className="p-3 rounded-md bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-1">
              <span className="font-sans font-semibold text-neutral-700 dark:text-neutral-300">
                Terms Hash (domain: umbra:terms:v1)
              </span>
              <Link
                href={`/verify?hash=${escrow.termsHash}&kind=terms`}
                className="font-sans text-blue-600 dark:text-blue-400 hover:underline"
              >
                Verify &rarr;
              </Link>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400 break-all">{escrow.termsHash}</p>
          </div>

          {escrow.proofHash && (
            <div className="p-3 rounded-md bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center justify-between mb-1">
                <span className="font-sans font-semibold text-neutral-700 dark:text-neutral-300">
                  Delivery Proof Hash (domain: umbra:delivery-proof:v1)
                </span>
                <Link
                  href={`/verify?hash=${escrow.proofHash}&kind=deliveryProof`}
                  className="font-sans text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Verify &rarr;
                </Link>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 break-all">{escrow.proofHash}</p>
            </div>
          )}

          {escrow.reasonHash && (
            <div className="p-3 rounded-md bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center justify-between mb-1">
                <span className="font-sans font-semibold text-neutral-700 dark:text-neutral-300">
                  Dispute Reason Hash (domain: umbra:dispute-reason:v1)
                </span>
                <Link
                  href={`/verify?hash=${escrow.reasonHash}&kind=disputeReason`}
                  className="font-sans text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Verify &rarr;
                </Link>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 break-all">
                {escrow.reasonHash}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
