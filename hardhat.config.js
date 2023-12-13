require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
const INFURA_API_KEY = "d849555cfa5b49dd814910c5a005dace";
const SEPOLIA_PRIVATE_KEY =
  "0x437f8c30df3e6b812ebafed028d08829a011bbf5524c38ec433efd2e4210bed6";
module.exports = {
  defaultNetwork: "sepolia",
  solidity: "0.8.0",
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 40000,
  },
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${"d849555cfa5b49dd814910c5a005dace"}`,
      accounts: [
        "0x437f8c30df3e6b812ebafed028d08829a011bbf5524c38ec433efd2e4210bed6",
      ],
    },
  },
};
