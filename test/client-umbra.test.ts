import { describe, it, expect, beforeEach } from "vitest";
import { UmbraClientStore } from "../lib/client-umbra";
import { EscrowRecord } from "../lib/types";

describe("UmbraClientStore State Machine Transitions", () => {
  let store: UmbraClientStore;

  const mockEscrow: EscrowRecord = {
    id: "100",
    buyer: "GBBD67VFO7CTP3S5BX7A5UOHQLWJ2C3Z7G4V5N3A2B1C0D9E8F7A6B5C",
    seller: "GAKF4W2N3M5L6K7J8H9G0F1E2D3C4B5A6B7C8D9E0F1A2B3C4D5E6F7A",
    asset: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
    amount: 100_000_000n,
    deliverBy: 2_000_000n,
    confirmWindow: 86_400n,
    disputeWindow: 86_400n,
    state: "Funded",
    arbiter: {
      type: "Single",
      address: "GARB4W2N3M5L6K7J8H9G0F1E2D3C4B5A6B7C8D9E0F1A2B3C4D5E6F7A",
    },
    termsHash: "terms-hash-100",
  };

  beforeEach(() => {
    store = new UmbraClientStore([mockEscrow]);
  });

  it("lists and filters escrows by status and search query", () => {
    expect(store.listEscrows()).toHaveLength(1);
    expect(store.listEscrows({ status: "Funded" })).toHaveLength(1);
    expect(store.listEscrows({ status: "Delivered" })).toHaveLength(0);
    expect(store.listEscrows({ search: "100" })).toHaveLength(1);
    expect(store.listEscrows({ search: "non-existent" })).toHaveLength(0);
  });

  it("creates a new escrow in Funded state", () => {
    const created = store.createEscrow({
      buyer: "GBUYER...",
      seller: "GSELLER...",
      asset: "CASSET...",
      amount: 50_000_000n,
      deliverBy: 3_000_000n,
      confirmWindow: 86_400n,
      disputeWindow: 86_400n,
      arbiter: { type: "None" },
      termsHash: "terms-hash-new",
    });

    expect(created.state).toBe("Funded");
    expect(created.termsHash).toBe("terms-hash-new");
    expect(store.listEscrows()).toHaveLength(2);
  });

  it("transitions Funded -> Delivered with proof hash", () => {
    const delivered = store.markDelivered("100", "proof-hash-100", 1_500_000n);
    expect(delivered.state).toBe("Delivered");
    expect(delivered.proofHash).toBe("proof-hash-100");
    expect(delivered.deliveredAt).toBe(1_500_000n);
  });

  it("allows buyer to release funds directly to seller", () => {
    const released = store.releaseFunds("100");
    expect(released.state).toBe("Released");
  });

  it("handles dispute within dispute window", () => {
    store.markDelivered("100", "proof-hash-100", 1_000_000n);
    // Dispute within 86,400s (e.g. at 1,050,000s)
    const disputed = store.raiseDispute("100", "reason-hash-100", 1_050_000n);
    expect(disputed.state).toBe("Disputed");
    expect(disputed.reasonHash).toBe("reason-hash-100");
  });

  it("rejects dispute after dispute window expires", () => {
    store.markDelivered("100", "proof-hash-100", 1_000_000n);
    // Exceeded 86,400s (e.g. at 1,100_000s)
    expect(() => store.raiseDispute("100", "reason-hash-100", 1_100_000n)).toThrow(
      "Dispute window has expired",
    );
  });

  it("allows seller to claim timeout after confirm window elapses", () => {
    store.markDelivered("100", "proof-hash-100", 1_000_000n);
    // Before confirm window elapses
    expect(() => store.claimTimeout("100", 1_050_000n)).toThrow(
      "Confirm window has not elapsed yet",
    );
    // After confirm window (1_086_400n+)
    const claimed = store.claimTimeout("100", 1_086_401n);
    expect(claimed.state).toBe("Released");
  });

  it("resolves dispute with various arbiter verdicts", () => {
    store.markDelivered("100", "proof-hash-100", 1_000_000n);
    store.raiseDispute("100", "reason-hash-100", 1_050_000n);

    const resolvedBuyer = store.resolveDispute("100", { type: "RefundBuyer" });
    expect(resolvedBuyer.state).toBe("ResolvedBuyer");

    store.reset([{ ...mockEscrow, state: "Disputed" }]);
    const resolvedSeller = store.resolveDispute("100", { type: "ReleaseSeller" });
    expect(resolvedSeller.state).toBe("ResolvedSeller");

    store.reset([{ ...mockEscrow, state: "Disputed" }]);
    const resolvedSplit = store.resolveDispute("100", { type: "Split", buyerBps: 5000 });
    expect(resolvedSplit.state).toBe("ResolvedSplit");
  });

  it("cancels and refunds funded escrow before delivery", () => {
    const refunded = store.refundCreated("100");
    expect(refunded.state).toBe("Refunded");
  });
});
