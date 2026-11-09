"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { EscrowRecord, EscrowState } from "../lib/types";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import {
  formatStroops,
  truncateAddress,
  formatTimestamp,
  getStateBadgeVariant,
  getTimeRemaining,
} from "../lib/format";

interface EscrowExplorerProps {
  initialEscrows: EscrowRecord[];
}

const FILTER_TABS = [
  "All",
  "Funded",
  "Delivered",
  "Disputed",
  "Released",
  "Resolved",
  "Refunded",
] as const;

export function EscrowExplorer({ initialEscrows }: EscrowExplorerProps) {
  const [search, setSearch] = useState("");
  const [selectedTab, setSelectedTab] = useState<string>("All");
  const nowTimestamp = useMemo(() => BigInt(Math.floor(Date.now() / 1000)), []);

  const filteredEscrows = useMemo(() => {
    return initialEscrows.filter((escrow) => {
      // Status filtering
      if (selectedTab !== "All") {
        if (selectedTab === "Resolved") {
          const isResolved =
            escrow.state === "ResolvedBuyer" ||
            escrow.state === "ResolvedSeller" ||
            escrow.state === "ResolvedSplit";
          if (!isResolved) return false;
        } else if (escrow.state !== selectedTab) {
          return false;
        }
      }

      // Search query filtering
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchesId = escrow.id.toLowerCase().includes(q);
        const matchesBuyer = escrow.buyer.toLowerCase().includes(q);
        const matchesSeller = escrow.seller.toLowerCase().includes(q);
        const matchesAsset = escrow.asset.toLowerCase().includes(q);
        return matchesId || matchesBuyer || matchesSeller || matchesAsset;
      }

      return true;
    });
  }, [initialEscrows, selectedTab, search]);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-xl">Escrow Directory</CardTitle>
            <CardDescription>Browse live and past escrows on Stellar Testnet.</CardDescription>
          </div>
          <div className="w-full sm:w-72">
            <Input
              type="text"
              placeholder="Search by ID, buyer, seller..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search escrows"
            />
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                selectedTab === tab
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {filteredEscrows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-neutral-500 font-medium">No escrows found</p>
            <p className="text-xs text-neutral-400 mt-1">
              {search
                ? `No matching escrows for "${search}". Try clearing your search query.`
                : `There are currently no escrows matching the "${selectedTab}" filter.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-neutral-200 dark:border-neutral-800 text-xs uppercase text-neutral-500">
                <tr>
                  <th className="py-3 px-2">ID</th>
                  <th className="py-3 px-2">State</th>
                  <th className="py-3 px-2">Amount (XLM)</th>
                  <th className="py-3 px-2">Buyer</th>
                  <th className="py-3 px-2">Seller</th>
                  <th className="py-3 px-2">Deliver By</th>
                  <th className="py-3 px-2">Dispute Window</th>
                  <th className="py-3 px-2 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filteredEscrows.map((escrow) => {
                  const disputeDeadline = escrow.deliveredAt
                    ? escrow.deliveredAt + escrow.disputeWindow
                    : undefined;
                  const countdown = disputeDeadline
                    ? getTimeRemaining(disputeDeadline, nowTimestamp)
                    : null;

                  return (
                    <tr
                      key={escrow.id}
                      className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-colors"
                    >
                      <td className="py-3 px-2 font-mono font-medium">#{escrow.id}</td>
                      <td className="py-3 px-2">
                        <div className="flex flex-col gap-1 items-start">
                          <Badge variant={getStateBadgeVariant(escrow.state)}>{escrow.state}</Badge>
                          {(escrow.astrolabeRecord ||
                            [
                              "Released",
                              "Refunded",
                              "ResolvedBuyer",
                              "ResolvedSeller",
                              "ResolvedSplit",
                            ].includes(escrow.state)) && (
                            <span className="inline-flex items-center text-[9px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-1 rounded">
                              Astrolabe
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2 font-semibold">{formatStroops(escrow.amount)}</td>
                      <td className="py-3 px-2 font-mono text-xs text-neutral-500">
                        {truncateAddress(escrow.buyer)}
                      </td>
                      <td className="py-3 px-2 font-mono text-xs text-neutral-500">
                        {truncateAddress(escrow.seller)}
                      </td>
                      <td className="py-3 px-2 text-xs text-neutral-500">
                        {formatTimestamp(escrow.deliverBy)}
                      </td>
                      <td className="py-3 px-2 text-xs">
                        {countdown ? (
                          countdown.expired ? (
                            <span className="text-neutral-400">Elapsed</span>
                          ) : (
                            <span className="text-amber-500 font-medium">
                              {countdown.formatted} left
                            </span>
                          )
                        ) : (
                          <span className="text-neutral-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <Link
                          href={`/escrows/${escrow.id}`}
                          className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          View &rarr;
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
  );
}
