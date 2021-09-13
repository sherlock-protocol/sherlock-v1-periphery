const { parseEther, parseUnits, id } = require('ethers/lib/utils');
const { constants } = require('ethers');
const { utils } = require('ethers/lib');
const hre = require('hardhat');

const { prepare, deploy, solution, blockNumber } = require('@sherlock/v1-core/test/utilities');

const tenBilly = '10000000000';

const BADGER = id('badger.protocol');
const ALCHEMIX = id('alchemix.protocol');
const SET = id('set.protocol');

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
  this.ERC20Mock = await ethers.getContractFactory('ERC20Mock');
  this.ERC20Mock6d = await ethers.getContractFactory('ERC20Mock6d');
  this.ERC20Mock8d = await ethers.getContractFactory('ERC20Mock8d');
  this.NativeLock = await ethers.getContractFactory('NativeLock');
  this.ForeignLock = await ethers.getContractFactory('ForeignLock');

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

  [this.gov] = await ethers.getSigners();
  this.gov.address = await this.gov.getAddress();

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
  ];

  facets.push(
    await ethers.getContractFactory('PoolOpen', {
      libraries: { LibPool: libPool.address },
    }),
  );

  diamondCut = await getDiamondCut(facets);
  Diamond = await ethers.getContractFactory('Diamond');

  const diamond = await Diamond.deploy(diamondCut, [gov.address]);
  await diamond.deployed();
  this.sl = await ethers.getContractAt('ISherlock', diamond.address);
  this.sl.c = this.sl.connect;

  const sherlock = await ethers.getContractAt('ISherlock', diamond.address);
  sherlock.c = sherlock.connect;
  await (await sherlock.c(gov).setInitialGovMain(gov.address)).wait();
  await (await sherlock.c(gov).setInitialGovPayout(gov.address)).wait();
  await (await sherlock.c(gov).initializeSherXERC20('SHERX Token', 'SHERX')).wait();
  await deploy(this, [
    ['usdc', this.ERC20Mock6d, ['USD Coin', 'USDC', parseUnits(tenBilly, 6)]],
    ['dai', this.ERC20Mock, ['Dai Stablecoin', 'DAI', parseUnits(tenBilly, 18)]],
    ['weth', this.ERC20Mock, ['Wrapped Ether', 'WETH', parseUnits(tenBilly, 18)]],
    ['wbtc', this.ERC20Mock8d, ['Wrapped BTC', 'WBTC', parseUnits(tenBilly, 8)]],
    ['badger', this.ERC20Mock, ['Badger Token', 'BADGER', parseUnits(tenBilly, 18)]],
    ['alcx', this.ERC20Mock, ['Alchemix', 'ALCX', parseUnits(tenBilly, 18)]],
    ['aave', this.ERC20Mock, ['Aave Token', 'AAVE', parseUnits(tenBilly, 18)]],
    ['sushi', this.ERC20Mock, ['SushiToken', 'SUSHI', parseUnits(tenBilly, 18)]],
  ]);
  await deploy(this, [
    ['lockUSDC', this.ForeignLock, ['Locked USDC', 'lockUSDC', this.sl.address, this.usdc.address]],
    ['lockDAI', this.ForeignLock, ['Locked DAI', 'lockDAI', this.sl.address, this.dai.address]],
    ['lockWETH', this.ForeignLock, ['Locked WETH', 'lockWETH', this.sl.address, this.weth.address]],
    ['lockWBTC', this.ForeignLock, ['Locked WTBC', 'lockWBTC', this.sl.address, this.wbtc.address]],
    [
      'lockBADGER',
      this.ForeignLock,
      ['Locked BADGER', 'lockBADGER', this.sl.address, this.badger.address],
    ],
    ['lockALCX', this.ForeignLock, ['Locked ALCX', 'lockALCX', this.sl.address, this.alcx.address]],
    ['lockAAVE', this.ForeignLock, ['Locked AAVE', 'lockAAVE', this.sl.address, this.aave.address]],
    [
      'lockSUSHI',
      this.ForeignLock,
      ['Locked SUSHI', 'lockSUSHI', this.sl.address, this.sushi.address],
    ],
    ['lockSHERX', this.NativeLock, ['Locked SHERX', 'lockSHERX', this.sl.address]],
  ]);

  // adding staker tokens
  await (
    await this.sl
      .c(this.gov)
      .tokenInit(this.usdc.address, this.gov.address, this.lockUSDC.address, true)
  ).wait();

  await (
    await this.sl
      .c(this.gov)
      .tokenInit(this.dai.address, this.gov.address, this.lockDAI.address, true)
  ).wait();

  await (
    await this.sl
      .c(this.gov)
      .tokenInit(this.weth.address, this.gov.address, this.lockWETH.address, true)
  ).wait();

  await (
    await this.sl
      .c(this.gov)
      .tokenInit(this.wbtc.address, this.gov.address, this.lockWBTC.address, true)
  ).wait();

  await (
    await this.sl
      .c(this.gov)
      .tokenInit(this.sl.address, this.gov.address, this.lockSHERX.address, false)
  ).wait();

  // adding protocol tokens
  await (
    await this.sl
      .c(this.gov)
      .tokenInit(this.badger.address, this.gov.address, constants.AddressZero, true)
  ).wait();

  await (
    await this.sl
      .c(this.gov)
      .tokenInit(this.alcx.address, this.gov.address, constants.AddressZero, true)
  ).wait();

  await (
    await this.sl
      .c(this.gov)
      .tokenInit(this.aave.address, this.gov.address, constants.AddressZero, true)
  ).wait();

  await (
    await this.sl
      .c(this.gov)
      .tokenInit(this.sushi.address, this.gov.address, constants.AddressZero, true)
  ).wait();

  // setting unstake variables
  await (await this.sl.c(this.gov).setCooldown(10)).wait();
  await (await this.sl.c(this.gov).setUnstakeWindow(5)).wait();

  // Add protocols
  await (
    await this.sl
      .c(this.gov)
      .protocolAdd(BADGER, this.gov.address, this.gov.address, [
        this.wbtc.address,
        this.badger.address,
      ])
  ).wait();

  await (
    await this.sl
      .c(this.gov)
      .protocolAdd(ALCHEMIX, this.gov.address, this.gov.address, [
        this.alcx.address,
        this.weth.address,
      ])
  ).wait();

  await (
    await this.sl
      .c(this.gov)
      .protocolAdd(SET, this.gov.address, this.gov.address, [
        this.weth.address,
        this.usdc.address,
        this.dai.address,
      ])
  ).wait();

  console.log('--protocols--');
  console.log('BADGER', BADGER);
  console.log('ALCHEMIX', ALCHEMIX);
  console.log('SET', SET);
  console.log('--address--');
  console.log('sherlock', this.sl.address);
  console.log('usdc', this.usdc.address, this.lockUSDC.address);
  console.log('dai', this.dai.address, this.lockDAI.address);
  console.log('weth', this.weth.address, this.lockWETH.address);
  console.log('wbtc', this.wbtc.address, this.lockWBTC.address);
  console.log('sherx', this.sl.address, this.lockSHERX.address);
  console.log('badger', this.badger.address, this.lockBADGER.address);
  console.log('alcx', this.alcx.address, this.lockALCX.address);
  console.log('aave', this.aave.address, this.lockAAVE.address);
  console.log('sushi', this.sushi.address, this.lockSUSHI.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
