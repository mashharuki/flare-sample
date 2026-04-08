# flare-sample Project Overview

## Purpose
Flare Network verification/tutorial workspace. Demonstrates smart contract development, deployment, and interaction on Flare Network testnets and mainnet.

## Sub-projects
- `hardhat-sample/` — Hardhat 3 + Viem + TypeScript + Bun smart contract project (Counter, SimpleStorage contracts)
- `fxrp-sample/` — FXRP/FAssets learning project: read FAssets settings, list agents, reserve collateral for minting

## Tech Stack (共通)
- **Runtime**: Bun v1.0+ (package manager)
- **Language**: TypeScript (ESM, `"type": "module"`)
- **Formatter**: Biome (`bunx biome format --write .`) in fxrp-sample; Prettier in hardhat-sample

## Networks Supported
| Network | Chain ID | Purpose |
|---|---|---|
| Coston2 | 114 | Flare testnet (recommended) |
| Coston | 16 | Songbird testnet |
| Songbird | 19 | Canary network |
| Flare | 14 | Mainnet |

## Environment
- Both sub-projects require a `.env` file copied from `.env.example`
- `PRIVATE_KEY` is needed only for write operations (04-reserve-collateral.ts, deploy scripts)
- Node.js v22+, Bun v1.0+
