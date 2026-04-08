# Code Style & Conventions

## TypeScript (両プロジェクト共通)
- ESM modules (`"type": "module"`) — always use `.js` extensions in imports
- Explicit return types on exported functions
- `BigInt` / `bigint` for on-chain numeric values (e.g. `0n`, `BigInt(amount)`)
- JSDoc comments in Japanese for public functions

## Formatter
- **hardhat-sample**: Prettier + prettier-plugin-solidity
- **fxrp-sample**: Biome (`bunx biome format --write .` / `bun run format`)

## Solidity (hardhat-sample)
- Version: `^0.8.28`
- Custom errors preferred over `require` strings
- NatSpec comments (`@notice`, `@dev`, `@param`) in Japanese
- Optimizer: 200 runs

## Hardhat 3 Patterns (hardhat-sample)
- Tasks use `.addOption()` not `.addParam()`
- Network access via `await hre.network.connect()`, returns `{ viem }`
- Tasks registered in `hardhat.config.ts` via `tasks` array
- Plugins registered via `plugins` array

## viem Patterns (fxrp-sample)
- Chain defined with `defineChain()` in `src/client.ts`
- Multiple return values from `read.*` come as an array: `const [a, b] = await contract.read.fn([...])`
- FTSOv2 price: `price = rawValue / 10^feedDecimals`
- All RPC-returned addresses validated with `isAddress()` before use
- ABIs defined inline as `const ... = [...] as const` in `constants.ts`

## Naming
- Task names: `contract:action` (e.g. `counter:increment-by`)
- Script names: `NN-kebab-case.ts` numbered for learning order
- Module IDs: `ModuleName#ContractName` (e.g. `CounterModule#Counter`)
