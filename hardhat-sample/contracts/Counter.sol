// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title Counter
 * @notice Flare Network チュートリアル用シンプルカウンターコントラクト
 * @dev カウンターのインクリメント・デクリメント・リセット操作を提供する
 */
contract Counter {
  uint256 public count;
  address public owner;

  event Incremented(address indexed by, uint256 newCount);
  event Decremented(address indexed by, uint256 newCount);
  event Reset(address indexed by);

  error OnlyOwner();
  error CounterUnderflow();

  constructor() {
    owner = msg.sender;
    count = 0;
  }

  modifier onlyOwner() {
    if (msg.sender != owner) revert OnlyOwner();
    _;
  }

  /// @notice カウンターを1増やす
  function increment() external {
    count += 1;
    emit Incremented(msg.sender, count);
  }

  /// @notice カウンターを指定値増やす
  /// @param amount 増加量（0より大きい必要あり）
  function incrementBy(uint256 amount) external {
    require(amount > 0, "Counter: amount must be greater than 0");
    count += amount;
    emit Incremented(msg.sender, count);
  }

  /// @notice カウンターを1減らす（0未満にはならない）
  function decrement() external {
    if (count == 0) revert CounterUnderflow();
    count -= 1;
    emit Decremented(msg.sender, count);
  }

  /// @notice カウンターを0にリセット（オーナーのみ）
  function reset() external onlyOwner {
    count = 0;
    emit Reset(msg.sender);
  }

  /// @notice 現在のカウント値を取得
  function getCount() external view returns (uint256) {
    return count;
  }
}
