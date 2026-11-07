import { describe, it, expect } from "vitest";
import {
  isValidSha256Hex,
  hashTermsDocument,
  hashDeliveryProofDocument,
  hashDisputeReasonDocument,
  verifyDocument,
  parseRawDocumentInput,
  DOMAIN,
} from "../lib/hashing";

describe("Document Hashing & Verification", () => {
  it("validates 64-char sha256 hex strings", () => {
    expect(isValidSha256Hex("")).toBe(false);
    expect(isValidSha256Hex("short")).toBe(false);
    expect(isValidSha256Hex("not-hex-chars-are-definitely-invalid-length-check-64-characters-ok")).toBe(false);

    const valid = "2af58aaebdd51405926baeb472bb7dd8a75163636bdaa084c6766e1c65052d72";
    expect(isValidSha256Hex(valid)).toBe(true);
    expect(isValidSha256Hex(valid.toUpperCase())).toBe(true);
  });

  it("produces deterministic hashes with domain separation", () => {
    const doc = { item: "Software Dev", milestone: 1 };
    const termsHash = hashTermsDocument(doc);
    const proofHash = hashDeliveryProofDocument(doc);
    const reasonHash = hashDisputeReasonDocument(doc);

    expect(isValidSha256Hex(termsHash)).toBe(true);
    expect(isValidSha256Hex(proofHash)).toBe(true);
    expect(isValidSha256Hex(reasonHash)).toBe(true);

    // Identical content must produce different hashes across different domains
    expect(termsHash).not.toBe(proofHash);
    expect(proofHash).not.toBe(reasonHash);
    expect(termsHash).not.toBe(reasonHash);
  });

  it("verifies matching and non-matching documents", () => {
    const terms = { title: "Milestone A", budget: 500 };
    const hash = hashTermsDocument(terms);

    const matchResult = verifyDocument("terms", terms, hash);
    expect(matchResult.match).toBe(true);
    expect(matchResult.computedHash).toBe(hash);

    const altered = { title: "Milestone A", budget: 600 };
    const mismatchResult = verifyDocument("terms", altered, hash);
    expect(mismatchResult.match).toBe(false);
    expect(mismatchResult.computedHash).not.toBe(hash);
  });

  it("parses raw user document inputs gracefully", () => {
    expect(parseRawDocumentInput("")).toBe("");
    expect(parseRawDocumentInput("   ")).toBe("");
    expect(parseRawDocumentInput("Plain text notes")).toBe("Plain text notes");

    const jsonText = '{"milestone": 2, "complete": true}';
    expect(parseRawDocumentInput(jsonText)).toEqual({
      milestone: 2,
      complete: true,
    });
  });

  it("exposes SDK domain identifiers", () => {
    expect(DOMAIN.terms).toBe("umbra:terms:v1");
    expect(DOMAIN.deliveryProof).toBe("umbra:delivery-proof:v1");
    expect(DOMAIN.disputeReason).toBe("umbra:dispute-reason:v1");
  });
});
