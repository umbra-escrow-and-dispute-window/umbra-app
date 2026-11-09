"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { clientStore } from "@/lib/client-umbra";
import { EscrowRecord, VerdictResolution } from "@/lib/types";
import { WalletConnect, WalletState } from "@/components/wallet-connect";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  formatStroops,
  truncateAddress,
  formatBps,
} from "@/lib/format";

export default function ArbiterPage() {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: true,
    address: "GARB4W2N3M5L6K7J8H9G0F1E2D3C4B5A6B7C8D9E0F1A2B3C4D5E6F7A",
    role: "Arbiter",
  });

  const [escrows, setEscrows] = useState<EscrowRecord[]>(() =>
    clientStore.listEscrows(),
  );
  const [selectedEscrow, setSelectedEscrow] = useState<EscrowRecord | null>(
    null,
  );

  // Verdict state
  const [verdictType, setVerdictType] = useState<
    "RefundBuyer" | "ReleaseSeller" | "Split"
  >("Split");
  const [buyerBps, setBuyerBps] = useState(5000); // 50%
  const [signedSigInput, setSignedSigInput] = useState("");

  const refreshList = () => {
    const list = clientStore.listEscrows();
    setEscrows(list);
    if (selectedEscrow) {
      const updated = list.find((e) => e.id === selectedEscrow.id) || null;
      setSelectedEscrow(updated);
    }
  };

  const disputedEscrows = useMemo(() => {
    return escrows.filter((e) => {
      if (e.state !== "Disputed") return false;
      if (wallet.role === "Arbiter") return true;
      if (e.arbiter.type === "Single") {
        return e.arbiter.address?.toLowerCase() === wallet.address.toLowerCase();
      }
      if (e.arbiter.type === "Panel") {
        return e.arbiter.members?.some(
          (m) => m.toLowerCase() === wallet.address.toLowerCase(),
        );
      }
      return true;
    });
  }, [escrows, wallet.address, wallet.role]);

  const handleIssueVerdict = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEscrow) return;

    try {
      const verdict: VerdictResolution = {
        type: verdictType,
        buyerBps: verdictType === "Split" ? buyerBps : undefined,
      };

      if (selectedEscrow.arbiter.type === "Panel") {
        clientStore.signPanelVerdict(selectedEscrow.id, wallet.address, verdict);
        alert(`Panel signature recorded for Escrow #${selectedEscrow.id}!`);
      } else {
        clientStore.resolveDispute(selectedEscrow.id, verdict);
        alert(`Verdict issued successfully for Escrow #${selectedEscrow.id}!`);
      }
      refreshList();
    } catch (err: any) {
      alert(err?.message || "Failed to resolve dispute");
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Banner and Account Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Arbiter Resolution Console
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Review contested deliveries, inspect off-chain evidence hashes, and execute binding
            single, panel, and signed verdicts.
          </p>
        </div>

        <WalletConnect onAccountChange={setWallet} defaultRole="Arbiter" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Disputed Escrow Queue */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Disputed Escrows ({disputedEscrows.length})
            </CardTitle>
            <CardDescription>Awaiting adjudication by your arbiter key.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {disputedEscrows.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-xs text-neutral-500">
                  No active disputes awaiting your review.
                </p>
              </div>
            ) : (
              disputedEscrows.map((escrow) => (
                <div
                  key={escrow.id}
                  onClick={() => setSelectedEscrow(escrow)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedEscrow?.id === escrow.id
                      ? "border-blue-500 bg-blue-50/20 dark:bg-blue-950/20"
                      : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-400"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-semibold text-xs">#{escrow.id}</span>
                    <Badge variant="destructive" className="text-[10px] py-0">
                      Disputed ({escrow.arbiter.type})
                    </Badge>
                  </div>
                  <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    {formatStroops(escrow.amount)} XLM
                  </p>
                  <div className="flex justify-between text-[11px] text-neutral-500 mt-2 font-mono">
                    <span>Buyer: {truncateAddress(escrow.buyer, 3)}</span>
                    <span>Seller: {truncateAddress(escrow.seller, 3)}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Right: Evidence Review & Verdict Panel */}
        <div className="lg:col-span-2 space-y-6">
          {selectedEscrow ? (
            <>
              {/* Evidence Review */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        Evidence Review: Escrow #{selectedEscrow.id}
                      </CardTitle>
                      <CardDescription>
                        Principal: {formatStroops(selectedEscrow.amount)} XLM
                        {selectedEscrow.disputeBond && selectedEscrow.disputeBond > 0n
                          ? ` | Dispute Bond: ${formatStroops(selectedEscrow.disputeBond)} XLM`
                          : ""}
                      </CardDescription>
                    </div>
                    <Link
                      href={`/escrows/${selectedEscrow.id}`}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Full Details &rarr;
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 text-xs font-mono">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                    <div>
                      <span className="text-neutral-500 font-sans uppercase">Buyer Key:</span>
                      <p className="font-semibold break-all mt-0.5">{selectedEscrow.buyer}</p>
                    </div>
                    <div>
                      <span className="text-neutral-500 font-sans uppercase">Seller Key:</span>
                      <p className="font-semibold break-all mt-0.5">{selectedEscrow.seller}</p>
                    </div>
                  </div>

                  {/* Panel Arbitration Tracker */}
                  {selectedEscrow.arbiter.type === "Panel" && (
                    <div className="p-3 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50/30 dark:bg-purple-950/20 font-sans">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-purple-900 dark:text-purple-300">
                          Panel Arbitration ({selectedEscrow.arbiter.threshold ?? 2} of{" "}
                          {selectedEscrow.arbiter.members?.length ?? 3} Required)
                        </span>
                        <Badge variant="outline" className="text-purple-700 dark:text-purple-300">
                          {selectedEscrow.arbiter.signatures?.length ?? 0} Signed
                        </Badge>
                      </div>
                      <div className="space-y-1 font-mono text-[11px]">
                        {selectedEscrow.arbiter.members?.map((m) => {
                          const isSigned =
                            selectedEscrow.arbiter.signatures?.includes(m);
                          return (
                            <div
                              key={m}
                              className="flex items-center justify-between py-1 border-b border-purple-100 dark:border-purple-900 last:border-0"
                            >
                              <span>{truncateAddress(m, 8)}</span>
                              <Badge
                                variant={isSigned ? "default" : "secondary"}
                                className="text-[10px]"
                              >
                                {isSigned ? "Signed" : "Pending"}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Signed Adjudicator Payload Preview */}
                  {selectedEscrow.arbiter.type === "Signed" && (
                    <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/20 font-sans">
                      <span className="font-semibold text-amber-900 dark:text-amber-300 block mb-1">
                        Cryptographic Signed Adjudicator
                      </span>
                      <p className="text-[11px] text-amber-700 dark:text-amber-400 mb-2 font-mono">
                        Domain: umbra:adjudicate:v1 | Escrow: #{selectedEscrow.id}
                      </p>
                      <input
                        type="text"
                        placeholder="Paste 64-byte Ed25519 hex signature..."
                        value={signedSigInput}
                        onChange={(e) => setSignedSigInput(e.target.value)}
                        className="w-full text-xs font-mono p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                      />
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="p-3 rounded bg-neutral-100 dark:bg-neutral-900">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-sans font-semibold text-neutral-700 dark:text-neutral-300">
                          1. Original Terms Hash
                        </span>
                        <Link
                          href={`/verify?hash=${selectedEscrow.termsHash}&kind=terms`}
                          className="font-sans text-blue-500 hover:underline text-[11px]"
                        >
                          Verify &rarr;
                        </Link>
                      </div>
                      <p className="text-neutral-500 break-all">{selectedEscrow.termsHash}</p>
                    </div>

                    <div className="p-3 rounded bg-neutral-100 dark:bg-neutral-900">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-sans font-semibold text-neutral-700 dark:text-neutral-300">
                          2. Seller Delivery Proof Hash
                        </span>
                        {selectedEscrow.proofHash && (
                          <Link
                            href={`/verify?hash=${selectedEscrow.proofHash}&kind=deliveryProof`}
                            className="font-sans text-blue-500 hover:underline text-[11px]"
                          >
                            Verify &rarr;
                          </Link>
                        )}
                      </div>
                      <p className="text-neutral-500 break-all">
                        {selectedEscrow.proofHash || "No proof submitted"}
                      </p>
                    </div>

                    <div className="p-3 rounded bg-neutral-100 dark:bg-neutral-900">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-sans font-semibold text-neutral-700 dark:text-neutral-300">
                          3. Buyer Dispute Claim Hash
                        </span>
                        {selectedEscrow.reasonHash && (
                          <Link
                            href={`/verify?hash=${selectedEscrow.reasonHash}&kind=disputeReason`}
                            className="font-sans text-blue-500 hover:underline text-[11px]"
                          >
                            Verify &rarr;
                          </Link>
                        )}
                      </div>
                      <p className="text-neutral-500 break-all">
                        {selectedEscrow.reasonHash || "No reason submitted"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Verdict Submission Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    {selectedEscrow.arbiter.type === "Panel"
                      ? "Submit Panel Signature"
                      : "Issue Binding Verdict"}
                  </CardTitle>
                  <CardDescription>
                    Executes contract settlement transaction to disburse held funds and dispute bond.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleIssueVerdict} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setVerdictType("RefundBuyer")}
                        className={`p-3 rounded-lg border text-left transition-colors ${
                          verdictType === "RefundBuyer"
                            ? "border-blue-500 bg-blue-50/20 dark:bg-blue-950/20"
                            : "border-neutral-200 dark:border-neutral-800"
                        }`}
                      >
                        <p className="font-semibold text-xs">100% Refund Buyer</p>
                        <p className="text-[11px] text-neutral-500 mt-1">Full refund to buyer</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setVerdictType("ReleaseSeller")}
                        className={`p-3 rounded-lg border text-left transition-colors ${
                          verdictType === "ReleaseSeller"
                            ? "border-blue-500 bg-blue-50/20 dark:bg-blue-950/20"
                            : "border-neutral-200 dark:border-neutral-800"
                        }`}
                      >
                        <p className="font-semibold text-xs">100% Release Seller</p>
                        <p className="text-[11px] text-neutral-500 mt-1">Full payout to seller</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setVerdictType("Split")}
                        className={`p-3 rounded-lg border text-left transition-colors ${
                          verdictType === "Split"
                            ? "border-blue-500 bg-blue-50/20 dark:bg-blue-950/20"
                            : "border-neutral-200 dark:border-neutral-800"
                        }`}
                      >
                        <p className="font-semibold text-xs">Split Payout</p>
                        <p className="text-[11px] text-neutral-500 mt-1">Custom percentage</p>
                      </button>
                    </div>

                    {verdictType === "Split" && (
                      <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3">
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span>Buyer Share: {formatBps(buyerBps)}</span>
                          <span>Seller Share: {formatBps(10000 - buyerBps)}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10000"
                          step="100"
                          value={buyerBps}
                          onChange={(e) => setBuyerBps(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    )}

                    <Button type="submit" className="w-full">
                      {selectedEscrow.arbiter.type === "Panel"
                        ? "Sign Panel Verdict"
                        : "Execute Verdict"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-16 text-center text-neutral-500">
                <p className="text-sm font-medium">
                  Select a disputed escrow from the queue to review evidence.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
