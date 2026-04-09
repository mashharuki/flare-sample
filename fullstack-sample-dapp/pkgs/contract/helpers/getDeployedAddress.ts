import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * ignition/deployments/{chain-chainId}/deployed_addresses.json から
 * デプロイ済みコントラクトのアドレスを読み込む汎用ヘルパー
 */

type DeployedAddresses = Record<string, string>;

function resolveDeploymentPath(chainId: number, projectRoot: string): string {
  return join(
    projectRoot,
    "ignition",
    "deployments",
    `chain-${chainId}`,
    "deployed_addresses.json",
  );
}

/**
 * 指定チェーンのデプロイ済みアドレス一覧を返す
 * @param chainId - チェーンID（例: 114 = Coston2, 19 = Songbird）
 * @param projectRoot - プロジェクトルート（デフォルト: process.cwd()）
 */
export function getAllDeployedAddresses(
  chainId: number,
  projectRoot: string = process.cwd(),
): DeployedAddresses {
  const deploymentPath = resolveDeploymentPath(chainId, projectRoot);

  if (!existsSync(deploymentPath)) {
    throw new Error(
      `デプロイ情報が見つかりません: ${deploymentPath}\n` +
        `先にコントラクトをデプロイしてください:\n` +
        `  bun run deploy:coston2   # Coston2 テストネット\n` +
        `  bun run deploy:local     # ローカル`,
    );
  }

  return JSON.parse(readFileSync(deploymentPath, "utf-8")) as DeployedAddresses;
}

/**
 * デプロイ済みコントラクトのアドレスを取得する
 * @param contractId - "ModuleName#ContractName" 形式（例: "CounterModule#Counter"）
 * @param chainId - チェーンID（例: 114 = Coston2, 19 = Songbird）
 * @param projectRoot - プロジェクトルート（デフォルト: process.cwd()）
 * @returns コントラクトアドレス（0x プレフィックス付き）
 *
 * @example
 * const address = getDeployedAddress("CounterModule#Counter", 114);
 */
export function getDeployedAddress(
  contractId: string,
  chainId: number,
  projectRoot: string = process.cwd(),
): `0x${string}` {
  const deployments = getAllDeployedAddresses(chainId, projectRoot);
  const address = deployments[contractId];

  if (!address) {
    const available = Object.keys(deployments)
      .map((k) => `  - ${k}`)
      .join("\n");
    throw new Error(
      `コントラクト "${contractId}" のアドレスが見つかりません。\n` +
        `利用可能なコントラクト:\n${available}`,
    );
  }

  return address as `0x${string}`;
}

/**
 * デプロイ済みコントラクト一覧を表示する
 * @param chainId - チェーンID
 * @param projectRoot - プロジェクトルート（デフォルト: process.cwd()）
 */
export function listDeployedContracts(chainId: number, projectRoot: string = process.cwd()): void {
  let deployments: DeployedAddresses;
  try {
    deployments = getAllDeployedAddresses(chainId, projectRoot);
  } catch {
    console.log(`chain-${chainId} にデプロイ済みコントラクトはありません。`);
    return;
  }

  const entries = Object.entries(deployments);
  if (entries.length === 0) {
    console.log(`chain-${chainId} にデプロイ済みコントラクトはありません。`);
    return;
  }

  console.log(`\nchain-${chainId} のデプロイ済みコントラクト:`);
  for (const [id, address] of entries) {
    console.log(`  ${id}: ${address}`);
  }
}
