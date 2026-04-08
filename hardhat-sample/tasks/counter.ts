import { task } from "hardhat/config";
import { getDeployedAddress, listDeployedContracts } from "../helpers/getDeployedAddress.js";

const CONTRACT_ID = "CounterModule#Counter";

/**
 * 現在のカウント値を取得する
 *
 * 使用例:
 *   bun hardhat counter:get --network coston2
 */
export const counterGetTask = task("counter:get", "現在のカウント値を取得する")
  .setInlineAction(async (_, hre) => {
    const { viem } = await hre.network.connect();
    const publicClient = await viem.getPublicClient();
    const chainId = await publicClient.getChainId();

    const address = getDeployedAddress(CONTRACT_ID, chainId);
    const counter = await viem.getContractAt("Counter", address);
    const count = await counter.read.count();

    console.log(`\nコントラクトアドレス: ${address}`);
    console.log(`現在のカウント: ${count}`);
  })
  .build();

/**
 * カウンターを1増やす
 *
 * 使用例:
 *   bun hardhat counter:increment --network coston2
 */
export const counterIncrementTask = task("counter:increment", "カウンターを1増やす")
  .setInlineAction(async (_, hre) => {
    const { viem } = await hre.network.connect();
    const publicClient = await viem.getPublicClient();
    const chainId = await publicClient.getChainId();

    const address = getDeployedAddress(CONTRACT_ID, chainId);
    const counter = await viem.getContractAt("Counter", address);

    console.log(`\nコントラクトアドレス: ${address}`);
    const before = await counter.read.count();
    console.log(`インクリメント前: ${before}`);

    const txHash = await counter.write.increment();
    await publicClient.waitForTransactionReceipt({ hash: txHash });

    const after = await counter.read.count();
    console.log(`インクリメント後: ${after}`);
    console.log(`トランザクション: ${txHash}`);
  })
  .build();

/**
 * カウンターを指定値増やす
 *
 * 使用例:
 *   bun hardhat counter:increment-by --amount 5 --network coston2
 */
export const counterIncrementByTask = task(
  "counter:increment-by",
  "カウンターを指定した値だけ増やす",
)
  .addOption({
    name: "amount",
    description: "増加量（1以上の整数）",
    defaultValue: "1",
  })
  .setInlineAction(async ({ amount }: { amount: string }, hre) => {
    const amountBigInt = BigInt(amount);
    if (amountBigInt <= 0n) {
      throw new Error("amount は1以上の整数を指定してください。");
    }

    const { viem } = await hre.network.connect();
    const publicClient = await viem.getPublicClient();
    const chainId = await publicClient.getChainId();

    const address = getDeployedAddress(CONTRACT_ID, chainId);
    const counter = await viem.getContractAt("Counter", address);

    console.log(`\nコントラクトアドレス: ${address}`);
    const before = await counter.read.count();
    console.log(`インクリメント前: ${before}`);

    const txHash = await counter.write.incrementBy([amountBigInt]);
    await publicClient.waitForTransactionReceipt({ hash: txHash });

    const after = await counter.read.count();
    console.log(`インクリメント後: ${after}（+${amount}）`);
    console.log(`トランザクション: ${txHash}`);
  })
  .build();

/**
 * カウンターを1減らす
 *
 * 使用例:
 *   bun hardhat counter:decrement --network coston2
 */
export const counterDecrementTask = task("counter:decrement", "カウンターを1減らす")
  .setInlineAction(async (_, hre) => {
    const { viem } = await hre.network.connect();
    const publicClient = await viem.getPublicClient();
    const chainId = await publicClient.getChainId();

    const address = getDeployedAddress(CONTRACT_ID, chainId);
    const counter = await viem.getContractAt("Counter", address);

    console.log(`\nコントラクトアドレス: ${address}`);
    const before = await counter.read.count();
    console.log(`デクリメント前: ${before}`);

    if (before === 0n) {
      throw new Error("カウントが0のためデクリメントできません。");
    }

    const txHash = await counter.write.decrement();
    await publicClient.waitForTransactionReceipt({ hash: txHash });

    const after = await counter.read.count();
    console.log(`デクリメント後: ${after}`);
    console.log(`トランザクション: ${txHash}`);
  })
  .build();

/**
 * カウンターを0にリセットする（オーナーのみ）
 *
 * 使用例:
 *   bun hardhat counter:reset --network coston2
 */
export const counterResetTask = task("counter:reset", "カウンターを0にリセットする（オーナーのみ）")
  .setInlineAction(async (_, hre) => {
    const { viem } = await hre.network.connect();
    const publicClient = await viem.getPublicClient();
    const chainId = await publicClient.getChainId();

    const address = getDeployedAddress(CONTRACT_ID, chainId);
    const counter = await viem.getContractAt("Counter", address);

    console.log(`\nコントラクトアドレス: ${address}`);
    const before = await counter.read.count();
    console.log(`リセット前: ${before}`);

    const txHash = await counter.write.reset();
    await publicClient.waitForTransactionReceipt({ hash: txHash });

    console.log(`リセット後: 0`);
    console.log(`トランザクション: ${txHash}`);
  })
  .build();

/**
 * デプロイ済みコントラクトの情報を表示する
 *
 * 使用例:
 *   bun hardhat counter:info --network coston2
 */
export const counterInfoTask = task(
  "counter:info",
  "デプロイ済み Counter コントラクトの情報を表示する",
)
  .setInlineAction(async (_, hre) => {
    const { viem } = await hre.network.connect();
    const publicClient = await viem.getPublicClient();
    const chainId = await publicClient.getChainId();

    listDeployedContracts(chainId);

    const address = getDeployedAddress(CONTRACT_ID, chainId);
    const counter = await viem.getContractAt("Counter", address);

    const [count, owner] = await Promise.all([counter.read.count(), counter.read.owner()]);

    console.log(`\n[Counter コントラクト情報]`);
    console.log(`  アドレス  : ${address}`);
    console.log(`  オーナー  : ${owner}`);
    console.log(`  カウント  : ${count}`);
    console.log(`  チェーンID: ${chainId}`);
  })
  .build();
