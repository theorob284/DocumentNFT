import { useEffect, useState } from "react";
// connects to metamask wallet
export function useWallet() {
  const [account, setAccount] = useState(null);

  async function connectWallet() { // connects to the wallet
    if (!window.ethereum) throw new Error("MetaMask not found"); // ensure metamask
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" }); // request metamask
    setAccount(accounts[0]); // sets the account using the service
    return accounts[0];
  }

  // Keep account in sync if user changes it in MetaMask
  useEffect(() => {
    if (!window.ethereum) return;

    const onAccountsChanged = (accounts) => setAccount(accounts?.[0] || null); // check for account changes
    window.ethereum.on("accountsChanged", onAccountsChanged);

    return () => {window.ethereum.removeListener("accountsChanged", onAccountsChanged);};
  }, []);

  return { account, connectWallet };
}

