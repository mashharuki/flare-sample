# Suggested Commands

All commands run from `hardhat-sample/` directory.

## Setup
```bash
cd hardhat-sample
bun install
cp .env.example .env   # set PRIVATE_KEY=0x...
```

## Build & Test
```bash
bun run build           # compile contracts (hardhat build)
bun test                # all tests (Solidity + TypeScript)
bun run test:solidity   # Solidity tests only (forge-std)
bun run test:node       # TypeScript tests only (node:test)
```

## Format
```bash
bun run format          # auto-format
bun run format:check    # CI check only
```

## Deploy
```bash
bun run deploy:local    # local Hardhat node
bun run deploy:coston2  # Flare Coston2 testnet (Chain ID 114)
bun run deploy:songbird # Songbird (Chain ID 19)
```

## Contract Tasks (Counter)
```bash
bun run counter:get
bun run counter:increment
bun run counter:increment-by -- --amount 5
bun run counter:decrement
bun run counter:reset        # owner only
bun run counter:info

# Other networks:
bun hardhat counter:get --network songbird
```

## Local Node
```bash
bun run node            # start local Hardhat node
```
