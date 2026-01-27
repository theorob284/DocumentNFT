import { ethers } from "ethers";
import DocumentNFTArtifact from "../abi/DocNFT.json";

const ABI = DocumentNFTArtifact.abi;

export function useDocumentNFT(contractAddress) {
  // this function is for testing on the local network, for safety reasons
  async function ensureHardhatNetwork() { // ensure hardhat network used
    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    if (network.chainId !== 31337n) { // make sure it's local network
      throw new Error(`Wrong network (chainId=${network.chainId}). Switch MetaMask to Hardhat Local.`);
    }
  }

  async function mintDocument(to, docHash) {
    if (!window.ethereum) throw new Error("MetaMask not found"); // ensure metamask
    if (!contractAddress) throw new Error("Missing contract address"); // needs contact address
    await ensureHardhatNetwork();

    const provider = new ethers.BrowserProvider(window.ethereum); //wraps metamask
    const signer = await provider.getSigner(); // gets currently connected metamask account

    const contract = new ethers.Contract(contractAddress, ABI, signer); // creates a new instance of the smart contract

    const tx = await contract.mintDocument(to, docHash); // sends transaction
    const receipt = await tx.wait(); // wait until its mindes

    // Robust tokenId extraction by filtering logs for this contract + Transfer topic
    const iface = new ethers.Interface(ABI);
    const transferTopic = iface.getEvent("Transfer").topicHash;

    const log = receipt.logs.find((l) =>l.address?.toLowerCase() === contractAddress.toLowerCase() &&l.topics?.[0] === transferTopic);
    if (!log) throw new Error("Transfer event not found in receipt");

    const decoded = iface.decodeEventLog("Transfer", log.data, log.topics);
    return decoded.tokenId.toString();
  }

  return { mintDocument, ensureHardhatNetwork };
}
