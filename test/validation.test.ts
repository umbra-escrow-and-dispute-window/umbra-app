import { describe, it, expect } from "vitest";
import {
  isValidStellarPublicKey,
  isValidContractId,
  isValidStroopAmount,
  isValidBasisPoints,
  isValidDuration,
} from "../lib/validation";

describe("Input Validation Utilities", () => {
  it("validates Stellar G... public keys", () => {
    expect(isValidStellarPublicKey("")).toBe(false);
    expect(
      isValidStellarPublicKey("GAT6KAYEL7B2MCVPAUUELPNQLBWEMEW2GKOHL4JWDSSCB2YOEFOBBNA2"),
    ).toBe(true);
    // Invalid prefix
    expect(
      isValidStellarPublicKey("CAT6KAYEL7B2MCVPAUUELPNQLBWEMEW2GKOHL4JWDSSCB2YOEFOBBNA2"),
    ).toBe(false);
    // Invalid length
    expect(isValidStellarPublicKey("GAT6KAYEL7B2M")).toBe(false);
    // Invalid characters (8 and 9 are not in RFC 4648 base32)
    expect(
      isValidStellarPublicKey("GAT6KAYEL7B2MCVPAUUELPNQLBWEMEW2GKOHL4JWDSSCB2YOEFOBBNA8"),
    ).toBe(false);
  });

  it("validates Soroban C... contract IDs", () => {
    expect(isValidContractId("")).toBe(false);
    expect(isValidContractId("CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC")).toBe(
      true,
    );
    // Invalid prefix
    expect(isValidContractId("GDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC")).toBe(
      false,
    );
    // Invalid length
    expect(isValidContractId("CDLZFC3S")).toBe(false);
  });

  it("validates stroop amounts strictly", () => {
    expect(isValidStroopAmount("").valid).toBe(false);
    expect(isValidStroopAmount("-5").valid).toBe(false);
    expect(isValidStroopAmount("0").valid).toBe(false);
    expect(isValidStroopAmount("abc").valid).toBe(false);

    expect(isValidStroopAmount("10").valid).toBe(true);
    expect(isValidStroopAmount("0.0000001").valid).toBe(true);
    // Exceeding 7 decimals
    expect(isValidStroopAmount("0.00000001").valid).toBe(false);
  });

  it("validates basis points within 0-10000 range", () => {
    expect(isValidBasisPoints(-1)).toBe(false);
    expect(isValidBasisPoints(10001)).toBe(false);
    expect(isValidBasisPoints(5000.5)).toBe(false);

    expect(isValidBasisPoints(0)).toBe(true);
    expect(isValidBasisPoints(5000)).toBe(true);
    expect(isValidBasisPoints(10000)).toBe(true);
  });

  it("validates durations", () => {
    expect(isValidDuration(0)).toBe(false);
    expect(isValidDuration(59)).toBe(false);
    expect(isValidDuration(60)).toBe(true);
    expect(isValidDuration(86400n)).toBe(true);
  });
});
