// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title SimpleStorage
 * @notice Flare Network チュートリアル用シンプルストレージコントラクト
 * @dev 文字列と数値の保存・取得ができるストレージコントラクト
 */
contract SimpleStorage {
  string private storedText;
  uint256 private storedNumber;
  address public owner;

  event TextUpdated(address indexed by, string newText);
  event NumberUpdated(address indexed by, uint256 newNumber);

  constructor(string memory initialText, uint256 initialNumber) {
    owner = msg.sender;
    storedText = initialText;
    storedNumber = initialNumber;
  }

  /// @notice テキストを保存する
  /// @param text 保存するテキスト
  function setText(string calldata text) external {
    storedText = text;
    emit TextUpdated(msg.sender, text);
  }

  /// @notice 数値を保存する
  /// @param number 保存する数値
  function setNumber(uint256 number) external {
    storedNumber = number;
    emit NumberUpdated(msg.sender, number);
  }

  /// @notice 保存されたテキストを取得する
  function getText() external view returns (string memory) {
    return storedText;
  }

  /// @notice 保存された数値を取得する
  function getNumber() external view returns (uint256) {
    return storedNumber;
  }

  /// @notice テキストと数値を同時に取得する
  function getAll() external view returns (string memory text, uint256 number) {
    return (storedText, storedNumber);
  }
}
