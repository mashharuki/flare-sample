import assert from "node:assert/strict";
import { describe, it, before } from "node:test";
import { network } from "hardhat";

/**
 * Counter コントラクトの TypeScript テスト
 * Hardhat 3 + Viem + node:test を使用
 */
describe("Counter", async function () {
  const { viem, networkHelpers } = await network.connect();

  async function deployCounter() {
    const counter = await viem.deployContract("Counter");
    const [owner, alice] = await viem.getWalletClients();
    return { counter, owner, alice };
  }

  it("初期値は0であること", async function () {
    const { counter } = await deployCounter();
    assert.equal(await counter.read.count(), 0n);
  });

  it("オーナーがデプロイアカウントであること", async function () {
    const { counter, owner } = await deployCounter();
    const ownerAddress = await counter.read.owner();
    assert.equal(ownerAddress.toLowerCase(), owner.account.address.toLowerCase());
  });

  it("increment() でカウントが1増える", async function () {
    const { counter } = await deployCounter();
    await counter.write.increment();
    assert.equal(await counter.read.count(), 1n);
  });

  it("incrementBy(5) でカウントが5増える", async function () {
    const { counter } = await deployCounter();
    await counter.write.incrementBy([5n]);
    assert.equal(await counter.read.count(), 5n);
  });

  it("incrementBy(0) はリバートする", async function () {
    const { counter } = await deployCounter();
    await assert.rejects(
      () => counter.write.incrementBy([0n]),
      /Counter: amount must be greater than 0/,
    );
  });

  it("decrement() でカウントが1減る", async function () {
    const { counter } = await deployCounter();
    await counter.write.increment();
    await counter.write.decrement();
    assert.equal(await counter.read.count(), 0n);
  });

  it("カウントが0のときに decrement() するとリバートする", async function () {
    const { counter } = await deployCounter();
    await assert.rejects(() => counter.write.decrement(), /CounterUnderflow/);
  });

  it("オーナーが reset() でカウントを0にできる", async function () {
    const { counter } = await deployCounter();
    await counter.write.incrementBy([100n]);
    await counter.write.reset();
    assert.equal(await counter.read.count(), 0n);
  });

  it("非オーナーが reset() するとリバートする", async function () {
    const { counter, alice } = await deployCounter();
    await counter.write.increment();
    await assert.rejects(
      () =>
        counter.write.reset({
          account: alice.account,
        }),
      /OnlyOwner/,
    );
  });

  it("getCount() が正しいカウント値を返す", async function () {
    const { counter } = await deployCounter();
    await counter.write.incrementBy([42n]);
    assert.equal(await counter.read.getCount(), 42n);
  });

  it("複数回インクリメントが正しく累積される", async function () {
    const { counter } = await deployCounter();
    await counter.write.increment();
    await counter.write.increment();
    await counter.write.incrementBy([3n]);
    assert.equal(await counter.read.count(), 5n);
  });
});
