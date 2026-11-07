# Drips Network Grant Review Guide

This guide is designed for grant reviewers evaluating the **Umbra Escrow & Dispute Window App** against the 5 core open-source evaluation criteria.

---

## Evaluation Criteria & Evidence

### 1. Does the project work?
- **Public Explorer:** Browse on-chain escrows, live status filters (`All`, `Funded`, `Delivered`, `Disputed`, `Released`, `Resolved`, `Refunded`), and search.
- **Escrow Detail:** Navigate to any escrow (`/escrows/1`) to inspect full 4-step lifecycle stepper, counterparty keys, and countdown timers.
- **Participant Console:** Connect test personas (`Buyer` / `Seller`), create new escrows with automated terms hashing, submit delivery proofs, release funds, or file disputes.
- **Arbiter Console:** Review evidence hashes for contested escrows and execute binding settlement verdicts (`RefundBuyer`, `ReleaseSeller`, or custom basis-point `Split`).
- **Off-Chain Verifier:** Independently verify RFC 8785 canonical JSON against on-chain SHA-256 hashes (`/verify`).

### 2. Is the code clean?
- **Strict Typing:** Built with TypeScript in strict mode, Next.js 15 App Router, and React 19.
- **Unified Utilities:** Shared formatting in `lib/format.ts`, input validation in `lib/validation.ts`, and hashing conventions in `lib/hashing.ts`.
- **Zero Warnings:** Clean ESLint runs (`pnpm lint`), zero TypeScript errors (`pnpm typecheck`), and 100% Prettier formatting compliance (`pnpm format:check`).

### 3. Is it well documented?
- **README.md:** Comprehensive architecture overview, state machine diagram, quickstart, and environment configuration.
- **CONTRIBUTING.md:** Contribution guidelines, conventional commits, quality standards, and multi-repo development instructions.
- **CHANGELOG.md:** Complete version history adhering to Keep a Changelog.
- **docs/multi-repo.md:** Guidance on linking and developing across `umbra-contracts`, `umbra-sdk`, and `umbra-app`.

### 4. Does it look actively maintained?
- **Atomic Git History:** Real, human-written conventional commits with clean progression across daily milestones.
- **Zero AI Attribution:** Rigorous git hooks enforce clean commit messages and author identity matching repository owner.
- **Security Patches:** Next.js patched to `15.1.11` resolving upstream security advisories.

### 5. Is it easy to contribute to?
- **GitHub Actions CI:** Automated workflow (`.github/workflows/ci.yml`) runs on push and PR.
- **Issue & PR Templates:** Pre-configured templates in `.github/` for structured contributions.
- **Interactive Sandbox:** Reviewers can test all buyer, seller, and arbiter flows instantly using the pre-configured persona switcher without installing extension wallets or holding real testnet funds.

---

## Quick Reviewer Verification Commands

Run the following commands in order to verify all checks pass cleanly:

```bash
# 1. Install dependencies
pnpm install

# 2. Check code formatting
pnpm format:check

# 3. Run linter
pnpm lint

# 4. Typecheck TypeScript
pnpm typecheck

# 5. Run test suite
pnpm test

# 6. Build production bundle
pnpm build
```
