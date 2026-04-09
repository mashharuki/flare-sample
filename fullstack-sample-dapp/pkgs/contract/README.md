# Flare Network Hardhat 3 チュートリアル

Flare Network（Coston2テストネット）にスマートコントラクトをデプロイ・操作するためのチュートリアルプロジェクトです。

**Hardhat 3** + **Viem** + **TypeScript** + **bun** を使用した最新構成です。

## ネットワーク情報

| ネットワーク | Chain ID | 用途                      | フォーセット                         |
| ------------ | -------- | ------------------------- | ------------------------------------ |
| Coston2      | 114      | Flareテストネット（推奨） | https://faucet.flare.network/coston2 |
| Coston       | 16       | Songbirdテストネット      | https://faucet.flare.network/coston  |
| Songbird     | 19       | カナリアネットワーク      | -                                    |
| Flare        | 14       | メインネット              | -                                    |

## 前提条件

- Node.js v22 以上
- [bun](https://bun.sh) v1.0 以上

## セットアップ

### 1. 依存関係のインストール

```bash
cd hardhat-sample
bun install
```

### 2. 環境変数の設定

```bash
cp .env.example .env
```

`.env` ファイルを編集して秘密鍵を設定します：

```
PRIVATE_KEY=0xあなたの秘密鍵
```

> 警告: 秘密鍵を Git にコミットしないこと！`.env` は `.gitignore` で除外済み。

### 3. テストトークンの取得

Coston2 フォーセットからテスト用トークン（C2FLR）を取得：
https://faucet.flare.network/coston2

## コマンド一覧

### ビルド・テスト

```bash
# コントラクトのコンパイル
bun run build

# テスト実行（全て）
bun test

# Solidity テストのみ
bun run test:solidity

# TypeScript テストのみ
bun run test:node

# ローカルノード起動
bun run node

# コードフォーマット
bun run format

# フォーマットチェック（CI用）
bun run format:check
```

### デプロイ

```bash
# ローカルにデプロイ
bun run deploy:local

# Coston2 テストネットにデプロイ
bun run deploy:coston2

# Songbird にデプロイ
bun run deploy:songbird
```

### コントラクト操作タスク（Counter）

デプロイ後に使用できる Hardhat タスクです。コントラクトアドレスは
`ignition/deployments/chain-{chainId}/deployed_addresses.json` から自動で読み込まれます。

```bash
# 現在のカウント値を取得
bun run counter:get
# → bun hardhat counter:get --network coston2

# カウンターを1増やす
bun run counter:increment
# → bun hardhat counter:increment --network coston2

# カウンターを N 増やす（--amount で指定）
bun run counter:increment-by -- --amount 5
# → bun hardhat counter:increment-by --amount 5 --network coston2

# カウンターを1減らす
bun run counter:decrement
# → bun hardhat counter:decrement --network coston2

# カウンターを0にリセット（オーナーのみ）
bun run counter:reset
# → bun hardhat counter:reset --network coston2

# コントラクト情報を表示（アドレス・オーナー・カウント）
bun run counter:info
# → bun hardhat counter:info --network coston2
```

他のネットワークで操作する場合は `--network` を直接指定してください：

```bash
bun hardhat counter:get --network songbird
bun hardhat counter:increment-by --amount 10 --network coston
```

## プロジェクト構造

```
hardhat-sample/
├── contracts/
│   ├── Counter.sol          # シンプルカウンターコントラクト
│   ├── Counter.t.sol        # Solidityテスト（forge-std使用）
│   └── SimpleStorage.sol    # テキスト・数値ストレージコントラクト
├── helpers/
│   └── getDeployedAddress.ts  # ignitionデプロイアドレス読み込みヘルパー
├── ignition/modules/
│   ├── Counter.ts           # Counter デプロイモジュール
│   └── SimpleStorage.ts     # SimpleStorage デプロイモジュール
├── tasks/
│   ├── counter.ts           # Counter 操作タスク
│   └── index.ts             # タスクエクスポート
├── test/
│   ├── Counter.ts           # TypeScript テスト（Viem + node:test）
│   └── SimpleStorage.ts     # TypeScript テスト
├── hardhat.config.ts        # Hardhat 3 設定
├── tsconfig.json
├── package.json
└── .env.example
```

## コントラクト説明

### Counter.sol

シンプルなカウンターコントラクト。基本的なEVM操作を学ぶのに最適。

- `increment()` — カウントを1増やす
- `incrementBy(uint256 amount)` — カウントを指定値増やす
- `decrement()` — カウントを1減らす（0未満にはならない）
- `reset()` — カウントを0にリセット（オーナーのみ）
- `getCount()` — 現在のカウントを取得

### SimpleStorage.sol

テキストと数値を保存できるストレージコントラクト。

- `setText(string text)` — テキストを保存
- `setNumber(uint256 number)` — 数値を保存
- `getText()` — テキストを取得
- `getNumber()` — 数値を取得
- `getAll()` — テキストと数値を同時取得

## デプロイ手順（Coston2）

### 1. コントラクトをビルド

```bash
bun run build
```

### 2. Coston2 にデプロイ

```bash
bun run deploy:coston2
```

デプロイ成功後、コントラクトアドレスが表示されます：

```
CounterModule#Counter - 0x1234...abcd
```

アドレスは `ignition/deployments/chain-114/deployed_addresses.json` に自動保存されます。

### 3. エクスプローラーで確認

https://coston2-explorer.flare.network でデプロイしたコントラクトを確認できます。

### 4. コントラクトとのインタラクション

デプロイ後はタスクコマンドで操作できます（アドレス指定不要）：

```bash
bun run counter:info       # コントラクト情報を確認
bun run counter:increment  # カウントを増やす
bun run counter:get        # 現在値を確認
```

## ヘルパー: getDeployedAddress

`helpers/getDeployedAddress.ts` はデプロイアドレスを動的に読み込む汎用ヘルパーです。
独自タスクを追加する際にも再利用できます。

```typescript
import {
  getDeployedAddress,
  getAllDeployedAddresses,
  listDeployedContracts,
} from "../helpers/getDeployedAddress.js";

// 特定コントラクトのアドレスを取得
const address = getDeployedAddress("CounterModule#Counter", 114);

// チェーンの全デプロイ情報を取得
const all = getAllDeployedAddresses(114);

// デプロイ済み一覧をコンソール出力
listDeployedContracts(114);
```

## Hardhat 3 の注意点（v2との違い）

| 項目             | Hardhat 2         | Hardhat 3                 |
| ---------------- | ----------------- | ------------------------- |
| 設定形式         | `module.exports`  | `defineConfig()` + ESM    |
| プラグイン登録   | 副作用インポート  | `plugins` 配列に明示      |
| ネットワーク接続 | `hre.ethers`      | `await network.connect()` |
| ビルドコマンド   | `hardhat compile` | `hardhat build`           |
| 初期化           | `hardhat init`    | `hardhat --init`          |
| タスクパラメータ | `.addParam()`     | `.addOption()`            |

## 参考リンク

- [Flare Network ドキュメント](https://dev.flare.network)
- [Hardhat 3 ドキュメント](https://hardhat.org/docs)
- [Flare Hardhat Starter Kit](https://dev.flare.network/network/guides/hardhat-foundry-starter-kit)
- [Coston2 エクスプローラー](https://coston2-explorer.flare.network)
- [Flare フォーセット](https://faucet.flare.network)
