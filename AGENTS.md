# Agent guidelines

## What this repo is

This repository contains the official CLI tool (`wazoo`) for interacting with the Wazoo Platform API (`wazoo-api`) and managing Wazoo resources.

## How to work here

- Use `package.json` scripts as the source of truth for local development, building, and checks.
- Keep output standard: default to clean readable human output or tabular views, and respect the `--json` global flag.
- Leverage `@wazoo/client` (`wazoo-client-ts`) for all platform API calls.
