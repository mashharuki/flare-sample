# flare-sample

Flare Network の各機能を検証・学習するためのリポジトリです。

---

## Flare Network とは

**Flare** は、**データリッチ**かつ**インターオペラブル**なアプリケーション向けに設計された EVM 互換 Layer 1 ブロックチェーンです。

最大の特徴は、FTSO・FDC といったデータプロトコルが **コアプロトコルに直接組み込まれていること（Enshrined Protocols）** です。これにより、すべてのバリデーターがデータ提供に参加し、ネットワーク全体の経済的安全性がすべてのデータフィードを支えます。サードパーティのオラクルに依存しない設計は Flare 最大の差別化ポイントです。

また、EVM 互換でありながら XRP Ledger・Bitcoin・Dogecoin という**スマートコントラクト非対応チェーンとのネイティブブリッジ**を持ち、これらのユーザーが Flare DeFi に参加できる仕組みを提供します。

---

## コアプロトコル（5 本柱）

### 1. FTSO — Flare Time Series Oracle

分散型のブロックレイテンシー価格フィード。約 100 のデータプロバイダーが参加し、**~1.8 秒ごと**にオンチェーンへ価格を書き込みます。さらに 90 秒ごとの Scaling アンカーフィードも提供。

- バリデーターがデータプロバイダーを兼任するため、外部オラクルへの依存ゼロ
- コミュニティが WFLR を委任することでプロバイダー選定に参加し、報酬を得られる
- 価格フィードは全 100+ 銘柄。スポット・デリバティブ・為替など幅広くカバー

### 2. FDC — Flare Data Connector

外部チェーン上のトランザクションや Web2 API データを、**アテステーション合意 + Merkle プルーフ**でオンチェーン検証するプロトコル。

- 「XRP Ledger 上で支払いが確かに行われた」という事実を Flare 上のスマートコントラクトへ安全に持ち込める
- XRP/BTC/DOGE などの外部チェーンイベントを EVM スマートコントラクトからトリガー可能
- FAssets・Smart Accounts のセキュリティ基盤として機能

### 3. FAssets — トラストレスクロスチェーンブリッジ

XRP・BTC・DOGE を**過剰担保型**でラップした ERC-20 トークン（FXRP・FBTC・FDOGE）を発行するプロトコル。

| トークン | 原資産 | 対象チェーン |
|----------|--------|-------------|
| FXRP | XRP | XRP Ledger |
| FBTC | BTC | Bitcoin |
| FDOGE | DOGE | Dogecoin |

- **エージェント**が担保（ステーブルコイン + FLR）を積み、原資産を保管
- FDC による支払い証明を経て FXRP を発行（Mint）→ Flare DeFi で利用
- FXRP を焼却（Redeem）すると XRP がエージェント経由で XRPL 上に戻される
- 担保不足エージェントは清算され、チャレンジャーが報酬を得る

### 4. Smart Accounts — アカウント抽象化

XRPL ユーザーが **FLR を保有せずに** Flare チェーンのスマートコントラクトを操作できる仕組み。

- 各 XRPL アドレスに対して、そのアドレスだけが制御できる Flare 上のスマートアカウントが払い出される
- ユーザーは XRPL Payment のメモフィールドに 32 バイトの命令（Payment Reference）を書くだけ
- オペレーターが FDC で支払い証明を取得し、`MasterAccountController` を呼び出してガスを立替実行
- FXRP のミント・転送・Firelight/Upshift Vault への預け入れなどをワントランザクションで完結

### 5. FCC — Flare Confidential Compute

**Trusted Execution Environment（TEE）**を用いた安全なオフチェーン計算とクロスチェーン署名拡張。

- データプロバイダーが 50% 超の署名重量で合意した命令のみ TEE マシンが実行
- **Protocol Managed Wallets**：Flare スマートコントラクトから XRPL・Bitcoin 上のトランザクションを組み立て・署名
- **Flare Compute Extensions（FCE）**：開発者が独自の計算モジュールを TEE 内にデプロイし、結果をオンチェーンで検証可能に
- 現在最終開発段階（2026 年 4 月時点では未公開）

---

## 技術仕様

| 項目 | 値 |
|------|-----|
| コンセンサス | Snowman++（Single-slot Finality） |
| ブロック時間 | ~1.8 秒 |
| EVM バージョン | Cancun（`evmVersion: "cancun"` 推奨） |
| ネイティブトークン小数点 | 18 桁 |
| アドレス形式 | 20 バイト ECDSA（Ethereum 互換） |
| トランザクション形式 | EIP-2718（Type 0 / Type 2 対応） |
| トランザクション手数料 | 全額バーン |
| Sybil 耐性 | Proof-of-Stake |

---

## ネットワーク一覧

| ネットワーク | 用途 | ネイティブトークン | Chain ID | RPC URL |
|---|---|---|---|---|
| Flare Mainnet | 本番 | FLR | 14 | `https://flare-api.flare.network/ext/C/rpc` |
| Coston2 | dApp テストネット | C2FLR | 114 | `https://coston2-api.flare.network/ext/C/rpc` |
| Songbird | カナリアネット | SGB | 19 | `https://songbird-api.flare.network/ext/C/rpc` |
| Coston | プロトコルテストネット | CFLR | 16 | `https://coston-api.flare.network/ext/C/rpc` |

**開発フロー：**
- dApp 開発：Coston2 → Flare Mainnet
- プロトコル開発：Coston → Songbird → Coston2 → Flare Mainnet

---

## 他チェーンとの差別ポイント

### vs Ethereum / L2 系

| 観点 | Ethereum / L2 | Flare |
|------|--------------|-------|
| オラクル | Chainlink など外部プロトコルに依存 | FTSO がプロトコルに直接組み込み |
| 非 EVM チェーン連携 | ブリッジは外部チームが別途開発 | FAssets・FDC でネイティブ対応 |
| データ安全性 | オラクルプロバイダーの経済安全性に依存 | ネットワーク全体の PoS セキュリティが担保 |

### vs Avalanche / Cosmos

| 観点 | Avalanche / Cosmos | Flare |
|------|-------------------|-------|
| インターオペラビリティ | 同系列チェーン間（IBC/Subnet）中心 | XRP・BTC・DOGE という主要非 EVM 資産をカバー |
| オラクル | サードパーティ依存 | プロトコルレベルで内蔵 |

### vs Chainlink / Pyth（オラクル比較）

| 観点 | Chainlink / Pyth | Flare FTSO |
|------|-----------------|-----------|
| プロトコル外依存 | あり（独自トークン・独自ネットワーク） | なし（Flare バリデーターが兼任） |
| 経済安全性 | オラクルネットワーク固有 | Flare ネットワーク全体の PoS |
| フィード更新速度 | オンデマンド or 数十秒 | ~1.8 秒（ブロック毎） |

### Flare 独自の優位性まとめ

- **Enshrined Oracles**：外部ベンダー不要。オラクル操作リスクを最小化
- **非 EVM 資産の DeFi 参加**：XRP / BTC / DOGE ホルダーが EVM DeFi を利用可能
- **ガスレス UX（Smart Accounts）**：XRPL ユーザーは FLR なしで Flare を操作可能
- **データ検証（FDC）**：クロスチェーン + Web2 データをオンチェーンで検証
- **TEE 計算（FCC）**：オフチェーンで安全に計算し、結果をオンチェーン証明

---

## XRPL との関係

Flare は XRP Ledger と最も深く統合されたEVMチェーンです。3 つの異なるレイヤーで連携しています。

### 連携レイヤー

```
XRPL ユーザー
     │
     ├─ [FAssets]        XRP → FXRP（ERC-20）へ変換、DeFi で活用
     │                   FXRP → XRP への償還（Redeem）も可能
     │
     ├─ [Smart Accounts] XRPL Payment 1本で Flare スマコンを操作
     │                   FLR 不要、ガスはオペレーターが立替
     │
     └─ [FCC / PMW]      Flare スマコンが XRPL トランザクションに直接署名
                         （Protocol Managed Wallets）
```

### FAssets（FXRP）のフロー

```
1. ユーザーが Flare 上でエージェントに担保を予約（reserveCollateral）
2. ユーザーが XRPL 上でエージェントへ XRP を送金（Payment Reference 付き）
3. FDC がその XRPL 支払いを attestation で検証
4. Flare 上で executeMinting を呼び出し → FXRP が発行される
5. FXRP を Flare DeFi（Uniswap 互換 DEX、レンディングなど）で利用
6. 不要になったら redeem → エージェントが XRPL 上で XRP を返却
```

### Smart Accounts のフロー

```
1. XRPL ウォレット（Xaman 等）から Payment を送信
   └─ Memo フィールドに 32 バイトの命令を記載
      例: 0x01（FXRP 転送）+ 転送量 + 宛先アドレス
2. オペレーターが XRPL をモニタリング → FDC で Payment attestation を取得
3. MasterAccountController.executeTransaction(proof, xrplAddress) を呼び出し
4. Flare 上のスマートアカウントで命令を実行（FLR 不要）
```

### 対応命令（Smart Accounts）

| タイプ | 命令 | 内容 |
|--------|------|------|
| `0x00` | FXRP 担保予約 | ミント開始 |
| `0x01` | FXRP 転送 | 指定アドレスへ送金 |
| `0x02` | FXRP 償還 | XRP に戻す |
| `0x10` | Firelight CR+Deposit | ミント & stXRP Vault 預入 |
| `0x20` | Upshift CR+Deposit | ミント & Upshift Vault 預入 |
| `0xff` | カスタム命令 | 任意のスマートコントラクト呼び出し |

---

## エコシステム・開発ツール

### ブリッジ / OFT

| ツール | 概要 |
|--------|------|
| LayerZero V2 | オムニチェーンメッセージング・資産転送 |
| Stargate V2 | ユニファイドリクイディティプールによるクロスチェーン |
| USD₮0 | Tether の OFT ステーブルコイン |
| flrETH | Liquid Staked ETH（Dinero） |

### インデクサー

| ツール | 概要 |
|--------|------|
| Envio | マルチチェーン EVM インデクサー（リアルタイム + 履歴） |
| Goldsky | ブロックチェーンデータプラットフォーム・Subgraph ホスティング |
| SubQuery | オープンインデキシングプロトコル |

### ウォレット SDK

| ツール | 概要 |
|--------|------|
| Wagmi | React hooks ライブラリ（ウォレット接続・コントラクト操作） |
| RainbowKit | カスタマイズ可能なウォレット接続コンポーネント |
| Etherspot Prime SDK | ERC-4337 アカウント抽象化（スポンサードトランザクション） |

### アナリティクス

| ツール | 概要 |
|--------|------|
| Catenalytica | FTSO パフォーマンス・投票権・報酬分析 |
| Dune | オンチェーンデータクエリ・可視化 |
| Flare Systems Explorer | FTSO / FDC / エポック指標のエクスプローラー |

---

## このリポジトリの構成

| ディレクトリ | 内容 |
|-------------|------|
| `hardhat-sample/` | Hardhat 3 + Viem + TypeScript + Bun による Counter コントラクト。Coston2 / Songbird へのデプロイ・タスク実行を検証 |
| `fxrp-sample/` | FAssets（FXRP）統合スクリプト。XRPL 上でのエージェント選択・担保予約・転送フローを Viem + Biome で実装 |
| `aa-wallet-sample/` | Flare Smart Accounts スターター。XRPL アドレスから Flare スマートアカウントを取得し、Payment Reference 経由で FXRP 操作を実行 |

各サブプロジェクトの詳細なセットアップ・コマンドは [AGENTS.md](./AGENTS.md) を参照してください。

---

## 参考文献

### 公式ドキュメント

| リソース | URL |
|----------|-----|
| Flare Developer Hub | https://dev.flare.network/ |
| Network Overview | https://dev.flare.network/network/overview |
| FTSO ドキュメント | https://dev.flare.network/ftso/overview |
| FDC ドキュメント | https://dev.flare.network/fdc/overview |
| FAssets / FXRP | https://dev.flare.network/fxrp/overview |
| Smart Accounts | https://dev.flare.network/smart-accounts/overview |
| FCC Overview | https://dev.flare.network/fcc/overview |
| Flare Systems Protocol | https://dev.flare.network/network/fsp |
| Governance | https://dev.flare.network/network/governance |

### テストネット・ツール

| リソース | URL |
|----------|-----|
| Coston2 Faucet | https://faucet.flare.network/coston2 |
| Coston2 Explorer | https://coston2-explorer.flare.network/ |
| Flare Systems Explorer | https://flare-systems-explorer.flare.network |
| XRPL Testnet Faucet | https://xrpl.org/resources/dev-tools/xrp-faucets |

### 関連記事

- [HyperliquidでXRP現物取引が解禁：Flare Networkの「FXRP」がもたらすDeFi革命](https://www.gfa.co.jp/crypto/news/alt-news/news-551/)
- [One-Click DeFi Vault with Xaman, powered by Flare Smart Accounts & FAssets](https://flare.network/news/one-click-defi-vault-xaman-flare-smart-accounts)
- [FlareNetwork エコシステム](https://flare.network/news/category/ecosystem)
- [GitHub（flare-foundation）](https://github.com/flare-foundation)
