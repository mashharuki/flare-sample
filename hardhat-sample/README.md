# Flare Network Hardhat 3 チュートリアル

Flare Network（Coston2テストネット）にスマートコントラクトをデプロイ・操作するためのチュートリアルプロジェクトです。

**Hardhat 3** + **Viem** + **TypeScript** を使用した最新構成です。

## ネットワーク情報

| ネットワーク | Chain ID | 用途                      | フォーセット                         |
| ------------ | -------- | ------------------------- | ------------------------------------ |
| Coston2      | 114      | Flareテストネット（推奨） | https://faucet.flare.network/coston2 |
| Coston       | 16       | Songbirdテストネット      | https://faucet.flare.network/coston  |
| Songbird     | 19       | カナリアネットワーク      | -                                    |
| Flare        | 14       | メインネット              | -                                    |

## 前提条件

- Node.js v22 以上
- npm または pnpm

## セットアップ

### 1. 依存関係のインストール

```bash
cd hardhat-sample
npm install
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

```bash
# コントラクトのコンパイル
npm run build

# テスト実行（全て）
npm test

# Solidity テストのみ
npm run test:solidity

# TypeScript テストのみ
npm run test:node

# ローカルノード起動
npm run node

# ローカルにデプロイ
npm run deploy:local

# Coston2 テストネットにデプロイ
npm run deploy:coston2
```

## プロジェクト構造

```
hardhat-sample/
├── contracts/
│   ├── Counter.sol          # シンプルカウンターコントラクト
│   ├── Counter.t.sol        # Solidityテスト（forge-std使用）
│   └── SimpleStorage.sol    # テキスト・数値ストレージコントラクト
├── test/
│   ├── Counter.ts           # TypeScript テスト（Viem + node:test）
│   └── SimpleStorage.ts     # TypeScript テスト
├── ignition/modules/
│   ├── Counter.ts           # Counter デプロイモジュール
│   └── SimpleStorage.ts     # SimpleStorage デプロイモジュール
├── scripts/
│   └── interact.ts          # デプロイ済みコントラクト操作スクリプト
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
npm run build
```

### 2. Coston2 にデプロイ

```bash
npx hardhat ignition deploy ignition/modules/Counter.ts --network coston2
```

デプロイ成功後、コントラクトアドレスが表示されます：

```
CounterModule#Counter - 0x1234...abcd
```

### 3. エクスプローラーで確認

https://coston2-explorer.flare.network でデプロイしたコントラクトを確認できます。

### 4. コントラクトとのインタラクション

`scripts/interact.ts` の `COUNTER_ADDRESS` を実際のアドレスに変更してから実行：

```bash
npx hardhat run scripts/interact.ts --network coston2
```

## Hardhat 3 の注意点（v2との違い）

| 項目             | Hardhat 2         | Hardhat 3                 |
| ---------------- | ----------------- | ------------------------- |
| 設定形式         | `module.exports`  | `defineConfig()` + ESM    |
| プラグイン登録   | 副作用インポート  | `plugins` 配列に明示      |
| ネットワーク接続 | `hre.ethers`      | `await network.connect()` |
| ビルドコマンド   | `hardhat compile` | `hardhat build`           |
| 初期化           | `hardhat init`    | `hardhat --init`          |

## 参考リンク

- [Flare Network ドキュメント](https://dev.flare.network)
- [Hardhat 3 ドキュメント](https://hardhat.org/docs)
- [Flare Hardhat Starter Kit](https://dev.flare.network/network/guides/hardhat-foundry-starter-kit)
- [Coston2 エクスプローラー](https://coston2-explorer.flare.network)
- [Flare フォーセット](https://faucet.flare.network)
