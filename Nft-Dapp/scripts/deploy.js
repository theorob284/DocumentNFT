const hre = require("hardhat");

async function main() {
  const DocumentNFT = await hre.ethers.getContractFactory("DocumentNFT");
  const contract = await DocumentNFT.deploy();

  await contract.waitForDeployment();

  console.log("DocumentNFT deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
