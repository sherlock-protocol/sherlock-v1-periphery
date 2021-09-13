// update facet to be open
// transfer gov thing to multisig
// govpool
// govmain
// owner

// transfer all to multisig, in case it sucks, we can always change it to other addresses
require('dotenv').config();
const SHERLOCK = process.env.SHERLOCK || '';

const { parseUnits, id } = require('ethers/lib/utils');
const { BigNumber, constants } = require('ethers');
const { utils } = require('ethers/lib');

const { deploy } = require('@sherlock/v1-core/test/utilities');
const { network } = require('hardhat');

const MULTISIG = '0x666B8EbFbF4D5f0CE56962a25635CfF563F13161';
const USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';

function sleep(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

async function main() {
  this.sl = await ethers.getContractAt('ISherlock', SHERLOCK);
  this.sl.c = this.sl.connect;

  [this.gov] = await ethers.getSigners();
  this.gov.address = await this.gov.getAddress();

  await (await this.sl.c(this.gov).transferGovDev(MULTISIG)).wait();
  await (await this.sl.c(this.gov).tokenInit(USDC, MULTISIG, constants.AddressZero, false)).wait();
  await (await this.sl.c(this.gov).transferGovMain(MULTISIG)).wait();
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
