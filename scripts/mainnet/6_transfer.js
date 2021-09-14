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

let MULTISIG = '0x666B8EbFbF4D5f0CE56962a25635CfF563F13161';
let USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';

if (network.name == 'kovan') {
  MULTISIG = '0x4d6510201F066043b6C4Bb73f36c0252Cc2c8916';
  USDC = '0xe22da380ee6B445bb8273C81944ADEB6E8450422';
}

function sleep(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

async function main() {
  // TODO
  // Update pool to be open
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
