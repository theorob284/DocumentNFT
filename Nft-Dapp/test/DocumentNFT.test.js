const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DocumentNFT", function () {
  it("mints, prevents duplicate hashes, and verifies", async function () {
    const [issuer, alice] = await ethers.getSigners();

    const DocumentNFT = await ethers.getContractFactory("DocumentNFT");
    const c = await DocumentNFT.deploy();
    await c.waitForDeployment();

    const docHash = ethers.keccak256(ethers.toUtf8Bytes("demo-doc"));

    await (await c.mintDocument(alice.address, docHash)).wait();

    const record = await c.getRecord(1);
    expect(record.documentHash).to.equal(docHash);
    expect(record.issuer).to.equal(issuer.address);

    expect(await c.verifyHash(1, docHash)).to.equal(true);

    await expect(c.mintDocument(alice.address, docHash)).to.be.revertedWith(
      "Document already certified"
    );
  });
});
