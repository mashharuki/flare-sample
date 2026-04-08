/**
 * スクリプト 02: スマートアカウントの残高確認
 *
 * 【学習内容】
 *   スマートアカウントの FLR・FXRP 残高と、登録済みボールトの残高を確認する。
 *
 * 【前提条件】
 *   .env ファイルに XRPL_SEED を設定すること。
 *   スクリプト 01 を先に実行してスマートアカウントアドレスを把握しておくこと。
 *
 * 【実行方法】
 *   bun run 02:check-balances
 */

import "dotenv/config";
import { Wallet } from "xrpl";
import { formatEther, erc4626Abi } from "viem";
import type { Address } from "viem";
import {
	MASTER_ACCOUNT_CONTROLLER_ABI,
	ERC20_ABI,
	getMasterAccountControllerAddress,
} from "../constants.js";
import { publicClient } from "../client.js";

async function main() {
	console.log("=== Flare Smart Accounts: 残高確認 ===\n");

	// ── 1. XRPL ウォレットを作成する ─────────────────────────────────────────
	const seed = process.env.XRPL_SEED;
	if (!seed) {
		throw new Error("XRPL_SEED が .env に設定されていません。");
	}

	const xrplWallet = Wallet.fromSeed(seed);
	const controllerAddress = await getMasterAccountControllerAddress();

	// ── 2. スマートアカウントアドレスを取得する ───────────────────────────────
	const smartAccount = await publicClient.readContract({
		address: controllerAddress,
		abi: MASTER_ACCOUNT_CONTROLLER_ABI,
		functionName: "getPersonalAccount",
		args: [xrplWallet.address],
	});
	console.log("スマートアカウント :", smartAccount);
	console.log();

	// ── 3. FLR (ネイティブトークン) 残高を取得する ───────────────────────────
	const flrBalance = await publicClient.getBalance({ address: smartAccount });
	console.log(`FLR 残高 : ${formatEther(flrBalance)} C2FLR`);

	// ── 4. 登録済みボールト一覧を取得して FXRP アドレスを特定する ─────────────
	const agentVaults = await publicClient.readContract({
		address: controllerAddress,
		abi: MASTER_ACCOUNT_CONTROLLER_ABI,
		functionName: "getAgentVaults",
		args: [],
	});

	// ── 5. FXRP トークンアドレスをエージェントボールトから取得する ─────────────
	// 注: 実際には AssetManager.fAsset() で取得するが、
	//     ここでは簡略化のため agentVault の最初のアドレスを利用
	console.log("\nエージェントボールト一覧:");
	if (agentVaults.length === 0) {
		console.log("  (登録済みのエージェントボールトがありません)");
	} else {
		for (const vault of agentVaults) {
			console.log(`  ID: ${vault.id}, アドレス: ${vault.addr}`);
		}
	}

	// ── 6. 登録済みボールト (Firelight / Upshift) の残高を確認する ─────────────
	const vaults = await publicClient.readContract({
		address: controllerAddress,
		abi: MASTER_ACCOUNT_CONTROLLER_ABI,
		functionName: "getVaults",
		args: [],
	});

	console.log("\n登録済みボールト残高:");
	if (vaults.length === 0) {
		console.log("  (登録済みのボールトがありません)");
	} else {
		for (const vault of vaults) {
			const vaultTypeNames: Record<number, string> = {
				1: "Firelight",
				2: "Upshift",
			};
			const typeName =
				vaultTypeNames[vault.vaultType] ?? `タイプ ${vault.vaultType}`;

			// ERC-4626 ボールトの balanceOf を取得
			let vaultBalance: bigint;
			try {
				vaultBalance = await publicClient.readContract({
					address: vault.addr as Address,
					abi: erc4626Abi,
					functionName: "balanceOf",
					args: [smartAccount],
				});
			} catch {
				vaultBalance = 0n;
			}

			console.log(`  [${typeName}] ID: ${vault.id}, アドレス: ${vault.addr}`);
			console.log(`    残高: ${vaultBalance} (raw)`);
		}
	}

	console.log("\n=== 残高確認完了 ===");
	console.log("※ FXRP 残高を確認するには、FXRP トークンアドレスが必要です。");
	console.log(
		"   fxrp-sample/src/scripts/05-get-fxrp-balance.ts を参考にしてください。",
	);
}

void main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error("エラー:", error);
		process.exit(1);
	});
