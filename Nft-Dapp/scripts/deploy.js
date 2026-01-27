const hre = require("hardhat"); // hardhat is required

async function main() {
  const DocumentNFT = await hre.ethers.getContractFactory("DocumentNFT"); // get contract
  const contract = await DocumentNFT.deploy();

  await contract.waitForDeployment(); // wait for deployment

  console.log("DocumentNFT deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
