import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";

import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    mainnet: {
      url: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY!],
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY!],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  sourcify: {
    enabled: true
  }
};

export default config;

// npx hardhat ignition deploy ignition/modules/SwapLstModule.ts --network sepolia --verify
// npx hardhat ignition deploy ignition/modules/SwapLstModule.ts --network mainnet --verify

// npx hardhat ignition deploy ignition/modules/DepositLstModule.ts --network sepolia --verify
// npx hardhat ignition deploy ignition/modules/DepositLstModule.ts --network mainnet --verify