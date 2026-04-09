import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * SimpleStorage コントラクトのデプロイモジュール
 *
 * 使用方法:
 *   ローカル: npx hardhat ignition deploy ignition/modules/SimpleStorage.ts
 *   Coston2:  npx hardhat ignition deploy ignition/modules/SimpleStorage.ts --network coston2
 */
const SimpleStorageModule = buildModule("SimpleStorageModule", (m) => {
  const initialText = m.getParameter("initialText", "Hello Flare Network!");
  const initialNumber = m.getParameter("initialNumber", 0n);

  const simpleStorage = m.contract("SimpleStorage", [initialText, initialNumber]);

  return { simpleStorage };
});

export default SimpleStorageModule;
