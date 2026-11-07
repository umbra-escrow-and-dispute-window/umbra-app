"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { clientStore } from "@/lib/client-umbra";
import { EscrowRecord } from "@/lib/types";
import { WalletConnect, WalletState } from "@/components/wallet-connect";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  formatStroops,
  parseStroops,
  truncateAddress,
  formatTimestamp,
  formatDuration,
  getStateBadgeVariant,
  getTimeRemaining,
} from "@/lib/format";
import {
  hashTermsDocument,
  hashDeliveryProofDocument,
  hashDisputeReasonDocument,
} from "@/lib/hashing";

export default function ConsolePage() {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: true,
    address: "GBBD67VFO7CTP3S5BX7A5UOHQLWJ2C3Z7G4V5N3A2B1C0D9E8F7A6B5C",
    role: "Buyer",
  });

  const [escrows, setEscrows] = useState<EscrowRecord[]>(() => clientStore.listEscrows());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deliveryModalEscrow, setDeliveryModalEscrow] = useState<EscrowRecord | null>(null);
  const [disputeModalEscrow, setDisputeModalEscrow] = useState<EscrowRecord | null>(null);

  // New Escrow Form State
  const [newSeller, setNewSeller] = useState("GAKF4W2N3M5L6K7J8H9G0F1E2D3C4B5A6B7C8D9E0F1A2B3C4D5E6F7A");
  const [newAmountXlm, setNewAmountXlm] = useState("50");
  const [newTermsText, setNewTermsText] = useState("Full-stack Soroban escrow integration delivery");

  // Proof & Dispute Modals
  const [deliveryProofText, setDeliveryProofText] = useState("");
  const [disputeReasonText, setDisputeReasonText] = useState("");

  const refreshList = () => {
    setEscrows(clientStore.listEscrows());
  };

  const myEscrows = useMemo(() => {
    if (!wallet.address) return [];
    return escrows.filter(
      (e) =>
        e.buyer.toLowerCase() === wallet.address.toLowerCase() ||
        e.seller.toLowerCase() === wallet.address.toLowerCase(),
    );
  }, [escrows, wallet.address]);

  // Create Escrow Handler
  const handleCreateEscrow = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const stroops = parseStroops(newAmountXlm);
      const termsHash = hashTermsDocument({
        terms: newTermsText.trim(),
        createdAt: Date.now(),
      });
      const now = BigInt(Math.floor(Date.now() / 1000));

      clientStore.createEscrow({
        buyer: wallet.address,
        seller: newSeller.trim(),
        asset: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
        amount: stroops,
        deliverBy: now + 604800n, // 7 days
        confirmWindow: 259200n, // 3 days
        disputeWindow: 172800n, // 2 days
        arbiter: {
          type: "Single",
          address: "GARB4W2N3M5L6K7J8H9G0F1E2D3C4B5A6B7C8D9E0F1A2B3C4D5E6F7A",
        },
        termsHash,
      });

      setShowCreateModal(false);
      refreshList();
    } catch (err: any) {
      alert(err?.message || "Failed to create escrow");
    }
  };

  // Release Funds Handler (Buyer)
  const handleRelease = (id: string) => {
    if (!confirm(`Release funds for Escrow #${id} to seller?`)) return;
    try {
      clientStore.releaseFunds(id);
      refreshList();
    } catch (err: any) {
      alert(err?.message || "Failed to release funds");
    }
  };

  // Submit Delivery Proof Handler (Seller)
  const handleDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryModalEscrow) return;
    try {
      const proofHash = hashDeliveryProofDocument({
        proofNotes: deliveryProofText.trim(),
        submittedAt: Date.now(),
      });

      clientStore.markDelivered(deliveryModalEscrow.id, proofHash);
      setDeliveryModalEscrow(null);
      setDeliveryProofText("");
      refreshList();
    } catch (err: any) {
      alert(err?.message || "Failed to submit delivery");
    }
  };

  // Submit Dispute Claim Handler (Buyer)
  const handleDisputeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeModalEscrow) return;
    try {
      const reasonHash = hashDisputeReasonDocument({
        claim: disputeReasonText.trim(),
        filedAt: Date.now(),
      });

      clientStore.raiseDispute(disputeModalEscrow.id, reasonHash);
      setDisputeModalEscrow(null);
      setDisputeReasonText("");
      refreshList();
    } catch (err: any) {
      alert(err?.message || "Failed to raise dispute");
    }
  };

  // Claim Timeout Handler (Seller)
  const handleClaimTimeout = (id: string) => {
    try {
      clientStore.claimTimeout(id);
      refreshList();
    } catch (err: any) {
      alert(err?.message || "Confirm window has not elapsed yet");
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Banner and Account Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Participant Console</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Manage your buyer and seller escrows, submit delivery proofs, release funds, or file disputes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <WalletConnect onAccountChange={setWallet} defaultRole="Buyer" />
          <Button onClick={() => setShowCreateModal(true)}>
            + Create Escrow
          </Button>
        </div>
      </div>

      {/* Escrow Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Active & Historical Escrows</CardTitle>
          <CardDescription>
            Showing records where you are designated as Buyer or Seller ({wallet.role}).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {myEscrows.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-neutral-500 font-medium">No escrows found for connected account</p>
              <p className="text-xs text-neutral-400 mt-1">
                Switch account persona above or click "+ Create Escrow" to begin.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-neutral-200 dark:border-neutral-800 text-xs uppercase text-neutral-500">
                  <tr>
                    <th className="py-3 px-2">ID</th>
                    <th className="py-3 px-2">Role</th>
                    <th className="py-3 px-2">State</th>
                    <th className="py-3 px-2">Amount</th>
                    <th className="py-3 px-2">Counterparty</th>
                    <th className="py-3 px-2">Deliver By</th>
                    <th className="py-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {myEscrows.map((escrow) => {
                    const isBuyer = escrow.buyer.toLowerCase() === wallet.address.toLowerCase();
                    const isSeller = escrow.seller.toLowerCase() === wallet.address.toLowerCase();

                    return (
                      <tr key={escrow.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50">
                        <td className="py-3 px-2 font-mono font-medium">#{escrow.id}</td>
                        <td className="py-3 px-2">
                          <Badge variant="outline" className="text-xs">
                            {isBuyer && isSeller ? "Both" : isBuyer ? "Buyer" : "Seller"}
                          </Badge>
                        </td>
                        <td className="py-3 px-2">
                          <Badge variant={getStateBadgeVariant(escrow.state)}>
                            {escrow.state}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 font-semibold">
                          {formatStroops(escrow.amount)} XLM
                        </td>
                        <td className="py-3 px-2 font-mono text-xs text-neutral-500">
                          {truncateAddress(isBuyer ? escrow.seller : escrow.buyer)}
                        </td>
                        <td className="py-3 px-2 text-xs text-neutral-500">
                          {formatTimestamp(escrow.deliverBy)}
                        </td>
                        <td className="py-3 px-2 text-right space-x-2">
                          {/* Seller Delivery Action */}
                          {isSeller && escrow.state === "Funded" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDeliveryModalEscrow(escrow)}
                            >
                              Deliver
                            </Button>
                          )}

                          {/* Buyer Release Action */}
                          {isBuyer && (escrow.state === "Funded" || escrow.state === "Delivered") && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleRelease(escrow.id)}
                            >
                              Release
                            </Button>
                          )}

                          {/* Buyer Dispute Action */}
                          {isBuyer && escrow.state === "Delivered" && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setDisputeModalEscrow(escrow)}
                            >
                              Dispute
                            </Button>
                          )}

                          {/* Seller Timeout Claim */}
                          {isSeller && escrow.state === "Delivered" && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleClaimTimeout(escrow.id)}
                            >
                              Claim Timeout
                            </Button>
                          )}

                          <Link
                            href={`/escrows/${escrow.id}`}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline inline-block ml-2"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Escrow Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold">Create New Escrow Agreement</h3>
            <form onSubmit={handleCreateEscrow} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1">
                  Seller Public Key
                </label>
                <Input
                  type="text"
                  value={newSeller}
                  onChange={(e) => setNewSeller(e.target.value)}
                  className="font-mono text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1">
                  Amount (XLM)
                </label>
                <Input
                  type="number"
                  step="0.0000001"
                  min="0.1"
                  value={newAmountXlm}
                  onChange={(e) => setNewAmountXlm(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1">
                  Terms & Deliverables Description
                </label>
                <textarea
                  rows={3}
                  value={newTermsText}
                  onChange={(e) => setNewTermsText(e.target.value)}
                  className="w-full rounded-md border border-neutral-800 bg-neutral-900 p-2 text-xs font-mono"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create & Fund</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit Delivery Proof Modal */}
      {deliveryModalEscrow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold">Submit Delivery Proof (Escrow #{deliveryModalEscrow.id})</h3>
            <p className="text-xs text-neutral-400">
              Your delivery notes or artifact links will be hashed with domain{" "}
              <code className="text-blue-400">umbra:delivery-proof:v1</code> and saved to the ledger.
            </p>
            <form onSubmit={handleDeliverySubmit} className="space-y-4">
              <textarea
                rows={4}
                placeholder="Commit URL, IPFS CID, or delivery notes..."
                value={deliveryProofText}
                onChange={(e) => setDeliveryProofText(e.target.value)}
                className="w-full rounded-md border border-neutral-800 bg-neutral-900 p-2 text-xs font-mono"
                required
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setDeliveryModalEscrow(null)}>
                  Cancel
                </Button>
                <Button type="submit">Submit Delivery</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Raise Dispute Modal */}
      {disputeModalEscrow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-red-500">
              File Dispute (Escrow #{disputeModalEscrow.id})
            </h3>
            <p className="text-xs text-neutral-400">
              State your dispute claim. It will be hashed with domain{" "}
              <code className="text-blue-400">umbra:dispute-reason:v1</code> for arbiter review.
            </p>
            <form onSubmit={handleDisputeSubmit} className="space-y-4">
              <textarea
                rows={4}
                placeholder="Describe reason for dispute (e.g. deliverable does not match terms)..."
                value={disputeReasonText}
                onChange={(e) => setDisputeReasonText(e.target.value)}
                className="w-full rounded-md border border-neutral-800 bg-neutral-900 p-2 text-xs font-mono"
                required
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setDisputeModalEscrow(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="destructive">
                  File Dispute
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
