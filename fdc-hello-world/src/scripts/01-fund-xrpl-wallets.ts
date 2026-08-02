/**
 * スクリプト 01: XRPL Testnetの送金元・送金先ウォレットを用意する
 *
 * xrpl.jsのClient.fundWallet()を使い、ウォレットの生成とTestnet faucetでの
 * 出金を自動化する（手動でfaucetのUIを開く必要がない）。
 *
 * 【実行方法】
 *   bun run fdc:01-fund-xrpl-wallets
 */

import "dotenv/config";
import { Client } from "xrpl";
import { writeState } from "../state.js";

const XRPL_TESTNET_WSS = "wss://s.altnet.rippletest.net:51233";

async function main() {
  console.log("=== FDC Hello World: XRPL Testnetウォレットの準備 ===\n");

  const client = new Client(XRPL_TESTNET_WSS);
  await client.connect();

  try {
    console.log("送金元ウォレットをfundWallet()で生成・出金中...");
    const sender = await client.fundWallet();
    console.log("  アドレス:", sender.wallet.address);
    console.log("  残高    :", sender.balance, "XRP");

    console.log("\n送金先ウォレットをfundWallet()で生成・出金中...");
    const receiver = await client.fundWallet();
    console.log("  アドレス:", receiver.wallet.address);
    console.log("  残高    :", receiver.balance, "XRP");

    writeState({
      xrpl: {
        senderSeed: sender.wallet.seed,
        senderAddress: sender.wallet.address,
        receiverSeed: receiver.wallet.seed,
        receiverAddress: receiver.wallet.address,
      },
    });

    console.log("\n完了。fdc-hello-world.state.json に保存しました。");
  } finally {
    await client.disconnect();
  }
}

void main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("エラー:", error);
    process.exit(1);
  });
