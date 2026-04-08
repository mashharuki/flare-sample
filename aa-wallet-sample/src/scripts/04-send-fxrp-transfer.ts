/**
 * スクリプト 04: FXRP 転送命令を XRPL 経由で送信
 *
 * 【学習内容】
 *   エンコードしたペイメントリファレンスを XRPL Payment トランザクションの
 *   Memo フィールドに埋め込み、オペレーターへ送信する実際の手順を学ぶ。
 *
 * 【前提条件】
 *   .env ファイルに以下を設定すること:
 *   - XRPL_SEED          : XRPL テストネット用ウォレットシード (スクリプト 00 で生成)
 *   - RECIPIENT_ADDRESS  : 転送先 Flare アドレス
 *
 *   XRPL アカウントが有効化されていること。
 *   未有効化の場合は先にフォーセットで XRP を取得してください:
 *   https://xrpl.org/resources/dev-tools/xrp-faucets
 *
 *   スマートアカウントに FXRP が存在することが前提。
 *   FXRP のミントは smart-accounts-cli を使用してください:
 *   https://github.com/flare-foundation/smart-accounts-cli
 *
 * 【実行方法】
 *   bun run 04:send-fxrp-transfer
 *
 * ⚠️  注意: このスクリプトは実際の XRPL トランザクションを送信します。
 *    テストネット (Testnet / Devnet) で実行してください。
 */

import "dotenv/config";
import { Client, Wallet } from "xrpl";
import {
	getMasterAccountControllerAddress,
	MASTER_ACCOUNT_CONTROLLER_ABI,
} from "../constants.js";
import { publicClient } from "../client.js";
import {
	encodeFxrpTransfer,
	decodeInstruction,
} from "../helpers/paymentRef.js";
import type { Address } from "viem";

/** XRPL Testnet WebSocket エンドポイント */
const XRPL_TESTNET_WSS = "wss://s.altnet.rippletest.net:51233";

/** XRPL 命令送信時に支払う XRP (drops 単位, 最低送金額 + α) */
const INSTRUCTION_FEE_DROPS = "1000000"; // 1 XRP (実際はオペレーターの要求額に従う)

async function main() {
	console.log("=== Flare Smart Accounts: FXRP 転送命令の送信 ===\n");

	// ── 1. 環境変数の確認 ─────────────────────────────────────────────────────
	const seed = process.env.XRPL_SEED;
	const recipientAddress = process.env.RECIPIENT_ADDRESS as Address | undefined;

	if (!seed) throw new Error("XRPL_SEED が .env に設定されていません。");
	if (!recipientAddress) {
		throw new Error("RECIPIENT_ADDRESS が .env に設定されていません。");
	}
	if (!recipientAddress.startsWith("0x")) {
		throw new Error(
			"RECIPIENT_ADDRESS は 0x から始まる Flare アドレスを設定してください。",
		);
	}

	// ── 2. XRPL ウォレットを作成する ─────────────────────────────────────────
	const xrplWallet = Wallet.fromSeed(seed);
	console.log("XRPL ウォレット :", xrplWallet.address);
	console.log("転送先 Flare    :", recipientAddress);
	console.log();

	// ── 3. オペレーター XRPL アドレスを取得する ───────────────────────────────
	const controllerAddress = await getMasterAccountControllerAddress();
	const operatorAddresses = await publicClient.readContract({
		address: controllerAddress,
		abi: MASTER_ACCOUNT_CONTROLLER_ABI,
		functionName: "getXrplProviderWallets",
		args: [],
	});

	if (operatorAddresses.length === 0) {
		throw new Error("オペレーターの XRPL アドレスが見つかりません。");
	}
	const operatorXrplAddress = operatorAddresses[0];
	console.log("オペレーター XRPL :", operatorXrplAddress);

	// ── 4. FXRP 転送命令をエンコードする ─────────────────────────────────────
	// 10 FXRP を転送する例 (raw 値: 10n)
	const transferAmount = 10n;
	const paymentRef = encodeFxrpTransfer(0, transferAmount, recipientAddress);

	const decoded = decodeInstruction(paymentRef);
	console.log("\nエンコード済み命令:");
	console.log("  ペイメントリファレンス :", paymentRef);
	console.log("  命令名               :", decoded.instructionName);
	console.log("  転送量 (raw)         :", decoded.value.toString());
	console.log("  パラメータ (転送先)   :", `0x${decoded.rawParams}`);
	console.log();

	// ── 5. XRPL クライアントを接続して Payment を送信する ─────────────────────
	console.log("XRPL テストネットに接続中...");
	const xrplClient = new Client(XRPL_TESTNET_WSS);
	await xrplClient.connect();
	console.log("接続完了\n");

	try {
		// Memo フィールドに命令を埋め込む
		// MemoData は hex 文字列 (0x なし) で指定する
		const memoData = paymentRef.slice(2).toUpperCase();

		const payment = {
			TransactionType: "Payment" as const,
			Account: xrplWallet.address,
			Destination: operatorXrplAddress,
			Amount: INSTRUCTION_FEE_DROPS,
			Memos: [
				{
					Memo: {
						MemoData: memoData,
					},
				},
			],
		};

		console.log("XRPL Payment トランザクションを送信中...");
		console.log("  宛先     :", operatorXrplAddress);
		console.log(
			"  金額     :",
			`${Number(INSTRUCTION_FEE_DROPS) / 1_000_000} XRP`,
		);
		console.log("  MemoData :", memoData);
		console.log();

		let result: Awaited<ReturnType<typeof xrplClient.submitAndWait>>;
		try {
			result = await xrplClient.submitAndWait(payment, {
				wallet: xrplWallet,
			});
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err);
			if (msg.includes("Account not found")) {
				console.error("❌ XRPL アカウントが有効化されていません。");
				console.error("");
				console.error(
					"  XRP テストネット フォーセットでアカウントに XRP を送金してください:",
				);
				console.error("  https://xrpl.org/resources/dev-tools/xrp-faucets");
				console.error(`  アドレス: ${xrplWallet.address}`);
				console.error("");
				console.error(
					"  フォーセットで XRP を受け取ったら再度このスクリプトを実行してください。",
				);
			} else {
				console.error("❌ トランザクション送信エラー:", msg);
			}
			process.exit(1);
		}

		const txHash = result.result.hash;
		console.log("✅ トランザクション送信完了!");
		console.log("  TX ハッシュ :", txHash);
		console.log(
			"  エクスプローラー: https://testnet.xrpl.org/transactions/" + txHash,
		);
		console.log();
		console.log(
			"次のステップ: オペレーターが FDC 証明を取得して Flare 上で命令を実行します。",
		);
		console.log(
			"Flare エクスプローラーでスマートアカウントへの FXRP 転送を確認できます:",
		);
		console.log("  https://coston2-explorer.flare.network");
	} finally {
		await xrplClient.disconnect();
	}
}

void main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error("エラー:", error);
		process.exit(1);
	});
