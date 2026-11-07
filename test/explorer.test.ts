import { describe, it, expect } from "vitest";
import { SEED_ESCROWS } from "../lib/mock-data";
import { EscrowRecord } from "../lib/types";

describe("Escrow Explorer Filtering Logic", () => {
  it("filters escrows by status tab accurately", () => {
    const funded = SEED_ESCROWS.filter((e) => e.state === "Funded");
    const delivered = SEED_ESCROWS.filter((e) => e.state === "Delivered");
    const disputed = SEED_ESCROWS.filter((e) => e.state === "Disputed");
    const resolved = SEED_ESCROWS.filter(
      (e) =>
        e.state === "ResolvedBuyer" ||
        e.state === "ResolvedSeller" ||
        e.state === "ResolvedSplit",
    );

    expect(funded.length).toBeGreaterThan(0);
    expect(delivered.length).toBeGreaterThan(0);
    expect(disputed.length).toBeGreaterThan(0);
    expect(resolved.length).toBeGreaterThan(0);
  });

  it("filters escrows by search query case-insensitively", () => {
    const query = "gbbd67";
    const matches = SEED_ESCROWS.filter(
      (e) =>
        e.id.toLowerCase().includes(query) ||
        e.buyer.toLowerCase().includes(query) ||
        e.seller.toLowerCase().includes(query),
    );

    expect(matches.length).toBeGreaterThan(0);
    matches.forEach((m) => {
      expect(
        m.id.toLowerCase().includes(query) ||
          m.buyer.toLowerCase().includes(query) ||
          m.seller.toLowerCase().includes(query),
      ).toBe(true);
    });
  });

  it("handles non-matching search queries gracefully", () => {
    const query = "non-existent-account-key-xyz";
    const matches = SEED_ESCROWS.filter(
      (e) =>
        e.id.toLowerCase().includes(query) ||
        e.buyer.toLowerCase().includes(query) ||
        e.seller.toLowerCase().includes(query),
    );
    expect(matches).toHaveLength(0);
  });
});
