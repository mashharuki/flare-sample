import hardhatToolboxViem from "@nomicfoundation/hardhat-toolbox-viem";
import "dotenv/config";
import { defineConfig } from "hardhat/config";

const { PRIVATE_KEY } = process.env;

if (!PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY is not set in the environment variables.");
}

/**
 * hardhatの設定ファイル
 *
 * このプロジェクトの役割はコントラクトのコンパイルとIgnitionデプロイのみ。
 * FDCのオフチェーンフロー（送金→attestation要求→待機→proof取得→提出）は
 * hreを経由しない素のviem+xrplスクリプト（src/scripts/）で行う。
 */
export default defineConfig({
  plugins: [hardhatToolboxViem],

  solidity: {
    version: "0.8.28",
    settings: {
      // @flarenetwork/flare-periphery-contracts の要件により明示的に指定する
      evmVersion: "cancun",
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  networks: {
    // ローカルシミュレーション（開発・テスト用）
    hardhat: {
      type: "edr-simulated",
      chainType: "generic",
    },

    // Flare Coston2 テストネット（Chain ID: 114）
    coston2: {
      type: "http",
      chainType: "generic",
      url: "https://coston2-api.flare.network/ext/C/rpc",
      accounts: [`${PRIVATE_KEY}`],
    },
  },
});
