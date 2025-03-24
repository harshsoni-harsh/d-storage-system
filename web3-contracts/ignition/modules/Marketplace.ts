import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MarketplaceModule = buildModule("MarketplaceModule", (m) => {
  const marketplace = m.contract("StorageMarketplace");
  return { marketplace };
});

export default MarketplaceModule;