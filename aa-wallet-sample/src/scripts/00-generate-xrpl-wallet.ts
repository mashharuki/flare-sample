/**
 * スクリプト 00: XRPL ウォレットの生成
 *
 * 【学習内容】
 *   Flare Smart Accounts を使うために必要な XRPL ウォレットを新規生成する。
 *   生成したシードを .env の XRPL_SEED に設定してから次のスクリプトへ進む。
 *
 * 【実行方法】
 *   bun run 00:generate-xrpl-wallet
 *
 * ⚠️  注意:
 *   - シード (XRPL_SEED) は秘密鍵です。絶対に他人に見せないでください。
 *   - .env ファイルは .gitignore に含めて Git にコミットしないでください。
 *   - テストネット用として生成したシードをメインネットで使用しないでください。
 */

import { Wallet } from "xrpl";

function main() {
	console.log("=== XRPL ウォレット生成 ===\n");

	// ── 新規ウォレットを生成する ──────────────────────────────────────────────
	const wallet = Wallet.generate();

	console.log("新しい XRPL ウォレットを生成しました:\n");
	console.log(`  シード (XRPL_SEED) : ${wallet.seed}`);
	console.log(`  アドレス           : ${wallet.address}`);
	console.log(`  公開鍵             : ${wallet.publicKey}`);

	console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【次のステップ】

1. .env の XRPL_SEED に上記シードを設定する:

   XRPL_SEED=${wallet.seed}

2. XRPL テストネット用の XRP をフォーセットから取得する:
   https://xrpl.org/resources/dev-tools/xrp-faucets
   (アドレス: ${wallet.address} をフォーセットに入力)

3. スクリプト 01 でスマートアカウントアドレスを確認する:
   bun run 01:get-smart-account
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  シードは秘密鍵です。.env ファイルを Git にコミットしないでください。
`);
}

main();
