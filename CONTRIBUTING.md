# Contributing to Umbra App

Thank you for your interest in contributing to **Umbra App**! This guide outlines the development workflow, quality requirements, and testing conventions.

---

## Development Workflow

1. **Fork and Clone:**
   ```bash
   git clone https://github.com/umbra-escrow-and-dispute-window/umbra-app.git
   cd umbra-app
   ```

2. **Branching:**
   Create a descriptive branch for your work:
   ```bash
   git checkout -b feat/my-new-feature
   # or
   git checkout -b fix/issue-description
   ```

3. **Install Dependencies:**
   ```bash
   pnpm install
   ```

4. **Verify Quality Before Committing:**
   ```bash
   pnpm format:check
   pnpm lint
   pnpm typecheck
   pnpm test
   pnpm build
   ```

---

## Commit Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/) to maintain an automated, human-readable changelog.

### Format
```
<type>(<scope>): <short imperative description>
```

### Allowed Types
- `feat`: New feature or user-facing functionality
- `fix`: Bug fix
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding or updating test cases
- `docs`: Documentation updates
- `style`: Formatting, whitespace, or lint fixes
- `chore`: Dependency updates, tooling, or internal maintenance
- `ci`: Changes to CI configuration workflows

### Attribution Policy
- Commits must be authored by the contributor with zero automated AI attribution trailers (`Co-authored-by` mentioning bots, `Generated with`, etc.).
- Repository git hooks validate author identity and commit scrub.

---

## Architecture Standards

- **Next.js 15 App Router & React 19:** Ensure client components include `"use client"` when using hooks or state.
- **Styling:** Use Tailwind CSS utility classes and `cn()` from `@/lib/utils` for conditional merging.
- **Off-Chain Hashing:** Never compute bespoke hashes; always import domain separators and helpers from `@/lib/hashing` (which wrap `@umbra-escrow-and-dispute-window/umbra-sdk`).
- **Test Coverage:** All new helpers, formatters, and state mutators must include corresponding unit tests in `test/`.

---

## Multi-Repository Workspace

When modifying contract types or hashing logic that affects the entire protocol:
1. Verify contract changes in `umbra-contracts`.
2. Update bindings and hashing conventions in `umbra-sdk`.
3. Link and consume changes here in `umbra-app`.

See [docs/multi-repo.md](docs/multi-repo.md) for detailed linking instructions.
