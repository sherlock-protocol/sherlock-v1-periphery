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
let LIBPOOL = '0x7bc06c482DEAd17c0e297aFbC32f6e63d3846650';

if (network.name == 'kovan') {
  MULTISIG = '0x34EDB6fD102578De64CaEbe82f540fB3E47a05EA';
  USDC = '0xe22da380ee6B445bb8273C81944ADEB6E8450422';
  LIBPOOL = '0xe1215b2Dc94F487818d65FD7A4F8B9558602f0E0';
}

async function getDiamondCut(facets, action = FacetCutAction.Add) {
  diamondCut = [];
  for (let i = 0; i < facets.length; i++) {
    const f = await facets[i].deploy();
    await f.deployed();
    console.log(i, f.address);
    diamondCut.push({
      action,
      facetAddress: f.address,
      functionSelectors: getSelectors(f),
    });
  }
  return diamondCut;
}

function getSelectors(contract) {
  const signatures = [];
  for (const key of Object.keys(contract.functions)) {
    signatures.push(utils.keccak256(utils.toUtf8Bytes(key)).substr(0, 10));
  }
  return signatures;
}

function sleep(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

async function main() {
  this.sl = await ethers.getContractAt('ISherlock', SHERLOCK);
  this.sl.c = this.sl.connect;

  [this.gov] = await ethers.getSigners();
  this.gov.address = await this.gov.getAddress();

  facets = [
    await ethers.getContractFactory('PoolOpen', {
      libraries: { LibPool: LIBPOOL },
    }),
  ];
  const diamondCut = await getDiamondCut(facets, (action = FacetCutAction.Replace));
  await (await this.sl.c(this.gov).updateSolution(diamondCut, constants.AddressZero, '0x')).wait();

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
