// make sure 1 lockUsdc = 1 usdc
// make sure 1 sherx = 1 usdc// This script will deploy the actual contracts
require('dotenv').config();
const SHERLOCK = process.env.SHERLOCK || '';

const { parseUnits, id } = require('ethers/lib/utils');
const { BigNumber } = require('ethers');
const { utils } = require('ethers/lib');

const { deploy } = require('@sherlock/v1-core/test/utilities');
const { network } = require('hardhat');

let MULTISIG = '0x666B8EbFbF4D5f0CE56962a25635CfF563F13161';
let USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';

if (network.name == 'kovan') {
  MULTISIG = '0x4d6510201F066043b6C4Bb73f36c0252Cc2c8916';
  USDC = '0xe22da380ee6B445bb8273C81944ADEB6E8450422';
}

const TELLER = id('teller.protocol');

function sleep(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

async function main() {
  this.sl = await ethers.getContractAt('ISherlock', SHERLOCK);
  this.sl.c = this.sl.connect;

  [this.gov] = await ethers.getSigners();
  this.gov.address = await this.gov.getAddress();
  this.usdc = await ethers.getContractAt('IERC20', USDC);

  if (network.name == 'localhost') {
    this.mintUSDC = async () => {
      const usdcWhaleAddress = '0xbe0eb53f46cd790cd13851d5eff43d12404d33e8';
      await network.provider.request({
        method: 'hardhat_impersonateAccount',
        params: [usdcWhaleAddress],
      });
      const usdcWhale = await ethers.provider.getSigner(usdcWhaleAddress);
      this.usdcAmount = parseUnits('10000', 6);
      this.usdc.connect(usdcWhale).transfer(this.gov.address, this.usdcAmount);
    };
    await this.mintUSDC();
  }

  console.log('SHERLOCK\t', SHERLOCK);
  console.log('MULTISIG\t', MULTISIG);
  console.log('USDC\t\t', USDC);

  console.log('^ verify variables, continuing in 10 seconds');
  await sleep(10);

  // Deposit initial balance for Teller
  const amount = parseUnits('100', 6);

  await (await this.usdc.approve(SHERLOCK, amount.mul(2))).wait();
  await (await this.sl.c(this.gov).depositProtocolBalance(TELLER, amount, USDC)).wait();

  // Set initital premium to 1 USDC per block
  await (
    await this.sl
      .c(this.gov)
      ['setProtocolPremiumAndTokenPrice(bytes32,address,uint256,uint256)'](
        TELLER,
        USDC,
        parseUnits('1', 6),
        parseUnits('1', 30),
      )
  ).wait();

  // Reset premium to 0 USDC per block
  await (
    await this.sl
      .c(this.gov)
      ['setProtocolPremium(bytes32,address,uint256)'](TELLER, USDC, parseUnits('0', 6))
  ).wait();

  // Stake 1 USDC
  await (await this.sl.c(this.gov).stake(parseUnits('1', 6), MULTISIG, USDC)).wait();
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
