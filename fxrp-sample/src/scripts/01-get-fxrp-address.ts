/**
 * スクリプト 01: FXRP トークンアドレスの取得
 *
 * 学習ポイント:
 *   - FlareContractsRegistry を使ったコントラクトアドレスの動的解決
 *   - AssetManager から FXRP ERC-20 トークンアドレスを取得する flow
 *
 * Flow:
 *   FlareContractsRegistry
 *     └─ getContractAddressByName("AssetManagerFXRP")
 *           └─ AssetManager.fAsset()
 *                 └─ FXRP ERC-20 token address
 *
 * 読み取り専用: 秘密鍵不要、トランザクション送信なし
 *
 * 実行方法:
 *   bun run 01:get-fxrp-address
 *
 * 参考: https://dev.flare.network/fxrp/token-interactions/fxrp-address
 */

import "dotenv/config";
import { getContract, isAddress } from "viem";
import { publicClient } from "../client.js";
import {
	FLARE_CONTRACTS_REGISTRY_ADDRESS,
	REGISTRY_ABI,
	ASSET_MANAGER_ABI,
	ERC20_ABI,
} from "../constants.js";

async function main() {
	console.log("=== FXRP アドレス取得 ===\n");

	// Step 1: FlareContractsRegistry から AssetManager のアドレスを取得
	const registry = getContract({
		address: FLARE_CONTRACTS_REGISTRY_ADDRESS,
		abi: REGISTRY_ABI,
		client: publicClient,
	});

	console.log("FlareContractsRegistry:", FLARE_CONTRACTS_REGISTRY_ADDRESS);

	const assetManagerAddress = await registry.read.getContractAddressByName([
		"AssetManagerFXRP",
	]);

	// RPC から返されたアドレスは信頼できない外部データ。必ず検証する
	if (
		!assetManagerAddress ||
		assetManagerAddress === "0x0000000000000000000000000000000000000000"
	) {
		throw new Error(
			"AssetManagerFXRP が FlareContractsRegistry に見つかりません",
		);
	}
	if (!isAddress(assetManagerAddress)) {
		throw new Error(
			`レジストリから無効なアドレスが返されました: ${assetManagerAddress}`,
		);
	}

	console.log("AssetManager (FXRP):", assetManagerAddress);

	// Step 2: AssetManager から FXRP ERC-20 トークンアドレスを取得
	const assetManager = getContract({
		address: assetManagerAddress,
		abi: ASSET_MANAGER_ABI,
		client: publicClient,
	});

	const fxrpAddress = await assetManager.read.fAsset();

	if (!isAddress(fxrpAddress)) {
		throw new Error(
			`AssetManager から無効な FXRP アドレスが返されました: ${fxrpAddress}`,
		);
	}

	console.log("FXRP ERC-20 Token:", fxrpAddress);

	// Step 3: ERC-20 メタ情報を確認
	const fxrpToken = getContract({
		address: fxrpAddress,
		abi: ERC20_ABI,
		client: publicClient,
	});

	const [name, symbol, decimals, totalSupply] = await Promise.all([
		fxrpToken.read.name(),
		fxrpToken.read.symbol(),
		fxrpToken.read.decimals(),
		fxrpToken.read.totalSupply(),
	]);

	console.log("\n--- FXRP トークン情報 ---");
	console.log("名前       :", name);
	console.log("シンボル   :", symbol);
	console.log("デシマル   :", decimals);
	console.log(
		"総供給量   :",
		(Number(totalSupply) / 10 ** decimals).toFixed(6),
		symbol,
	);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
