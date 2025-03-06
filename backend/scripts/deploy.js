// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
  // Get the contract factory
  const ProductAuthentication = await ethers.getContractFactory(
    "ProductAuthentication"
  );

  // Deploy the contract
  console.log("Deploying ProductAuthentication contract...");
  const productAuth = await ProductAuthentication.deploy();
  await productAuth.deployed();

  console.log("ProductAuthentication deployed to:", productAuth.address);

  // Save the contract address to a file or environment variable
  const fs = require("fs");
  const envConfig = `CONTRACT_ADDRESS=${productAuth.address}\n`;
  fs.writeFileSync(".env", envConfig);

  console.log("Contract address saved to .env file");

  // Log the ABI to a file (if needed)
  const contractArtifact = await artifacts.readArtifact(
    "ProductAuthentication"
  );
  fs.writeFileSync(
    "./contractABI.json",
    JSON.stringify(contractArtifact.abi, null, 2)
  );

  console.log("Contract ABI saved to contractABI.json");
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
