// This script will deploy the actual contracts
require('dotenv').config();
const SHERLOCK = process.env.SHERLOCK || '';

const { id } = require('ethers/lib/utils');
const { BigNumber } = require('ethers');
const { utils } = require('ethers/lib');

const { deploy } = require('@sherlock/v1-core/test/utilities');

const MULTISIG = '0x666B8EbFbF4D5f0CE56962a25635CfF563F13161';
const USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
const aUSDC = '0xbcca60bb61934080951369a648fb03df4f96263c';

function sleep(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

async function main() {
  this.sl = await ethers.getContractAt('ISherlock', SHERLOCK);
  this.sl.c = this.sl.connect;

  [this.gov] = await ethers.getSigners();
  this.gov.address = await this.gov.getAddress();

  console.log('SHERLOCK\t', SHERLOCK);
  console.log('MULTISIG\t', MULTISIG);
  console.log('USDC\t\t', USDC);

  console.log('^ verify variables, continuing in 10 seconds');
  await sleep(10);

  const aaveV2 = await (await ethers.getContractFactory('AaveV2')).deploy(
    aUSDC,
    SHERLOCK,
    MULTISIG,
  );
  await aaveV2.deployed();

  await (await this.sl.c(this.gov).strategyUpdate(aaveV2.address, USDC)).wait();
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
