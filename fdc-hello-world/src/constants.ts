/**
 * FDC Hello World — 共通定数・ABI定義
 *
 * FlareContractsRegistryのアドレスは全ネットワーク共通。
 * FdcHub/FdcVerification/FdcRequestFeeConfigurations/Relayは
 * レジストリ経由で毎回動的に取得する（ハードコードしない）。
 *
 * 参照: flare-general スキルの flare-contracts-registry-guide.md
 */

import type { Address } from "viem";
import { publicClient } from "./viem/client.js";

// ─── 定数 ────────────────────────────────────────────────────────────────────

/** FlareContractsRegistry — 全 Flare ネットワークで共通のアドレス */
export const FLARE_CONTRACTS_REGISTRY_ADDRESS =
  "0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019" as const;

/** FDC Payment attestation type（generic Payment, 非UTXOチェーンはinUtxo/utxoともに0） */
export const ATTESTATION_TYPE_PAYMENT = "Payment" as const;

/** XRPL Testnetのソースid */
export const SOURCE_ID_TEST_XRP = "testXRP" as const;

/** Verifier APIのurlTypeBase（XRPの場合） */
export const VERIFIER_URL_TYPE_BASE_XRP = "xrp" as const;

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

/** IFdcHub ABI (最小限) */
export const FDC_HUB_ABI = [
  {
    name: "requestAttestation",
    type: "function",
    stateMutability: "payable",
    inputs: [{ name: "_data", type: "bytes" }],
    outputs: [],
  },
] as const;

/** IFdcVerification ABI (最小限) */
export const FDC_VERIFICATION_ABI = [
  {
    name: "fdcProtocolId",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "_fdcProtocolId", type: "uint8" }],
  },
] as const;

/** IFdcRequestFeeConfigurations ABI (最小限) */
export const FDC_REQUEST_FEE_CONFIGURATIONS_ABI = [
  {
    name: "getRequestFee",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "_data", type: "bytes" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

/** IRelay ABI (最小限) */
export const RELAY_ABI = [
  {
    name: "isFinalized",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "_protocolId", type: "uint256" },
      { name: "_votingRoundId", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "getVotingRoundId",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "_timestamp", type: "uint256" }],
    outputs: [{ name: "_votingRoundId", type: "uint256" }],
  },
] as const;

// ─── ヘルパー関数 ─────────────────────────────────────────────────────────────

/**
 * レジストリからコントラクトアドレスを名前解決する共通ヘルパー。
 * ハードコードより動的取得が推奨されている（Flare公式ガイドライン）。
 */
export async function getContractAddress(name: string): Promise<Address> {
  const address = await publicClient.readContract({
    address: FLARE_CONTRACTS_REGISTRY_ADDRESS,
    abi: REGISTRY_ABI,
    functionName: "getContractAddressByName",
    args: [name],
  });
  if (address === "0x0000000000000000000000000000000000000000") {
    throw new Error(`レジストリに "${name}" が登録されていません。`);
  }
  return address;
}
