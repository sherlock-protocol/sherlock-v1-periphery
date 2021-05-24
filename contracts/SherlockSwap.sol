// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;

/******************************************************************************\
* Author: Evert Kors <dev@sherlock.xyz> (https://twitter.com/evert0x)
* Sherlock Protocol: https://sherlock.xyz
/******************************************************************************/

import 'hardhat/console.sol';

import '@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol';

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/SafeERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

import '@sherlock/v1-core/contracts/interfaces/ILock.sol';
import '@sherlock/v1-core/contracts/interfaces/ISherlock.sol';

import './interfaces/ISherlockSwap.sol';

contract SherlockSwap is ISherlockSwap {
  using SafeERC20 for IERC20;
  using SafeERC20 for ILock;

  IUniswapV2Router02 router = IUniswapV2Router02(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);

  struct withdrawal {
    address user;
    ILock token;
    uint256 tokenID;
    uint256 SherXID;
  }
  withdrawal[] public withdrawals;
  ISherlock public sherlock;
  ILock public lockSherX;

  constructor(ISherlock _sherlock, ILock _lockSherX) public {
    sherlock = _sherlock;
    lockSherX = _lockSherX;
  }

  function activateCooldown(uint256 _amount, ILock _token)
    external
    override
    returns (uint256 index)
  {
    // TODO bool for max stakewithdraw, and check before balance of lockSherX
    _token.safeTransferFrom(msg.sender, address(this), _amount);
    _token.approve(address(sherlock), _amount);

    uint256 id = sherlock.activateCooldown(_amount, _token.underlying());

    uint256 stakeFeeAmount = lockSherX.balanceOf(msg.sender);
    uint256 SherXID = uint256(-1);
    if (stakeFeeAmount > 0) {
      lockSherX.safeTransferFrom(msg.sender, address(this), stakeFeeAmount);
      lockSherX.approve(address(sherlock), stakeFeeAmount);
      SherXID = sherlock.activateCooldown(stakeFeeAmount, sherlock);
    }

    index = withdrawals.length;
    withdrawals.push(withdrawal(msg.sender, _token, id, SherXID));
    emit CooldownActivated(index, msg.sender, _token, id, SherXID);
  }

  function unstakeSwap(
    uint256 _id,
    uint256 _uniMinOut,
    address[] calldata _uniPath,
    uint256 _uniDeadline
  ) external override {
    withdrawal storage w = withdrawals[_id];
    require(w.user == msg.sender, 'ERR_SENDER');

    sherlock.unstake(w.tokenID, msg.sender, w.token.underlying());

    uint256 SherXAmount = 0;
    if (w.SherXID != uint256(-1)) {
      SherXAmount = sherlock.unstake(w.SherXID, address(this), sherlock);
    }
    if (SherXAmount > 0) {
      IERC20(address(sherlock)).approve(address(router), SherXAmount);
      router.swapExactTokensForTokens(SherXAmount, _uniMinOut, _uniPath, msg.sender, _uniDeadline);
    }
    delete withdrawals[_id];
  }
}

contract TestSherlockSwap is SherlockSwap {
  constructor(ISherlock _sherlock, ILock _lockSherX) public SherlockSwap(_sherlock, _lockSherX) {}

  function testSetRouter(address _router) external {
    uint256 id;
    assembly {
      id := chainid()
    }
    if (id != 1) {
      router = IUniswapV2Router02(_router);
    }
  }
}
