/**
 * スクリプト 04: ラウンドのfinalizeを待ち、DA LayerからMerkle proofを取得する
 *
 * Relay.isFinalized(fdcProtocolId, roundId)をポーリングし、
 * finalize後にDA Layerのproof-by-request-round-rawへPOSTする。
 *
 * 【実行方法】
 *   bun run fdc:04-await-and-fetch-proof
 */

import "dotenv/config";
import { FDC_VERIFICATION_ABI, RELAY_ABI, getContractAddress } from "../constants.js";
import { requireState, writeState } from "../state.js";
import { publicClient } from "../viem/client.js";

const POLL_INTERVAL_MS = 15_000;
const MAX_WAIT_MS = 10 * 60 * 1000; // 10分

interface ProofResponse {
  response_hex?: `0x${string}`;
  proof?: `0x${string}`[];
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForFinalization(
  relayAddress: `0x${string}`,
  fdcProtocolId: number,
  roundId: number,
) {
  const startedAt = Date.now();
  let attempt = 0;

  while (Date.now() - startedAt < MAX_WAIT_MS) {
    attempt += 1;
    const finalized = await publicClient.readContract({
      address: relayAddress,
      abi: RELAY_ABI,
      functionName: "isFinalized",
      args: [BigInt(fdcProtocolId), BigInt(roundId)],
    });

    console.log(`  試行 ${attempt}: isFinalized = ${finalized}`);
    if (finalized) {
      return;
    }
    await sleep(POLL_INTERVAL_MS);
  }

  throw new Error(
    `roundId=${roundId} が ${MAX_WAIT_MS / 1000}秒以内にfinalizeされませんでした。もう少し待ってから再実行してください。`,
  );
}

async function fetchProof(
  votingRoundId: number,
  abiEncodedRequest: `0x${string}`,
): Promise<ProofResponse> {
  const daLayerUrl = process.env.COSTON2_DA_LAYER_URL;
  if (!daLayerUrl) {
    throw new Error("COSTON2_DA_LAYER_URL が .env に設定されていません。");
  }

  const url = `${daLayerUrl}/api/v1/fdc/proof-by-request-round-raw`;
  console.log("\nDA Layerからproofを取得中...");
  console.log("  URL :", url);

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ votingRoundId, requestBytes: abiEncodedRequest }),
  });

  const json = (await response.json()) as ProofResponse;
  if (!response.ok || !json.response_hex || !json.proof) {
    throw new Error(`proof取得が失敗しました (status=${response.status}): ${JSON.stringify(json)}`);
  }

  return json;
}

async function main() {
  console.log("=== FDC Hello World: finalize待機 + proof取得 ===\n");

  const attestation = requireState("attestation");
  if (attestation.roundId === undefined || !attestation.abiEncodedRequest) {
    throw new Error(
      "attestation情報が不足しています。先に fdc:03-request-attestation を実行してください。",
    );
  }

  const relayAddress = await getContractAddress("Relay");
  const fdcVerificationAddress = await getContractAddress("FdcVerification");
  const fdcProtocolId = await publicClient.readContract({
    address: fdcVerificationAddress,
    abi: FDC_VERIFICATION_ABI,
    functionName: "fdcProtocolId",
  });
  console.log("fdcProtocolId:", fdcProtocolId);

  console.log(`\nroundId=${attestation.roundId} のfinalizeを待機中...`);
  await waitForFinalization(relayAddress, fdcProtocolId, attestation.roundId);
  console.log("✅ finalize確認済み");

  const proof = await fetchProof(attestation.roundId, attestation.abiEncodedRequest);
  console.log("✅ proof取得完了");
  console.log("  merkleProof件数:", proof.proof?.length);

  writeState({
    proof: {
      merkleProof: proof.proof,
      responseHex: proof.response_hex,
      finalizedAt: new Date().toISOString(),
    },
  });

  console.log("\n次のステップ: bun run fdc:05-submit-proof");
}

void main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("エラー:", error);
    process.exit(1);
  });
