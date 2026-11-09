"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { clientStore } from "@/lib/client-umbra";

export function TtlExtensionButton({
  escrowId,
  initialLedgers = 120000,
}: {
  escrowId: string;
  initialLedgers?: number;
}) {
  const [ledgers, setLedgers] = useState(initialLedgers);
  const [loading, setLoading] = useState(false);

  const handleExtend = () => {
    setLoading(true);
    try {
      const updated = clientStore.extendTtl(escrowId, 518400);
      setLedgers(updated.ttlLedgers ?? ledgers + 518400);
      alert(`Storage TTL extended by 518,400 ledgers (~30 days) for Escrow #${escrowId}!`);
    } catch (err: any) {
      alert(err?.message || "Failed to extend TTL");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-mono text-neutral-500">
        Current Lease:{" "}
        <strong className="text-neutral-900 dark:text-neutral-100">
          {ledgers.toLocaleString()}
        </strong>{" "}
        Ledgers
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExtend}
        disabled={loading}
        className="h-7 text-xs"
      >
        {loading ? "Renewing..." : "+ Extend Lease (+30 Days)"}
      </Button>
    </div>
  );
}
