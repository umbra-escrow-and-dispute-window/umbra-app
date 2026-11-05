import { describe, it, expect } from "vitest";
import {
  formatStroops,
  parseStroops,
  truncateAddress,
  truncateHash,
  formatDuration,
  formatTimestamp,
  isTerminalState,
  canDispute,
  canClaimTimeout,
} from "../lib/format";
import { EscrowRecord } from "../lib/types";

describe("Formatting and Conversion Utilities", () => {
  it("formats stroop amounts to human decimal strings", () => {
    expect(formatStroops(10_000_000n)).toBe("1");
    expect(formatStroops(15_500_000n)).toBe("1.55");
    expect(formatStroops(100n)).toBe("0.00001");
    expect(formatStroops(0n)).toBe("0");
    expect(formatStroops(-10_000_000n)).toBe("-1");
    expect(formatStroops("500000000")).toBe("50");
  });

  it("parses human decimal strings to stroops bigint", () => {
    expect(parseStroops("1")).toBe(10_000_000n);
    expect(parseStroops("1.55")).toBe(15_500_000n);
    expect(parseStroops("0.00001")).toBe(100n);
    expect(parseStroops("50")).toBe(500_000_000n);
  });

  it("throws on invalid stroop parse inputs", () => {
    expect(() => parseStroops("abc")).toThrow("Invalid numeric amount");
    expect(() => parseStroops("")).toThrow("Invalid numeric amount");
  });

  it("truncates Stellar addresses appropriately", () => {
    const address = "CA3W2JO6TD3JCPTNUSNSMNROYM6NSSQID55H5BKO6GLQQKNZ5KKEIZZG";
    expect(truncateAddress(address)).toBe("CA3W2...IZZG");
    expect(truncateAddress(address, 6)).toBe("CA3W2JO...KEIZZG");
    expect(truncateAddress("SHORT")).toBe("SHORT");
  });

  it("truncates 32-byte hashes", () => {
    const hash = "2af58aaebdd51405926baeb472bb7dd8a75163636bdaa084c6766e1c65052d72";
    expect(truncateHash(hash)).toBe("2af58a...052d72");
    expect(truncateHash("short")).toBe("short");
  });

  it("formats second durations into readable strings", () => {
    expect(formatDuration(0)).toBe("0s");
    expect(formatDuration(-10)).toBe("0s");
    expect(formatDuration(45)).toBe("45s");
    expect(formatDuration(3600)).toBe("1h");
    expect(formatDuration(3665)).toBe("1h 1m");
    expect(formatDuration(90000)).toBe("1d 1h");
  });

  it("handles formatTimestamp edge cases", () => {
    expect(formatTimestamp(undefined)).toBe("N/A");
    expect(formatTimestamp(0)).toBe("N/A");
    expect(formatTimestamp(-100n)).toBe("N/A");
    expect(formatTimestamp(1700000000)).toContain("2023");
  });

  it("correctly flags terminal states", () => {
    expect(isTerminalState("Released")).toBe(true);
    expect(isTerminalState("Refunded")).toBe(true);
    expect(isTerminalState("ResolvedBuyer")).toBe(true);
    expect(isTerminalState("ResolvedSeller")).toBe(true);
    expect(isTerminalState("ResolvedSplit")).toBe(true);

    expect(isTerminalState("Created")).toBe(false);
    expect(isTerminalState("Funded")).toBe(false);
    expect(isTerminalState("Delivered")).toBe(false);
    expect(isTerminalState("Disputed")).toBe(false);
  });
});

describe("State Machine Timeout & Dispute Rules", () => {
  const baseEscrow: EscrowRecord = {
    id: "1",
    buyer: "GBYER...",
    seller: "GSELLER...",
    asset: "CASSET...",
    amount: 10_000_000n,
    deliverBy: 1_000_000n,
    confirmWindow: 86400n,
    disputeWindow: 86400n,
    deliveredAt: 100_000n,
    state: "Delivered",
    arbiter: { type: "Single", address: "GARBITER..." },
    termsHash: "hash1",
  };

  it("allows dispute within dispute window when arbiter is configured", () => {
    expect(canDispute(baseEscrow, 150_000n)).toBe(true);
    // After deadline (100_000 + 86_400 = 186_400)
    expect(canDispute(baseEscrow, 190_000n)).toBe(false);
  });

  it("rejects dispute if arbiter type is None", () => {
    const noArbiterEscrow: EscrowRecord = {
      ...baseEscrow,
      arbiter: { type: "None" },
    };
    expect(canDispute(noArbiterEscrow, 150_000n)).toBe(false);
  });

  it("rejects dispute if escrow is not in Delivered state or missing deliveredAt", () => {
    const createdEscrow: EscrowRecord = {
      ...baseEscrow,
      state: "Funded",
    };
    expect(canDispute(createdEscrow, 150_000n)).toBe(false);

    const missingDeliveryTimeEscrow: EscrowRecord = {
      ...baseEscrow,
      deliveredAt: undefined,
    };
    expect(canDispute(missingDeliveryTimeEscrow, 150_000n)).toBe(false);
  });

  it("rejects timeout claim if escrow is not in Delivered state or missing deliveredAt", () => {
    const releasedEscrow: EscrowRecord = {
      ...baseEscrow,
      state: "Released",
    };
    expect(canClaimTimeout(releasedEscrow, 200_000n)).toBe(false);

    const missingDeliveryTimeEscrow: EscrowRecord = {
      ...baseEscrow,
      deliveredAt: undefined,
    };
    expect(canClaimTimeout(missingDeliveryTimeEscrow, 200_000n)).toBe(false);
  });

  it("allows timeout claim only after confirm window elapses", () => {
    // Before confirm window (100_000 + 86_400 = 186_400)
    expect(canClaimTimeout(baseEscrow, 150_000n)).toBe(false);
    // At and after confirm window
    expect(canClaimTimeout(baseEscrow, 186_400n)).toBe(true);
    expect(canClaimTimeout(baseEscrow, 200_000n)).toBe(true);
  });
});
