import { describe, it, expect, beforeEach } from "vitest";
import { UmbraClientStore } from "../lib/client-umbra";

describe("Seller Collateral Vault operations in store", () => {
  let store: UmbraClientStore;
  const seller = "GSELLER_VAULT_TEST";
  const asset = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

  beforeEach(() => {
    store = new UmbraClientStore([]);
  });

  it("retrieves baseline vault position", () => {
    const pos = store.getVaultPosition(seller, asset);
    expect(pos.seller).toBe(seller);
    expect(pos.asset).toBe(asset);
    expect(pos.totalCollateral).toBeGreaterThan(0n);
    expect(pos.availableCollateral).toBeLessThanOrEqual(pos.totalCollateral);
  });

  it("deposits collateral and updates available balance", () => {
    const initial = store.getVaultPosition(seller, asset);
    const updated = store.depositVault(seller, asset, 50_000_0000000n);

    expect(updated.totalCollateral).toBe(initial.totalCollateral + 50_000_0000000n);
    expect(updated.availableCollateral).toBe(initial.availableCollateral + 50_000_0000000n);
  });

  it("withdraws unencumbered balance and prevents overdraw", () => {
    const pos = store.getVaultPosition(seller, asset);
    const withdrawAmount = pos.availableCollateral / 2n;

    const after = store.withdrawVault(seller, asset, withdrawAmount);
    expect(after.totalCollateral).toBe(pos.totalCollateral - withdrawAmount);

    // Overdraw fails
    expect(() => store.withdrawVault(seller, asset, after.availableCollateral + 1n)).toThrow(
      "Insufficient available unencumbered collateral",
    );
  });

  it("locks and releases collateral for instant-release escrows", () => {
    const pos = store.getVaultPosition(seller, asset);
    const lockAmount = 10_000_0000000n;
    const expiresAt = Math.floor(Date.now() / 1000) + 3600;

    const locked = store.lockVault(seller, asset, lockAmount, "777", expiresAt);
    expect(locked.lockedCollateral).toBe(pos.lockedCollateral + lockAmount);
    expect(locked.availableCollateral).toBe(pos.availableCollateral - lockAmount);
    expect(locked.locks.some((l) => l.escrowId === "777")).toBe(true);

    const released = store.releaseVaultLock(seller, "777");
    expect(released.lockedCollateral).toBe(pos.lockedCollateral);
    expect(released.availableCollateral).toBe(pos.availableCollateral);
    expect(released.locks.some((l) => l.escrowId === "777")).toBe(false);
  });
});
