/**
 * スクリプト 02: XRPL Testnetで実際のPaymentを送信する
 *
 * Memo.MemoDataにスクリプト00で生成したpayment referenceを埋め込む。
 * これがFDCのresponseBody.standardPaymentReferenceとして返ってくることを
 * 後続のステップで確認する。
 *
 * 【実行方法】
 *   bun run fdc:02-send-xrpl-payment
 */

import "dotenv/config";
import { Client, Wallet } from "xrpl";
import { toMemoData } from "../paymentReference.js";
import { requireState, writeState } from "../state.js";

const XRPL_TESTNET_WSS = "wss://s.altnet.rippletest.net:51233";

/** 送金額（drops単位）。5 XRP。 */
const AMOUNT_DROPS = "5000000";

async function main() {
  console.log("=== FDC Hello World: XRPL Payment送信 ===\n");

  const paymentReference = requireState("paymentReference");
  const xrpl = requireState("xrpl");
  if (!xrpl.senderSeed || !xrpl.receiverAddress) {
    throw new Error(
      "送金元/送金先の情報が不足しています。先に fdc:01-fund-xrpl-wallets を実行してください。",
    );
  }

  const senderWallet = Wallet.fromSeed(xrpl.senderSeed);
  const memoData = toMemoData(paymentReference);

  console.log("送金元       :", senderWallet.address);
  console.log("送金先       :", xrpl.receiverAddress);
  console.log("金額         :", `${Number(AMOUNT_DROPS) / 1_000_000} XRP`);
  console.log("MemoData     :", memoData);
  console.log();

  const client = new Client(XRPL_TESTNET_WSS);
  await client.connect();

  try {
    const payment = {
      TransactionType: "Payment" as const,
      Account: senderWallet.address,
      Destination: xrpl.receiverAddress,
      Amount: AMOUNT_DROPS,
      Memos: [
        {
          Memo: {
            MemoData: memoData,
          },
        },
      ],
    };

    console.log("XRPL Payment トランザクションを送信中...");
    const result = await client.submitAndWait(payment, { wallet: senderWallet });

    const txHash = result.result.hash;
    console.log("✅ トランザクション送信完了!");
    console.log("  TX ハッシュ      :", txHash);
    console.log("  エクスプローラー :", `https://testnet.xrpl.org/transactions/${txHash}`);

    writeState({
      payment: {
        xrplTxHash: txHash,
        amountDrops: AMOUNT_DROPS,
        sentAt: new Date().toISOString(),
      },
    });

    console.log("\n次のステップ: bun run fdc:03-request-attestation");
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
