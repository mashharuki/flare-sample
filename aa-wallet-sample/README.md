# AA Wallet Sample — Flare Smart Accounts スタータープロジェクト

Flare Network の **Smart Accounts（アカウント抽象化）** を学ぶための初心者向けスタータープロジェクトです。

## Flare Smart Accounts とは

Flare Smart Accounts は、**XRPL ユーザーが FLR を持たずに Flare チェーン上の操作を行える**仕組みです。通常、Flare でトランザクションを送るには FLR（ガス代）が必要ですが、この仕組みを使えば XRPL ウォレットだけで Flare の DeFi を利用できます。

| 特徴 | 説明 |
|---|---|
| **FLR 不要** | XRP Ledger のウォレットだけで Flare を操作できる |
| **自動作成** | XRPL アドレスごとに Flare スマートアカウントが自動生成される |
| **ガス代はオペレーターが負担** | リレーヤーサービスが Flare 側の実行を担う |
| **証明ベースのセキュリティ** | FDC（Flare Data Connector）で XRPL の支払いを検証 |
| **カスタム命令対応** | 任意のコントラクト呼び出しを XRPL 経由でトリガーできる |

## 仕組みの概要

```
XRPL ユーザー
  │
  │  Payment トランザクション
  │  (memo に 32 バイトの命令を埋め込む)
  ▼
XRPL ネットワーク ─────────────────────────────────────────
                                    │
                          オペレーターが監視
                          FDC 証明を取得
                                    │
                                    ▼
                     MasterAccountController (Flare チェーン)
                      │
                      ├─ Personal Smart Account を自動作成
                      └─ 命令を実行 (FXRP 転送、DeFi 操作 etc.)
                                    │
                                    ▼
                     Personal Smart Account (Flare アドレス)
```

## 前提条件

- [Bun](https://bun.sh) v1.0 以上
- Node.js v22 以上
- XRPL テストネット用ウォレット（下記フォーセットから取得）

## セットアップ

```bash
cd aa-wallet-sample
bun install
cp .env.example .env
```

`.env` ファイルを編集して `XRPL_SEED` を設定します。

```env
# XRPL テストネット用ウォレットシード
XRPL_SEED=s...

# スクリプト 04, 05 用: Flare ウォレット秘密鍵
PRIVATE_KEY=0x...

# スクリプト 04 用: FXRP の転送先 Flare アドレス
RECIPIENT_ADDRESS=0x...
```

XRPL テストネット用トークンは [XRP Faucets](https://xrpl.org/resources/dev-tools/xrp-faucets) から取得してください。

## スクリプト一覧

| スクリプト | 内容 | 必要な環境変数 |
|---|---|---|
| `01-get-smart-account.ts` | XRPL アドレスに紐づく Flare スマートアカウントを取得 | `XRPL_SEED` |
| `02-check-balances.ts` | FLR・FXRP・Vault 残高の確認 | `XRPL_SEED` |
| `03-encode-instructions.ts` | 命令エンコードのデモ表示 | 不要 |
| `04-send-fxrp-transfer.ts` | FXRP 転送命令を XRPL 経由で送信 | `XRPL_SEED`, `RECIPIENT_ADDRESS` |
| `05-custom-instruction.ts` | カスタム命令の登録・エンコード例 | `XRPL_SEED`, `PRIVATE_KEY` |

### まずここから（ネット接続不要）

```bash
# 命令エンコードの仕組みをデモ表示
bun run 03:encode-instructions
```

### スマートアカウントの確認

```bash
# あなたの XRPL アドレスに対応する Flare アドレスを取得
bun run 01:get-smart-account

# スマートアカウントの残高を確認
bun run 02:check-balances
```

### FXRP 転送（XRPL トランザクション送信）

```bash
# FXRP 転送命令を XRPL Payment として送信
bun run 04:send-fxrp-transfer
```

> **注意**: スクリプト 04 は実際の XRPL トランザクションを送信します。必ずテストネットで実行してください。

### カスタム命令の登録

```bash
# 任意のコントラクト呼び出しをカスタム命令として登録
bun run 05:custom-instruction
```

## プロジェクト構造

```
aa-wallet-sample/
├── src/
│   ├── client.ts               # Viem パブリック/ウォレットクライアント (Coston2 接続)
│   ├── constants.ts            # ABI・定数・getMasterAccountControllerAddress()
│   ├── helpers/
│   │   └── paymentRef.ts       # 32 バイト命令エンコード/デコードヘルパー
│   └── scripts/
│       ├── 01-get-smart-account.ts    # XRPL → Flare アドレス取得
│       ├── 02-check-balances.ts       # FLR/FXRP/Vault 残高確認
│       ├── 03-encode-instructions.ts  # 命令エンコードデモ
│       ├── 04-send-fxrp-transfer.ts   # XRPL Payment 送信
│       └── 05-custom-instruction.ts  # カスタム命令登録・エンコード
├── .env.example
├── biome.json
├── package.json
└── tsconfig.json
```

## 重要な概念

### 32 バイトのペイメントリファレンス

XRPL Payment トランザクションの Memo フィールドに埋め込む命令の形式です。

```
[Byte 1 : 命令 ID][Byte 2 : ウォレット ID][Bytes 3-12 : Value][Bytes 13-32 : パラメータ]
```

| 命令 ID | 命令名 |
|---|---|
| `0x00` | FXRP 担保予約 |
| `0x01` | FXRP 転送 |
| `0x02` | FXRP リデーム |
| `0x11` | Firelight デポジット |
| `0x21` | Upshift デポジット |
| `0xff` | カスタム命令 |

### MasterAccountController

スマートアカウントの中核コントラクトです。全 Flare ネットワークで同じアドレス (`0x434936d47503353f06750Db1A444DBDC5F0AD37c`) を持ちます。

```typescript
// XRPL アドレスから Flare スマートアカウントアドレスを取得
const smartAccount = await publicClient.readContract({
  address: controllerAddress,
  abi: MASTER_ACCOUNT_CONTROLLER_ABI,
  functionName: "getPersonalAccount",
  args: [xrplWallet.address],
});
```

### FlareContractsRegistry

`0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019`（全ネットワーク共通）

コントラクトアドレスを動的に取得するためのレジストリです。

```typescript
// MasterAccountController アドレスをレジストリから取得（推奨）
const address = await getMasterAccountControllerAddress();
```

## 参考リンク

- [Flare Smart Accounts 公式ドキュメント](https://dev.flare.network/smart-accounts/)
- [Smart Accounts CLI](https://github.com/flare-foundation/smart-accounts-cli)
- [Coston2 エクスプローラー](https://coston2-explorer.flare.network)
- [Coston2 フォーセット](https://faucet.flare.network/coston2)
- [XRP Testnet フォーセット](https://xrpl.org/resources/dev-tools/xrp-faucets)
- [FAssets サンプル (fxrp-sample)](../fxrp-sample/README.md)
