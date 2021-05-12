// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.7.4;

import '@sherlock/v1-core/contracts/interfaces/ILock.sol';

interface ISherlockSwap {
  event CooldownActivated(
    uint256 index,
    address indexed user,
    ILock indexed lock,
    uint256 withdrawID,
    uint256 sherXWithdrawID
  );

  function activateCooldown(uint256 _amount, ILock _token) external returns (uint256 index);

  function unstakeSwap(
    uint256 _id,
    uint256 _uniMinOut,
    address[] calldata _uniPath,
    uint256 _uniDeadline
  ) external;
}
