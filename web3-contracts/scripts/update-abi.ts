import fs from "fs";
import path from "path";

const contracts = ["Deal", "Marketplace", "Provider"];

const artifactsDir = path.resolve(__dirname, "../artifacts/contracts");
const outputPath = path.resolve(__dirname, "../../frontend/src/lib/abi.ts");

function generateAbiTs() {
  let fileContent = `// Auto-generated ABI file\n\n`;

  for (const name of contracts) {
    const contractArtifactPath = path.join(artifactsDir, `${name}.sol`, `${name}.json`);
    
    if (!fs.existsSync(contractArtifactPath)) {
      console.warn(`ABI for ${name} not found at ${contractArtifactPath}`);
      continue;
    }

    const artifact = JSON.parse(fs.readFileSync(contractArtifactPath, "utf-8"));
    const abi = JSON.stringify(artifact.abi, null, 2);

    fileContent += `export const ${name}ABI = ${abi} as const;\n\n`;
  }

  fs.writeFileSync(outputPath, fileContent);
  console.log(`ABI written to ${outputPath}`);
}

generateAbiTs();
