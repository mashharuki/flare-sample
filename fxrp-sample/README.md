# FXRP Sample — Flare FAssets スタータープロジェクト

Flare Network の主要機能 **FXRP (FAssets)** を学ぶためのスタータープロジェクトです。

## FXRP とは

FXRP は Flare の **FAssets** システムが生み出す ERC-20 トークンで、XRP Ledger の XRP を Flare の EVM 上で使えるようにラップしたものです。

| 特徴 | 説明 |
|---|---|
| **トラストレス** | FDC（Flare Data Connector）による XRPL 上の XRP 支払い検証 |
| **過剰担保** | エージェントが FLR/ステーブルコインで担保を提供 |
| **償還可能** | FXRP → XRP にいつでも戻せる |
| **DeFi 対応** | 通常の ERC-20 として Flare DeFi で利用可能 |

## ミントフロー

```
Step 1: reserveCollateral()     (Flare トランザクション)
   ↓
Step 2: XRP を XRPL でエージェントに送付
   ↓
Step 3: FDC で XRP 支払いを証明（attestation）
   ↓
Step 4: executeMinting() → FXRP 受け取り
```

## 前提条件

- Node.js v22 以上
- [Bun](https://bun.sh) v1.0 以上

## セットアップ

```bash
cd fxrp-sample
bun install
cp .env.example .env
```

テスト用トークンは [Coston2 フォーセット](https://faucet.flare.network/coston2) から取得してください。

## スクリプト一覧

| スクリプト | 内容 | 秘密鍵 |
|---|---|---|
| `01-get-fxrp-address.ts` | FXRP トークンアドレスの取得 | 不要 |
| `02-get-fassets-settings.ts` | ロットサイズ・XRP/USD 価格 | 不要 |
| `03-list-agents.ts` | 利用可能エージェント一覧 | 不要 |
| `04-reserve-collateral.ts` | 担保予約（ミント Step 1）| 必要 |

### 読み取り専用スクリプト（秘密鍵不要）

```bash
# FXRP のトークンアドレスを取得
bun run 01:get-fxrp-address

# ロットサイズと XRP/USD 価格を確認
bun run 02:get-fassets-settings

# エージェント一覧（手数料・空きロット数）を確認
bun run 03:list-agents
```

### 書き込みスクリプト（DRY RUN デフォルト）

```bash
# 担保予約のシミュレーション（送信なし）
bun run 04:reserve-collateral

# 実際に送信する場合
DRY_RUN=false bun run 04:reserve-collateral
```

> **注意**: `04-reserve-collateral.ts` は実行すると CRF（担保予約手数料）が発生します。  
> ミント失敗時も CRF は返金されません。まず Coston2 テストネットで試してください。

実際に発行したトランザクション

[0x1cf02862c84f2653500c3615b663aa5bde3a345337bd48bcdce15a52b189bc5f](https://coston2-explorer.flare.network/tx/0x1cf02862c84f2653500c3615b663aa5bde3a345337bd48bcdce15a52b189bc5f)

## プロジェクト構造

```
fxrp-sample/
├── src/
│   ├── client.ts           # viem パブリッククライアント（Coston2 接続）
│   ├── constants.ts        # レジストリアドレス・フィードID・ABI
│   └── scripts/
│       ├── 01-get-fxrp-address.ts      # Registry → AssetManager → fAsset()
│       ├── 02-get-fassets-settings.ts  # getSettings() + FTSOv2 価格
│       ├── 03-list-agents.ts           # getAvailableAgentsDetailedList()
│       └── 04-reserve-collateral.ts   # reserveCollateral() (DRY RUN)
├── .env.example
├── package.json
└── tsconfig.json
```

## 重要な概念

### FlareContractsRegistry

`0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019`（全ネットワーク共通）

FXRP やその他 Flare コントラクトのアドレスはネットワークによって異なるため、**必ずレジストリ経由で取得**します。ハードコードは禁止。

```typescript
// 正しい方法: レジストリから動的に解決
const assetManagerAddress = await registry.read.getContractAddressByName(["AssetManagerFXRP"]);
const fxrpAddress = await assetManager.read.fAsset();
```

### ロット（Lot）

ミントの最小単位。`02-get-fassets-settings.ts` で確認できます（Coston2 では通常 10〜20 XRP）。

### エージェント

XRP を預かり担保を提供する参加者。ミント時は `feeBIPS`（手数料）と `freeCollateralLots`（空き容量）を基準に選択します。

## 参考リンク

- [FXRP 概要](https://dev.flare.network/fxrp/overview)
- [FAssets ミント](https://dev.flare.network/fassets/developer-guides/fassets-mint)
- [FAssets 設定値](https://dev.flare.network/fassets/developer-guides/fassets-settings-node)
- [エージェント一覧](https://dev.flare.network/fassets/developer-guides/fassets-list-agents)
- [Coston2 エクスプローラー](https://coston2-explorer.flare.network)
- [Coston2 フォーセット](https://faucet.flare.network/coston2)
