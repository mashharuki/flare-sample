/**
 * スクリプト 00: 32バイトのpayment referenceを生成する
 *
 * 【実行方法】
 *   bun run fdc:00-generate-reference
 *
 * 出力されたreferenceを ignition/parameters.json の
 * expectedPaymentReference にコピーしてからデプロイすること。
 */

import { writeState } from "../state.js";
import { buildPaymentReference, toMemoData } from "../paymentReference.js";

function main() {
  const reference = buildPaymentReference();
  writeState({ paymentReference: reference });

  console.log("=== FDC Hello World: payment reference生成 ===\n");
  console.log("Payment reference (bytes32) :", reference);
  console.log("XRPL Memo.MemoData用        :", toMemoData(reference));
  console.log();
  console.log("次のステップ:");
  console.log(
    "  1. ignition/parameters.json を作成し（ignition/parameters.example.json を参考に）、",
  );
  console.log(`     expectedPaymentReference に "${reference}" を設定する`);
  console.log("  2. bun run deploy:coston2 でデプロイする");
}

main();
