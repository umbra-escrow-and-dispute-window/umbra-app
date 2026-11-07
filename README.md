# Umbra App

> Web explorer, participant console, and arbiter resolution interface for the **Umbra Escrow & Dispute Window Protocol** on Stellar.

[![CI](https://github.com/umbra-escrow-and-dispute-window/umbra-app/actions/workflows/ci.yml/badge.svg)](https://github.com/umbra-escrow-and-dispute-window/umbra-app/actions/workflows/ci.yml)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Stellar Testnet](https://img.shields.io/badge/Stellar-Testnet-success.svg)](https://stellar.org)

Umbra provides trust-minimized, machine-to-machine conditional payments on Stellar. Buyers fund an escrow, sellers submit delivery proofs, and disputes are adjudicated by designated arbiters within strict, verifiable on-chain time windows.

---

## Key Features

- **Public Escrow Explorer:** Search, inspect, and filter on-chain escrows by ID, state (`Funded`, `Delivered`, `Disputed`, `Released`, `Resolved`, `Refunded`), buyer, seller, or asset.
- **Escrow Detail & Stepper:** Visualizes the 4-step escrow lifecycle, countdown timers for confirm and dispute windows, and links to off-chain hashes.
- **Participant Console:** Streamlined buyer and seller actions—create escrows with automated terms hashing, submit delivery proofs, release payments, or file disputes.
- **Arbiter Resolution Console:** Adjudication queue for single arbiters to review evidence hashes (terms, delivery notes, dispute claims) and issue binding settlements (`RefundBuyer`, `ReleaseSeller`, or basis-point `Split`).
- **Off-Chain Document Verifier:** Independent cryptographic verifier conforming to RFC 8785 canonical JSON and domain-separated SHA-256 hashing.
- **Interactive Sandbox & Personas:** Pre-configured testnet roles (Buyer, Seller, Arbiter) or custom Stellar public keys to evaluate and operate the app without requiring extension wallets.

---

## Protocol Architecture & State Machine

```
              ┌─────────┐
              │ Created │
              └────┬────┘
                   │ fund()
                   ▼
              ┌─────────┐
       ┌──────┤ Funded  ├──────┐
       │      └────┬────┘      │
       │ cancel()  │           │ release()
       │           │ deliver() │
       ▼           ▼           ▼
 ┌──────────┐ ┌───────────┐ ┌──────────┐
 │ Refunded │ │ Delivered │ │ Released │
 └──────────┘ └─────┬─────┘ └──────────┘
                    │
          ┌─────────┴─────────┐
          │ dispute()         │ claim_timeout()
          ▼                   ▼
    ┌───────────┐       ┌──────────┐
    │ Disputed  │       │ Released │
    └─────┬─────┘       └──────────┘
          │ resolve() [Arbiter Verdict]
          ├───────────────────┬───────────────────┐
          ▼                   ▼                   ▼
  ┌───────────────┐   ┌────────────────┐  ┌───────────────┐
  │ ResolvedBuyer │   │ ResolvedSeller │  │ ResolvedSplit │
  └───────────────┘   └────────────────┘  └───────────────┘
```

---

## Off-Chain Hashing Scheme

To optimize ledger storage costs, agreement terms, delivery artifacts, and dispute claims remain off-chain; the smart contract holds only their 32-byte SHA-256 digests.

Payloads are formatted using **RFC 8785 JSON Canonicalization** and hashed with unique domain separators:

| Document Type | Domain Separator | Description |
|---|---|---|
| **Terms** | `umbra:terms:v1` | Milestone description, deliverables, acceptance criteria |
| **Delivery Proof** | `umbra:delivery-proof:v1` | Commit hashes, artifact links, execution proofs |
| **Dispute Claim** | `umbra:dispute-reason:v1` | Contested points filed during dispute window |

---

## Quickstart

### Prerequisites

- **Node.js:** `>=20.0.0`
- **Package Manager:** `pnpm` (`v12.x` or higher)

### Installation

```bash
# Clone the repository
git clone https://github.com/umbra-escrow-and-dispute-window/umbra-app.git
cd umbra-app

# Install dependencies
pnpm install
```

### Local Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Verification & Testing

```bash
# Run unit test suite
pnpm test

# Typecheck TypeScript definitions
pnpm typecheck

# Check and fix formatting
pnpm format:check
pnpm format

# Run linter
pnpm lint

# Production build
pnpm build
```

---

## Environment Variables

Copy `.env.example` to `.env.local` to override default settings:

```bash
# Stellar Network identifier
NEXT_PUBLIC_STELLAR_NETWORK=testnet

# Soroban Testnet RPC endpoint
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org

# Optional override path to contract deployments JSON
# UMBRA_DEPLOYMENTS=../contracts/deployments.json
```

---

## Multi-Repository Context

- **[umbra-contracts](https://github.com/umbra-escrow-and-dispute-window/umbra-contracts):** Core Soroban escrow contract with normative dispute windows and storage TTL management.
- **[umbra-sdk](https://github.com/umbra-escrow-and-dispute-window/umbra-sdk):** TypeScript client library, hashing conventions, and contract bindings.
- **[umbra-app](https://github.com/umbra-escrow-and-dispute-window/umbra-app):** Modern Next.js 15 web client and dashboard.

---

## License

This project is licensed under the **Apache-2.0 License**. See [LICENSE](LICENSE) for details.
