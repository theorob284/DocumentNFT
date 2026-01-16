import { ethers } from "ethers";
import DocumentNFTArtifact from "../abi/DocNFT.json";

const ABI = DocumentNFTArtifact.abi;

export function useDocumentNFT(contractAddress) {
  async function ensureHardhatNetwork() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    if (network.chainId !== 31337n) {
      throw new Error(`Wrong network (chainId=${network.chainId}). Switch MetaMask to Hardhat Local.`);
    }
  }

  async function mintDocument(to, docHash) {
    if (!window.ethereum) throw new Error("MetaMask not found");
    if (!contractAddress) throw new Error("Missing contract address");

    await ensureHardhatNetwork();

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(contractAddress, ABI, signer);

    const tx = await contract.mintDocument(to, docHash);
    const receipt = await tx.wait();

    // Robust tokenId extraction by filtering logs for this contract + Transfer topic
    const iface = new ethers.Interface(ABI);
    const transferTopic = iface.getEvent("Transfer").topicHash;

    const log = receipt.logs.find(
      (l) =>
        l.address?.toLowerCase() === contractAddress.toLowerCase() &&
        l.topics?.[0] === transferTopic
    );

    if (!log) throw new Error("Transfer event not found in receipt");

    const decoded = iface.decodeEventLog("Transfer", log.data, log.topics);
    return decoded.tokenId.toString();
  }

  return { mintDocument, ensureHardhatNetwork };
}
