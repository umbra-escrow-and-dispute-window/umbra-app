/**
 * Input validation helpers for Stellar and Umbra protocol parameters.
 */

/**
 * Validates a Stellar G... public key (56 uppercase base32 characters).
 */
export function isValidStellarPublicKey(key: string): boolean {
  if (!key || typeof key !== "string") return false;
  return /^G[A-Z2-7]{55}$/.test(key.trim());
}

/**
 * Validates a Soroban C... contract address (56 uppercase base32 characters).
 */
export function isValidContractId(id: string): boolean {
  if (!id || typeof id !== "string") return false;
  return /^C[A-Z2-7]{55}$/.test(id.trim());
}

/**
 * Validates human decimal string for XLM stroop amounts.
 * Must be positive, finite, and have at most 7 decimal places.
 */
export function isValidStroopAmount(amountStr: string): {
  valid: boolean;
  error?: string;
} {
  const trimmed = amountStr?.trim();
  if (!trimmed) {
    return { valid: false, error: "Amount is required" };
  }

  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    return { valid: false, error: "Amount must be a positive number" };
  }

  const num = Number(trimmed);
  if (!Number.isFinite(num) || num <= 0) {
    return { valid: false, error: "Amount must be greater than zero" };
  }

  const parts = trimmed.split(".");
  if (parts[1] && parts[1].length > 7) {
    return { valid: false, error: "Amount cannot exceed 7 decimal places (1 Stroop)" };
  }

  return { valid: true };
}

/**
 * Validates split basis points (0 <= bps <= 10000).
 */
export function isValidBasisPoints(bps: number): boolean {
  return Number.isInteger(bps) && bps >= 0 && bps <= 10000;
}

/**
 * Validates duration in seconds (must be at least 60 seconds).
 */
export function isValidDuration(seconds: bigint | number): boolean {
  const val = typeof seconds === "bigint" ? seconds : BigInt(seconds);
  return val >= 60n;
}
