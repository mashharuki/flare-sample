/**
 * スクリプト 02: FAssets の設定値と XRP/USD 価格の取得
 *
 * 学習ポイント:
 *   - collateralReservationFee() でミント手数料（CRF）を確認
 *   - FTSOv2 から XRP/USD の価格フィードを取得
 *   - FXRP ERC-20 のデシマル（= XRP と同じ 6）
 *
 * 読み取り専用: 秘密鍵不要、トランザクション送信なし
 *
 * 実行方法:
 *   bun run 02:get-fassets-settings
 *
 * 参考: https://dev.flare.network/fassets/developer-guides/fassets-settings-node
 */

import "dotenv/config";
import { getContract, formatEther, isAddress } from "viem";
import { publicClient } from "../client.js";
import {
	FLARE_CONTRACTS_REGISTRY_ADDRESS,
	REGISTRY_ABI,
	ASSET_MANAGER_ABI,
	FTSO_V2_ABI,
	ERC20_ABI,
	XRP_USD_FEED_ID,
} from "../constants.js";

async function main() {
	console.log("=== FAssets 設定値 & XRP/USD 価格 ===\n");

	const registry = getContract({
		address: FLARE_CONTRACTS_REGISTRY_ADDRESS,
		abi: REGISTRY_ABI,
		client: publicClient,
	});

	// AssetManager・FTSOv2 のアドレスを並列取得
	const [assetManagerAddress, ftsoAddress] = await Promise.all([
		registry.read.getContractAddressByName(["AssetManagerFXRP"]),
		registry.read.getContractAddressByName(["FtsoV2"]),
	]);

	console.log("AssetManager (FXRP):", assetManagerAddress);
	console.log("FTSOv2            :", ftsoAddress);

	// RPC から返されたアドレスを検証
	if (!isAddress(assetManagerAddress) || !isAddress(ftsoAddress)) {
		throw new Error("レジストリから無効なアドレスが返されました");
	}

	const assetManager = getContract({
		address: assetManagerAddress,
		abi: ASSET_MANAGER_ABI,
		client: publicClient,
	});

	const ftsoV2 = getContract({
		address: ftsoAddress,
		abi: FTSO_V2_ABI,
		client: publicClient,
	});

	// FXRP トークンアドレスを取得
	const fxrpAddress = await assetManager.read.fAsset();

	const fxrpToken = getContract({
		address: fxrpAddress,
		abi: ERC20_ABI,
		client: publicClient,
	});

	// 並列で情報を取得
	const [crf1Lot, xrpUsdFeedRaw, fxrpDecimals, fxrpTotalSupply] =
		await Promise.all([
			// 1 ロット分の担保予約手数料 (CRF)
			assetManager.read.collateralReservationFee([1n]),
			// XRP/USD 価格フィード（viem は複数戻り値を配列で返す）
			ftsoV2.read.getFeedById([XRP_USD_FEED_ID]),
			// FXRP のデシマル（XRP と同じ 6）
			fxrpToken.read.decimals(),
			// FXRP の総供給量
			fxrpToken.read.totalSupply(),
		]);

	// viem の複数戻り値は配列: [_value, _decimals, _timestamp]
	const [feedValue, feedDecimals_, feedTimestamp] = xrpUsdFeedRaw as [
		bigint,
		number,
		bigint,
	];

	// ─── FXRP トークン情報 ─────────────────────────────────────────────
	console.log("\n--- FXRP トークン情報 ---");
	console.log("デシマル        :", fxrpDecimals, "（XRP と同じ）");
	console.log(
		"総供給量        :",
		(Number(fxrpTotalSupply) / 10 ** fxrpDecimals).toFixed(6),
		"FXRP",
	);

	// ─── 担保予約手数料 (CRF) ─────────────────────────────────────────
	//
	// reserveCollateral() を呼ぶ際に支払う手数料。
	// ミント失敗時も返金されないため、事前に確認が重要。
	//
	console.log("\n--- 担保予約手数料 (CRF) ---");
	console.log("1 ロット分 CRF  :", crf1Lot.toString(), "wei");
	console.log("1 ロット分 CRF  :", formatEther(crf1Lot), "C2FLR");

	// ─── XRP/USD 価格の計算 ──────────────────────────────────────────
	//
	// FTSOv2 は価格を整数で返し、_decimals（通常負の値）で補正する。
	// price = _value × 10^_decimals
	//
	// 例: _value=228450, _decimals=-5 → 2.2845 USD
	//
	const rawValue = Number(feedValue);
	const feedDecimals = Number(feedDecimals_);
	// FTSOv2 の価格計算: price = rawValue / 10^feedDecimals
	// 例: rawValue=1371010, feedDecimals=6 → 1.371010 USD
	const xrpUsdPrice = rawValue / Math.pow(10, feedDecimals);
	const priceTimestamp = new Date(Number(feedTimestamp) * 1000);

	console.log("\n--- XRP/USD 価格（FTSOv2） ---");
	console.log("フィードID      :", XRP_USD_FEED_ID);
	console.log("Raw value       :", rawValue);
	console.log("Decimals        :", feedDecimals);
	console.log("XRP/USD 価格    : $" + xrpUsdPrice.toFixed(4));
	console.log("価格更新時刻    :", priceTimestamp.toISOString());
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
