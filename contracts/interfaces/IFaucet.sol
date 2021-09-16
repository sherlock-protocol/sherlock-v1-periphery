// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.7.4;

interface IFaucet {

    function mint(address receiver, uint256 amount) external;
}
