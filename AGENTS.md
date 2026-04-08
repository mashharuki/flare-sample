# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This repository (`flare-sample`) is a Flare Network verification/tutorial workspace. Currently contains one sub-project:

- **`hardhat-sample/`** — Hardhat 3 + Viem + TypeScript + Bun smart contract project targeting Flare Network

## hardhat-sample

### Setup

```bash
cd hardhat-sample
bun install
cp .env.example .env  # then set PRIVATE_KEY=0x...
```

Requires Node.js v22+ and Bun v1.0+. `PRIVATE_KEY` must be set or the config throws on startup.

### Common Commands

```bash
# Build / compile contracts
bun run build

# Run all tests (Solidity + TypeScript)
bun test

# Run only Solidity tests (forge-std)
bun run test:solidity

# Run only TypeScript/Node tests
bun run test:node

# Format code
bun run format

# Format check (CI)
bun run format:check
```

### Deploy

```bash
bun run deploy:local      # local Hardhat node
bun run deploy:coston2    # Flare Coston2 testnet (Chain ID 114)
bun run deploy:songbird   # Songbird (Chain ID 19)
```

Deployed addresses are saved to `ignition/deployments/chain-{chainId}/deployed_addresses.json` and auto-loaded by tasks via `helpers/getDeployedAddress.ts`.

### Contract Interaction Tasks (Coston2)

```bash
bun run counter:get
bun run counter:increment
bun run counter:increment-by -- --amount 5
bun run counter:decrement
bun run counter:reset       # owner only
bun run counter:info

# Other networks: pass --network directly
bun hardhat counter:get --network songbird
```

## Architecture

### Contracts (`contracts/`)

- `Counter.sol` — Owner-controlled counter with increment/decrement/reset and custom errors
- `SimpleStorage.sol` — Text + number storage
- `Counter.t.sol` — Solidity-level tests using forge-std

### Hardhat Tasks (`tasks/`)

Tasks are registered in `hardhat.config.ts` via the `tasks` array (Hardhat 3 style). Each task reads the deployed contract address from the ignition deployments JSON — no manual address passing needed.

### Ignition Modules (`ignition/modules/`)

Deployment modules for Hardhat Ignition. Chain-specific deployment artifacts live in `ignition/deployments/`.

### Test Files (`test/`)

TypeScript tests using Viem + Node's built-in `node:test` runner. Run via `bun run test:node`.

## Hardhat 3 vs Hardhat 2 Key Differences

| Item | Hardhat 3 |
|---|---|
| Config format | `defineConfig()` + ESM (`"type": "module"`) |
| Plugin registration | `plugins` array in config (not side-effect imports) |
| Build command | `hardhat build` (not `compile`) |
| Task params | `.addOption()` (not `.addParam()`) |
| Network connection | `await network.connect()` |

## Networks

| Network | Chain ID | Purpose |
|---|---|---|
| Coston2 | 114 | Flare testnet (recommended) |
| Coston | 16 | Songbird testnet |
| Songbird | 19 | Canary network |
| Flare | 14 | Mainnet |

Testnet faucet: https://faucet.flare.network/coston2  
Block explorer: https://coston2-explorer.flare.network
