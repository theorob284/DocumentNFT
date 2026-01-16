import { useEffect, useState } from "react";

export function useWallet() {
  const [account, setAccount] = useState(null);

  async function connectWallet() {
    if (!window.ethereum) throw new Error("MetaMask not found");
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    setAccount(accounts[0]);
    return accounts[0];
  }

  // Keep account in sync if user changes it in MetaMask
  useEffect(() => {
    if (!window.ethereum) return;

    const onAccountsChanged = (accounts) => setAccount(accounts?.[0] || null);
    window.ethereum.on("accountsChanged", onAccountsChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", onAccountsChanged);
    };
  }, []);

  return { account, connectWallet };
}

