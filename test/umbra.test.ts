import { describe, it, expect, afterEach } from "vitest";
import {
  resolveDeployment,
  getEscrowContractId,
  getNetworkPassphrase,
  getRpcUrl,
} from "../lib/umbra";

describe("Deployment Resolution", () => {
  const originalRpc = process.env.NEXT_PUBLIC_SOROBAN_RPC_URL;

  afterEach(() => {
    process.env.NEXT_PUBLIC_SOROBAN_RPC_URL = originalRpc;
  });

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

  it("resolves default and custom RPC URLs", () => {
    delete process.env.NEXT_PUBLIC_SOROBAN_RPC_URL;
    expect(getRpcUrl()).toBe("https://soroban-testnet.stellar.org");

    process.env.NEXT_PUBLIC_SOROBAN_RPC_URL = "https://custom-rpc.example.com";
    expect(getRpcUrl()).toBe("https://custom-rpc.example.com");
  });
});
