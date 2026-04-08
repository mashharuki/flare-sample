# Code Style & Conventions

## TypeScript
- ESM modules (`"type": "module"`) — always use `.js` extensions in imports (e.g., `../helpers/getDeployedAddress.js`)
- JSDoc comments in Japanese for public functions (`@param`, `@returns`, `@example`)
- Explicit return types on exported functions
- `BigInt` for on-chain numeric values (e.g., `0n`, `BigInt(amount)`)
- Prettier for formatting (auto-configured)

## Solidity
- Version: `^0.8.28`
- Custom errors preferred over `require` strings (e.g., `error OnlyOwner()`)
- NatSpec comments (`@notice`, `@dev`, `@param`) in Japanese
- Optimizer enabled: 200 runs
- Prettier + prettier-plugin-solidity for formatting

## Hardhat 3 Patterns
- Tasks use `.addOption()` not `.addParam()`
- Network access via `await hre.network.connect()`, returns `{ viem }`
- Tasks registered in `hardhat.config.ts` via `tasks` array
- Plugins registered via `plugins` array (not side-effect imports)

## Naming
- Task names: `contract:action` format (e.g., `counter:increment-by`)
- Module IDs: `ModuleName#ContractName` (e.g., `CounterModule#Counter`)
- Contract variables: camelCase; contract names: PascalCase
