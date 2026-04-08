/**
 * スクリプト 05: 自分のウォレットの FXRP 残高を取得
 *
 * 学習ポイント:
 *   - ERC-20 の balanceOf() で残高を取得する基本パターン
 *   - PRIVATE_KEY からウォレットアドレスを導出（秘密鍵で署名は不要）
 *   - C2FLR（ネイティブトークン）と FXRP（ERC-20）の両方を表示
 *
 * 読み取り専用: balanceOf は view 関数のためトランザクション不要
 *   ただし、アドレス導出のために PRIVATE_KEY または ADDRESS を使用
 *
 * 環境変数:
 *   PRIVATE_KEY — ウォレットの秘密鍵（アドレス導出のみに使用、署名なし）
 *   WALLET_ADDRESS — 秘密鍵の代わりに直接アドレスを指定することも可能
 *
 * 実行方法:
 *   bun run 05:get-fxrp-balance
 */

import "dotenv/config";
import { getContract, formatEther, isAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { publicClient } from "../client.js";
import {
  FLARE_CONTRACTS_REGISTRY_ADDRESS,
  REGISTRY_ABI,
  ASSET_MANAGER_ABI,
  ERC20_ABI,
} from "../constants.js";

async function resolveWalletAddress(): Promise<`0x${string}`> {
  // 優先順位: WALLET_ADDRESS → PRIVATE_KEY から導出
  const walletAddress = process.env.WALLET_ADDRESS;
  if (walletAddress) {
    if (!isAddress(walletAddress)) {
      throw new Error(`WALLET_ADDRESS が無効なアドレスです: ${walletAddress}`);
    }
    return walletAddress;
  }

  const privateKey = process.env.PRIVATE_KEY as `0x${string}` | undefined;
  if (privateKey) {
    const account = privateKeyToAccount(privateKey);
    return account.address;
  }

  throw new Error(
    "WALLET_ADDRESS または PRIVATE_KEY を .env に設定してください。"
  );
}

async function main() {
  console.log("=== FXRP 残高確認 ===\n");

  const walletAddress = await resolveWalletAddress();
  console.log("ウォレットアドレス:", walletAddress);

  // FlareContractsRegistry → AssetManagerFXRP → fAsset()
  const registry = getContract({
    address: FLARE_CONTRACTS_REGISTRY_ADDRESS,
    abi: REGISTRY_ABI,
    client: publicClient,
  });

  const assetManagerAddress =
    await registry.read.getContractAddressByName(["AssetManagerFXRP"]);

  const assetManager = getContract({
    address: assetManagerAddress,
    abi: ASSET_MANAGER_ABI,
    client: publicClient,
  });

  const fxrpAddress = await assetManager.read.fAsset();

  const fxrpToken = getContract({
    address: fxrpAddress,
    abi: ERC20_ABI,
    client: publicClient,
  });

  // C2FLR（ネイティブ）と FXRP（ERC-20）を並列取得
  const [nativeBalance, fxrpBalance, fxrpDecimals, fxrpSymbol] =
    await Promise.all([
      publicClient.getBalance({ address: walletAddress }),
      fxrpToken.read.balanceOf([walletAddress]),
      fxrpToken.read.decimals(),
      fxrpToken.read.symbol(),
    ]);

  console.log("\n--- 残高 ---");
  console.log(
    "C2FLR (ネイティブ) :",
    formatEther(nativeBalance),
    "C2FLR"
  );
  console.log(
    `FXRP               : ${(Number(fxrpBalance) / 10 ** fxrpDecimals).toFixed(6)} ${fxrpSymbol}`
  );
  console.log(
    `\nFXRP コントラクト  : ${fxrpAddress}`
  );

  if (fxrpBalance === 0n) {
    console.log(
      "\n💡 FXRP 残高が 0 です。"
    );
    console.log(
      "   Coston2 フォーセット: https://faucet.flare.network/coston2"
    );
    console.log(
      "   またはスクリプト 04 でミントしてください。"
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
