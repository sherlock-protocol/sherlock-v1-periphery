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

let USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';

if (network.name == 'kovan') {
  USDC = '0xe22da380ee6B445bb8273C81944ADEB6E8450422';
}

async function main() {
  this.sl = await ethers.getContractAt('ISherlock', SHERLOCK);
  this.sl.c = this.sl.connect;

  [this.gov] = await ethers.getSigners();
  this.gov.address = await this.gov.getAddress();

  console.log(await this.sl.c(this.gov).getLockToken(USDC));
  console.log(await this.sl.c(this.gov).getLockToken(SHERLOCK));
  //await (await this.sl.c(this.gov).strategyDeposit(parseUnits('2500000', 6), USDC)).wait();
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
