"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { verifyDocument, parseRawDocumentInput, canonicalize, DOMAIN } from "@/lib/hashing";

function VerifyContent() {
  const searchParams = useSearchParams();
  const initialHash = searchParams?.get("hash") || "";
  const initialKind = searchParams?.get("kind") as
    "terms" | "deliveryProof" | "disputeReason" | null;

  const [kind, setKind] = useState<"terms" | "deliveryProof" | "disputeReason">(
    initialKind || "terms",
  );
  const [expectedHash, setExpectedHash] = useState(initialHash);
  const [rawText, setRawText] = useState("");
  const [result, setResult] = useState<{
    computedHash: string;
    canonicalJson: string;
    match: boolean;
  } | null>(null);

  useEffect(() => {
    if (initialHash) {
      setExpectedHash(initialHash);
    }
    if (initialKind) {
      setKind(initialKind);
    }
  }, [initialHash, initialKind]);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) return;

    try {
      const doc = parseRawDocumentInput(rawText);
      const canonical = canonicalize(doc);
      const verifyRes = verifyDocument(kind, doc, expectedHash || "");

      setResult({
        computedHash: verifyRes.computedHash,
        canonicalJson: canonical,
        match: verifyRes.match,
      });
    } catch (err: any) {
      alert(`Error during document processing: ${err?.message || err}`);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Off-Chain Document Verifier</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Verify whether an agreement document, delivery proof, or dispute claim matches the 32-byte
          SHA-256 hash committed on the Stellar ledger.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Document Verification Parameters</CardTitle>
          <CardDescription>
            Conforms strictly to Umbra specification RFC 8785 JSON canonicalization and domain
            separation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-6">
            {/* Kind Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-500 mb-2">
                Document Domain Type
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setKind("terms")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    kind === "terms"
                      ? "bg-blue-600 text-white"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                  }`}
                >
                  Terms ({DOMAIN.terms})
                </button>
                <button
                  type="button"
                  onClick={() => setKind("deliveryProof")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    kind === "deliveryProof"
                      ? "bg-blue-600 text-white"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                  }`}
                >
                  Delivery Proof ({DOMAIN.deliveryProof})
                </button>
                <button
                  type="button"
                  onClick={() => setKind("disputeReason")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    kind === "disputeReason"
                      ? "bg-blue-600 text-white"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                  }`}
                >
                  Dispute Reason ({DOMAIN.disputeReason})
                </button>
              </div>
            </div>

            {/* Expected On-Chain Hash */}
            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1">
                Expected On-Chain Hash (32-Byte Hex)
              </label>
              <Input
                type="text"
                placeholder="e.g. 2af58aaebdd51405926baeb472bb7dd8a75163636bdaa084c6766e1c65052d72"
                value={expectedHash}
                onChange={(e) => setExpectedHash(e.target.value)}
                className="font-mono text-xs"
              />
            </div>

            {/* Raw Text / JSON Document */}
            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1">
                Document Body (JSON or Plain Text)
              </label>
              <textarea
                rows={6}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder='{"milestone": 1, "description": "Complete Soroban smart contract audit"}'
                className="w-full rounded-md border border-neutral-800 bg-neutral-900 p-3 font-mono text-xs text-neutral-100 placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
                required
              />
            </div>

            <Button type="submit" className="w-full sm:w-auto">
              Compute & Verify Hash
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Verification Result */}
      {result && (
        <Card
          className={`border-2 ${result.match ? "border-emerald-500/50" : "border-neutral-800"}`}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Verification Result</CardTitle>
              {expectedHash ? (
                result.match ? (
                  <Badge variant="success">Verified Match</Badge>
                ) : (
                  <Badge variant="destructive">Hash Mismatch</Badge>
                )
              ) : (
                <Badge variant="outline">Hash Generated</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-xs font-mono">
            <div>
              <p className="font-sans font-semibold text-neutral-500 uppercase">Computed Hash</p>
              <p className="p-2 mt-1 rounded bg-neutral-100 dark:bg-neutral-900 break-all text-neutral-900 dark:text-neutral-100">
                {result.computedHash}
              </p>
            </div>

            {expectedHash && (
              <div>
                <p className="font-sans font-semibold text-neutral-500 uppercase">Expected Hash</p>
                <p className="p-2 mt-1 rounded bg-neutral-100 dark:bg-neutral-900 break-all text-neutral-900 dark:text-neutral-100">
                  {expectedHash}
                </p>
              </div>
            )}

            <div>
              <p className="font-sans font-semibold text-neutral-500 uppercase">
                Canonical Payload Representation
              </p>
              <pre className="p-2 mt-1 rounded bg-neutral-100 dark:bg-neutral-900 overflow-x-auto text-neutral-600 dark:text-neutral-400">
                {result.canonicalJson}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-8">Loading verifier...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
