/**
 * Flare Smart Accounts — ペイメントリファレンス エンコード/デコード
 *
 * XRPL の Payment トランザクション Memo フィールドに埋め込む
 * 32 バイト (64 hex 文字) の命令形式を扱うヘルパー集。
 *
 * ─── 32 バイト構造 ───────────────────────────────────────────────────────────
 * Byte 1     : 命令 ID (上位 nibble = タイプ, 下位 nibble = コマンド)
 * Byte 2     : ウォレット ID (0 = 未割り当て)
 * Bytes 3-12 : Value (10 バイト、金額やロット数)
 * Bytes 13+  : 命令固有パラメータ
 *
 * 公式ドキュメント: https://dev.flare.network/smart-accounts/
 */

import type { Address } from "viem";

// ─── 命令タイプ定数 ──────────────────────────────────────────────────────────

/** 命令 ID の一覧 */
export const InstructionId = {
	/** FXRP 担保予約 (ミント前の操作) */
	FXRP_COLLATERAL_RESERVATION: 0x00,
	/** FXRP 転送 */
	FXRP_TRANSFER: 0x01,
	/** FXRP リデーム (XRP に戻す) */
	FXRP_REDEEM: 0x02,
	/** Firelight: 担保予約 + デポジット */
	FIRELIGHT_CR_DEPOSIT: 0x10,
	/** Firelight: FXRP をデポジット */
	FIRELIGHT_DEPOSIT: 0x11,
	/** Firelight: 引き出し開始 */
	FIRELIGHT_REDEEM: 0x12,
	/** Firelight: 引き出し完了 */
	FIRELIGHT_CLAIM_WITHDRAW: 0x13,
	/** Upshift: 担保予約 + デポジット */
	UPSHIFT_CR_DEPOSIT: 0x20,
	/** Upshift: FXRP をデポジット */
	UPSHIFT_DEPOSIT: 0x21,
	/** Upshift: 引き出しリクエスト */
	UPSHIFT_REQUEST_REDEEM: 0x22,
	/** Upshift: 引き出し完了 (待機期間後) */
	UPSHIFT_CLAIM: 0x23,
	/** カスタム命令 (任意のコントラクト呼び出し) */
	CUSTOM: 0xff,
} as const;

// ─── 内部ユーティリティ ───────────────────────────────────────────────────────

/**
 * 数値を指定バイト数の hex 文字列に変換する (0 埋め)
 * @param value - 変換する数値
 * @param byteLen - バイト数
 */
function toHexBytes(value: bigint | number, byteLen: number): string {
	const hex = BigInt(value).toString(16);
	return hex.padStart(byteLen * 2, "0");
}

/**
 * 32 バイトのペイメントリファレンスを組み立てる
 * @param instructionId - 命令 ID (1 バイト)
 * @param walletId     - ウォレット ID (1 バイト)
 * @param value        - 金額/ロット数 (10 バイト)
 * @param params       - 残り 20 バイトのパラメータ (hex 文字列, 40 文字)
 */
function buildRef(
	instructionId: number,
	walletId: number,
	value: bigint,
	params: string,
): `0x${string}` {
	const id = toHexBytes(instructionId, 1);
	const wid = toHexBytes(walletId, 1);
	const val = toHexBytes(value, 10);
	// params は 20 バイト = 40 hex 文字になるよう右詰め 0 パディング
	const p = params.replace(/^0x/, "").padEnd(40, "0").slice(0, 40);
	return `0x${id}${wid}${val}${p}` as `0x${string}`;
}

// ─── エンコード関数 ──────────────────────────────────────────────────────────

/**
 * FXRP 担保予約命令をエンコードする
 *
 * @param walletId    - ウォレット ID (通常 0)
 * @param lots        - ミントするロット数
 * @param agentVaultId - エージェントボールト ID
 * @returns 32 バイトのペイメントリファレンス
 */
export function encodeFxrpCollateralReservation(
	walletId: number,
	lots: bigint,
	agentVaultId: number,
): `0x${string}` {
	const agentHex = toHexBytes(agentVaultId, 2); // 2 バイト
	const params = agentHex.padEnd(40, "0");
	return buildRef(
		InstructionId.FXRP_COLLATERAL_RESERVATION,
		walletId,
		lots,
		params,
	);
}

/**
 * FXRP 転送命令をエンコードする
 *
 * @param walletId          - ウォレット ID (通常 0)
 * @param amountFxrp        - 転送する FXRP 量 (wei 単位)
 * @param recipientAddress  - 転送先 Flare アドレス
 * @returns 32 バイトのペイメントリファレンス
 */
export function encodeFxrpTransfer(
	walletId: number,
	amountFxrp: bigint,
	recipientAddress: Address,
): `0x${string}` {
	// アドレスは 20 バイト = 40 hex 文字
	const addrHex = recipientAddress.replace(/^0x/, "");
	return buildRef(InstructionId.FXRP_TRANSFER, walletId, amountFxrp, addrHex);
}

/**
 * FXRP リデーム命令をエンコードする
 *
 * @param walletId - ウォレット ID (通常 0)
 * @param lots     - リデームするロット数
 * @returns 32 バイトのペイメントリファレンス
 */
export function encodeFxrpRedeem(
	walletId: number,
	lots: bigint,
): `0x${string}` {
	return buildRef(InstructionId.FXRP_REDEEM, walletId, lots, "");
}

/**
 * Firelight デポジット命令をエンコードする
 *
 * @param walletId - ウォレット ID (通常 0)
 * @param amountFxrp - デポジットする FXRP 量 (wei 単位)
 * @param vaultId  - Firelight ボールト ID
 * @returns 32 バイトのペイメントリファレンス
 */
export function encodeFirelightDeposit(
	walletId: number,
	amountFxrp: bigint,
	vaultId: number,
): `0x${string}` {
	// Bytes 13-14 = 0x0000, Bytes 15-16 = vaultId
	const params = "0000" + toHexBytes(vaultId, 2);
	return buildRef(
		InstructionId.FIRELIGHT_DEPOSIT,
		walletId,
		amountFxrp,
		params,
	);
}

/**
 * Upshift デポジット命令をエンコードする
 *
 * @param walletId   - ウォレット ID (通常 0)
 * @param amountFxrp - デポジットする FXRP 量 (wei 単位)
 * @param vaultId    - Upshift ボールト ID
 * @returns 32 バイトのペイメントリファレンス
 */
export function encodeUpshiftDeposit(
	walletId: number,
	amountFxrp: bigint,
	vaultId: number,
): `0x${string}` {
	const params = "0000" + toHexBytes(vaultId, 2);
	return buildRef(InstructionId.UPSHIFT_DEPOSIT, walletId, amountFxrp, params);
}

/**
 * カスタム命令のペイメントリファレンスをエンコードする
 *
 * @param walletId - ウォレット ID (通常 0)
 * @param callHash - `encodeCustomInstruction()` が返す 32 バイトのハッシュ
 * @returns 32 バイトのペイメントリファレンス
 */
export function encodeCustomPaymentRef(
	walletId: number,
	callHash: `0x${string}`,
): `0x${string}` {
	// callHash は 32 バイト。先頭 2 バイトを除いた 30 バイト (60 hex 文字) を使う
	const hashHex = callHash.replace(/^0x/, "").slice(4); // 先頭 2 バイト = 4 hex 文字を削除
	// instructionId=0xff, walletId=1 バイト → 残り 30 バイト = hashHex
	return `0x${toHexBytes(InstructionId.CUSTOM, 1)}${toHexBytes(walletId, 1)}${hashHex}` as `0x${string}`;
}

// ─── デコード関数 ─────────────────────────────────────────────────────────────

/** デコード結果の型 */
export type DecodedInstruction = {
	instructionId: number;
	instructionName: string;
	walletId: number;
	value: bigint;
	rawParams: string;
};

/**
 * ペイメントリファレンスをデコードして命令の内容を返す
 *
 * @param paymentRef - 32 バイト (0x プレフィックス付き) の hex 文字列
 * @returns デコードされた命令オブジェクト
 */
export function decodeInstruction(paymentRef: string): DecodedInstruction {
	const hex = paymentRef.replace(/^0x/, "");
	if (hex.length !== 64) {
		throw new Error(
			`ペイメントリファレンスは 32 バイト (64 hex 文字) である必要があります。実際: ${hex.length} 文字`,
		);
	}

	const instructionId = parseInt(hex.slice(0, 2), 16);
	const walletId = parseInt(hex.slice(2, 4), 16);
	const value = BigInt(`0x${hex.slice(4, 24)}`);
	const rawParams = hex.slice(24);

	const nameMap: Record<number, string> = {
		[InstructionId.FXRP_COLLATERAL_RESERVATION]: "FXRP 担保予約",
		[InstructionId.FXRP_TRANSFER]: "FXRP 転送",
		[InstructionId.FXRP_REDEEM]: "FXRP リデーム",
		[InstructionId.FIRELIGHT_CR_DEPOSIT]: "Firelight: 担保予約 + デポジット",
		[InstructionId.FIRELIGHT_DEPOSIT]: "Firelight: デポジット",
		[InstructionId.FIRELIGHT_REDEEM]: "Firelight: 引き出し開始",
		[InstructionId.FIRELIGHT_CLAIM_WITHDRAW]: "Firelight: 引き出し完了",
		[InstructionId.UPSHIFT_CR_DEPOSIT]: "Upshift: 担保予約 + デポジット",
		[InstructionId.UPSHIFT_DEPOSIT]: "Upshift: デポジット",
		[InstructionId.UPSHIFT_REQUEST_REDEEM]: "Upshift: 引き出しリクエスト",
		[InstructionId.UPSHIFT_CLAIM]: "Upshift: 引き出し完了",
		[InstructionId.CUSTOM]: "カスタム命令",
	};

	return {
		instructionId,
		instructionName:
			nameMap[instructionId] ??
			`不明 (0x${instructionId.toString(16).padStart(2, "0")})`,
		walletId,
		value,
		rawParams,
	};
}
