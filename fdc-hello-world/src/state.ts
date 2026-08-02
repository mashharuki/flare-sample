/**
 * スクリプト間で状態を受け渡すための小さなJSONファイル。
 *
 * FDCのラウンドfinalize待ち(90〜180秒、テストネットではそれ以上の場合あり)を
 * 1つの長時間プロセスに閉じ込めないための仕組み。途中のステップが失敗しても、
 * 実際のXRPL送金からやり直さずに、そのステップだけ再実行できる。
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const STATE_FILE_PATH = join(process.cwd(), "fdc-hello-world.state.json");

export interface FdcHelloWorldState {
  paymentReference?: `0x${string}`;
  xrpl?: {
    senderSeed?: string;
    senderAddress?: string;
    receiverSeed?: string;
    receiverAddress?: string;
  };
  payment?: {
    xrplTxHash?: string;
    amountDrops?: string;
    sentAt?: string;
  };
  attestation?: {
    abiEncodedRequest?: `0x${string}`;
    roundId?: number;
    requestTxHash?: `0x${string}`;
  };
  proof?: {
    merkleProof?: `0x${string}`[];
    responseHex?: `0x${string}`;
    finalizedAt?: string;
  };
  result?: {
    registerTxHash?: `0x${string}`;
    success?: boolean;
  };
}

export function readState(): FdcHelloWorldState {
  if (!existsSync(STATE_FILE_PATH)) {
    return {};
  }
  return JSON.parse(readFileSync(STATE_FILE_PATH, "utf-8")) as FdcHelloWorldState;
}

export function writeState(patch: Partial<FdcHelloWorldState>): FdcHelloWorldState {
  const current = readState();
  const next: FdcHelloWorldState = { ...current, ...patch };
  writeFileSync(STATE_FILE_PATH, JSON.stringify(next, null, 2));
  return next;
}

export function requireState<K extends keyof FdcHelloWorldState>(
  key: K,
): NonNullable<FdcHelloWorldState[K]> {
  const state = readState();
  const value = state[key];
  if (value === undefined) {
    throw new Error(
      `状態ファイル(${STATE_FILE_PATH})に "${key}" がありません。前のステップのスクリプトを先に実行してください。`,
    );
  }
  return value;
}
