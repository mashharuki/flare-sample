import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * FdcPaymentHelloWorld コントラクトのデプロイモジュール
 *
 * expectedPaymentReference は ignition/parameters.json で渡す
 * （scripts/00-generate-reference.ts の出力をコピーすること）。
 *
 * 使用方法:
 *   Coston2: bun run deploy:coston2
 *            = npx hardhat ignition deploy ignition/modules/FdcPaymentHelloWorld.ts --network coston2 --parameters ignition/parameters.json
 */
const FdcPaymentHelloWorldModule = buildModule("FdcPaymentHelloWorldModule", (m) => {
  const expectedPaymentReference = m.getParameter<string>("expectedPaymentReference");

  const fdcPaymentHelloWorld = m.contract("FdcPaymentHelloWorld", [expectedPaymentReference]);

  return { fdcPaymentHelloWorld };
});

export default FdcPaymentHelloWorldModule;
