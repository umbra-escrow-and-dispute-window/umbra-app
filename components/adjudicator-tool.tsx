"use client";

import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function AdjudicatorTool({
  escrowId,
  verdictType,
  buyerBps = 0,
}: {
  escrowId: string;
  verdictType: "RefundBuyer" | "ReleaseSeller" | "Split";
  buyerBps?: number;
}) {
  const [copied, setCopied] = useState(false);

  // Compute canonical payload representation
  const payloadHex = useMemo(() => {
    // 19 bytes domain + 8 bytes id + 1 byte tag + 4 bytes bps
    const domainHex = Buffer.from("umbra:adjudicate:v1", "utf8").toString("hex");
    const idHex = BigInt(escrowId || 0).toString(16).padStart(16, "0");
    const tagHex = verdictType === "RefundBuyer" ? "00" : verdictType === "ReleaseSeller" ? "01" : "02";
    const bpsHex = (verdictType === "Split" ? buyerBps : 0).toString(16).padStart(8, "0");
    return `${domainHex}${idHex}${tagHex}${bpsHex}`;
  }, [escrowId, verdictType, buyerBps]);

  const copyPayload = () => {
    navigator.clipboard.writeText(payloadHex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-amber-200 dark:border-amber-900 bg-amber-50/20 dark:bg-amber-950/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <span>Cryptographic Adjudicator Payload</span>
            <Badge variant="outline" className="text-[10px] text-amber-700 dark:text-amber-300">
              32 Bytes Canonical
            </Badge>
          </CardTitle>
          <Button variant="outline" size="sm" onClick={copyPayload} className="h-7 text-xs">
            {copied ? "Copied!" : "Copy Payload Hex"}
          </Button>
        </div>
        <CardDescription className="text-xs">
          Canonical binary format: <code className="font-mono">domain || id || tag || buyer_bps</code>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-2.5 rounded bg-neutral-900 text-neutral-100 font-mono text-[11px] break-all select-all">
          0x{payloadHex}
        </div>
      </CardContent>
    </Card>
  );
}
