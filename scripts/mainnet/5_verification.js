require('dotenv').config();
const SHERLOCK = process.env.SHERLOCK || '';

const { parseUnits, id } = require('ethers/lib/utils');
const { BigNumber } = require('ethers');
const { utils } = require('ethers/lib');

const { deploy } = require('@sherlock/v1-core/test/utilities');
const { network } = require('hardhat');

let USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';

if (network.name == 'kovan') {
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
  this.aave = await ethers.getContractAt('AaveV2', '0xeecee260a402fe3c20e5b8301382005124bef121');
  this.sl.c = this.sl.connect;

  //[this.gov] = await ethers.getSigners();
  //this.gov.address = await this.gov.getAddress();

  console.log('~ LockUSDC rates ~');
  console.log('ttl', (await this.sl.TokenToLock(parseUnits('1', 6), USDC)).toString());
  console.log('ltt', (await this.sl.LockToToken(parseUnits('1', 18), USDC)).toString());

  console.log('~ SHERX tokens ~');
  const data = await this.sl['calcUnderlying(uint256)'](parseUnits('1', 18));
  console.log('token', data.tokens[0].toString());
  console.log('amount', data.amounts[0].toString());

  console.log('~ SHERX weight ~');
  console.log('watsons', await this.sl.getWatsonsSherXWeight());
  console.log('usdc', await this.sl.getSherXWeight(USDC));

  console.log('~ Gov ~');
  console.log('govDev\t\t\t\t', await this.sl.getGovDev());
  console.log('govMain\t\t\t\t', await this.sl.getGovMain());
  console.log('govPayout\t\t\t', await this.sl.getGovPayout());
  console.log('getGovPool(usdc)\t\t', await this.sl.getGovPool(USDC));
  console.log('getProtocolManager(primitive)\t', await this.sl.getProtocolManager(PRIMITIVE));
  console.log('getProtocolManager(teller)\t', await this.sl.getProtocolManager(TELLER));
  console.log('getProtocolManager(euler)\t', await this.sl.getProtocolManager(EULER));
  console.log('getProtocolAgent(primitive)\t', await this.sl.getProtocolAgent(PRIMITIVE));
  console.log('getProtocolAgent(teller)\t', await this.sl.getProtocolAgent(TELLER));
  console.log('getProtocolAgent(euler)\t\t', await this.sl.getProtocolAgent(EULER));

  console.log('~ USDC protocols ~');
  const protocols = await this.sl['getProtocols(address)'](USDC);
  console.log('1', protocols[0], PRIMITIVE == protocols[0]);
  console.log('2', protocols[1], TELLER == protocols[1]);
  console.log('3', protocols[2], EULER == protocols[2]);

  console.log('~ LIMITS ~');
  console.log('getMaxTokensSherX', await this.sl.getMaxTokensSherX());
  console.log('getMaxTokensStaker', await this.sl.getMaxTokensStaker());
  console.log('getMaxProtocolPool', await this.sl.getMaxProtocolPool());

  console.log('~ Aave strategy ~');
  console.log('aaveLmReceiver', await this.aave.aaveLmReceiver());


  console.log('getUnstakeWindow', await this.sl.getUnstakeWindow());
  console.log('getCooldown', await this.sl.getCooldown());
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
