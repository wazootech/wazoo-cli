# @wazoo/cli

Official Command-Line Interface (`wazoo`) for the **Wazoo Platform** — Neuro-symbolic infrastructure for AI agents.

## Installation

```bash
npm install -g @wazoo/cli
# or run directly via npx:
npx @wazoo/cli --help
```

## Quickstart

```bash
# Check service health
wazoo health

# Set authentication token
export WAZOO_API_TOKEN="wzp_..."

# List worlds
wazoo worlds list

# Create a world; its server-minted ID has the form w_<UUIDv4>
wazoo worlds create --name "Project Context"
export WORLD_ID="<id from the response>"
wazoo worlds get "$WORLD_ID"

# View current usage & limits
wazoo usage --json
```

## Global Flags

- `--api-url <url>`: Override the default API URL (`https://api.wazoo.dev` or `WAZOO_API_URL`).
- `--token <token>`: Set API auth token (or set `WAZOO_API_TOKEN` / `WORLDS_TOKEN` environment variable).
- `--json`: Format command output as structured JSON.
