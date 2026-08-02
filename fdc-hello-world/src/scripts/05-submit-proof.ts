/**
 * スクリプト 05: proofをコントラクトへ提出し、成功基準を確認する
 *
 * IPayment.ResponseのABI構造は手で書き写さず、コンパイル済みartifactの
 * registerPayment関数のABIから抽出する（フィールド名・順序の写し間違いを防ぐため）。
 *
 * 【実行方法】
 *   bun run fdc:05-submit-proof
 */

import "dotenv/config";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { type Abi, decodeAbiParameters, getContract, keccak256, toBytes } from "viem";
import { getDeployedAddress } from "../../helpers/getDeployedAddress.js";
import { requireState, writeState } from "../state.js";
import { createFlareWalletClient, publicClient } from "../viem/client.js";

const COSTON2_CHAIN_ID = 114;

function loadContractAbi(): Abi {
  const artifactPath = join(
    process.cwd(),
    "artifacts",
    "contracts",
    "FdcPaymentHelloWorld.sol",
    "FdcPaymentHelloWorld.json",
  );
  const artifact = JSON.parse(readFileSync(artifactPath, "utf-8"));
  return artifact.abi as Abi;
}

function getIPaymentResponseAbiParam(abi: Abi) {
  const registerPayment = abi.find(
    (item): item is Extract<Abi[number], { type: "function" }> =>
      item.type === "function" && item.name === "registerPayment",
  );
  if (!registerPayment) {
    throw new Error(
      "ABIにregisterPaymentが見つかりません。bun hardhat buildを先に実行してください。",
    );
  }
  const proofParam = registerPayment.inputs[0] as { components: unknown[] };
  const dataParam = proofParam.components[1]; // IPayment.Response
  return dataParam;
}

/** XRPLアドレス文字列のStandard Address Hash（ローワーケース化せずkeccak256） */
function standardAddressHash(address: string): `0x${string}` {
  return keccak256(toBytes(address));
}

async function main() {
  console.log("=== FDC Hello World: proof提出 + 成功基準チェック ===\n");

  const paymentReference = requireState("paymentReference");
  const payment = requireState("payment");
  const xrpl = requireState("xrpl");
  const proof = requireState("proof");

  if (!proof.merkleProof || !proof.responseHex) {
    throw new Error(
      "proof情報が不足しています。先に fdc:04-await-and-fetch-proof を実行してください。",
    );
  }
  if (!xrpl.senderAddress || !xrpl.receiverAddress) {
    throw new Error("XRPLアドレス情報が不足しています。");
  }

  const abi = loadContractAbi();
  const dataParam = getIPaymentResponseAbiParam(abi);
  const [decodedData] = decodeAbiParameters([dataParam as never], proof.responseHex);

  const responseBody = (decodedData as { responseBody: Record<string, unknown> }).responseBody;

  const contractAddress = getDeployedAddress(
    "FdcPaymentHelloWorldModule#FdcPaymentHelloWorld",
    COSTON2_CHAIN_ID,
  );
  const { client: walletClient, account } = createFlareWalletClient();
  const contract = getContract({
    address: contractAddress,
    abi,
    client: { public: publicClient, wallet: walletClient },
  });

  const proofStruct = {
    merkleProof: proof.merkleProof,
    data: decodedData,
  };

  console.log("registerPayment(proof) を送信中...");
  const registerTxHash = await walletClient.writeContract({
    address: contractAddress,
    abi,
    functionName: "registerPayment",
    args: [proofStruct],
    account,
    chain: walletClient.chain,
  });
  console.log("  TX ハッシュ:", registerTxHash);

  const receipt = await publicClient.waitForTransactionReceipt({ hash: registerTxHash });
  console.log("  ステータス :", receipt.status);

  // ── 成功基準の確認 ──────────────────────────────────────────────────────
  const checks: { name: string; pass: boolean; detail: string }[] = [];

  checks.push({
    name: "トランザクションが成功した",
    pass: receipt.status === "success",
    detail: receipt.status,
  });

  const expectedRef: `0x${string}` = await contract.read.expectedPaymentReference();
  checks.push({
    name: "expectedPaymentReference() がスクリプト00の出力と一致",
    pass: expectedRef.toLowerCase() === paymentReference.toLowerCase(),
    detail: `expected=${paymentReference} onchain=${expectedRef}`,
  });

  const onchainRef = responseBody.standardPaymentReference as `0x${string}`;
  checks.push({
    name: "FDCが返したstandardPaymentReferenceが期待値と一致",
    pass: onchainRef.toLowerCase() === paymentReference.toLowerCase(),
    detail: `expected=${paymentReference} fdc=${onchainRef}`,
  });

  const count: bigint = await contract.read.verifiedPaymentsCount();
  checks.push({
    name: "verifiedPaymentsCount() === 1",
    pass: count === 1n,
    detail: `count=${count}`,
  });

  const status = Number(responseBody.status);
  checks.push({
    name: "status === 0 (成功した送金)",
    pass: status === 0,
    detail: `status=${status}`,
  });

  const expectedSourceHash = standardAddressHash(xrpl.senderAddress);
  const onchainSourceHash = responseBody.sourceAddressHash as `0x${string}`;
  checks.push({
    name: "sourceAddressHashが送金元アドレスのkeccak256と一致",
    pass: expectedSourceHash.toLowerCase() === onchainSourceHash.toLowerCase(),
    detail: `expected=${expectedSourceHash} fdc=${onchainSourceHash}`,
  });

  const expectedReceivingHash = standardAddressHash(xrpl.receiverAddress);
  const onchainReceivingHash = responseBody.receivingAddressHash as `0x${string}`;
  checks.push({
    name: "receivingAddressHashが送金先アドレスのkeccak256と一致",
    pass: expectedReceivingHash.toLowerCase() === onchainReceivingHash.toLowerCase(),
    detail: `expected=${expectedReceivingHash} fdc=${onchainReceivingHash}`,
  });

  const receivedAmount = BigInt(responseBody.receivedAmount as bigint);
  checks.push({
    name: "receivedAmountが送金額(drops)と一致",
    pass: receivedAmount === BigInt(payment.amountDrops ?? "0"),
    detail: `expected=${payment.amountDrops} fdc=${receivedAmount}`,
  });

  console.log("\n=== 成功基準チェック結果 ===");
  let allPass = true;
  for (const check of checks) {
    const mark = check.pass ? "✅" : "❌";
    console.log(`${mark} ${check.name}`);
    console.log(`   ${check.detail}`);
    if (!check.pass) allPass = false;
  }

  writeState({ result: { registerTxHash, success: allPass } });

  console.log();
  console.log(
    allPass
      ? "🎉 PASS: FDCパイプライン全体が実データで検証できました"
      : "🛑 FAIL: 一部の基準を満たしていません",
  );

  if (!allPass) {
    process.exit(1);
  }
}

void main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("エラー:", error);
    process.exit(1);
  });
