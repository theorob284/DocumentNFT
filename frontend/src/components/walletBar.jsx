// checks for the connected wallet if one is connected
export default function WalletBar({ account, onConnect }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <button onClick={onConnect}>
        {account ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}`: "Connect MetaMask"}
      </button>
    </div>
  );
}
