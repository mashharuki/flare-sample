/**
 * デプロイ済みコントラクトとのインタラクションスクリプト
 *
 * 使用方法:
 *   npx hardhat run scripts/interact.ts --network coston2
 *
 * 事前準備:
 *   1. .env ファイルに PRIVATE_KEY を設定
 *   2. Coston2 のテストトークン取得: https://faucet.flare.network/coston2
 *   3. コントラクトをデプロイし、アドレスを COUNTER_ADDRESS に設定
 */

import { createPublicClient, createWalletClient, http, parseAbi } from "viem";

// デプロイ済みコントラクトのアドレスをここに設定
const COUNTER_ADDRESS = "0x0000000000000000000000000000000000000000";

// Coston2 テストネット設定
const coston2 = {
  id: 114,
  name: "Coston2",
  nativeCurrency: { name: "C2FLR", symbol: "C2FLR", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://coston2-api.flare.network/ext/C/rpc"] },
  },
  blockExplorers: {
    default: {
      name: "Coston2 Explorer",
      url: "https://coston2-explorer.flare.network",
    },
  },
};

const counterAbi = parseAbi([
  "function count() view returns (uint256)",
  "function getCount() view returns (uint256)",
  "function increment() external",
  "function incrementBy(uint256 amount) external",
  "function decrement() external",
  "function reset() external",
  "event Incremented(address indexed by, uint256 newCount)",
]);

async function main() {
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY が .env ファイルに設定されていません");
  }

  const publicClient = createPublicClient({
    chain: coston2,
    transport: http(),
  });

  // 現在のカウント値を読み取る
  console.log("=== Counter コントラクト操作デモ ===\n");

  const currentCount = await publicClient.readContract({
    address: COUNTER_ADDRESS as `0x${string}`,
    abi: counterAbi,
    functionName: "count",
  });

  console.log(`現在のカウント: ${currentCount}`);
  console.log("\nヒント: コントラクトをデプロイしてからスクリプトを実行してください");
  console.log(
    "デプロイコマンド: npx hardhat ignition deploy ignition/modules/Counter.ts --network coston2",
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
