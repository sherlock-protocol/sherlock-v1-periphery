require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-etherscan');
require('dotenv').config();

const ETHERSCAN_API = process.env.ETHERSCAN_API || '';
const INFURA_API_KEY = process.env.INFURA_API_KEY || '';
const ALCHEMY_API_KEY_GOERLI = process.env.ALCHEMY_API_KEY_GOERLI || '';
const ALCHEMY_API_KEY_KOVAN = process.env.ALCHEMY_API_KEY_KOVAN || '';
const PRIVATE_KEY = process.env.PRIVATE_KEY || '';

task('env', 'Prints env', async () => {
  console.log('ETHERSCAN_API', ETHERSCAN_API);
  console.log('ALCHEMY_API_KEY_GOERLI', ALCHEMY_API_KEY_GOERLI);
  console.log('ALCHEMY_API_KEY_KOVAN', ALCHEMY_API_KEY_KOVAN);
  console.log('INFURA_API_KEY', INFURA_API_KEY);
  console.log('PRIVATE_KEY', PRIVATE_KEY);
});

module.exports = {
  solidity: {
    version: '0.7.6',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_API_KEY_GOERLI}`,
      gasPrice: 900000000000,
      accounts: [PRIVATE_KEY].filter(item => item !== ''),
    },
    kovan: {
      url: `https://eth-kovan.alchemyapi.io/v2/${ALCHEMY_API_KEY_KOVAN}`,
      gasPrice: 3000000000,
      accounts: [PRIVATE_KEY].filter(item => item !== ''),
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: ETHERSCAN_API,
  },
};
