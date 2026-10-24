# Flare 2026 Updates (as of 2026-10-24)

Primary source: https://flare.network/news. Items marked (unconfirmed) rest on secondary reporting. Full write-up: Notion page "Flare 2026 アップデート棚卸し" under the FlareNetwork page; the same table lives in `.claude/skills/flare-general/SKILL.md` ("Recent Changes").

- **FIP.16** (proposed 2026-04-08, vote Apr 17-24; result unconfirmed): inflation 5%->3%, base gas fee 60->1,200 gwei, staged protocol MEV capture, FIRE entity for FLR buyback/burn, FDC attestation base fee 1->20 FLR (90% to incentive pool).
- **FAssets v1.3** (announced 2026-04-28; mainnet reportedly 2026-05-14, unconfirmed): standard mint = one XRPL payment to Core Vault, Executor relays FDC proof; agents only needed for redemption; hourly/daily mint caps. The `reserveCollateral` flow in `fxrp-sample` is now legacy.
- **Smart Accounts v1.3** (2026-07-28): one XRPL signature from XRP to yield vault (Monarq, Clearstar). `MasterAccountController` address (0x4349...D37c) not verified for v1.3 - resolve via registry.
- **FCC**: live on Songbird since ~2026-10-01 (STP.13); Flare mainnet date TBD; PMW still in development.
- **FBTC**: announced 2026-07-28 as FCC-based, no date. FDOGE: nothing found.
- **flare-tx-sdk 2.0.0** (2026-10-06): removed `claimFlareDropReward` / `getClaimableFlareDropReward`; added `getDefaultAllocatedFeeOnP`, `getRNatProjectsAndClaimableRewards`.
- npm latest: flare-periphery-contracts 0.1.53, flare-wagmi-periphery-package 3.7.0.

**How to apply:** do not hardcode gas price or FDC fees in mainnet scripts; read fees at runtime. When asked about Flare status, re-check flare.network/news since these facts age quickly.
