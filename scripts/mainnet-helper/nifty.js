// make sure 1 lockUsdc = 1 usdc
// make sure 1 sherx = 1 usdc// This script will deploy the actual contracts
require('dotenv').config();

const { parseUnits, id } = require('ethers/lib/utils');

const NIFTY = '0x7e964a6811a4c68a414897db01fbdc86548992442bf2c39d7cfe5aa4669a70cc';
const USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
const SHERLOCK = '0xacbBe1d537BDa855797776F969612df7bBb98215';
// Deposit amount
const AMOUNT = parseUnits('10000', 6);

async function main() {
  this.sl = await ethers.getContractAt('ISherlock', SHERLOCK);

  [this.sender] = await ethers.getSigners();
  this.sender.address = await this.sender.getAddress();

  this.usdc = await ethers.getContractAt('IERC20', USDC);

  console.log('SHERLOCK\t', SHERLOCK);
  console.log('NIFTY\t\t', NIFTY);
  console.log('USDC\t\t', USDC);
  console.log('SENDER\t\t', this.sender.address);
  console.log('AMOUNT\t\t', AMOUNT.toString());

  await (await this.usdc.approve(SHERLOCK, AMOUNT)).wait();
  await (await this.sl.connect(this.sender).depositProtocolBalance(NIFTY, AMOUNT, USDC)).wait();
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
