const { parseEther, parseUnits, id } = require('ethers/lib/utils');
const { constants } = require('ethers');
const { utils } = require('ethers/lib');
const hre = require('hardhat');

const { prepare, deploy, solution, blockNumber } = require('@sherlock/v1-core/test/utilities');

async function main() {
  const faucet = await ethers.getContractAt(
    'IFaucet',
    '0x600103d518cc5e8f3319d532eb4e5c268d32e604',
  );

  [this.gov] = await ethers.getSigners();
  this.gov.address = await this.gov.getAddress();

  const one = parseUnits('1', 6);
  const amount = one.mul("59869078474609345000000000000");

  const USDT = '0x13512979ADE267AB5100878E2e0f485B568328a4';
  await (await faucet.mint(USDT, amount)).wait();
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
