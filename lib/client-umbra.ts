import { EscrowRecord, EscrowState, VerdictResolution, VaultSellerPosition } from "./types";
import { SEED_ESCROWS } from "./mock-data";
import { canDispute, canClaimTimeout } from "./format";

export function computeAmountBucket(amount: bigint): number {
  if (amount <= 100_000_000n) return 0;
  if (amount <= 1_000_000_000n) return 1;
  if (amount <= 10_000_000_000n) return 2;
  if (amount <= 100_000_000_000n) return 3;
  return 4;
}

/**
 * In-memory client store for demo, development, and testing.
 */
class UmbraClientStore {
  private escrows: EscrowRecord[] = [];
  private vaultPositions: Map<string, VaultSellerPosition> = new Map();

  constructor(initialSeed: EscrowRecord[] = SEED_ESCROWS) {
    this.escrows = initialSeed.map((e) => ({
      ...e,
      ttlLedgers: e.ttlLedgers ?? 120_000,
    }));
  }

  /**
   * Reset store to default seed dataset.
   */
  public reset(seed: EscrowRecord[] = SEED_ESCROWS): void {
    this.escrows = seed.map((e) => ({
      ...e,
      ttlLedgers: e.ttlLedgers ?? 120_000,
    }));
    this.vaultPositions.clear();
  }

  /**
   * List escrows with optional search and status filtering.
   */
  public listEscrows(filter?: { status?: string; search?: string }): EscrowRecord[] {
    let result = [...this.escrows];

    if (filter?.status && filter.status !== "All") {
      result = result.filter((e) => e.state === filter.status);
    }

    if (filter?.search) {
      const q = filter.search.trim().toLowerCase();
      result = result.filter(
        (e) =>
          e.id.toLowerCase().includes(q) ||
          e.buyer.toLowerCase().includes(q) ||
          e.seller.toLowerCase().includes(q) ||
          e.asset.toLowerCase().includes(q),
      );
    }

    return result;
  }

  /**
   * Fetch single escrow by ID.
   */
  public getEscrow(id: string): EscrowRecord | undefined {
    return this.escrows.find((e) => e.id === id);
  }

  /**
   * Create a new escrow in Funded state.
   */
  public createEscrow(params: {
    buyer: string;
    seller: string;
    asset: string;
    amount: bigint;
    deliverBy: bigint;
    confirmWindow: bigint;
    disputeWindow: bigint;
    arbiter: {
      type: "None" | "Single" | "Panel" | "Signed";
      address?: string;
      members?: string[];
      threshold?: number;
    };
    termsHash: string;
    disputeBond?: bigint;
  }): EscrowRecord {
    const nextId = (this.escrows.length + 1).toString();
    const newRecord: EscrowRecord = {
      id: nextId,
      buyer: params.buyer,
      seller: params.seller,
      asset: params.asset,
      amount: params.amount,
      deliverBy: params.deliverBy,
      confirmWindow: params.confirmWindow,
      disputeWindow: params.disputeWindow,
      state: "Funded",
      arbiter: {
        ...params.arbiter,
        signatures: [],
      },
      termsHash: params.termsHash,
      disputeBond: params.disputeBond ?? 0n,
      ttlLedgers: 518_400,
    };
    this.escrows.unshift(newRecord);
    return { ...newRecord };
  }

  /**
   * Seller submits delivery proof and marks escrow Delivered.
   */
  public markDelivered(
    id: string,
    proofHash: string,
    nowTimestamp = BigInt(Math.floor(Date.now() / 1000)),
  ): EscrowRecord {
    const record = this.getEscrow(id);
    if (!record) throw new Error(`Escrow #${id} not found`);
    if (record.state !== "Funded") {
      throw new Error(`Cannot deliver escrow in state: ${record.state}`);
    }

    record.state = "Delivered";
    record.proofHash = proofHash;
    record.deliveredAt = nowTimestamp;
    return { ...record };
  }

  /**
   * Buyer releases escrow funds to seller.
   */
  public releaseFunds(id: string): EscrowRecord {
    const record = this.getEscrow(id);
    if (!record) throw new Error(`Escrow #${id} not found`);
    if (record.state !== "Funded" && record.state !== "Delivered") {
      throw new Error(`Cannot release escrow in state: ${record.state}`);
    }

    record.state = "Released";
    record.astrolabeRecord = {
      amountBucket: computeAmountBucket(record.amount),
      attestedAt: Date.now(),
    };
    return { ...record };
  }

  /**
   * Buyer raises a dispute within the dispute window.
   */
  public raiseDispute(
    id: string,
    reasonHash: string,
    nowTimestamp = BigInt(Math.floor(Date.now() / 1000)),
  ): EscrowRecord {
    const record = this.getEscrow(id);
    if (!record) throw new Error(`Escrow #${id} not found`);
    if (record.state !== "Delivered") {
      throw new Error(`Cannot dispute escrow in state: ${record.state}`);
    }
    if (!canDispute(record, nowTimestamp)) {
      throw new Error("Dispute window has expired or no arbiter is configured");
    }

    record.state = "Disputed";
    record.reasonHash = reasonHash;
    return { ...record };
  }

  /**
   * Seller claims timeout after confirm window elapses without dispute.
   */
  public claimTimeout(
    id: string,
    nowTimestamp = BigInt(Math.floor(Date.now() / 1000)),
  ): EscrowRecord {
    const record = this.getEscrow(id);
    if (!record) throw new Error(`Escrow #${id} not found`);
    if (record.state !== "Delivered") {
      throw new Error(`Cannot claim timeout in state: ${record.state}`);
    }
    if (!canClaimTimeout(record, nowTimestamp)) {
      throw new Error("Confirm window has not elapsed yet");
    }

    record.state = "Released";
    record.astrolabeRecord = {
      amountBucket: computeAmountBucket(record.amount),
      attestedAt: Date.now(),
    };
    return { ...record };
  }

  /**
   * Arbiter resolves dispute with verdict.
   */
  public resolveDispute(id: string, verdict: VerdictResolution): EscrowRecord {
    const record = this.getEscrow(id);
    if (!record) throw new Error(`Escrow #${id} not found`);
    if (record.state !== "Disputed") {
      throw new Error(`Cannot resolve escrow in state: ${record.state}`);
    }

    let nextState: EscrowState;
    switch (verdict.type) {
      case "RefundBuyer":
        nextState = "ResolvedBuyer";
        break;
      case "ReleaseSeller":
        nextState = "ResolvedSeller";
        break;
      case "Split":
        nextState = "ResolvedSplit";
        break;
      default:
        throw new Error(`Unknown verdict type: ${(verdict as any).type}`);
    }

    record.state = nextState;
    record.astrolabeRecord = {
      amountBucket: computeAmountBucket(record.amount),
      attestedAt: Date.now(),
    };
    return { ...record };
  }

  /**
   * Panel member signs a verdict. If threshold signatures reached, resolves.
   */
  public signPanelVerdict(
    id: string,
    memberAddress: string,
    verdict: VerdictResolution,
  ): EscrowRecord {
    const record = this.getEscrow(id);
    if (!record) throw new Error(`Escrow #${id} not found`);
    if (record.arbiter.type !== "Panel") {
      throw new Error("Escrow does not use panel arbitration");
    }

    const members = record.arbiter.members ?? [];
    if (!members.includes(memberAddress)) {
      throw new Error("Address is not a member of the arbitration panel");
    }

    const currentSigs = record.arbiter.signatures ?? [];
    if (currentSigs.includes(memberAddress)) {
      throw new Error("Member has already signed this verdict");
    }

    const updatedSigs = [...currentSigs, memberAddress];
    record.arbiter.signatures = updatedSigs;

    const threshold = record.arbiter.threshold ?? members.length;
    if (updatedSigs.length >= threshold) {
      return this.resolveDispute(id, verdict);
    }

    return { ...record };
  }

  /**
   * Extends storage TTL for active escrow.
   */
  public extendTtl(id: string, ledgers = 518_400): EscrowRecord {
    const record = this.getEscrow(id);
    if (!record) throw new Error(`Escrow #${id} not found`);
    record.ttlLedgers = (record.ttlLedgers ?? 120_000) + ledgers;
    return { ...record };
  }

  /**
   * Refund created/unfunded escrow.
   */
  public refundCreated(id: string): EscrowRecord {
    const record = this.getEscrow(id);
    if (!record) throw new Error(`Escrow #${id} not found`);
    if (record.state !== "Created" && record.state !== "Funded") {
      throw new Error(`Cannot cancel/refund escrow in state: ${record.state}`);
    }

    record.state = "Refunded";
    record.astrolabeRecord = {
      amountBucket: computeAmountBucket(record.amount),
      attestedAt: Date.now(),
    };
    return { ...record };
  }

  /**
   * Collateral Vault operations.
   */
  public getVaultPosition(seller: string, asset: string): VaultSellerPosition {
    const key = `${seller}:${asset}`;
    let pos = this.vaultPositions.get(key);
    if (!pos) {
      pos = {
        seller,
        asset,
        totalCollateral: 100_000_0000000n, // 100k demo tokens
        lockedCollateral: 20_000_0000000n,
        availableCollateral: 80_000_0000000n,
        locks: [
          {
            escrowId: "1",
            amount: 20_000_0000000n,
            expiresAt: Math.floor(Date.now() / 1000) + 86400,
          },
        ],
      };
      this.vaultPositions.set(key, pos);
    }
    return { ...pos };
  }

  public depositVault(seller: string, asset: string, amount: bigint): VaultSellerPosition {
    const pos = this.getVaultPosition(seller, asset);
    pos.totalCollateral += amount;
    pos.availableCollateral += amount;
    this.vaultPositions.set(`${seller}:${asset}`, pos);
    return { ...pos };
  }

  public withdrawVault(seller: string, asset: string, amount: bigint): VaultSellerPosition {
    const pos = this.getVaultPosition(seller, asset);
    if (amount > pos.availableCollateral) {
      throw new Error("Insufficient available unencumbered collateral");
    }
    pos.totalCollateral -= amount;
    pos.availableCollateral -= amount;
    this.vaultPositions.set(`${seller}:${asset}`, pos);
    return { ...pos };
  }

  public lockVault(
    seller: string,
    asset: string,
    amount: bigint,
    escrowId: string,
    expiresAt: number,
  ): VaultSellerPosition {
    const pos = this.getVaultPosition(seller, asset);
    if (amount > pos.availableCollateral) {
      throw new Error("Insufficient unencumbered collateral to lock");
    }
    pos.lockedCollateral += amount;
    pos.availableCollateral -= amount;
    pos.locks.push({ escrowId, amount, expiresAt });
    this.vaultPositions.set(`${seller}:${asset}`, pos);
    return { ...pos };
  }

  public releaseVaultLock(seller: string, escrowId: string): VaultSellerPosition {
    for (const [key, pos] of this.vaultPositions.entries()) {
      if (pos.seller === seller) {
        const lockIndex = pos.locks.findIndex((l) => l.escrowId === escrowId);
        if (lockIndex >= 0) {
          const lock = pos.locks[lockIndex];
          pos.lockedCollateral -= lock.amount;
          pos.availableCollateral += lock.amount;
          pos.locks.splice(lockIndex, 1);
          this.vaultPositions.set(key, pos);
          return { ...pos };
        }
      }
    }
    throw new Error(`Lock for escrow #${escrowId} not found`);
  }
}

export const clientStore = new UmbraClientStore();
export { UmbraClientStore };
