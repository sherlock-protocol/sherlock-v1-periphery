// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.6;

/******************************************************************************\
* Author: Evert Kors <dev@sherlock.xyz> (https://twitter.com/evert0x)
* Sherlock Protocol: https://sherlock.xyz
/******************************************************************************/

import 'hardhat/console.sol';

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/SafeERC20.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';

import '@sherlock/v1-core/contracts/interfaces/ISherlock.sol';

contract StakeCommitment {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  ISherlock public sherlock;
  IERC20 rewardToken;

  // Mapping from blocks --> token rewards (per 10**18 token)
  mapping(IERC20 => mapping(uint256 => uint256)) commitRewards;
  // Mapping from blocks --> amount of tokens left allocated to that reward
  mapping(IERC20 => mapping(uint256 => uint256)) commitRewardsLeft;

  struct commitEntry {
    address user;
    IERC20 token;
    uint256 unlockBlock;
    uint256 lockAmount;
    uint256 reward;
    uint256 unstakeEntry;
  }

  commitEntry[] public commits;

  constructor(ISherlock _sherlock, IERC20 _rewardToken) public {
    sherlock = _sherlock;
    rewardToken = _rewardToken;
  }

  // todo update rewards
  // todo update rewardsleft + transfer token

  function stake(
    uint256 _amount,
    IERC20 _token,
    uint256 _period
  ) external returns (uint256) {
    _token.safeTransferFrom(msg.sender, address(this), _amount);

    // e.g.
    // - staking 100 DAI (18 decimals)
    // having 10**18 / 2 commitRewards (0.5 rewardToken per 1 DAI)
    // - staking 100 USDC (6 decimals)
    // having 10**30 / 2 commitRewards (0.5 rewardToken per 1 USDC)
    uint256 reward = commitRewards[_token][_period].mul(_amount).div(10**18);
    uint256 rewardLeft = commitRewardsLeft[_token][_period];
    uint256 unlockBlock = block.number.add(_period);

    require(reward > 0, 'NO_REWARD');
    require(reward <= rewardLeft, 'NO_LEFT');

    commitRewardsLeft[_token][_period] = rewardLeft.sub(reward);

    // Stake into sherlock
    _token.approve(address(sherlock), _amount);
    uint256 lockAmount = sherlock.stake(_amount, address(this), _token);

    commits.push(commitEntry(msg.sender, _token, unlockBlock, lockAmount, reward, uint256(-1)));

    return commits.length - 1;
  }

  function activateCooldown(uint256 _entry) public {
    commitEntry storage entry = commits[_entry];

    require(entry.user == msg.sender, 'SENDER');
    require(entry.unlockBlock >= block.number, 'BLOCK');
    require(entry.unstakeEntry == uint256(-1), 'COOLDOWN');

    sherlock.getLockToken(entry.token).approve(address(sherlock), entry.lockAmount);
    entry.unstakeEntry = sherlock.activateCooldown(entry.lockAmount, entry.token);
  }

  function reactivateCooldown(uint256 _entry) external {
    commitEntry storage entry = commits[_entry];

    require(entry.user == msg.sender, 'SENDER');
    require(entry.unstakeEntry != uint256(-1), 'COOLDOWN');

    sherlock.unstakeWindowExpiry(address(this), entry.unstakeEntry, entry.token);
    entry.unstakeEntry = uint256(-1);

    activateCooldown(_entry);
  }

  function unstake(uint256 _entry) external {
    commitEntry storage entry = commits[_entry];

    require(entry.user == msg.sender, 'SENDER');
    require(entry.unstakeEntry != uint256(-1), 'COOLDOWN');

    sherlock.unstake(entry.unstakeEntry, msg.sender, entry.token);
    rewardToken.safeTransfer(msg.sender, entry.reward);

    delete commits[_entry];
  }
}
