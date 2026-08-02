/**
 * スクリプト 03: FDC Payment attestationをリクエストする
 *
 * 1. Verifier APIのprepareRequestでabiEncodedRequestを取得する
 * 2. IFdcRequestFeeConfigurations.getRequestFee()で正確な手数料を取得する
 * 3. FdcHub.requestAttestation(abiEncodedRequest, {value: fee})を実行する
 * 4. Relay.getVotingRoundId(blockTimestamp)でroundIdを求める
 *
 * 【実行方法】
 *   bun run fdc:03-request-attestation
 */

import "dotenv/config";
import {
  ATTESTATION_TYPE_PAYMENT,
  FDC_HUB_ABI,
  FDC_REQUEST_FEE_CONFIGURATIONS_ABI,
  RELAY_ABI,
  SOURCE_ID_TEST_XRP,
  VERIFIER_URL_TYPE_BASE_XRP,
  getContractAddress,
} from "../constants.js";
import { toUtf8HexString } from "../fdcEncoding.js";
import { requireState, writeState } from "../state.js";
import { createFlareWalletClient, publicClient } from "../viem/client.js";

interface PrepareRequestResponse {
  status: string;
  abiEncodedRequest?: `0x${string}`;
}

async function prepareAttestationRequest(transactionId: string): Promise<`0x${string}`> {
  const verifierUrlBase = process.env.VERIFIER_URL_TESTNET;
  const apiKey = process.env.VERIFIER_API_KEY_TESTNET ?? "";
  if (!verifierUrlBase) {
    throw new Error("VERIFIER_URL_TESTNET が .env に設定されていません。");
  }

  const url = `${verifierUrlBase}/verifier/${VERIFIER_URL_TYPE_BASE_XRP}/${ATTESTATION_TYPE_PAYMENT}/prepareRequest`;
  const body = {
    attestationType: toUtf8HexString(ATTESTATION_TYPE_PAYMENT),
    sourceId: toUtf8HexString(SOURCE_ID_TEST_XRP),
    requestBody: {
      transactionId: `0x${transactionId}`,
      inUtxo: "0",
      utxo: "0",
    },
  };

  console.log("Verifier APIへprepareRequestを送信中...");
  console.log("  URL :", url);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": apiKey,
    },
    body: JSON.stringify(body),
  });

  const json = (await response.json()) as PrepareRequestResponse;
  if (!response.ok || !json.abiEncodedRequest) {
    throw new Error(
      `prepareRequestが失敗しました (status=${response.status}): ${JSON.stringify(json)}`,
    );
  }

  return json.abiEncodedRequest;
}

async function main() {
  console.log("=== FDC Hello World: Attestationリクエスト ===\n");

  const payment = requireState("payment");
  if (!payment.xrplTxHash) {
    throw new Error(
      "XRPL送金情報が不足しています。先に fdc:02-send-xrpl-payment を実行してください。",
    );
  }

  const abiEncodedRequest = await prepareAttestationRequest(payment.xrplTxHash);
  console.log("abiEncodedRequest取得完了:", abiEncodedRequest);

  const fdcHubAddress = await getContractAddress("FdcHub");
  const feeConfigAddress = await getContractAddress("FdcRequestFeeConfigurations");
  const relayAddress = await getContractAddress("Relay");

  const fee = await publicClient.readContract({
    address: feeConfigAddress,
    abi: FDC_REQUEST_FEE_CONFIGURATIONS_ABI,
    functionName: "getRequestFee",
    args: [abiEncodedRequest],
  });
  console.log("手数料 (wei):", fee.toString());

  const { client: walletClient, account } = createFlareWalletClient();

  console.log("\nFdcHub.requestAttestationを送信中...");
  const requestTxHash = await walletClient.writeContract({
    address: fdcHubAddress,
    abi: FDC_HUB_ABI,
    functionName: "requestAttestation",
    args: [abiEncodedRequest],
    value: fee,
    account,
    chain: walletClient.chain,
  });
  console.log("  TX ハッシュ:", requestTxHash);

  const receipt = await publicClient.waitForTransactionReceipt({ hash: requestTxHash });
  const block = await publicClient.getBlock({ blockNumber: receipt.blockNumber });

  const roundId = await publicClient.readContract({
    address: relayAddress,
    abi: RELAY_ABI,
    functionName: "getVotingRoundId",
    args: [block.timestamp],
  });
  console.log("roundId:", roundId.toString());

  writeState({
    attestation: {
      abiEncodedRequest,
      roundId: Number(roundId),
      requestTxHash,
    },
  });

  console.log("\n次のステップ: bun run fdc:04-await-and-fetch-proof");
  console.log("（ラウンドのfinalizeには90〜180秒程度かかります）");
}

void main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("エラー:", error);
    process.exit(1);
  });
