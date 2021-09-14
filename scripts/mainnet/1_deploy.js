// This script will deploy the actual contracts

const { BigNumber } = require('ethers');
const { utils } = require('ethers/lib');

const { deploy } = require('@sherlock/v1-core/test/utilities');

let MULTISIG = '0x666B8EbFbF4D5f0CE56962a25635CfF563F13161';
let USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
const COOLDOWN_BLOCKS = 46523; // ~7 days of blocks
const UNSTAKE_BLOCKS = 19938; // ~3 days of blocks

if (network.name == 'kovan') {
  MULTISIG = '0x4d6510201F066043b6C4Bb73f36c0252Cc2c8916';
  USDC = '0xe22da380ee6B445bb8273C81944ADEB6E8450422';
}

function sleep(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

function Uint16Fragment(fragment) {
  const f = BigNumber.from(fragment * 10000);
  return BigNumber.from(2 ** 16 - 1)
    .mul(f)
    .div(10000);
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

async function main() {
  this.NativeLock = await ethers.getContractFactory('NativeLock');
  this.ForeignLock = await ethers.getContractFactory('ForeignLock');

  [this.gov] = await ethers.getSigners();
  this.gov.address = await this.gov.getAddress();

  console.log('MULTISIG\t', MULTISIG);
  console.log('USDC\t\t', USDC);
  console.log('COOLDOWN_BLOCKS\t', COOLDOWN_BLOCKS);
  console.log('UNSTAKE_BLOCKS\t', UNSTAKE_BLOCKS);
  console.log('^ verify variables, continuing in 10 seconds');
  await sleep(10);

  //
  // Deploy libraries
  //
  console.log('-- 1 --');
  libPool = await (await ethers.getContractFactory('LibPool')).deploy();
  await libPool.deployed();

  libSherX = await (
    await ethers.getContractFactory('LibSherX', {
      libraries: {
        LibPool: libPool.address,
      },
    })
  ).deploy();
  await libSherX.deployed();
  console.log('libPool', libPool.address);
  console.log('libSherX', libSherX.address);

  // Prepare facets with DevOnly staking
  console.log('-- 2 --');
  facets = [
    await ethers.getContractFactory('Gov'),
    await ethers.getContractFactory('GovDev'),
    await ethers.getContractFactory('Manager', {
      libraries: {
        LibPool: libPool.address,
        LibSherX: libSherX.address,
      },
    }),
    await ethers.getContractFactory('Payout', {
      libraries: {
        LibPool: libPool.address,
        LibSherX: libSherX.address,
      },
    }),
    await ethers.getContractFactory('PoolBase', {
      libraries: { LibPool: libPool.address },
    }),
    await ethers.getContractFactory('SherX', {
      libraries: {
        LibPool: libPool.address,
        LibSherX: libSherX.address,
      },
    }),
    await ethers.getContractFactory('SherXERC20'),
    await ethers.getContractFactory('PoolStrategy'),
    await ethers.getContractFactory('PoolDevOnly', {
      libraries: { LibPool: libPool.address },
    }),
  ];

  // Deploy facets and produce diamond information
  diamondCut = await getDiamondCut(facets);
  Diamond = await ethers.getContractFactory('Diamond');

  // Deploy actual diamond with the produced facets
  console.log('-- 3 --');
  const diamond = await Diamond.deploy(diamondCut, [this.gov.address]);
  await diamond.deployed();
  this.sl = await ethers.getContractAt('ISherlock', diamond.address);
  this.sl.c = this.sl.connect;

  const sherlock = await ethers.getContractAt('ISherlock', diamond.address);
  sherlock.c = sherlock.connect;
  console.log('SHERLOCK', sherlock.address);
  // Initial address will be EOA, will be multisig at a later time.
  console.log('-- 4 --');
  await (await sherlock.c(gov).setInitialGovMain(this.gov.address)).wait();
  await (await sherlock.c(gov).setInitialGovPayout(MULTISIG)).wait();
  // SherX will be initially only USDC
  console.log('-- 5 --');
  await (await sherlock.c(gov).setMaxTokensSherX(1)).wait();
  // Users are allowed to stake in USDC and SHERX
  await (await sherlock.c(gov).setMaxTokensStaker(2)).wait();
  await (await sherlock.c(gov).setMaxProtocolPool(4)).wait();
  console.log('-- 6 --');
  await (await sherlock.c(gov).initializeSherXERC20('SHERX Token', 'SHERX')).wait();

  // setting unstake variables
  console.log('-- 7 --');
  await (await this.sl.c(this.gov).setCooldown(COOLDOWN_BLOCKS)).wait();
  await (await this.sl.c(this.gov).setUnstakeWindow(UNSTAKE_BLOCKS)).wait();

  // Deploying lock tokens
  console.log('-- 8 --');
  await deploy(this, [
    ['lockUSDC', this.ForeignLock, ['Locked USDC', 'lockUSDC', this.sl.address, USDC]],
    ['lockSHERX', this.NativeLock, ['Locked SHERX', 'lockSHERX', this.sl.address]],
  ]);

  // Init tokens
  console.log('-- 9 --');
  await (
    await this.sl.c(this.gov).tokenInit(USDC, this.gov.address, this.lockUSDC.address, true)
  ).wait();

  await (
    await this.sl.c(this.gov).tokenInit(this.sl.address, MULTISIG, this.lockSHERX.address, false)
  ).wait();

  // Init watsons
  console.log('-- 10 --');
  await (await this.sl.c(this.gov).setWatsonsAddress(MULTISIG)).wait();
  await (await this.sl.c(this.gov).setInitialWeight()).wait();
  await (
    await this.sl.c(this.gov).setWeights([USDC], [Uint16Fragment(0.8)], Uint16Fragment(0.2))
  ).wait();
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
