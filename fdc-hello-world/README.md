# FDC Hello World

Flare Data Connector (FDC) の **Payment attestation** パイプライン全体を、実際の
XRPL Testnet送金とCoston2上のコントラクトで、モックなしにエンドツーエンド検証する
最小プロジェクト。

「ReserveFlow Credit」(FDCでXRP準備金を証明し、FTSOで評価して信用枠を発行するハッカソン案)
の最大の技術リスクは、このFDC Payment attestationパイプラインが実際に通るかどうかだった。
このプロジェクトが通れば、`ReserveFlowCore.submitPaymentProof`はここでの
`FdcPaymentHelloWorld.registerPayment`とほぼ同じ形のコードをそのまま流用できる。

## パイプライン

```
XRPL Testnet送金(Memoにpayment reference埋め込み)
        ↓
Verifier API prepareRequest（Payment attestation）
        ↓
FdcHub.requestAttestation（Coston2）
        ↓
ラウンドfinalize待ち（Relay.isFinalized）
        ↓
DA Layerからproof取得（proof-by-request-round-raw）
        ↓
FdcPaymentHelloWorld.registerPayment（Coston2、verifyPayment検証 + reference一致確認）
```

## 前提条件

- Bun v1.0+
- Coston2用のPRIVATE_KEY（C2FLR残高が必要。[faucet](https://faucet.flare.network/coston2)）
- XRPL_SEEDは未設定でも可（スクリプト01が`Client.fundWallet()`でTestnetウォレットを
  新規生成・出金する）

```bash
bun install
cp .env.example .env
# .envのPRIVATE_KEYを、C2FLRを入れた自分のCoston2用秘密鍵に設定する
```

⚠️ **`.env.example`の値をそのまま使わないこと。** 開発中の動作確認では、広く知られた
Hardhatのテスト用秘密鍵(`0xac09...`, アドレス`0xf39Fd6e5...`)を暫定的に使用した。
この鍵は世界中の開発者が使う共有の公開鍵で、誰でも資金を引き出せる状態にあるため、
コンパイル確認以外の目的では絶対に使わないこと。実行時は必ず自分だけの秘密鍵に
置き換えること。

## 実行手順

```bash
# 1. コントラクトのコンパイル
bun run build

# 2. payment referenceを生成する
bun run fdc:00-generate-reference
# 出力された値を ignition/parameters.json の expectedPaymentReference に設定
# （ignition/parameters.example.json を参考にファイルを作成する）

# 3. コントラクトをCoston2にデプロイ
bun run deploy:coston2

# 4. XRPL Testnetウォレットを準備（新規生成 + fundWalletで自動出金）
bun run fdc:01-fund-xrpl-wallets

# 5. XRPL Payment送信（Memoに payment reference を埋め込む）
bun run fdc:02-send-xrpl-payment

# 6. FDC Payment attestationをリクエスト
bun run fdc:03-request-attestation

# 7. ラウンドのfinalizeを待ってDA Layerからproofを取得
#    （finalizeは典型的に90〜180秒。DA Layer側のインデックスに数十秒のラグが
#      見られる場合があるため、"attestation request not found" エラーが出たら
#      少し待って再実行する）
bun run fdc:04-await-and-fetch-proof

# 8. proofをコントラクトへ提出し、成功基準をチェック
bun run fdc:05-submit-proof
```

各ステップの状態は`fdc-hello-world.state.json`（gitignore対象）に保存されるため、
途中のステップで失敗しても、実際のXRPL送金からやり直さずに、そのステップだけ
再実行できる。

## 成功基準

`fdc:05-submit-proof`が以下をすべてチェックし、`🎉 PASS`を出力すれば成功。

1. `registerPayment`トランザクションが成功する
2. `expectedPaymentReference()`がスクリプト00の出力と一致する
3. FDCが返した`standardPaymentReference`が期待値と一致する
4. `verifiedPaymentsCount() === 1`
5. `status === 0`（成功した送金であること）
6. `sourceAddressHash`/`receivingAddressHash`をオフチェーンで独立に計算した値と一致する
   （proofが有効なだけでなく、意図した送金の証明であることまで確認する）
7. `receivedAmount`がXRPL側の送金額(drops)と一致する

## 実行結果（2026-08-02、Coston2 + XRPL Testnet）

このプロジェクトを実際に一度通した結果、上記7項目すべて`PASS`した。

| 項目                         | 値                                                                                                                                        |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| デプロイ済みコントラクト     | [`0xE97166C46816d48B2aFFCfFf704B962E88fd0abE`](https://coston2-explorer.flare.network/address/0xE97166C46816d48B2aFFCfFf704B962E88fd0abE) |
| XRPL送金tx                   | [`17DF1254...44A19`](https://testnet.xrpl.org/transactions/17DF1254F3EF40D4D9D890978C1ED6550E31846FA60543E1E28FA23D35244A19)              |
| FdcHub.requestAttestation tx | [`0x6a48d144...6a3956`](https://coston2-explorer.flare.network/tx/0x6a48d1448b1d9f3e8583c3940c49232195f412d587d81f38d36ca8926d6a3956)     |
| FDC roundId                  | `1413800`                                                                                                                                 |
| registerPayment tx           | [`0xbce189ca...82f8ca`](https://coston2-explorer.flare.network/tx/0xbce189ca9a0e57d8bf542cd8d3967432a7c583d1b19fa6d42a714541f782f8ca)     |
| 送金額                       | 5 XRP (5,000,000 drops)                                                                                                                   |

## 既知の制約 / 次のステップ

- FDCの`Payment`(汎用)ではなく`XRPPayment`(XRPL固有)を使うと、Destination Tagや
  Memoフィールドをより直接的に扱える。今回は汎用`Payment`型の`standardPaymentReference`
  で要件を満たせたため、あえてシンプルな方を採用した。
- Hardhatユニットテストは意図的に未実装（`ContractRegistry`のアドレスはローカルネットに
  存在しないため、意味のあるテストにはCoston2 forkが必要）。ReserveFlow Credit本実装時に
  forkベースのテストを追加する。
- ReserveFlow Creditでは、この`registerPayment`のロジック（proof検証 → reference一致確認
  → 状態更新）を`ReserveFlowCore.submitPaymentProof`にほぼそのまま移植し、そこに
  FTSO価格評価とcredit limit計算を追加していく。
