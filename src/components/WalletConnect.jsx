// ============================================================
// src/components/WalletConnect.jsx
// MetaMask connect / disconnect button component.
// ============================================================

import { Wallet, LogOut, Loader2 } from "lucide-react";
import { useWallet } from "../context/WalletContext";

export default function WalletConnect({ className = "" }) {
  const { isConnected, isConnecting, connect, disconnect, account, formatAddress } = useWallet();

  if (isConnected && account) {
    return (
      <button
        onClick={disconnect}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all duration-200 ${className}`}
        title="Disconnect wallet"
      >
        <LogOut size={15} />
        <span className="hidden sm:inline">Disconnect</span>
      </button>
    );
  }

  return (
    <button
      onClick={connect}
      disabled={isConnecting}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold btn-primary text-white shadow-lg ${className}`}
    >
      {isConnecting ? (
        <>
          <Loader2 size={15} className="animate-spin" />
          <span>Connecting…</span>
        </>
      ) : (
        <>
          <Wallet size={15} />
          <span>Connect Wallet</span>
        </>
      )}
    </button>
  );
}
