const { expect } = require('chai');
const { parseEther, parseUnits } = require('ethers/lib/utils');

const { prepare, deploy, solution, blockNumber } = require('@sherlock/v1-core/test/utilities');
const { constants } = require('ethers');
const { TimeTraveler } = require('@sherlock/v1-core/test/utilities/snapshot');

describe('Gov', function () {
  before(async function () {
    timeTraveler = new TimeTraveler(network.provider);

    await prepare(this, ['ERC20Mock', 'NativeLock', 'ForeignLock', 'TestSherlockSwap', 'MockUNI']);

    await solution(this, 'sl', this.gov);
    await deploy(this, [
      ['tokenA', this.ERC20Mock, ['TokenA', 'A', parseEther('10010')]],
      ['tokenB', this.ERC20Mock, ['TokenB', 'B', parseEther('0')]],
      ['tokenC', this.ERC20Mock, ['TokenC', 'C', parseEther('0')]],
    ]);
    await deploy(this, [
      ['lockA', this.ForeignLock, ['Lock TokenA', 'lockA', this.sl.address, this.tokenA.address]],
      ['lockB', this.ForeignLock, ['Lock TokenB', 'lockB', this.sl.address, this.tokenB.address]],
      ['lockC', this.ForeignLock, ['Lock TokenC', 'lockC', this.sl.address, this.tokenC.address]],
      ['lockSHERX', this.NativeLock, ['Lock SHERX', 'lockSHERX', this.sl.address]],
    ]);

    await deploy(this, [
      ['mockUNI', this.MockUNI, []],
      ['sherlockSwap', this.TestSherlockSwap, [this.sl.address, this.lockSHERX.address]],
    ]);
    await this.tokenA.transfer(this.mockUNI.address, parseEther('10000'));
    await this.sherlockSwap.testSetRouter(this.mockUNI.address);

    // add tokens
    await this.sl
      .c(this.gov)
      .tokenAdd(this.tokenA.address, this.lockA.address, this.gov.address, true);

    await this.sl
      .c(this.gov)
      .tokenAdd(this.sl.address, this.lockSHERX.address, this.gov.address, true);

    // add premiums to mint sherx
    await this.sl
      .c(this.gov)
      .protocolAdd(this.protocolX, this.alice.address, this.bob.address, [this.tokenA.address]);

    await this.sl
      .c(this.gov)
      ['setProtocolPremiumAndTokenPrice(bytes32,address[],uint256[],uint256[])'](
        this.protocolX,
        [this.tokenA.address],
        [parseEther('1')],
        [parseEther('1')],
      );

    // set premium
    await this.sl.c(this.gov).setInitialWeight(this.tokenA.address);
    await this.sl.c(this.gov).setUnstakeWindow(2);
    await timeTraveler.snapshot();
  });
  describe('SherlockSwap', function () {
    before(async function () {
      await timeTraveler.revertSnapshot();
    });
    it('stake()', async function () {
      await this.tokenA.approve(this.sl.address, parseEther('10000'));
      await this.sl.stake(parseEther('10'), this.alice.address, this.tokenA.address);

      await expect(await this.tokenA.balanceOf(this.alice.address)).to.eq(0);
      await expect(await this.lockA.balanceOf(this.alice.address)).to.eq(parseEther('1'));
    });
    it('activateCooldown()', async function () {
      await this.lockA.approve(this.sherlockSwap.address, parseEther('10000'));
      await this.lockSHERX.approve(this.sherlockSwap.address, parseEther('10000'));
      await this.sherlockSwap.activateCooldown(parseEther('1'), this.lockA.address);

      await expect(await this.tokenA.balanceOf(this.alice.address)).to.eq(0);
      await expect(await this.lockA.balanceOf(this.alice.address)).to.eq(0);
    });
    it('unstakeSwap()', async function () {
      await this.sherlockSwap.unstakeSwap(0, 0, [this.sl.address, this.tokenA.address], 10000);

      await expect(await this.tokenA.balanceOf(this.alice.address)).to.eq(parseEther('11'));
      await expect(await this.lockA.balanceOf(this.alice.address)).to.eq(0);
    });
  });
});
