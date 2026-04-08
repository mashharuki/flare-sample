/**
 * スクリプト 03: 命令エンコードのデモ
 *
 * 【学習内容】
 *   XRPL の Payment トランザクション Memo に埋め込む 32 バイト命令を
 *   実際にエンコードして確認する。
 *   ネットワーク接続不要で動作するため、まずここから始めると良い。
 *
 * 【実行方法】
 *   bun run 03:encode-instructions
 */

import {
	InstructionId,
	decodeInstruction,
	encodeFxrpCollateralReservation,
	encodeFxrpRedeem,
	encodeFxrpTransfer,
	encodeFirelightDeposit,
	encodeUpshiftDeposit,
} from "../helpers/paymentRef.js";

/** 結果を整形して表示するヘルパー */
function printResult(label: string, encoded: string) {
	console.log(`\n【${label}】`);
	console.log("  エンコード結果:", encoded);

	const decoded = decodeInstruction(encoded);
	console.log("  命令名       :", decoded.instructionName);
	console.log(
		`  命令 ID      : 0x${decoded.instructionId.toString(16).padStart(2, "0")}`,
	);
	console.log("  ウォレット ID:", decoded.walletId);
	console.log("  Value        :", decoded.value.toString());
	console.log("  パラメータ   :", decoded.rawParams);
}

function main() {
	console.log("=== Flare Smart Accounts: 命令エンコードデモ ===\n");
	console.log(
		"32 バイト構造: [命令ID 1B][ウォレットID 1B][Value 10B][パラメータ 20B]",
	);
	console.log("─".repeat(60));

	// ── FXRP 担保予約 ─────────────────────────────────────────────────────────
	// 1 ロット (= 10 FXRP), エージェントボールト ID = 1
	const crRef = encodeFxrpCollateralReservation(0, 1n, 1);
	printResult("FXRP 担保予約 (1 ロット, エージェント ID=1)", crRef);

	// ── FXRP 転送 ──────────────────────────────────────────────────────────────
	// 10 FXRP を指定アドレスへ転送
	const transferRef = encodeFxrpTransfer(
		0,
		10n,
		"0xf5488132432118596fa13800b68df4c0ff25131d",
	);
	printResult("FXRP 転送 (10 FXRP → 0xf548...131d)", transferRef);

	// ── FXRP リデーム ──────────────────────────────────────────────────────────
	// 1 ロットを XRP にリデーム
	const redeemRef = encodeFxrpRedeem(0, 1n);
	printResult("FXRP リデーム (1 ロット)", redeemRef);

	// ── Firelight デポジット ───────────────────────────────────────────────────
	// 100 FXRP を Firelight ボールト ID=1 にデポジット
	const firelightRef = encodeFirelightDeposit(0, 100n, 1);
	printResult("Firelight デポジット (100 FXRP, ボールト ID=1)", firelightRef);

	// ── Upshift デポジット ────────────────────────────────────────────────────
	// 50 FXRP を Upshift ボールト ID=2 にデポジット
	const upshiftRef = encodeUpshiftDeposit(0, 50n, 2);
	printResult("Upshift デポジット (50 FXRP, ボールト ID=2)", upshiftRef);

	// ── 命令タイプ一覧 ────────────────────────────────────────────────────────
	console.log("\n\n=== 命令タイプ一覧 ===");
	const entries = Object.entries(InstructionId) as [string, number][];
	for (const [name, id] of entries) {
		console.log(`  0x${id.toString(16).padStart(2, "0")} : ${name}`);
	}

	console.log("\n=== エンコードデモ完了 ===");
	console.log(
		"\nこれらのペイメントリファレンスを XRPL Payment トランザクションの",
	);
	console.log(
		"Memo フィールドに埋め込むと、オペレーターが Flare 上で命令を実行します。",
	);
}

main();
