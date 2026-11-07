import { EscrowRecord, EscrowState, VerdictResolution } from "./types";
import { SEED_ESCROWS } from "./mock-data";
import { canDispute, canClaimTimeout } from "./format";

/**
 * In-memory client store for demo, development, and testing.
 */
class UmbraClientStore {
  private escrows: EscrowRecord[] = [];

  constructor(initialSeed: EscrowRecord[] = SEED_ESCROWS) {
    this.escrows = initialSeed.map((e) => ({ ...e }));
  }

  /**
   * Reset store to default seed dataset.
   */
  public reset(seed: EscrowRecord[] = SEED_ESCROWS): void {
    this.escrows = seed.map((e) => ({ ...e }));
  }

  /**
   * List escrows with optional search and status filtering.
   */
  public listEscrows(filter?: {
    status?: string;
    search?: string;
  }): EscrowRecord[] {
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
    arbiter: { type: "None" | "Single" | "Panel" | "Signed"; address?: string };
    termsHash: string;
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
      arbiter: params.arbiter,
      termsHash: params.termsHash,
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
    return { ...record };
  }
}

export const clientStore = new UmbraClientStore();
export { UmbraClientStore };
