/**
 * Viem パブリッククライアントの共通設定
 *
 * Flare Coston2 テストネット (Chain ID: 114) に接続する。
 * 環境変数 FLARE_RPC_URL でエンドポイントを上書き可能。
 */

import "dotenv/config";
import { createPublicClient, http, defineChain } from "viem";

/** Flare Coston2 テストネット (Chain ID: 114) */
export const coston2 = defineChain({
	id: 114,
	name: "Flare Testnet Coston2",
	nativeCurrency: { name: "Coston2 Flare", symbol: "C2FLR", decimals: 18 },
	rpcUrls: {
		default: {
			http: [
				process.env.FLARE_RPC_URL ??
					"https://coston2-api.flare.network/ext/C/rpc",
			],
		},
	},
	blockExplorers: {
		default: {
			name: "Coston2 Explorer",
			url: "https://coston2-explorer.flare.network",
		},
	},
});

/** Coston2 に接続した viem パブリッククライアント */
export const publicClient = createPublicClient({
	chain: coston2,
	transport: http(),
});
