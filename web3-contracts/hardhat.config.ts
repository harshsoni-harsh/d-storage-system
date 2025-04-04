import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  defaultNetwork: "localhost",
  solidity: "0.8.28",
  networks: {
    localhost: {
      loggingEnabled: true,
    },
  },
};

export default config;
