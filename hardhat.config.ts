import dotenv from "dotenv";

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.16",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
    ],
  },
  networks: {
    ethereum: {
      url:
        process.env.ETHEREUM_MAINNET_URL !== undefined
          ? process.env.ETHEREUM_MAINNET_URL
          : "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },

    polygon: {
      url:
        process.env.POLYGON_MAINNET_URL !== undefined
          ? process.env.POLYGON_MAINNET_URL
          : "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },

    bnb: {
      url:
        process.env.BNB_MAINNET_URL !== undefined
          ? process.env.BNB_MAINNET_URL
          : "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },

    goerli_testnet: {
      url:
        process.env.GOERLI_TESTNET_URL !== undefined
          ? process.env.GOERLI_TESTNET_URL
          : "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },

    mumbai_testnet: {
      url:
        process.env.MUMBAI_TESTNET_URL !== undefined
          ? process.env.MUMBAI_TESTNET_URL
          : "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },

    bnb_testnet: {
      url:
        process.env.BNB_TESTNET_URL !== undefined
          ? process.env.BNB_TESTNET_URL
          : "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
  },

  gasReporter: {
    enabled: true,
    currency: "",
  },
  etherscan: {
    apiKey: process.env.SCAN_API_KEY,
  },
};

export default config;
