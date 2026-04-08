/**
 * スクリプト 04: 担保の予約（ミントStep 1）— DRY RUN デフォルト
 *
 * 学習ポイント:
 *   - FXRP ミントフロー Step 1: AssetManager.reserveCollateral()
 *   - CollateralReserved イベントから次ステップに必要な情報を取得
 *   - ミント手数料（CRF）の計算
 *
 * ミントの全体フロー:
 *   Step 1: reserveCollateral()   ← このスクリプト（Flare トランザクション）
 *   Step 2: XRP を XRPL でエージェントに送付
 *   Step 3: FDC で XRP 支払いを証明
 *   Step 4: executeMinting() でFXRP を受け取る
 *
 * 重要:
 *   - DRY_RUN=true（デフォルト）ではトランザクションを送信しません
 *   - 実際に送信する場合は .env で DRY_RUN=false を設定してください
 *   - CRF（担保予約手数料）はミント失敗でも返金されません
 *   - テストネット（Coston2）で使用することを推奨します
 *
 * 必要な環境変数:
 *   PRIVATE_KEY   — ウォレットの秘密鍵（C2FLR 残高が必要）
 *   DRY_RUN=false — 実際にトランザクションを送信する場合のみ設定
 *
 * 実行方法:
 *   bun run 04:reserve-collateral
 *
 * 参考: https://dev.flare.network/fassets/developer-guides/fassets-mint
 */

import "dotenv/config";
import {
	createWalletClient,
	getContract,
	http,
	parseEventLogs,
	formatEther,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { publicClient, coston2 } from "../client.js";
import {
	FLARE_CONTRACTS_REGISTRY_ADDRESS,
	REGISTRY_ABI,
	ASSET_MANAGER_ABI,
} from "../constants.js";

// ─── 設定 ─────────────────────────────────────────────────────────────
const LOTS_TO_MINT = 1n; // ミントするロット数（最小: 1）
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;
const DRY_RUN = process.env.DRY_RUN !== "false"; // デフォルト: DRY RUN モード

// CollateralReserved イベント ABI（ログのデコードに使用）
const COLLATERAL_RESERVED_EVENT = {
	name: "CollateralReserved",
	type: "event",
	inputs: [
		{ name: "agentVault", type: "address", indexed: true },
		{ name: "minter", type: "address", indexed: true },
		{ name: "collateralReservationId", type: "uint64", indexed: true },
		{ name: "valueUBA", type: "uint256", indexed: false },
		{ name: "feeUBA", type: "uint256", indexed: false },
		{ name: "firstUnderlyingBlock", type: "uint64", indexed: false },
		{ name: "lastUnderlyingBlock", type: "uint64", indexed: false },
		{ name: "lastUnderlyingTimestamp", type: "uint64", indexed: false },
		{ name: "paymentAddress", type: "string", indexed: false },
		{ name: "paymentReference", type: "bytes32", indexed: false },
		{ name: "executor", type: "address", indexed: false },
		{ name: "executorFeeNatWei", type: "uint256", indexed: false },
	],
} as const;

async function main() {
	console.log("=== 担保の予約（ミント Step 1） ===");
	console.log(DRY_RUN ? "モード: DRY RUN（送信なし）\n" : "モード: 実行\n");

	// 秘密鍵の確認（DRY RUN では不要）
	const privateKey = process.env.PRIVATE_KEY as `0x${string}` | undefined;
	if (!DRY_RUN && !privateKey) {
		throw new Error(
			"PRIVATE_KEY が設定されていません。.env ファイルを確認してください。",
		);
	}

	let walletClient;
	if (!DRY_RUN && privateKey) {
		const account = privateKeyToAccount(privateKey);
		console.log("ウォレットアドレス:", account.address);
		walletClient = createWalletClient({
			account,
			chain: coston2,
			transport: http(),
		});
	} else {
		console.log("ウォレット: DRY RUN のため不要\n");
	}

	// FlareContractsRegistry から AssetManager アドレスを取得
	const registry = getContract({
		address: FLARE_CONTRACTS_REGISTRY_ADDRESS,
		abi: REGISTRY_ABI,
		client: publicClient,
	});

	const assetManagerAddress = await registry.read.getContractAddressByName([
		"AssetManagerFXRP",
	]);
	console.log("AssetManager (FXRP):", assetManagerAddress);

	const assetManager = getContract({
		address: assetManagerAddress,
		abi: ASSET_MANAGER_ABI,
		client: publicClient,
	});

	// エージェント一覧を取得し最適なエージェントを選択
	const agentsResult = await assetManager.read.getAvailableAgentsDetailedList([
		0n,
		20n,
	]);
	// viem は複数戻り値を配列で返す: [_agents, _totalLength]
	const agents = [...agentsResult[0]];

	// 十分な空きロットを持つエージェントを選択
	// Note: feeBIPS のデコードは ABI 不一致で正確でない場合があるため
	//   ここでは freeCollateralLots のみ確認し、最初に見つかった適格エージェントを使用する
	const selectedAgent = agents.find(
		(a) => a.freeCollateralLots >= LOTS_TO_MINT,
	);

	if (!selectedAgent) {
		throw new Error(
			`空きロット数 ${LOTS_TO_MINT} 以上のエージェントが見つかりません。`,
		);
	}

	console.log("\n--- 選択されたエージェント ---");
	console.log("Vault アドレス:", selectedAgent.agentVault);
	console.log("空きロット数  :", selectedAgent.freeCollateralLots.toString());
	// Note: feeBIPS の表示は ABI 不一致のため省略（本番では periphery パッケージを使用）

	// 担保予約手数料（CRF）を計算
	const crf = await assetManager.read.collateralReservationFee([LOTS_TO_MINT]);
	console.log("\n--- 手数料 ---");
	console.log("CRF (wei)     :", crf.toString());
	console.log("CRF (C2FLR)  :", formatEther(crf));

	if (DRY_RUN) {
		// DRY RUN: 実際には送信しない
		console.log("\n[DRY RUN] 以下のトランザクションが送信されます:");
		console.log("  Contract  :", assetManagerAddress);
		console.log("  Function  : reserveCollateral");
		console.log("  agentVault:", selectedAgent.agentVault);
		console.log("  lots      :", LOTS_TO_MINT.toString());
		console.log("  maxFeeBIPS: 10000 (100%, 上限)");
		console.log("  executor  :", ZERO_ADDRESS, "（エグゼキューターなし）");
		console.log("  value     :", formatEther(crf), "C2FLR");
		console.log(
			"\n実際に送信する場合は .env で DRY_RUN=false を設定してください。",
		);
		return;
	}

	// 実際のトランザクション送信
	if (!walletClient) {
		throw new Error(
			"walletClient が初期化されていません（DRY_RUN=false かつ PRIVATE_KEY が必要）",
		);
	}
	console.log("\nトランザクションを送信中...");
	const txHash = await walletClient.writeContract({
		address: assetManagerAddress,
		abi: ASSET_MANAGER_ABI,
		functionName: "reserveCollateral",
		args: [
			selectedAgent.agentVault,
			LOTS_TO_MINT,
			10000n, // maxFeeBIPS: 100% (上限値を指定してエージェント側の実際の手数料を許容)
			ZERO_ADDRESS,
		],
		value: crf,
	});
	console.log("Transaction Hash:", txHash);

	const receipt = await publicClient.waitForTransactionReceipt({
		hash: txHash,
	});
	console.log("ブロック番号    :", receipt.blockNumber.toString());
	console.log("ステータス      :", receipt.status);

	// CollateralReserved イベントをデコードして次のステップに必要な情報を表示
	const logs = parseEventLogs({
		abi: [COLLATERAL_RESERVED_EVENT],
		logs: receipt.logs,
	});

	if (logs.length > 0) {
		const event = logs[0].args as {
			collateralReservationId: bigint;
			paymentAddress: string;
			paymentReference: `0x${string}`;
			valueUBA: bigint;
			feeUBA: bigint;
			lastUnderlyingBlock: bigint;
			lastUnderlyingTimestamp: bigint;
		};

		console.log("\n=== 次のステップ（Step 2: XRP 支払い）===");
		console.log(
			"collateralReservationId:",
			event.collateralReservationId.toString(),
		);
		console.log("支払い先アドレス (XRPL):", event.paymentAddress);
		console.log("支払いリファレンス      :", event.paymentReference);
		console.log("支払い金額 (valueUBA)  :", event.valueUBA.toString());
		console.log("ミント手数料 (feeUBA)  :", event.feeUBA.toString());
		console.log(
			"合計 XRP (drops)       :",
			(event.valueUBA + event.feeUBA).toString(),
		);
		console.log(
			"合計 XRP               :",
			(Number(event.valueUBA + event.feeUBA) / 1_000_000).toFixed(6),
			"XRP",
		);
		console.log(
			"支払い期限ブロック      :",
			event.lastUnderlyingBlock.toString(),
		);
		console.log(
			"支払い期限タイムスタンプ:",
			new Date(Number(event.lastUnderlyingTimestamp) * 1000).toISOString(),
		);
		console.log(
			"\n次は上記の支払い先アドレスと paymentReference を使って XRP Ledger で送金してください。",
		);
		console.log(
			"参考: https://dev.flare.network/fassets/developer-guides/fassets-mint",
		);
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
