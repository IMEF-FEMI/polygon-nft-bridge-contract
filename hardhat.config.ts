require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan")

const dotenv = require("dotenv");

dotenv.config();
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.7",
  networks: {
    polygon: {
      url: process.env.POLYGON_URL,
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_KEY
  }
};



//npx hardhat verify --network rinkeby 0x--------------------------------