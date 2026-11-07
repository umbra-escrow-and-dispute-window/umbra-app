import {
  canonicalize,
  hashTerms as sdkHashTerms,
  hashDeliveryProof as sdkHashDeliveryProof,
  hashDisputeReason as sdkHashDisputeReason,
  verifyTerms as sdkVerifyTerms,
  verifyDeliveryProof as sdkVerifyDeliveryProof,
  verifyDisputeReason as sdkVerifyDisputeReason,
  JsonValue,
  DOMAIN,
} from "@umbra-escrow-and-dispute-window/umbra-sdk";

export { DOMAIN };

/**
 * Validates whether a string is a 32-byte (64 hex characters) hex string.
 */
export function isValidSha256Hex(hash: string): boolean {
  if (!hash || typeof hash !== "string") return false;
  return /^[0-9a-fA-F]{64}$/.test(hash.trim());
}

/**
 * Computes canonical terms hash as lowercase hex string.
 */
export function hashTermsDocument(terms: JsonValue): string {
  return sdkHashTerms(terms).toString("hex");
}

/**
 * Computes canonical delivery proof hash as lowercase hex string.
 */
export function hashDeliveryProofDocument(proof: JsonValue): string {
  return sdkHashDeliveryProof(proof).toString("hex");
}

/**
 * Computes canonical dispute reason hash as lowercase hex string.
 */
export function hashDisputeReasonDocument(reason: JsonValue): string {
  return sdkHashDisputeReason(reason).toString("hex");
}

/**
 * Verifies arbitrary JSON document or string against expected 32-byte hex hash.
 */
export function verifyDocument(
  kind: "terms" | "deliveryProof" | "disputeReason",
  document: JsonValue,
  expectedHex: string,
): { match: boolean; computedHash: string } {
  const cleanExpected = expectedHex.trim().toLowerCase();
  let computedBuf: Buffer;

  switch (kind) {
    case "terms":
      computedBuf = sdkHashTerms(document);
      break;
    case "deliveryProof":
      computedBuf = sdkHashDeliveryProof(document);
      break;
    case "disputeReason":
      computedBuf = sdkHashDisputeReason(document);
      break;
    default:
      throw new Error(`Unknown document kind: ${kind}`);
  }

  const computedHex = computedBuf.toString("hex");
  return {
    match: computedHex === cleanExpected,
    computedHash: computedHex,
  };
}

/**
 * Safely parses raw user text into JsonValue (fallback to string if not valid JSON).
 */
export function parseRawDocumentInput(input: string): JsonValue {
  const trimmed = input.trim();
  if (!trimmed) return "";
  try {
    return JSON.parse(trimmed) as JsonValue;
  } catch {
    return trimmed;
  }
}

export {
  canonicalize,
  sdkVerifyTerms as verifyTerms,
  sdkVerifyDeliveryProof as verifyDeliveryProof,
  sdkVerifyDisputeReason as verifyDisputeReason,
};
