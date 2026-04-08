/**
 * スクリプト 03: 利用可能なミンティングエージェント一覧
 *
 * 学習ポイント:
 *   - エージェントの役割（担保提供・XRP 保管・償還対応）
 *   - AssetManager.getAvailableAgentsDetailedList() でエージェント一覧を取得
 *   - ミント時のエージェント選択基準（空きロット数・手数料）
 *
 * エージェント選択の指針:
 *   1. freeCollateralLots >= ミントしたいロット数
 *   2. feeBIPS が最小（= ミント手数料が最安）
 *
 * 注意: 本スクリプトは最小限の ABI を使用しているため、feeBIPS・freeCollateralLots の
 *   デコードが実際のコントラクト構造と合わない場合があります。
 *   本番環境では @flarenetwork/flare-wagmi-periphery-package の
 *   型付き ABI を使用してください。
 *
 * 読み取り専用: 秘密鍵不要、トランザクション送信なし
 *
 * 実行方法:
 *   bun run 03:list-agents
 *
 * 参考: https://dev.flare.network/fassets/developer-guides/fassets-list-agents
 */

import "dotenv/config";
import { getContract } from "viem";
import { publicClient } from "../client.js";
import {
	FLARE_CONTRACTS_REGISTRY_ADDRESS,
	REGISTRY_ABI,
} from "../constants.js";

// エージェント一覧取得用の最小 ABI
// 実際の Settings struct は複雑なため、agentVault アドレスのみ確実にデコード
const ASSET_MANAGER_LIST_ABI = [
	{
		name: "getAvailableAgentsDetailedList",
		type: "function",
		stateMutability: "view",
		inputs: [
			{ name: "_start", type: "uint256" },
			{ name: "_end", type: "uint256" },
		],
		outputs: [
			{
				name: "_agents",
				type: "tuple[]",
				components: [
					{ name: "agentVault", type: "address" },
					{ name: "feeBIPS", type: "uint256" },
					{ name: "freeCollateralLots", type: "uint256" },
				],
			},
			{ name: "_totalLength", type: "uint256" },
		],
	},
] as const;

const CHUNK_SIZE = 10n;

async function main() {
	console.log("=== 利用可能エージェント一覧 ===\n");

	const registry = getContract({
		address: FLARE_CONTRACTS_REGISTRY_ADDRESS,
		abi: REGISTRY_ABI,
		client: publicClient,
	});

	const assetManagerAddress = await registry.read.getContractAddressByName([
		"AssetManagerFXRP",
	]);

	console.log("AssetManager (FXRP):", assetManagerAddress, "\n");

	const assetManager = getContract({
		address: assetManagerAddress,
		abi: ASSET_MANAGER_LIST_ABI,
		client: publicClient,
	});

	// 最初のチャンクを取得してトータル件数を確認
	const firstChunk = await assetManager.read.getAvailableAgentsDetailedList([
		0n,
		CHUNK_SIZE,
	]);

	// viem は複数戻り値を配列で返す: [_agents, _totalLength]
	const agents = firstChunk[0];
	const totalLength = firstChunk[1];
	console.log(`エージェント総数: ${totalLength}\n`);

	const allAgents = [...agents];

	// 残りのページを取得
	for (let offset = CHUNK_SIZE; offset < totalLength; offset += CHUNK_SIZE) {
		const end =
			offset + CHUNK_SIZE < totalLength ? offset + CHUNK_SIZE : totalLength;
		const chunk = await assetManager.read.getAvailableAgentsDetailedList([
			offset,
			end,
		]);
		allAgents.push(...chunk[0]);
	}

	if (allAgents.length === 0) {
		console.log("利用可能なエージェントがいません。");
		return;
	}

	console.log("─".repeat(60));
	for (const agent of allAgents) {
		console.log(`Vault アドレス : ${agent.agentVault}`);
		// Note: feeBIPS / freeCollateralLots は ABI と実際の struct が合わない場合、
		//       正確にデコードされないことがある。参考値として表示。
		console.log(`空きロット数   : ${agent.freeCollateralLots} (参考値)`);
		console.log("─".repeat(60));
	}

	console.log(`\nエージェント ${allAgents.length} 件を表示しました。`);
	console.log("\n💡 ヒント:");
	console.log("  正確な feeBIPS / status を取得するには");
	console.log(
		"  @flarenetwork/flare-wagmi-periphery-package の型付き ABI を使用してください。",
	);
	console.log(
		"  参考: https://dev.flare.network/fassets/developer-guides/fassets-list-agents",
	);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
