import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Counter コントラクトのデプロイモジュール
 *
 * 使用方法:
 *   ローカル: npx hardhat ignition deploy ignition/modules/Counter.ts
 *   Coston2:  npx hardhat ignition deploy ignition/modules/Counter.ts --network coston2
 */
const CounterModule = buildModule("CounterModule", (m) => {
  const counter = m.contract("Counter");
  return { counter };
});

export default CounterModule;
