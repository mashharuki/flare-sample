import { defineConfig, configVariable } from "hardhat/config";
import hardhatToolboxViem from "@nomicfoundation/hardhat-toolbox-viem";

export default defineConfig({
  plugins: [hardhatToolboxViem],

  solidity: {
    version: "0.8.28",
    settings: {
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
      accounts: [configVariable("PRIVATE_KEY")],
    },

    // Flare Coston テストネット（Chain ID: 16）
    coston: {
      type: "http",
      chainType: "generic",
      url: "https://coston-api.flare.network/ext/C/rpc",
      accounts: [configVariable("PRIVATE_KEY")],
    },

    // Songbird Canary ネットワーク（Chain ID: 19）
    songbird: {
      type: "http",
      chainType: "generic",
      url: "https://songbird-api.flare.network/ext/C/rpc",
      accounts: [configVariable("PRIVATE_KEY")],
    },

    // Flare Mainnet（Chain ID: 14）
    flare: {
      type: "http",
      chainType: "generic",
      url: "https://flare-api.flare.network/ext/C/rpc",
      accounts: [configVariable("PRIVATE_KEY")],
    },
  },

  test: {
    solidity: {
      timeout: 40000,
    },
  },
});
