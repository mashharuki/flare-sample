/**
 * FDC Hello World用の32バイトpayment referenceを生成する。
 *
 * この値をXRPL PaymentのMemo.MemoDataに埋め込み、FDCが返す
 * responseBody.standardPaymentReferenceと一致することをコントラクト側で検証する。
 * これにより「FDCが何かを検証した」ではなく「この回で送ったその送金を検証した」
 * ことをオンチェーンで断言できる。
 */

import { keccak256, toBytes } from "viem";

export function buildPaymentReference(label = "fdc-hello-world"): `0x${string}` {
  const timestamp = new Date().toISOString();
  return keccak256(toBytes(`${label}:${timestamp}`));
}

/** XRPL PaymentのMemo.MemoData用に、0xプレフィックスを外して大文字hexに変換する */
export function toMemoData(reference: `0x${string}`): string {
  return reference.slice(2).toUpperCase();
}
