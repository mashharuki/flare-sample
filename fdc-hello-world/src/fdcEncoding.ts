/**
 * FDC attestationリクエスト用のエンコーディングヘルパー。
 *
 * attestationTypeとsourceIdは、文字列をUTF-8バイト列にしてから
 * 右側を0埋めしてbytes32(64桁hex)にする決まりになっている。
 * 自前で再実装せず、flare-hardhat-starterのtoUtf8HexString相当のロジックを踏襲する。
 */

/** 文字列をUTF-8エンコードし、右側を0埋めしてbytes32(0xプレフィックス付き64桁hex)にする */
export function toUtf8HexString(value: string): `0x${string}` {
  const bytes = new TextEncoder().encode(value);
  if (bytes.length > 32) {
    throw new Error(`"${value}" is longer than 32 bytes and cannot be encoded as bytes32.`);
  }
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `0x${hex.padEnd(64, "0")}`;
}
