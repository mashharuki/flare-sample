# flare-sample Project Overview

## Purpose
Flare Network verification/tutorial workspace. Demonstrates smart contract development, deployment, and interaction on Flare Network testnets and mainnet, plus FAssets, FDC, and Smart Accounts integration.

## Sub-projects
- `hardhat-sample/` — Hardhat 3 + Viem + TypeScript + Bun smart contract project (Counter, SimpleStorage contracts)
- `fxrp-sample/` — FXRP/FAssets learning project: read FAssets settings, list agents, reserve collateral (legacy pre-v1.3 minting flow)
- `aa-wallet-sample/` — Flare Smart Accounts starter: XRPL users operate on Flare without FLR (Viem + xrpl + Biome)
- `fdc-hello-world/` — FDC Payment attestation end-to-end (XRPL Testnet payment -> FdcHub -> DA Layer proof -> Coston2 contract). Hardhat 3 + Ignition + Prettier
- `fullstack-sample-dapp/` — pnpm workspace: `pkgs/contract` (Hardhat) + `pkgs/frontend` (React + Vite)
- `docs/slide.pdf` — AMA/presentation material
- `.claude/skills/` — Flare skills (flare-general, flare-fassets, flare-fdc, flare-ftso, flare-fcc, flare-smart-accounts) plus generic ones

## Tech Stack (common)
- **Runtime**: Bun v1.0+ (pnpm in fullstack-sample-dapp)
- **Language**: TypeScript (ESM, `"type": "module"`)
- **Formatter**: Biome in fxrp-sample and aa-wallet-sample; Prettier in hardhat-sample and fdc-hello-world
- **Packages**: viem ^2.43, xrpl ^4, @flarenetwork/flare-periphery-contracts ^0.1.52 (latest 0.1.53)

## Networks Supported
| Network | Chain ID | Purpose |
|---|---|---|
| Coston2 | 114 | Flare testnet (recommended) |
| Coston | 16 | Songbird testnet |
| Songbird | 19 | Canary network (FCC live here since 2026-10-01) |
| Flare | 14 | Mainnet |

## Environment
- Each sub-project needs a `.env` copied from `.env.example`
- `PRIVATE_KEY` is only needed for write operations (deploys, reserve-collateral, aa-wallet script 05)
- `XRPL_SEED` is needed for aa-wallet-sample scripts 01/02/04 and fdc-hello-world XRPL scripts
- Node.js v22+, Bun v1.0+

## Status notes (as of 2026-10-24)
See memory `flare_updates_2026`. Key: FAssets/Smart Accounts v1.3, FIP.16, FCC on Songbird, flare-tx-sdk 2.0.
