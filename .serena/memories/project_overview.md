# flare-sample Project Overview

## Purpose
Flare Network verification/tutorial workspace. Demonstrates smart contract development, deployment, and interaction on Flare Network testnets and mainnet.

## Sub-projects
- `hardhat-sample/` — Main project: Hardhat 3 + Viem + TypeScript + Bun smart contract project

## Tech Stack
- **Runtime**: Bun v1.0+ (package manager and test runner)
- **Language**: TypeScript (ESM, `"type": "module"`)
- **Smart Contracts**: Solidity 0.8.28
- **Framework**: Hardhat 3 with `defineConfig()` API
- **Contract interaction**: Viem v2
- **Deployment**: Hardhat Ignition
- **Testing**: Node's built-in `node:test` (TypeScript) + forge-std (Solidity)
- **Formatting**: Prettier + prettier-plugin-solidity

## Networks Supported
| Network | Chain ID | Purpose |
|---|---|---|
| Coston2 | 114 | Flare testnet (recommended) |
| Coston | 16 | Songbird testnet |
| Songbird | 19 | Canary network |
| Flare | 14 | Mainnet |

## Environment
- Requires `PRIVATE_KEY` env var (set in `hardhat-sample/.env`)
- Node.js v22+, Bun v1.0+
