// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Counter} from "./Counter.sol";
import {Test} from "forge-std/Test.sol";

/**
 * @title CounterTest
 * @notice Solidityテスト（Foundry / forge-std 互換）
 */
contract CounterTest is Test {
  Counter counter;
  address owner = address(this);
  address alice = address(0xA11CE);

  function setUp() public {
    counter = new Counter();
  }

  function test_InitialCount() public view {
    assertEq(counter.count(), 0);
    assertEq(counter.owner(), owner);
  }

  function test_Increment() public {
    counter.increment();
    assertEq(counter.count(), 1);
  }

  function test_IncrementBy() public {
    counter.incrementBy(5);
    assertEq(counter.count(), 5);
  }

  function test_IncrementBy_Zero_Reverts() public {
    vm.expectRevert("Counter: amount must be greater than 0");
    counter.incrementBy(0);
  }

  function test_Decrement() public {
    counter.increment();
    counter.decrement();
    assertEq(counter.count(), 0);
  }

  function test_Decrement_Underflow_Reverts() public {
    vm.expectRevert(Counter.CounterUnderflow.selector);
    counter.decrement();
  }

  function test_Reset_OnlyOwner() public {
    counter.increment();
    counter.reset();
    assertEq(counter.count(), 0);
  }

  function test_Reset_NonOwner_Reverts() public {
    counter.increment();
    vm.prank(alice);
    vm.expectRevert(Counter.OnlyOwner.selector);
    counter.reset();
  }

  function test_GetCount() public {
    counter.incrementBy(42);
    assertEq(counter.getCount(), 42);
  }

  function testFuzz_IncrementBy(uint8 amount) public {
    vm.assume(amount > 0);
    counter.incrementBy(amount);
    assertEq(counter.count(), uint256(amount));
  }

  function test_EmitIncremented() public {
    vm.expectEmit(true, false, false, true);
    emit Counter.Incremented(owner, 1);
    counter.increment();
  }
}
