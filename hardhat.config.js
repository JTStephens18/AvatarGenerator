/** @type import('hardhat/config').HardhatUserConfig */
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
module.exports = {
  solidity: {
  version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {},
    goerli: {
      url: process.env.REACT_APP_ALCHEMY_API_KEY,
      accounts: [process.env.REACT_APP_PRIVATE_KEY],
      gas: "auto",
      gasPrice: "auto",
      gasMultiplier: 2,
    }
  },
  paths: {
    artifacts: './src/artifacts',
  },
};
