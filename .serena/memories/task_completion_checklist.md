# Task Completion Checklist

After completing any code change in `hardhat-sample/`:

1. **Build** — verify contracts compile:
   ```bash
   bun run build
   ```

2. **Test** — run relevant tests:
   ```bash
   bun test               # all
   bun run test:solidity  # if Solidity changed
   bun run test:node      # if TypeScript changed
   ```

3. **Format** — ensure consistent style:
   ```bash
   bun run format
   ```

4. **Format check** (CI):
   ```bash
   bun run format:check
   ```

No linter (ESLint) is configured — formatting via Prettier is sufficient.

## Other sub-projects
- `fxrp-sample/`, `aa-wallet-sample/`: run `bun run format` (Biome); no test suite.
- `fdc-hello-world/`: `bun run build` then `bun run format:check` (Prettier).
- Docs: when Flare behaviour changes, update `.claude/skills/flare-*`, READMEs, and memory `flare_updates_2026`.
