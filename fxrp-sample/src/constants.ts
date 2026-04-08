/**
 * Flare ネットワーク共通定数
 *
 * FlareContractsRegistry のアドレスは全ネットワーク共通。
 * 他のコントラクトアドレス（AssetManager, FXRP token 等）は
 * ネットワークによって異なるため、必ずレジストリ経由で取得する。
 *
 * 公式ドキュメント: https://dev.flare.network/network/guides/flare-contracts-registry
 */

/** FlareContractsRegistry — 全 Flare ネットワークで共通のアドレス */
export const FLARE_CONTRACTS_REGISTRY_ADDRESS =
	"0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019" as const;

/**
 * FTSOv2 XRP/USD フィードID
 * 参考: https://dev.flare.network/ftso/scaling/anchor-feeds
 */
export const XRP_USD_FEED_ID =
	"0x015852502f55534400000000000000000000000000" as const;

// ─── ABIs ────────────────────────────────────────────────────────────────────

export const REGISTRY_ABI = [
	{
		name: "getContractAddressByName",
		type: "function",
		stateMutability: "view",
		inputs: [{ name: "_name", type: "string" }],
		outputs: [{ name: "", type: "address" }],
	},
] as const;

export const ASSET_MANAGER_ABI = [
	{
		name: "fAsset",
		type: "function",
		stateMutability: "view",
		inputs: [],
		outputs: [{ name: "", type: "address" }],
	},
	{
		name: "getSettings",
		type: "function",
		stateMutability: "view",
		inputs: [],
		outputs: [
			{
				name: "",
				type: "tuple",
				components: [
					{ name: "lotSizeAMG", type: "uint64" },
					{ name: "assetDecimals", type: "uint8" },
					{ name: "agentOwnerRegistry", type: "address" },
				],
			},
		],
	},
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
	{
		name: "getAgentInfo",
		type: "function",
		stateMutability: "view",
		inputs: [{ name: "_agentVault", type: "address" }],
		outputs: [
			{
				name: "",
				type: "tuple",
				components: [
					{ name: "status", type: "uint8" },
					{ name: "feeBIPS", type: "uint256" },
				],
			},
		],
	},
	{
		name: "collateralReservationFee",
		type: "function",
		stateMutability: "view",
		inputs: [{ name: "_lots", type: "uint256" }],
		outputs: [{ name: "", type: "uint256" }],
	},
	{
		name: "reserveCollateral",
		type: "function",
		stateMutability: "payable",
		inputs: [
			{ name: "_agentVault", type: "address" },
			{ name: "_lots", type: "uint256" },
			{ name: "_maxMintingFeeBIPS", type: "uint256" },
			{ name: "_executor", type: "address" },
		],
		outputs: [{ name: "", type: "uint256" }],
	},
] as const;

export const FTSO_V2_ABI = [
	{
		name: "getFeedById",
		type: "function",
		stateMutability: "view",
		inputs: [{ name: "_feedId", type: "bytes21" }],
		outputs: [
			{ name: "_value", type: "uint256" },
			{ name: "_decimals", type: "int8" },
			{ name: "_timestamp", type: "uint64" },
		],
	},
] as const;

export const ERC20_ABI = [
	{
		name: "name",
		type: "function",
		stateMutability: "view",
		inputs: [],
		outputs: [{ name: "", type: "string" }],
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
	{
		name: "totalSupply",
		type: "function",
		stateMutability: "view",
		inputs: [],
		outputs: [{ name: "", type: "uint256" }],
	},
	{
		name: "balanceOf",
		type: "function",
		stateMutability: "view",
		inputs: [{ name: "account", type: "address" }],
		outputs: [{ name: "", type: "uint256" }],
	},
] as const;
