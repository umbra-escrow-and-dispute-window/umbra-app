import { describe, it, expect } from "vitest";
import { UmbraClientStore } from "../lib/client-umbra";
import {
  hashTermsDocument,
  hashDeliveryProofDocument,
  hashDisputeReasonDocument,
  verifyDocument,
} from "../lib/hashing";
import { parseStroops, formatStroops, formatBps, isTerminalState } from "../lib/format";

describe("End-to-End Escrow Protocol Lifecycle Integration", () => {
  it("executes full lifecycle: create -> deliver -> dispute -> arbiter split resolution", () => {
    const store = new UmbraClientStore([]);

    // 1. Buyer & Seller parameters
    const buyerKey = "GBBD67VFO7CTP3S5BX7A5UOHQLWJ2C3Z7G4V5N3A2B1C0D9E8F7A6B5C";
    const sellerKey = "GAKF4W2N3M5L6K7J8H9G0F1E2D3C4B5A6B7C8D9E0F1A2B3C4D5E6F7A";
    const arbiterKey = "GARB4W2N3M5L6K7J8H9G0F1E2D3C4B5A6B7C8D9E0F1A2B3C4D5E6F7A";

    // 2. Off-chain terms agreement
    const termsDocument = {
      title: "Smart Contract Security Audit",
      scope: ["contracts/goal-escrow"],
      deliverables: "Formal verification report",
    };
    const termsHash = hashTermsDocument(termsDocument);

    // Verify terms hash cryptographically
    const termsCheck = verifyDocument("terms", termsDocument, termsHash);
    expect(termsCheck.match).toBe(true);

    // 3. Buyer creates and funds escrow
    const amountStroops = parseStroops("50"); // 50 XLM
    const escrow = store.createEscrow({
      buyer: buyerKey,
      seller: sellerKey,
      asset: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
      amount: amountStroops,
      deliverBy: 2_000_000n,
      confirmWindow: 86_400n, // 1 day
      disputeWindow: 86_400n, // 1 day
      arbiter: { type: "Single", address: arbiterKey },
      termsHash,
    });

    expect(escrow.state).toBe("Funded");
    expect(formatStroops(escrow.amount)).toBe("50");
    expect(isTerminalState(escrow.state)).toBe(false);

    // 4. Seller delivers proof
    const deliveryProofDoc = {
      reportUrl: "ipfs://QmZtmD2qtQgWZPQjkdH9UVbY3Zd6BaZs4XdZ9W5uT21P34",
      auditedCommit: "eaf119e",
    };
    const proofHash = hashDeliveryProofDocument(deliveryProofDoc);
    const proofCheck = verifyDocument("deliveryProof", deliveryProofDoc, proofHash);
    expect(proofCheck.match).toBe(true);

    const deliveredEscrow = store.markDelivered(escrow.id, proofHash, 1_500_000n);
    expect(deliveredEscrow.state).toBe("Delivered");
    expect(deliveredEscrow.proofHash).toBe(proofHash);

    // 5. Buyer files dispute within dispute window
    const disputeClaimDoc = {
      issue: "Formal verification proofs missing appendix section",
      requestedRemedy: "Partial refund",
    };
    const reasonHash = hashDisputeReasonDocument(disputeClaimDoc);
    const reasonCheck = verifyDocument("disputeReason", disputeClaimDoc, reasonHash);
    expect(reasonCheck.match).toBe(true);

    const disputedEscrow = store.raiseDispute(escrow.id, reasonHash, 1_550_000n);
    expect(disputedEscrow.state).toBe("Disputed");
    expect(disputedEscrow.reasonHash).toBe(reasonHash);

    // 6. Arbiter inspects evidence and executes 60/40 Split verdict
    const resolvedEscrow = store.resolveDispute(escrow.id, {
      type: "Split",
      buyerBps: 6000, // 60%
    });

    expect(resolvedEscrow.state).toBe("ResolvedSplit");
    expect(isTerminalState(resolvedEscrow.state)).toBe(true);
    expect(formatBps(6000)).toBe("60.00%");
  });
});
