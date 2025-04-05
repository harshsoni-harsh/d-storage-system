import { ignition } from "hardhat";
import { execSync } from "child_process";
import MarketplaceModule from "../ignition/modules/Marketplace";

async function main() {
  const deployment = await ignition.deploy(MarketplaceModule);

  console.log("Deployed contracts:");
  const keys = Object.keys(deployment) as Array<keyof typeof deployment>;

  for (const key of keys) {
    const contract = deployment[key];
    console.log(`${String(key)}: ${contract.address}`);
  }

  execSync("pnpm update-abi", { stdio: "inherit" });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
