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
| `00-generate-xrpl-wallet.ts` | XRPL ウォレットの新規生成 | 不要 |
| `01-get-smart-account.ts` | XRPL アドレスに紐づく Flare スマートアカウントを取得 | `XRPL_SEED` |
| `02-check-balances.ts` | FLR・FXRP・Vault 残高の確認 | `XRPL_SEED` |
| `03-encode-instructions.ts` | 命令エンコードのデモ表示 | 不要 |
| `04-send-fxrp-transfer.ts` | FXRP 転送命令を XRPL 経由で送信 | `XRPL_SEED`, `RECIPIENT_ADDRESS` |
| `05-custom-instruction.ts` | カスタム命令の登録・エンコード例 | `XRPL_SEED`, `PRIVATE_KEY` |

### Step 0: XRPL ウォレットを生成する

```bash
# 新しい XRPL ウォレット（シード・アドレス・公開鍵）を生成
bun run 00:generate-xrpl-wallet
```

実行すると以下のような出力が得られます。

```
=== XRPL ウォレット生成 ===

新しい XRPL ウォレットを生成しました:

  シード (XRPL_SEED) : sEdS2d1YHGXk3rkJ5aLxQw9JGrgd4cq
  アドレス           : rhFctxMbhb2zrnZAGZm4SBKfqrFi7rJoDW
  公開鍵             : EDBD7632855FC9E94B19FDB8C4701209...
```

生成後は以下の手順で準備を進めます。

1. **シードを `.env` に設定する**

   ```env
   XRPL_SEED=sEdS2d1YHGXk3rkJ5aLxQw9JGrgd4cq  # 生成された値を貼り付ける
   ```

2. **テスト用 XRP をフォーセットから取得する**

   [XRP Faucets](https://xrpl.org/resources/dev-tools/xrp-faucets) を開き、生成されたアドレスを入力して XRP を受け取ります。

3. **次のスクリプトへ進む**

   ```bash
   bun run 01:get-smart-account
   ```

   実行結果例

   ```bash
    === Flare Smart Accounts: スマートアカウント取得 ===

    XRPL ウォレット情報:
      アドレス : rMH93SMmbmvKrV2gGT1BNZrN587faNXi7E
      公開鍵   : EDB680652557E56B2DA43032221F4B4DCE97F6B59057A775E0443F56A4075A6A7A

    MasterAccountController アドレスを取得中...
      アドレス : 0x434936d47503353f06750Db1A444DBDC5F0AD37c

    Flare スマートアカウントアドレスを取得中...
      Flare スマートアカウント : 0xa79385960Fa2041549B0A172FaB1c934425876AE

    オペレーター XRPL アドレスを取得中...
      オペレーター XRPL アドレス:
      - rEyj8nsHLdgt79KJWzXR5BgF7ZbaohbXwq

    === 仕組みの説明 ===

    Flare Smart Accounts の流れ:

    1. あなたの XRPL アドレス (rMH93SMmbmvKrV2gGT1BNZrN587faNXi7E)
      ↓
    2. XRPL Payment トランザクション (memo に 32 バイトの命令を埋め込む)
      宛先: rEyj8nsHLdgt79KJWzXR5BgF7ZbaohbXwq
      ↓
    3. オペレーターが FDC 証明を取得して MasterAccountController を呼び出す
      ↓
    4. あなたの Flare スマートアカウント (0xa79385960Fa2041549B0A172FaB1c934425876AE)
      が命令を実行する (FXRP 転送、DeFi 操作 etc.)

    ポイント: FLR を持たなくても Flare チェーン上で操作できる！
   ```

> **セキュリティ注意事項**
> - シード（秘密鍵）は絶対に他人に見せないでください
> - `.env` ファイルは `.gitignore` に含まれているため Git にはコミットされません
> - テストネット用に生成したシードをメインネットで使用しないでください

### まずここから（ネット接続不要）

```bash
# 命令エンコードの仕組みをデモ表示
bun run 03:encode-instructions
```

実行結果例

```bah
=== Flare Smart Accounts: 命令エンコードデモ ===

32 バイト構造: [命令ID 1B][ウォレットID 1B][Value 10B][パラメータ 20B]
────────────────────────────────────────────────────────────

【FXRP 担保予約 (1 ロット, エージェント ID=1)】
  エンコード結果: 0x0000000000000000000000010001000000000000000000000000000000000000
  命令名       : FXRP 担保予約
  命令 ID      : 0x00
  ウォレット ID: 0
  Value        : 1
  パラメータ   : 0001000000000000000000000000000000000000

【FXRP 転送 (10 FXRP → 0xf548...131d)】
  エンコード結果: 0x01000000000000000000000af5488132432118596fa13800b68df4c0ff25131d
  命令名       : FXRP 転送
  命令 ID      : 0x01
  ウォレット ID: 0
  Value        : 10
  パラメータ   : f5488132432118596fa13800b68df4c0ff25131d

【FXRP リデーム (1 ロット)】
  エンコード結果: 0x0200000000000000000000010000000000000000000000000000000000000000
  命令名       : FXRP リデーム
  命令 ID      : 0x02
  ウォレット ID: 0
  Value        : 1
  パラメータ   : 0000000000000000000000000000000000000000

【Firelight デポジット (100 FXRP, ボールト ID=1)】
  エンコード結果: 0x1100000000000000000000640000000100000000000000000000000000000000
  命令名       : Firelight: デポジット
  命令 ID      : 0x11
  ウォレット ID: 0
  Value        : 100
  パラメータ   : 0000000100000000000000000000000000000000

【Upshift デポジット (50 FXRP, ボールト ID=2)】
  エンコード結果: 0x2100000000000000000000320000000200000000000000000000000000000000
  命令名       : Upshift: デポジット
  命令 ID      : 0x21
  ウォレット ID: 0
  Value        : 50
  パラメータ   : 0000000200000000000000000000000000000000


=== 命令タイプ一覧 ===
  0x00 : FXRP_COLLATERAL_RESERVATION
  0x01 : FXRP_TRANSFER
  0x02 : FXRP_REDEEM
  0x10 : FIRELIGHT_CR_DEPOSIT
  0x11 : FIRELIGHT_DEPOSIT
  0x12 : FIRELIGHT_REDEEM
  0x13 : FIRELIGHT_CLAIM_WITHDRAW
  0x20 : UPSHIFT_CR_DEPOSIT
  0x21 : UPSHIFT_DEPOSIT
  0x22 : UPSHIFT_REQUEST_REDEEM
  0x23 : UPSHIFT_CLAIM
  0xff : CUSTOM

=== エンコードデモ完了 ===

これらのペイメントリファレンスを XRPL Payment トランザクションの
Memo フィールドに埋め込むと、オペレーターが Flare 上で命令を実行します。
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

実行結果例

```bash
=== Flare Smart Accounts: FXRP 転送命令の送信 ===

XRPL ウォレット : r4U1RSo5v3PwRYcBZj2JKVjL8y2JDScW6C
転送先 Flare    : 0x51908F598A5e0d8F1A3bAbFa6DF76F9704daD072

オペレーター XRPL : rEyj8nsHLdgt79KJWzXR5BgF7ZbaohbXwq

エンコード済み命令:
  ペイメントリファレンス : 0x01000000000000000000000a51908F598A5e0d8F1A3bAbFa6DF76F9704daD072
  命令名               : FXRP 転送
  転送量 (raw)         : 10
  パラメータ (転送先)   : 0x51908F598A5e0d8F1A3bAbFa6DF76F9704daD072

XRPL テストネットに接続中...
接続完了

XRPL Payment トランザクションを送信中...
  宛先     : rEyj8nsHLdgt79KJWzXR5BgF7ZbaohbXwq
  金額     : 1 XRP
  MemoData : 01000000000000000000000A51908F598A5E0D8F1A3BABFA6DF76F9704DAD072

✅ トランザクション送信完了!
  TX ハッシュ : 8E399245E0B083E172815557BFD552525AE5DE239062363E0EDD4ABBA24EDF56
  エクスプローラー: https://testnet.xrpl.org/transactions/8E399245E0B083E172815557BFD552525AE5DE239062363E0EDD4ABBA24EDF56

次のステップ: オペレーターが FDC 証明を取得して Flare 上で命令を実行します。
Flare エクスプローラーでスマートアカウントへの FXRP 転送を確認できます:
  https://coston2-explorer.flare.network
```

> **注意**: スクリプト 04 は実際の XRPL トランザクションを送信します。必ずテストネットで実行してください。

#### `Account not found.` エラーが出た場合

XRPL アカウントはまだ XRP を受け取ったことがない場合、ネットワーク上に存在しない状態です。  
[XRP Faucets](https://xrpl.org/resources/dev-tools/xrp-faucets) でアドレスに XRP を送ってアカウントを有効化してから再実行してください。

```
❌ XRPL アカウントが有効化されていません。

  XRP テストネット フォーセットでアカウントに XRP を送金してください:
  https://xrpl.org/resources/dev-tools/xrp-faucets
  アドレス: rXXXXXXXXXXXXXXXXXXXX
```

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
│       ├── 00-generate-xrpl-wallet.ts # XRPL ウォレット新規生成
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
