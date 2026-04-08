/**
 * スクリプト 01: スマートアカウントアドレスの取得
 *
 * 【学習内容】
 *   Flare Smart Accounts の基本概念を理解する。
 *   XRPL ウォレットのアドレスに紐づく Flare スマートアカウントアドレスを取得する。
 *
 * 【前提条件】
 *   .env ファイルに XRPL_SEED を設定すること。
 *   XRPL テストネット用のシードは https://xrpl.org/resources/dev-tools/xrp-faucets から取得できる。
 *
 * 【実行方法】
 *   bun run 01:get-smart-account
 */

import "dotenv/config";
import { Wallet } from "xrpl";
import {
	MASTER_ACCOUNT_CONTROLLER_ABI,
	getMasterAccountControllerAddress,
} from "../constants.js";
import { publicClient } from "../client.js";

async function main() {
	console.log("=== Flare Smart Accounts: スマートアカウント取得 ===\n");

	// ── 1. XRPL ウォレットを作成する ─────────────────────────────────────────
	const seed = process.env.XRPL_SEED;
	if (!seed) {
		throw new Error(
			"XRPL_SEED が .env に設定されていません。.env.example を参照してください。",
		);
	}

	const xrplWallet = Wallet.fromSeed(seed);
	console.log("XRPL ウォレット情報:");
	console.log("  アドレス :", xrplWallet.address);
	console.log("  公開鍵   :", xrplWallet.publicKey);
	console.log();

	// ── 2. MasterAccountController アドレスを取得する ─────────────────────────
	console.log("MasterAccountController アドレスを取得中...");
	const controllerAddress = await getMasterAccountControllerAddress();
	console.log("  アドレス :", controllerAddress);
	console.log();

	// ── 3. XRPL アドレスに対応する Flare スマートアカウントを取得する ──────────
	console.log("Flare スマートアカウントアドレスを取得中...");
	const personalAccount = await publicClient.readContract({
		address: controllerAddress,
		abi: MASTER_ACCOUNT_CONTROLLER_ABI,
		functionName: "getPersonalAccount",
		args: [xrplWallet.address],
	});
	console.log("  Flare スマートアカウント :", personalAccount);
	console.log();

	// ── 4. オペレーターの XRPL アドレスを取得する ─────────────────────────────
	console.log("オペレーター XRPL アドレスを取得中...");
	const operatorAddresses = await publicClient.readContract({
		address: controllerAddress,
		abi: MASTER_ACCOUNT_CONTROLLER_ABI,
		functionName: "getXrplProviderWallets",
		args: [],
	});
	console.log("  オペレーター XRPL アドレス:");
	for (const addr of operatorAddresses) {
		console.log("   -", addr);
	}
	console.log();

	// ── まとめ ────────────────────────────────────────────────────────────────
	console.log("=== 仕組みの説明 ===");
	console.log(`
Flare Smart Accounts の流れ:

1. あなたの XRPL アドレス (${xrplWallet.address})
   ↓
2. XRPL Payment トランザクション (memo に 32 バイトの命令を埋め込む)
   宛先: ${operatorAddresses[0] ?? "(オペレーターアドレス)"}
   ↓
3. オペレーターが FDC 証明を取得して MasterAccountController を呼び出す
   ↓
4. あなたの Flare スマートアカウント (${personalAccount})
   が命令を実行する (FXRP 転送、DeFi 操作 etc.)

ポイント: FLR を持たなくても Flare チェーン上で操作できる！
`);
}

void main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error("エラー:", error);
		process.exit(1);
	});
