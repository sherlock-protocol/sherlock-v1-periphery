// This script will deploy the actual contracts
require('dotenv').config();
const SHERLOCK = process.env.SHERLOCK || '';

const { id } = require('ethers/lib/utils');
const { BigNumber } = require('ethers');
const { utils } = require('ethers/lib');

const { deploy } = require('@sherlock/v1-core/test/utilities');

let MULTISIG = '0x666B8EbFbF4D5f0CE56962a25635CfF563F13161';
let USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';

if (network.name == 'kovan') {
  MULTISIG = '0x4d6510201F066043b6C4Bb73f36c0252Cc2c8916';
  USDC = '0xe22da380ee6B445bb8273C81944ADEB6E8450422';
}

const PRIMITIVE = id('primitive.protocol');
const TELLER = id('teller.protocol');
const EULER = id('euler.protocol');

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
  console.log('PRIMITIVE\t', PRIMITIVE);
  console.log('TELLER\t\t', TELLER);
  console.log('EULER\t\t', EULER);

  console.log('^ verify variables, continuing in 10 seconds');
  await sleep(10);

  // Add protocols
  await (await this.sl.c(this.gov).protocolAdd(PRIMITIVE, MULTISIG, MULTISIG, [USDC])).wait();
  await (await this.sl.c(this.gov).protocolAdd(TELLER, MULTISIG, MULTISIG, [USDC])).wait();
  await (await this.sl.c(this.gov).protocolAdd(EULER, MULTISIG, MULTISIG, [USDC])).wait();
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
