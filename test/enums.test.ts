import { describe, it, expect } from "vitest";
import { getStateBadgeVariant } from "../lib/format";
import { EscrowState } from "../lib/types";

describe("State Badge Color Mappings", () => {
  it("assigns appropriate badges to all protocol states", () => {
    const states: { state: EscrowState; variant: string }[] = [
      { state: "Created", variant: "outline" },
      { state: "Funded", variant: "secondary" },
      { state: "Delivered", variant: "warning" },
      { state: "Released", variant: "success" },
      { state: "Disputed", variant: "destructive" },
      { state: "ResolvedBuyer", variant: "default" },
      { state: "ResolvedSeller", variant: "success" },
      { state: "ResolvedSplit", variant: "secondary" },
      { state: "Refunded", variant: "default" },
    ];

    for (const { state, variant } of states) {
      expect(getStateBadgeVariant(state)).toBe(variant);
    }
  });
});
