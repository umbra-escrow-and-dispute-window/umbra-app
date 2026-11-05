import { describe, it, expect } from "vitest";
import { resolveDeployment, getEscrowContractId, getNetworkPassphrase } from "../lib/umbra";

describe("Deployment Resolution", () => {
  it("resolves vendored testnet deployment by default", () => {
    const deployment = resolveDeployment();
    expect(deployment.network).toBe("testnet");
    expect(deployment.contracts.escrow).toBeDefined();
    expect(deployment.contracts.escrow.startsWith("C")).toBe(true);
  });

  it("retrieves the active escrow contract id", () => {
    const contractId = getEscrowContractId();
    expect(contractId).toBe("CA3W2JO6TD3JCPTNUSNSMNROYM6NSSQID55H5BKO6GLQQKNZ5KKEIZZG");
  });

  it("retrieves the active network passphrase", () => {
    const passphrase = getNetworkPassphrase();
    expect(passphrase).toBe("Test SDF Network ; September 2015");
  });
});
