"use client";

import React, { useState } from "react";
import Link from "next/link";
import { clientStore } from "@/lib/client-umbra";
import { VaultSellerPosition } from "@/lib/types";
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
import { Input } from "@/components/ui/input";
import { formatStroops, parseStroops, truncateAddress, formatTimestamp } from "@/lib/format";

const DEFAULT_ASSET = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

export default function VaultPage() {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: true,
    address: "GAKF4W2N3M5L6K7J8H9G0F1E2D3C4B5A6B7C8D9E0F1A2B3C4D5E6F7A",
    role: "Seller",
  });

  const [position, setPosition] = useState<VaultSellerPosition>(() =>
    clientStore.getVaultPosition(wallet.address, DEFAULT_ASSET),
  );

  const [depositAmountXlm, setDepositAmountXlm] = useState("100");
  const [withdrawAmountXlm, setWithdrawAmountXlm] = useState("50");

  const refreshPosition = (sellerAddress = wallet.address) => {
    const pos = clientStore.getVaultPosition(sellerAddress, DEFAULT_ASSET);
    setPosition(pos);
  };

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const stroops = parseStroops(depositAmountXlm);
      const updated = clientStore.depositVault(wallet.address, DEFAULT_ASSET, stroops);
      setPosition(updated);
      alert(`Deposited ${depositAmountXlm} XLM collateral into vault!`);
    } catch (err: any) {
      alert(err?.message || "Failed to deposit collateral");
    }
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const stroops = parseStroops(withdrawAmountXlm);
      const updated = clientStore.withdrawVault(wallet.address, DEFAULT_ASSET, stroops);
      setPosition(updated);
      alert(`Withdrew ${withdrawAmountXlm} XLM unencumbered collateral from vault!`);
    } catch (err: any) {
      alert(err?.message || "Failed to withdraw collateral");
    }
  };

  const handleReleaseLock = (escrowId: string) => {
    try {
      const updated = clientStore.releaseVaultLock(wallet.address, escrowId);
      setPosition(updated);
      alert(`Released locked collateral for Escrow #${escrowId}!`);
    } catch (err: any) {
      alert(err?.message || "Failed to release lock");
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Seller Collateral Vault
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Stake reserves to back instant-release escrows with time-bounded post-release reversal
            protection.
          </p>
        </div>

        <WalletConnect
          onAccountChange={(w) => {
            setWallet(w);
            refreshPosition(w.address);
          }}
          defaultRole="Seller"
        />
      </div>

      {/* Position Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-medium">
              Total Staked Collateral
            </CardDescription>
            <CardTitle className="text-2xl font-bold font-mono">
              {formatStroops(position.totalCollateral)} XLM
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-neutral-500">
              Contract: {truncateAddress(DEFAULT_ASSET, 6)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 dark:border-amber-900 bg-amber-50/20 dark:bg-amber-950/10">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-medium text-amber-700 dark:text-amber-400">
              Locked Liabilities
            </CardDescription>
            <CardTitle className="text-2xl font-bold font-mono text-amber-800 dark:text-amber-300">
              {formatStroops(position.lockedCollateral)} XLM
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-neutral-500">
              Backing {position.locks.length} active instant-release escrows
            </p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 dark:border-emerald-900 bg-emerald-50/20 dark:bg-emerald-950/10">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-medium text-emerald-700 dark:text-emerald-400">
              Available to Withdraw
            </CardDescription>
            <CardTitle className="text-2xl font-bold font-mono text-emerald-800 dark:text-emerald-300">
              {formatStroops(position.availableCollateral)} XLM
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-neutral-500">
              Unencumbered balance free of active claims
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Staking & Withdrawal Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Deposit Collateral</CardTitle>
            <CardDescription>
              Increase unencumbered vault balance to accept higher-volume instant-release agreements.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1">
                  Deposit Amount (XLM)
                </label>
                <Input
                  type="number"
                  step="0.0000001"
                  min="1"
                  value={depositAmountXlm}
                  onChange={(e) => setDepositAmountXlm(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Deposit to Vault
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Withdraw Unencumbered Balance</CardTitle>
            <CardDescription>
              Withdraw available funds back to your seller wallet. Cannot withdraw locked liabilities.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1">
                  Withdraw Amount (XLM)
                </label>
                <Input
                  type="number"
                  step="0.0000001"
                  min="1"
                  value={withdrawAmountXlm}
                  onChange={(e) => setWithdrawAmountXlm(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" variant="outline" className="w-full">
                Withdraw to Wallet
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Active Liabilities Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Active Instant-Release Liabilities ({position.locks.length})
              </CardTitle>
              <CardDescription>
                Collateral encumbered during post-release dispute windows.
              </CardDescription>
            </div>
            <Badge variant="outline" className="font-mono text-xs">
              Reserve Ratio: 1:1
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {position.locks.length === 0 ? (
            <div className="py-8 text-center text-neutral-500 text-xs">
              No active collateral locks. All staked balance is unencumbered.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500">
                    <th className="py-2 px-3">Escrow ID</th>
                    <th className="py-2 px-3">Locked Collateral</th>
                    <th className="py-2 px-3">Window Expiry</th>
                    <th className="py-2 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {position.locks.map((lock) => (
                    <tr key={lock.escrowId} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50">
                      <td className="py-3 px-3 font-mono">
                        <Link
                          href={`/escrows/${lock.escrowId}`}
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          #{lock.escrowId}
                        </Link>
                      </td>
                      <td className="py-3 px-3 font-bold font-mono">
                        {formatStroops(lock.amount)} XLM
                      </td>
                      <td className="py-3 px-3 text-xs text-neutral-500 font-mono">
                        {formatTimestamp(BigInt(lock.expiresAt))}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReleaseLock(lock.escrowId)}
                          className="h-7 text-xs"
                        >
                          Release Lock
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
