/**
 * Viem パブリッククライアント / ウォレットクライアント の共通設定
 *
 * Flare Coston2 テストネット (Chain ID: 114) に接続する。
 * 環境変数 FLARE_RPC_URL でエンドポイントを上書き可能。
 */

import "dotenv/config";
import {
	createPublicClient,
	createWalletClient,
	defineChain,
	http,
	privateKeyToAccount,
} from "viem";

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

/** Coston2 に接続した Viem パブリッククライアント (読み取り専用) */
export const publicClient = createPublicClient({
	chain: coston2,
	transport: http(),
});

/**
 * Flare ウォレットクライアントを作成する
 *
 * 環境変数 PRIVATE_KEY が必要。
 * カスタム命令の登録など、トランザクションを送信する場合に使用する。
 */
export function createFlareWalletClient() {
	const privateKey = process.env.PRIVATE_KEY;
	if (!privateKey) {
		throw new Error(
			"PRIVATE_KEY が .env に設定されていません。.env.example を参照してください。",
		);
	}
	const account = privateKeyToAccount(privateKey as `0x${string}`);
	return {
		client: createWalletClient({
			account,
			chain: coston2,
			transport: http(),
		}),
		account,
	};
}
