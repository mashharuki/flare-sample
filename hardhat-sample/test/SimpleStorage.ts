import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

/**
 * SimpleStorage コントラクトの TypeScript テスト
 * Hardhat 3 + Viem + node:test を使用
 */
describe("SimpleStorage", async function () {
  const { viem } = await network.connect();

  async function deploySimpleStorage(text = "Hello Flare", number = 42n) {
    const storage = await viem.deployContract("SimpleStorage", [text, number]);
    return { storage };
  }

  it("コンストラクタで初期値が設定される", async function () {
    const { storage } = await deploySimpleStorage("Hello Flare", 42n);
    assert.equal(await storage.read.getText(), "Hello Flare");
    assert.equal(await storage.read.getNumber(), 42n);
  });

  it("setText() でテキストを更新できる", async function () {
    const { storage } = await deploySimpleStorage();
    await storage.write.setText(["Flare Network"]);
    assert.equal(await storage.read.getText(), "Flare Network");
  });

  it("setNumber() で数値を更新できる", async function () {
    const { storage } = await deploySimpleStorage();
    await storage.write.setNumber([100n]);
    assert.equal(await storage.read.getNumber(), 100n);
  });

  it("getAll() でテキストと数値を同時取得できる", async function () {
    const { storage } = await deploySimpleStorage("Coston2", 114n);
    const [text, number] = await storage.read.getAll();
    assert.equal(text, "Coston2");
    assert.equal(number, 114n);
  });
});
