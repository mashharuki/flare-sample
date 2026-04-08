/**
 * Flare Smart Accounts — 共通定数・ABI 定義
 *
 * FlareContractsRegistry のアドレスは全ネットワーク共通。
 * MasterAccountController のアドレスも全ネットワーク共通だが、
 * レジストリ経由で取得することを推奨する。
 *
 * 公式ドキュメント: https://dev.flare.network/smart-accounts/
 */

import type { Address } from "viem";
import { publicClient } from "./client.js";

// ─── 定数 ────────────────────────────────────────────────────────────────────

/** FlareContractsRegistry — 全 Flare ネットワークで共通のアドレス */
export const FLARE_CONTRACTS_REGISTRY_ADDRESS =
	"0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019" as const;

/**
 * MasterAccountController の既知アドレス (全ネットワーク共通)
 * ※ 動的取得が推奨。`getMasterAccountControllerAddress()` を使用すること。
 */
export const MASTER_ACCOUNT_CONTROLLER_ADDRESS =
	"0x434936d47503353f06750Db1A444DBDC5F0AD37c" as const;

// ─── ABIs ────────────────────────────────────────────────────────────────────

/** FlareContractsRegistry ABI (最小限) */
export const REGISTRY_ABI = [
	{
		name: "getContractAddressByName",
		type: "function",
		stateMutability: "view",
		inputs: [{ name: "_name", type: "string" }],
		outputs: [{ name: "", type: "address" }],
	},
] as const;

/** MasterAccountController ABI */
export const MASTER_ACCOUNT_CONTROLLER_ABI = [
	{
		name: "getPersonalAccount",
		type: "function",
		stateMutability: "view",
		inputs: [{ name: "xrplAddress", type: "string" }],
		outputs: [{ name: "", type: "address" }],
	},
	{
		name: "getXrplProviderWallets",
		type: "function",
		stateMutability: "view",
		inputs: [],
		outputs: [{ name: "", type: "string[]" }],
	},
	{
		name: "getVaults",
		type: "function",
		stateMutability: "view",
		inputs: [],
		outputs: [
			{
				name: "",
				type: "tuple[]",
				components: [
					{ name: "id", type: "uint256" },
					{ name: "addr", type: "address" },
					{ name: "vaultType", type: "uint8" },
				],
			},
		],
	},
	{
		name: "getAgentVaults",
		type: "function",
		stateMutability: "view",
		inputs: [],
		outputs: [
			{
				name: "",
				type: "tuple[]",
				components: [
					{ name: "id", type: "uint256" },
					{ name: "addr", type: "address" },
				],
			},
		],
	},
	{
		name: "registerCustomInstruction",
		type: "function",
		stateMutability: "nonpayable",
		inputs: [
			{
				name: "calls",
				type: "tuple[]",
				components: [
					{ name: "targetContract", type: "address" },
					{ name: "value", type: "uint256" },
					{ name: "data", type: "bytes" },
				],
			},
		],
		outputs: [],
	},
	{
		name: "encodeCustomInstruction",
		type: "function",
		stateMutability: "pure",
		inputs: [
			{
				name: "calls",
				type: "tuple[]",
				components: [
					{ name: "targetContract", type: "address" },
					{ name: "value", type: "uint256" },
					{ name: "data", type: "bytes" },
				],
			},
		],
		outputs: [{ name: "", type: "bytes32" }],
	},
] as const;

/** ERC-20 ABI (balanceOf のみ) */
export const ERC20_ABI = [
	{
		name: "balanceOf",
		type: "function",
		stateMutability: "view",
		inputs: [{ name: "account", type: "address" }],
		outputs: [{ name: "", type: "uint256" }],
	},
	{
		name: "symbol",
		type: "function",
		stateMutability: "view",
		inputs: [],
		outputs: [{ name: "", type: "string" }],
	},
	{
		name: "decimals",
		type: "function",
		stateMutability: "view",
		inputs: [],
		outputs: [{ name: "", type: "uint8" }],
	},
] as const;

// ─── ヘルパー関数 ─────────────────────────────────────────────────────────────

/**
 * FlareContractRegistry から MasterAccountController アドレスを取得する。
 *
 * ハードコードより動的取得が推奨。ネットワーク移行時にも対応できる。
 */
export async function getMasterAccountControllerAddress(): Promise<Address> {
	const address = await publicClient.readContract({
		address: FLARE_CONTRACTS_REGISTRY_ADDRESS,
		abi: REGISTRY_ABI,
		functionName: "getContractAddressByName",
		args: ["MasterAccountController"],
	});
	if (address === "0x0000000000000000000000000000000000000000") {
		// レジストリに未登録の場合は既知アドレスにフォールバック
		return MASTER_ACCOUNT_CONTROLLER_ADDRESS;
	}
	return address;
}
