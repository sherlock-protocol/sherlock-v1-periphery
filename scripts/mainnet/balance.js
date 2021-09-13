require('dotenv').config();
const SHERLOCK = process.env.SHERLOCK || '';

const { parseEther, id } = require('ethers/lib/utils');
const { BigNumber } = require('ethers');
const { utils } = require('ethers/lib');

const { deploy } = require('@sherlock/v1-core/test/utilities');
const { network } = require('hardhat');

const MULTISIG = '0x666B8EbFbF4D5f0CE56962a25635CfF563F13161';
const USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';

const PRIMITIVE = id('primitive.protocol');
const TELLER = id('teller.protocol');
const EULER = id('euler.protocol');

function sleep(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

async function main() {
  [this.gov] = await ethers.getSigners();
  this.gov.address = await this.gov.getAddress();

  const b = await this.gov.getBalance();
  console.log(b.toString());
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
