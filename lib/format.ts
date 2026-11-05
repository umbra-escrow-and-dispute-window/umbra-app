import { EscrowRecord, EscrowState } from "./types";

/**
 * Truncate a Stellar public key or contract address for readable display.
 * Example: 'GBBD67VFO7CTP...3S5B'
 */
export function truncateAddress(address: string, chars = 4): string {
  if (!address || address.length <= chars * 2 + 3) {
    return address || "";
  }
  return `${address.slice(0, chars + 1)}...${address.slice(-chars)}`;
}

/**
 * Format a 32-byte hex string (e.g. hash) for compact display.
 */
export function truncateHash(hash: string, chars = 6): string {
  if (!hash || hash.length <= chars * 2 + 2) {
    return hash || "";
  }
  return `${hash.slice(0, chars)}...${hash.slice(-chars)}`;
}

/**
 * Convert stroop integer amounts (10^-7 XLM) into human-readable string.
 */
export function formatStroops(stroops: bigint | number | string): string {
  const amountBig = typeof stroops === "bigint" ? stroops : BigInt(stroops || 0);
  const isNegative = amountBig < 0n;
  const absVal = isNegative ? -amountBig : amountBig;
  const divisor = 10_000_000n;
  const integerPart = absVal / divisor;
  const fractionalPart = absVal % divisor;

  const fractionalStr = fractionalPart.toString().padStart(7, "0").replace(/0+$/, "");
  const result = fractionalStr ? `${integerPart}.${fractionalStr}` : integerPart.toString();
  return isNegative ? `-${result}` : result;
}

/**
 * Parse human decimal amount (e.g. '12.5') into stroops bigint.
 */
export function parseStroops(amountStr: string): bigint {
  const trimmed = amountStr.trim();
  if (!trimmed || !/^\d+(\.\d+)?$/.test(trimmed)) {
    throw new Error("Invalid numeric amount");
  }

  const parts = trimmed.split(".");
  const integerPart = BigInt(parts[0]);
  let fractionPartStr = parts[1] || "";
  if (fractionPartStr.length > 7) {
    fractionPartStr = fractionPartStr.slice(0, 7);
  } else {
    fractionPartStr = fractionPartStr.padEnd(7, "0");
  }

  const fractionPart = BigInt(fractionPartStr);
  return integerPart * 10_000_000n + fractionPart;
}

/**
 * Format epoch timestamp (seconds) into local readable date.
 */
export function formatTimestamp(timestamp: bigint | number | undefined): string {
  if (!timestamp || timestamp <= 0n) {
    return "N/A";
  }
  const sec = typeof timestamp === "bigint" ? Number(timestamp) : timestamp;
  return new Date(sec * 1000).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * Compute readable duration or remaining time.
 */
export function formatDuration(seconds: bigint | number): string {
  const sec = typeof seconds === "bigint" ? Number(seconds) : seconds;
  if (sec <= 0) return "0s";

  const days = Math.floor(sec / 86400);
  const hours = Math.floor((sec % 86400) / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const remainingSecs = sec % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (mins > 0) parts.push(`${mins}m`);
  if (remainingSecs > 0 && days === 0) parts.push(`${remainingSecs}s`);

  return parts.slice(0, 2).join(" ") || "0s";
}

/**
 * Check if an escrow has reached a final, non-transitionable state.
 */
export function isTerminalState(state: EscrowState): boolean {
  return (
    state === "Released" ||
    state === "Refunded" ||
    state === "ResolvedBuyer" ||
    state === "ResolvedSeller" ||
    state === "ResolvedSplit"
  );
}

/**
 * Determine if buyer is eligible to dispute.
 * Precondition: Delivered state, non-None arbiter, within dispute window.
 */
export function canDispute(escrow: EscrowRecord, nowTimestamp: bigint): boolean {
  if (escrow.state !== "Delivered") return false;
  if (escrow.arbiter.type === "None") return false;
  if (!escrow.deliveredAt) return false;

  const deadline = escrow.deliveredAt + escrow.disputeWindow;
  return nowTimestamp <= deadline;
}

/**
 * Determine if seller is eligible to claim timeout.
 * Precondition: Delivered state, confirm window elapsed.
 */
export function canClaimTimeout(escrow: EscrowRecord, nowTimestamp: bigint): boolean {
  if (escrow.state !== "Delivered") return false;
  if (!escrow.deliveredAt) return false;

  const claimableAfter = escrow.deliveredAt + escrow.confirmWindow;
  return nowTimestamp >= claimableAfter;
}

/**
 * Badge color variants based on escrow state.
 */
export function getStateBadgeVariant(
  state: EscrowState,
): "default" | "secondary" | "success" | "warning" | "destructive" | "outline" {
  switch (state) {
    case "Created":
      return "outline";
    case "Funded":
      return "secondary";
    case "Delivered":
      return "warning";
    case "Released":
    case "ResolvedSeller":
      return "success";
    case "Disputed":
      return "destructive";
    case "ResolvedBuyer":
    case "Refunded":
      return "default";
    case "ResolvedSplit":
      return "secondary";
    default:
      return "outline";
  }
}
