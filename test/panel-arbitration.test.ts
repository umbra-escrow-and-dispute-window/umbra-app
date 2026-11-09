import { describe, it, expect, beforeEach } from "vitest";
import { UmbraClientStore } from "../lib/client-umbra";
import { EscrowRecord } from "../lib/types";

describe("Panel arbitration aggregation and threshold validation", () => {
  let store: UmbraClientStore;
  const memberA = "GA111111111111111111111111111111111111111111111111111111";
  const memberB = "GB222222222222222222222222222222222222222222222222222222";
  const memberC = "GC333333333333333333333333333333333333333333333333333333";

  const panelEscrow: EscrowRecord = {
    id: "500",
    buyer: "GBUYER",
    seller: "GSELLER",
    asset: "CASSET",
    amount: 10_000_000n,
    deliverBy: 1_000_000n,
    confirmWindow: 86_400n,
    disputeWindow: 86_400n,
    state: "Disputed",
    arbiter: {
      type: "Panel",
      members: [memberA, memberB, memberC],
      threshold: 2,
      signatures: [],
    },
    termsHash: "hash-terms",
  };

  beforeEach(() => {
    store = new UmbraClientStore([
      {
        ...panelEscrow,
        arbiter: {
          ...panelEscrow.arbiter,
          signatures: [],
        },
      },
    ]);
  });

  it("records signatures without resolving until threshold is met", () => {
    const res1 = store.signPanelVerdict("500", memberA, { type: "ReleaseSeller" });
    expect(res1.state).toBe("Disputed");
    expect(res1.arbiter.signatures).toEqual([memberA]);

    const res2 = store.signPanelVerdict("500", memberB, { type: "ReleaseSeller" });
    expect(res2.state).toBe("ResolvedSeller");
    expect(res2.arbiter.signatures).toEqual([memberA, memberB]);
  });

  it("rejects duplicate signatures from the same member", () => {
    store.signPanelVerdict("500", memberA, { type: "ReleaseSeller" });
    expect(() =>
      store.signPanelVerdict("500", memberA, { type: "ReleaseSeller" }),
    ).toThrow("Member has already signed this verdict");
  });

  it("rejects sign-offs from unauthorized addresses not in the panel", () => {
    expect(() =>
      store.signPanelVerdict("500", "G_INTRUDER", { type: "ReleaseSeller" }),
    ).toThrow("Address is not a member of the arbitration panel");
  });
});
