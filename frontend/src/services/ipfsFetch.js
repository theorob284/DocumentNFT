// fetches the document from ipfs pinata server
export async function fetchFromIpfs(cid) {
  const url = `https://gateway.pinata.cloud/ipfs/${cid}`; // url to get document from
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch from IPFS (HTTP ${res.status})`);
  return await res.arrayBuffer();
}
