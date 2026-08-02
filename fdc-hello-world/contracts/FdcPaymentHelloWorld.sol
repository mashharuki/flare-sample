// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ContractRegistry} from "@flarenetwork/flare-periphery-contracts/coston2/ContractRegistry.sol";
import {IFdcVerification} from "@flarenetwork/flare-periphery-contracts/coston2/IFdcVerification.sol";
import {IPayment} from "@flarenetwork/flare-periphery-contracts/coston2/IPayment.sol";

/**
 * FDC Payment attestationの最小エンドツーエンド検証用コントラクト。
 *
 * 「FDCが何かを検証した」ではなく「この回で送ったその送金を検証した」ことを
 * オンチェーンで断言できるように、デプロイ時に固定したexpectedPaymentReferenceとの
 * 一致をrequireする。
 */
contract FdcPaymentHelloWorld {
  struct VerifiedPayment {
    uint64 blockNumber;
    uint64 blockTimestamp;
    bytes32 sourceAddressHash;
    bytes32 receivingAddressHash;
    int256 spentAmount;
    int256 receivedAmount;
    bytes32 standardPaymentReference;
    uint8 status;
  }

  /// @notice この回で証明する32バイトのpayment reference（デプロイ時に固定）
  bytes32 public immutable expectedPaymentReference;

  VerifiedPayment[] public verifiedPayments;
  mapping(bytes32 => bool) public referenceRegistered;

  event PaymentRegistered(
    bytes32 indexed standardPaymentReference,
    bytes32 sourceAddressHash,
    bytes32 receivingAddressHash,
    int256 spentAmount,
    int256 receivedAmount,
    uint8 status
  );

  error InvalidPaymentProof();
  error UnexpectedPaymentReference(bytes32 expected, bytes32 actual);
  error PaymentNotSuccessful(uint8 status);
  error ReferenceAlreadyRegistered(bytes32 paymentReference);

  constructor(bytes32 _expectedPaymentReference) {
    expectedPaymentReference = _expectedPaymentReference;
  }

  /**
   * FDCのMerkle proofを検証し、想定した支払いと一致することを確認した上で記録する。
   */
  function registerPayment(IPayment.Proof calldata _transaction) external {
    if (!ContractRegistry.getFdcVerification().verifyPayment(_transaction)) {
      revert InvalidPaymentProof();
    }

    bytes32 ref = _transaction.data.responseBody.standardPaymentReference;
    if (ref != expectedPaymentReference) {
      revert UnexpectedPaymentReference(expectedPaymentReference, ref);
    }
    if (referenceRegistered[ref]) {
      revert ReferenceAlreadyRegistered(ref);
    }
    if (_transaction.data.responseBody.status != 0) {
      revert PaymentNotSuccessful(_transaction.data.responseBody.status);
    }

    referenceRegistered[ref] = true;
    verifiedPayments.push(
      VerifiedPayment(
        _transaction.data.responseBody.blockNumber,
        _transaction.data.responseBody.blockTimestamp,
        _transaction.data.responseBody.sourceAddressHash,
        _transaction.data.responseBody.receivingAddressHash,
        _transaction.data.responseBody.spentAmount,
        _transaction.data.responseBody.receivedAmount,
        ref,
        _transaction.data.responseBody.status
      )
    );

    emit PaymentRegistered(
      ref,
      _transaction.data.responseBody.sourceAddressHash,
      _transaction.data.responseBody.receivingAddressHash,
      _transaction.data.responseBody.spentAmount,
      _transaction.data.responseBody.receivedAmount,
      _transaction.data.responseBody.status
    );
  }

  function verifiedPaymentsCount() external view returns (uint256) {
    return verifiedPayments.length;
  }
}
