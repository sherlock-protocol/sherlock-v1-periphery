const { parseEther, parseUnits, id } = require('ethers/lib/utils');
const { constants } = require('ethers');
const { utils } = require('ethers/lib');
const hre = require('hardhat');

const { prepare, deploy, solution, blockNumber } = require('@sherlock/v1-core/test/utilities');

const tenBilly = '10000000000';

const BADGER = id('badger.protocol');
const ALCHEMIX = id('alchemix.protocol');
const SET = id('set.protocol');

async function main() {
  const sherlock = await ethers.getContractAt(
    'ISherlock',
    '0xE6f4e3af0d5d9BBC77d2e4b69c5F589d0Fc7b182',
  );
  [this.gov] = await ethers.getSigners();
  this.gov.address = await this.gov.getAddress();
  sherlock.c = sherlock.connect;
  // await sherlock['unstakeWindowExpiry(address,uint256,address)'](
  //   '0x34EDB6fD102578De64CaEbe82f540fB3E47a05EA',
  //   1,
  //   '0x0B6221B2AcD50173167e7840fB40EF7cBDFe31B3',
  // );
  //const weth = await ethers.getContractAt('IERC20', '0xf9c64dB8127Af8eF2025437C4E96b3963F011b3a');
  // await weth.approve(sherlock.address, parseEther(tenBilly));
  // await sherlock.depositProtocolBalance(
  //   ALCHEMIX,
  //   parseEther('100000000'),
  //   '0xf9c64dB8127Af8eF2025437C4E96b3963F011b3a',
  // );
  // const data =
  //   '0xa7d545db00000000000000000000000000000000000000000000000000000000000f4240000000000000000000000000d53a08c4702cb3da87fee937fd03a3b9d80945660000000000000000000000000b6221b2acd50173167e7840fb40ef7cbdfe31b3';
  // const x = await sherlock.interface.parseTransaction({data});
  // console.log(x);
  //await sherlock.c(this.gov).setUnstakeWindow(14400);
  // const x = await sherlock.getAccruedDebt(SET, '0x0B6221B2AcD50173167e7840fB40EF7cBDFe31B3');
  // console.log(x);
  await sherlock['setProtocolPremiumAndTokenPrice(bytes32,address[],uint256[],uint256[])'](
    SET,
    [
      '0xf9c64dB8127Af8eF2025437C4E96b3963F011b3a',
      '0x803de95dA111C1DD41c3626457A10c8cAd1F0013',
      '0x0B6221B2AcD50173167e7840fB40EF7cBDFe31B3',
    ],
    [parseUnits('0.0352113', 18), parseUnits('100', 18), parseUnits('100', 6)],
    [parseUnits('2840', 18), parseUnits('1', 18), parseUnits('1', 18 + 12)],
  );
  // await (await sherlock.c(this.gov).setWatsonsAddress(this.gov.address)).wait();
  // await (await sherlock.c(this.gov).setInitialWeight()).wait();
  // await (
  //   await sherlock
  //     .c(this.gov)
  //     .setWeights(
  //       [
  //         '0x0B6221B2AcD50173167e7840fB40EF7cBDFe31B3',
  //         '0xE6f4e3af0d5d9BBC77d2e4b69c5F589d0Fc7b182',
  //       ],
  //       [parseEther('0.5'), parseEther('0.5')],
  //       0,
  //     )
  // ).wait();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
