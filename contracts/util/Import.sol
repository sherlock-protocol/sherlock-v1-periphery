// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.7.4;

/******************************************************************************\
* Author: Evert Kors <dev@sherlock.xyz> (https://twitter.com/evert0x)
* Sherlock Protocol: https://sherlock.xyz
/******************************************************************************/

import '@sherlock/v1-core/contracts/util/Import.sol';
import '@sherlock/v1-core/contracts/util/ERC20Mock.sol';

import '@sherlock/v1-core/contracts/ForeignLock.sol';
import '@sherlock/v1-core/contracts/NativeLock.sol';

import '@sherlock/v1-core/contracts/facets/Gov.sol';
import '@sherlock/v1-core/contracts/facets/GovDev.sol';
import '@sherlock/v1-core/contracts/facets/Manager.sol';
import '@sherlock/v1-core/contracts/facets/Payout.sol';
import '@sherlock/v1-core/contracts/facets/PoolBase.sol';
import '@sherlock/v1-core/contracts/facets/PoolOpen.sol';
import '@sherlock/v1-core/contracts/facets/PoolDevOnly.sol';
import '@sherlock/v1-core/contracts/facets/SherX.sol';
import '@sherlock/v1-core/contracts/facets/SherXERC20.sol';
import '@sherlock/v1-core/contracts/facets/PoolStrategy.sol';
import '@sherlock/v1-core/contracts/strategies/AaveV2.sol';

// Get the compiler to pick up these facets
contract ImportsPeriphery {
  Imports public imports;
  ERC20Mock public erc20Mock;
  ForeignLock public foreignLock;
  NativeLock public nativeLock;
  Gov public gov;
  GovDev public govDev;
  Manager public manager;
  Payout public payout;
  PoolBase public poolBase;
  PoolOpen public poolOpen;
  PoolDevOnly public poolDevOnly;
  SherX public sherX;
  SherXERC20 public sherXERC20;
  PoolStrategy public poolStrategy;
  AaveV2 public aavev2;
}
