/**
 * Umbra escrow lifecycle states matching the protocol specification.
 */
export type EscrowState =
  | "Created"
  | "Funded"
  | "Delivered"
  | "Released"
  | "Disputed"
  | "ResolvedBuyer"
  | "ResolvedSeller"
  | "ResolvedSplit"
  | "Refunded";

/**
 * Single arbiter or multi-member panel config.
 */
export type ArbiterType = "None" | "Single" | "Panel" | "Signed";

export interface ArbiterInfo {
  type: ArbiterType;
  address?: string;
  members?: string[];
  threshold?: number;
  signerKey?: string;
  signatures?: string[];
  signedSignature?: string;
}

/**
 * Escrow entity data structure.
 */
export interface EscrowRecord {
  id: string;
  buyer: string;
  seller: string;
  asset: string;
  amount: bigint;
  deliverBy: bigint;
  confirmWindow: bigint;
  disputeWindow: bigint;
  deliveredAt?: bigint;
  state: EscrowState;
  arbiter: ArbiterInfo;
  termsHash: string;
  proofHash?: string;
  reasonHash?: string;
  disputeBond?: bigint;
  ttlLedgers?: number;
  astrolabeRecord?: {
    amountBucket: number;
    attestedAt: number;
  };
}

/**
 * Seller Collateral Vault data structures.
 */
export interface VaultLockItem {
  escrowId: string;
  amount: bigint;
  expiresAt: number;
}

export interface VaultSellerPosition {
  seller: string;
  asset: string;
  totalCollateral: bigint;
  lockedCollateral: bigint;
  availableCollateral: bigint;
  locks: VaultLockItem[];
}

/**
 * Supported verdict types for dispute resolution.
 */
export type VerdictType = "RefundBuyer" | "ReleaseSeller" | "Split";

export interface VerdictResolution {
  type: VerdictType;
  buyerBps?: number;
}
