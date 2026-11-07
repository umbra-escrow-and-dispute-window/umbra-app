import { EscrowRecord } from "./types";

/**
 * Initial deterministic seed escrows for explorer, console, and testing.
 */
export const SEED_ESCROWS: EscrowRecord[] = [
  {
    id: "1",
    buyer: "GBBD67VFO7CTP3S5BX7A5UOHQLWJ2C3Z7G4V5N3A2B1C0D9E8F7A6B5C",
    seller: "GAKF4W2N3M5L6K7J8H9G0F1E2D3C4B5A6B7C8D9E0F1A2B3C4D5E6F7A",
    asset: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
    amount: 250_000_000n, // 25.0 XLM
    deliverBy: 1735689600n, // Dec 31 2024
    confirmWindow: 259200n, // 3 days
    disputeWindow: 172800n, // 2 days
    deliveredAt: 1735000000n,
    state: "Delivered",
    arbiter: {
      type: "Single",
      address: "GARB4W2N3M5L6K7J8H9G0F1E2D3C4B5A6B7C8D9E0F1A2B3C4D5E6F7A",
    },
    termsHash: "2af58aaebdd51405926baeb472bb7dd8a75163636bdaa084c6766e1c65052d72",
    proofHash: "c0b998cfb6139c8112d7653a6c9d0db3b4f6e3c0420d43a5717ef367098cf387",
  },
  {
    id: "2",
    buyer: "GBBD67VFO7CTP3S5BX7A5UOHQLWJ2C3Z7G4V5N3A2B1C0D9E8F7A6B5C",
    seller: "GD3JCPTNUSNSMNROYM6NSSQID55H5BKO6GLQQKNZ5KKEIZZG0A1B2C3D",
    asset: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
    amount: 1_000_000_000n, // 100.0 XLM
    deliverBy: 1740000000n,
    confirmWindow: 604800n, // 7 days
    disputeWindow: 259200n, // 3 days
    state: "Funded",
    arbiter: {
      type: "Single",
      address: "GARB4W2N3M5L6K7J8H9G0F1E2D3C4B5A6B7C8D9E0F1A2B3C4D5E6F7A",
    },
    termsHash: "7b4c6e2a9e3f1d8c4b5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e",
  },
  {
    id: "3",
    buyer: "GCX7A5UOHQLWJ2C3Z7G4V5N3A2B1C0D9E8F7A6B5CGBBD67VFO7CTP3S5B",
    seller: "GAKF4W2N3M5L6K7J8H9G0F1E2D3C4B5A6B7C8D9E0F1A2B3C4D5E6F7A",
    asset: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
    amount: 500_000_000n, // 50.0 XLM
    deliverBy: 1734000000n,
    confirmWindow: 86400n,
    disputeWindow: 86400n,
    deliveredAt: 1734050000n,
    state: "Disputed",
    arbiter: {
      type: "Single",
      address: "GARB4W2N3M5L6K7J8H9G0F1E2D3C4B5A6B7C8D9E0F1A2B3C4D5E6F7A",
    },
    termsHash: "3f8d2b1a0c9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a",
    proofHash: "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
    reasonHash: "e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3",
  },
  {
    id: "4",
    buyer: "GBBD67VFO7CTP3S5BX7A5UOHQLWJ2C3Z7G4V5N3A2B1C0D9E8F7A6B5C",
    seller: "GSELLER4W2N3M5L6K7J8H9G0F1E2D3C4B5A6B7C8D9E0F1A2B3C4D5E6F",
    asset: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
    amount: 75_000_000n, // 7.5 XLM
    deliverBy: 1730000000n,
    confirmWindow: 86400n,
    disputeWindow: 86400n,
    deliveredAt: 1730050000n,
    state: "Released",
    arbiter: { type: "None" },
    termsHash: "5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b",
    proofHash: "8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c",
  },
  {
    id: "5",
    buyer: "GBUYER1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF12345",
    seller: "GSELLER1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF12345",
    asset: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
    amount: 150_000_000n, // 15.0 XLM
    deliverBy: 1732000000n,
    confirmWindow: 172800n,
    disputeWindow: 86400n,
    deliveredAt: 1732050000n,
    state: "ResolvedSplit",
    arbiter: {
      type: "Single",
      address: "GARB4W2N3M5L6K7J8H9G0F1E2D3C4B5A6B7C8D9E0F1A2B3C4D5E6F7A",
    },
    termsHash: "9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d",
    proofHash: "6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a",
    reasonHash: "3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d",
  },
];
