const { parseEther, parseUnits, id } = require('ethers/lib/utils');
const { constants } = require('ethers');
const hre = require('hardhat');

const { prepare, deploy, solution, blockNumber } = require('@sherlock/v1-core/test/utilities');

const tenBilly = '10000000000';

const BADGER = id('badger.protocol');
const ALCHEMIX = id('alchemix.protocol');
const SET = id('set.protocol');

async function main() {
  await prepare(this, ['ERC20Mock', 'ERC20Mock6d', 'ERC20Mock8d', 'NativeLock', 'ForeignLock']);

  await solution(this, 'sl', this.gov);
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
    [
      'lockUSDC',
      this.ForeignLock,
      ['Sherlocked USDC', 'lockUSDC', this.sl.address, this.usdc.address],
    ],
    ['lockDAI', this.ForeignLock, ['Sherlocked DAI', 'lockDAI', this.sl.address, this.dai.address]],
    [
      'lockWETH',
      this.ForeignLock,
      ['Sherlocked WETH', 'lockWETH', this.sl.address, this.weth.address],
    ],
    [
      'lockWBTC',
      this.ForeignLock,
      ['Sherlocked WTBC', 'lockWBTC', this.sl.address, this.wbtc.address],
    ],
    [
      'lockBADGER',
      this.ForeignLock,
      ['Sherlocked BADGER', 'lockBADGER', this.sl.address, this.badger.address],
    ],
    [
      'lockALCX',
      this.ForeignLock,
      ['Sherlocked ALCX', 'lockALCX', this.sl.address, this.alcx.address],
    ],
    [
      'lockAAVE',
      this.ForeignLock,
      ['Sherlocked AAVE', 'lockAAVE', this.sl.address, this.aave.address],
    ],
    [
      'lockSUSHI',
      this.ForeignLock,
      ['Sherlocked SUSHI', 'lockSUSHI', this.sl.address, this.sushi.address],
    ],
    ['lockSHERX', this.NativeLock, ['Sherlocked SHERX', 'lockSHERX', this.sl.address]],
  ]);

  // adding staker tokens
  await this.sl
    .c(this.gov)
    .tokenAdd(this.usdc.address, this.lockUSDC.address, this.gov.address, true);

  await this.sl
    .c(this.gov)
    .tokenAdd(this.dai.address, this.lockDAI.address, this.gov.address, true);

  await this.sl
    .c(this.gov)
    .tokenAdd(this.weth.address, this.lockWETH.address, this.gov.address, true);

  await this.sl
    .c(this.gov)
    .tokenAdd(this.wbtc.address, this.lockWBTC.address, this.gov.address, true);

  await this.sl
    .c(this.gov)
    .tokenAdd(this.sl.address, this.lockSHERX.address, this.gov.address, true);

  // adding protocol tokens
  await this.sl
    .c(this.gov)
    .tokenAdd(this.badger.address, this.lockBADGER.address, this.gov.address, false);

  await this.sl
    .c(this.gov)
    .tokenAdd(this.alcx.address, this.lockALCX.address, this.gov.address, false);

  await this.sl
    .c(this.gov)
    .tokenAdd(this.aave.address, this.lockAAVE.address, this.gov.address, false);

  await this.sl
    .c(this.gov)
    .tokenAdd(this.sushi.address, this.lockSUSHI.address, this.gov.address, false);

  // setting unstake variables
  await this.sl.c(this.gov).setCooldown(10);
  await this.sl.c(this.gov).setUnstakeWindow(5);

  // Add protocols
  await this.sl
    .c(this.gov)
    .protocolAdd(BADGER, this.gov.address, this.gov.address, [
      this.wbtc.address,
      this.badger.address,
    ]);

  await this.sl
    .c(this.gov)
    .protocolAdd(ALCHEMIX, this.gov.address, this.gov.address, [
      this.alcx.address,
      this.weth.address,
    ]);

  await this.sl
    .c(this.gov)
    .protocolAdd(SET, this.gov.address, this.gov.address, [
      this.weth.address,
      this.usdc.address,
      this.dai.address,
    ]);

  // approvals
  await this.dai.approve(this.sl.address, constants.MaxUint256);
  await this.usdc.approve(this.sl.address, constants.MaxUint256);
  await this.weth.approve(this.sl.address, constants.MaxUint256);
  await this.wbtc.approve(this.sl.address, constants.MaxUint256);
  await this.badger.approve(this.sl.address, constants.MaxUint256);
  await this.alcx.approve(this.sl.address, constants.MaxUint256);

  // depositing balances
  await this.sl.depositProtocolBalance(BADGER, parseUnits('1000', 8), this.wbtc.address);
  await this.sl.depositProtocolBalance(BADGER, parseUnits('1000', 18), this.badger.address);
  await this.sl.depositProtocolBalance(ALCHEMIX, parseUnits('1000', 18), this.alcx.address);
  await this.sl.depositProtocolBalance(ALCHEMIX, parseUnits('1000', 18), this.weth.address);
  await this.sl.depositProtocolBalance(SET, parseUnits('1000', 18), this.weth.address);
  await this.sl.depositProtocolBalance(SET, parseUnits('1000', 6), this.usdc.address);
  await this.sl.depositProtocolBalance(SET, parseUnits('1000', 18), this.dai.address);

  // revoke some approvals
  await this.dai.approve(this.sl.address, 0);
  await this.wbtc.approve(this.sl.address, 0);

  // setting initial fee token price
  await this.sl
    .c(this.gov)
    ['setProtocolPremiumAndTokenPrice(bytes32,address[],uint256[],uint256[])'](
      SET,
      [this.usdc.address],
      [parseUnits('1', 6)],
      [parseUnits('1', 18)],
    );
  //  setting premium
  await this.sl
    .c(this.gov)
    ['setProtocolPremiumAndTokenPrice(bytes32,address[],uint256[],uint256[])'](
      BADGER,
      [this.wbtc.address, this.badger.address],
      [parseUnits('0.', 8), parseUnits('0', 18)],
      [parseUnits('50000', 18), parseUnits('35', 18)],
    );

  await this.sl
    .c(this.gov)
    ['setProtocolPremiumAndTokenPrice(bytes32,address[],uint256[],uint256[])'](
      ALCHEMIX,
      [this.alcx.address, this.weth.address],
      [parseUnits('0', 18), parseUnits('0', 18)],
      [parseUnits('1600', 18), parseUnits('4000', 18)],
    );

  await this.sl
    .c(this.gov)
    ['setProtocolPremiumAndTokenPrice(bytes32,address[],uint256[],uint256[])'](
      SET,
      [this.weth.address, this.usdc.address, this.dai.address],
      [parseUnits('0', 18), parseUnits('10', 6), parseUnits('0', 18)],
      [parseUnits('4000', 18), parseUnits('1', 18), parseUnits('1', 18)],
    );

  await this.sl.c(this.gov).setInitialWeight(this.usdc.address);
  // await this.sl
  //   .c(this.gov)
  //   .setWeights(
  //     [this.usdc.address, this.dai.address, this.weth.address, this.wbtc.address, this.sl.address],
  //     [parseEther('0.33'), parseEther('0.67'), parseEther('0'), parseEther('0'), parseEther('0')],
  //   );
  await this.lockUSDC.approve(this.sl.address, constants.MaxUint256);
  await this.sl.stake(parseUnits('100', 6), this.alice.address, this.usdc.address);
  await this.sl.activateCooldown(parseEther('1'), this.usdc.address);
  for (i = 0; i < 10; i++) {
    await network.provider.send('evm_mine', []);
  }
  await this.sl.unstake(0, this.alice.address, this.usdc.address);

  const b = await blockNumber(
    this.sl.stake(parseUnits('100', 6), this.alice.address, this.usdc.address),
  );
  const x = await ethers.provider.getBlock(parseInt(b.toString()));
  console.log('Second times 1000 difference:', x.timestamp * 1000 - +new Date());

  await network.provider.send('evm_setAutomine', [false]);
  await network.provider.send('evm_setIntervalMining', [13325]);

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
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });