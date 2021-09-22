require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-etherscan');
require('dotenv').config();

const ETHERSCAN_API = process.env.ETHERSCAN_API || '';
const INFURA_API_KEY = process.env.INFURA_API_KEY || '';
const ALCHEMY_API_KEY_GOERLI = process.env.ALCHEMY_API_KEY_GOERLI || '';
const ALCHEMY_API_KEY_KOVAN = process.env.ALCHEMY_API_KEY_KOVAN || '';
const ALCHEMY_API_KEY_MAINNET = process.env.ALCHEMY_API_KEY_MAINNET || '';
const PRIVATE_KEY = process.env.PRIVATE_KEY || '';
const KOVAN_PRIVATE_KEY = process.env.KOVAN_PRIVATE_KEY || '';

task('env', 'Prints env', async () => {
  console.log('ETHERSCAN_API', ETHERSCAN_API);
  console.log('ALCHEMY_API_KEY_GOERLI', ALCHEMY_API_KEY_GOERLI);
  console.log('ALCHEMY_API_KEY_KOVAN', ALCHEMY_API_KEY_KOVAN);
  console.log('ALCHEMY_API_KEY_MAINNET', ALCHEMY_API_KEY_MAINNET);
  console.log('INFURA_API_KEY', INFURA_API_KEY);
  console.log('PRIVATE_KEY', PRIVATE_KEY);
  console.log('KOVAN_PRIVATE_KEY', KOVAN_PRIVATE_KEY);
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
    localhost: {
      timeout: 999999999,
      gasPrice: 1600000000000,
      accounts: [PRIVATE_KEY].filter(item => item !== ''),
    },
    local: {
      url: 'http://127.0.0.1:8545',
      gasPrice: 50000000000,
    },
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_API_KEY_GOERLI}`,
      gasPrice: 900000000000,
      accounts: [PRIVATE_KEY].filter(item => item !== ''),
    },
    kovan: {
      url: `https://eth-kovan.alchemyapi.io/v2/${ALCHEMY_API_KEY_KOVAN}`,
      gasPrice: 1000000007,
      accounts: [KOVAN_PRIVATE_KEY].filter(item => item !== ''),
    },
    mainnet: {
      timeout: 999999999,
      url: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_API_KEY_MAINNET}`,
      gasPrice: 100000000000,
      accounts: [PRIVATE_KEY].filter(item => item !== ''),
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: ETHERSCAN_API,
  },
};
