# Agent guidelines

## What this repo is

This repository contains the official CLI tool (`wazoo`) for interacting with the Wazoo Platform API (`wazoo-api`) and managing Wazoo resources.

## How to work here

- Use `package.json` scripts as the source of truth for local development, building, and checks.
- Keep output standard: default to clean readable human output or tabular views, and respect the `--json` global flag.
- Leverage `@wazoo/client` (`wazoo-client-ts`) for all platform API calls.

## Code health

Family-wide rules live in the [wazootech workspace constitution](https://github.com/wazootech/workspace/blob/main/AGENTS.md#code-health-standards); this repo's specifics:

- Before pushing, run `pnpm run format:check`, `pnpm run lint`, `pnpm run typecheck`, and `pnpm run build`; CI runs the same checks. Lint uses `--max-warnings 0`.
- `@typescript-eslint/no-explicit-any` is an error. In `catch` blocks, use `catch (err)` with the typed `errorMessage(err: unknown)` helper in `src/client.ts`.
- Workflow actions are pinned to full commit SHAs with a version comment; Node comes from `.node-version`; installs are frozen (`pnpm install --frozen-lockfile`).
- `secret-scan.yml` runs gitleaks on every pull request and push to `main`. `code-health.yml` only warns (file length, TODO/FIXME without an issue link). `CODEOWNERS` routes review to `@EthanThatOneKid`.
