/**
 * スクリプト 05: カスタム命令の登録・エンコード例
 *
 * 【学習内容】
 *   任意のコントラクト呼び出しを XRPL 経由でトリガーする「カスタム命令」を学ぶ。
 *   registerCustomInstruction でオンチェーンに登録し、
 *   encodeCustomInstruction でペイメントリファレンスを取得する手順を確認する。
 *
 * 【前提条件】
 *   .env ファイルに以下を設定すること:
 *   - XRPL_SEED    : XRPL テストネット用ウォレットシード
 *   - PRIVATE_KEY  : Flare ウォレット秘密鍵 (カスタム命令登録に必要)
 *
 *   スクリプト 04 を先に実行し、スマートアカウントに FLR が存在することを確認すること。
 *
 * 【実行方法】
 *   bun run 05:custom-instruction
 *
 * ⚠️  注意: このスクリプトは Flare チェーンへのトランザクションを送信します。
 *    Coston2 テストネットで実行してください。
 */

import "dotenv/config";
import { Wallet } from "xrpl";
import { encodeFunctionData } from "viem";
import type { Address } from "viem";
import {
	MASTER_ACCOUNT_CONTROLLER_ABI,
	getMasterAccountControllerAddress,
} from "../constants.js";
import { publicClient, createFlareWalletClient } from "../client.js";
import { encodeCustomPaymentRef } from "../helpers/paymentRef.js";

/**
 * カスタム命令の型定義
 *
 * MasterAccountController の CustomCall 構造体に対応する。
 */
type CustomCall = {
	targetContract: Address;
	value: bigint;
	data: `0x${string}`;
};

/**
 * サンプル: スマートアカウントから FLR を別アドレスに転送するカスタム命令
 *
 * 実際には任意のコントラクト呼び出し (DeFi, NFT mint, etc.) を設定できる。
 */
function buildSampleCustomCalls(recipientAddress: Address): CustomCall[] {
	// 例: 0.001 FLR を指定アドレスへ送る (データなし = ネイティブ転送)
	return [
		{
			targetContract: recipientAddress,
			value: BigInt(1e15), // 0.001 FLR (wei 単位)
			data: "0x",
		},
	];
}

async function main() {
	console.log("=== Flare Smart Accounts: カスタム命令デモ ===\n");

	// ── 1. 環境変数の確認 ─────────────────────────────────────────────────────
	const seed = process.env.XRPL_SEED;
	if (!seed) throw new Error("XRPL_SEED が .env に設定されていません。");

	const xrplWallet = Wallet.fromSeed(seed);
	console.log("XRPL ウォレット :", xrplWallet.address);

	// ── 2. Flare ウォレットクライアントを作成する ─────────────────────────────
	const { client: walletClient, account } = createFlareWalletClient();
	console.log("Flare アカウント :", account.address);
	console.log();

	// ── 3. MasterAccountController アドレスを取得する ─────────────────────────
	const controllerAddress = await getMasterAccountControllerAddress();
	console.log("MasterAccountController :", controllerAddress);
	console.log();

	// ── 4. カスタム命令を構築する ─────────────────────────────────────────────
	// サンプル: アカウントアドレス自身への 0.001 FLR 転送 (動作確認用)
	const customCalls = buildSampleCustomCalls(account.address);

	console.log("カスタム命令の内容:");
	for (const call of customCalls) {
		console.log("  targetContract :", call.targetContract);
		console.log("  value (wei)    :", call.value.toString());
		console.log("  data           :", call.data);
	}
	console.log();

	// ── 5. カスタム命令のハッシュを取得する (登録前に確認) ──────────────────
	console.log("カスタム命令ハッシュを計算中 (読み取り)...");
	const callHash = await publicClient.readContract({
		address: controllerAddress,
		abi: MASTER_ACCOUNT_CONTROLLER_ABI,
		functionName: "encodeCustomInstruction",
		args: [customCalls],
	});
	console.log("  callHash :", callHash);

	// ── 6. ペイメントリファレンスを生成する ─────────────────────────────────
	const paymentRef = encodeCustomPaymentRef(0, callHash as `0x${string}`);
	console.log("  ペイメントリファレンス :", paymentRef);
	console.log();

	// ── 7. カスタム命令をオンチェーンに登録する ────────────────────────────────
	console.log("カスタム命令を Flare チェーンに登録中...");
	console.log("  ※ Flare ウォレットからトランザクションを送信します");

	const txHash = await walletClient.writeContract({
		address: controllerAddress,
		abi: MASTER_ACCOUNT_CONTROLLER_ABI,
		functionName: "registerCustomInstruction",
		args: [customCalls],
	});
	console.log("  TX ハッシュ :", txHash);

	// トランザクション確定を待機
	console.log("  確定を待機中...");
	const receipt = await publicClient.waitForTransactionReceipt({
		hash: txHash,
	});
	console.log(
		"  ステータス  :",
		receipt.status === "success" ? "✅ 成功" : "❌ 失敗",
	);
	console.log();

	// ── 8. まとめ ─────────────────────────────────────────────────────────────
	console.log("=== 次のステップ ===");
	console.log(`
カスタム命令の登録が完了しました。

次に XRPL から以下のペイメントリファレンスを memo に含めて送信することで
Flare 上のカスタム命令が実行されます:

  ペイメントリファレンス: ${paymentRef}

smart-accounts-cli を使った送信例:
  ./smart_accounts.py bridge instruction ${paymentRef}

または スクリプト 04 を参考に XRPL Payment を直接送信してください。
`);
}

void main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error("エラー:", error);
		process.exit(1);
	});
