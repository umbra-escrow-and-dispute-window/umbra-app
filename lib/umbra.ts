import fs from "node:fs";
import { deployments, Deployment } from "@umbra-escrow-and-dispute-window/umbra-sdk";

/**
 * Resolve deployment configuration according to docs/multi-repo.md:
 * 1. Check UMBRA_DEPLOYMENTS env var.
 * 2. Check CONSTELLATION_DEPLOYMENTS env var.
 * 3. Fallback to SDK vendored deployment.
 */
export function resolveDeployment(): Deployment {
  const envPath = process.env.UMBRA_DEPLOYMENTS || process.env.CONSTELLATION_DEPLOYMENTS;
  if (envPath && typeof window === "undefined") {
    try {
      if (fs.existsSync(envPath)) {
        const raw = fs.readFileSync(envPath, "utf8");
        return JSON.parse(raw) as Deployment;
      }
    } catch {
      // Fallback to vendored deployment on any read/parse error
    }
  }
  return deployments;
}

/**
 * Returns the active Escrow contract ID.
 */
export function getEscrowContractId(): string {
  const dep = resolveDeployment();
  const id = dep.contracts?.escrow;
  if (!id) {
    throw new Error("Missing escrow contract address in deployment configuration");
  }
  return id;
}

/**
 * Returns active network passphrase.
 */
export function getNetworkPassphrase(): string {
  const dep = resolveDeployment();
  return dep.networkPassphrase || "Test SDF Network ; September 2015";
}

/**
 * Default Soroban RPC URL.
 */
export function getRpcUrl(): string {
  return process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org";
}
