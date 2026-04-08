# Suggested Commands

## hardhat-sample/ (cd hardhat-sample)

### Setup
```bash
bun install
cp .env.example .env   # set PRIVATE_KEY=0x...
```

### Build & Test
```bash
bun run build           # compile contracts
bun test                # all tests
bun run test:solidity   # Solidity tests (forge-std)
bun run test:node       # TypeScript tests (node:test)
```

### Format
```bash
bun run format          # Prettier auto-format
bun run format:check    # CI check
```

### Deploy
```bash
bun run deploy:local
bun run deploy:coston2
bun run deploy:songbird
```

### Contract Tasks (Counter, Coston2)
```bash
bun run counter:get
bun run counter:increment
bun run counter:increment-by -- --amount 5
bun run counter:decrement
bun run counter:reset
bun run counter:info
bun hardhat counter:get --network songbird   # other network
```

---

## fxrp-sample/ (cd fxrp-sample)

### Setup
```bash
bun install
cp .env.example .env   # PRIVATE_KEY only needed for script 04 with DRY_RUN=false
```

### Read-only scripts (no PRIVATE_KEY needed)
```bash
bun run 01:get-fxrp-address       # FXRP token address + ERC20 info
bun run 02:get-fassets-settings   # CRF fee, XRP/USD price (FTSOv2)
bun run 03:list-agents            # available minting agents
```

### Write script (DRY_RUN by default)
```bash
bun run 04:reserve-collateral              # DRY RUN (no tx sent)
DRY_RUN=false bun run 04:reserve-collateral  # actually broadcast
```

### Format
```bash
bunx biome format --write .   # or: bun run format
```
