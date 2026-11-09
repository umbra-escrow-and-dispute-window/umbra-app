# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.2.0] - 2026-11-09

### Added

- **Multi-Signer Panel Arbitration Console:** Arbiter console support for M-of-N threshold arbitration (`ArbiterType = Panel`), with member signature tracking, live threshold progress badges, and multi-signer verdict execution.
- **Cryptographic Signed Adjudicator Tooling:** Canonical 32-byte payload viewer (`umbra:adjudicate:v1`) and Ed25519 signature input support in the arbiter workspace.
- **Anti-Griefing Dispute Bonds:** Escrow creation form support for optional `disputeBond` configuration and payout calculations.
- **Astrolabe Reputation Attestations:** Display on-chain Astrolabe attestation badges (`["astrolabe", "record", escrow_id]`) and logarithmic volume tiers on terminal escrows.
- **Contract Storage TTL Extension:** Interactive lease status viewer and +30 days (+518,400 ledgers) renewal trigger on escrow detail pages.
- **Seller Collateral Vault Dashboard (`/vault`):** Staking management interface for sellers to deposit collateral, withdraw unencumbered funds, and monitor active instant-release liabilities.

---

## [0.1.0] - 2026-11-07

### Added

- **Public Escrow Explorer:** Search, filter, and inspect live and past escrows with real-time status chips and responsive empty states.
- **Escrow Detail Page:** Full 4-step lifecycle stepper (`Funded`, `Delivered`, `Dispute/Confirm Review`, `Settled`), party keys, asset addresses, countdown timers, and off-chain hash links.
- **Participant Console:** Streamlined buyer and seller workspace with automated terms JSON hashing, delivery proof submissions, fund releases, dispute claims, and seller timeout claims.
- **Arbiter Resolution Console:** Queue of contested escrows for designated arbiters with evidence review (terms, delivery proof, dispute claim) and execution of binding settlement verdicts (`RefundBuyer`, `ReleaseSeller`, or basis-point `Split`).
- **Off-Chain Document Verifier:** Independent verification tool for terms, proofs, and claims computing RFC 8785 canonical JSON and domain-separated SHA-256 hashes matching on-chain storage.
- **Wallet & Persona Switcher:** Interactive testnet persona switcher (`Buyer`, `Seller`, `Arbiter`) with custom address input support.
- **Developer Tooling & Safety:**
  - Automated GitHub Actions CI workflow running lint, typecheck, format check, unit tests, and production build on push and PR.
  - Comprehensive unit test suite with 52 passing tests covering state machine transitions, formatting, validation, and off-chain hashing.
  - Skeletons and React error boundaries for Next.js App Router.
  - Detailed `README.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, and issue templates.

### Security

- Patched Next.js to version `15.1.11` resolving critical flight protocol and authorization vulnerabilities.
- Added RFC 4648 Base32 validation for Stellar public keys (`G...`) and Soroban contract addresses (`C...`).
- Implemented strictly typed off-chain domain separation preventing cross-domain hash replay attacks.
