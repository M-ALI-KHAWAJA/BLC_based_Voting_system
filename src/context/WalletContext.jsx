// ============================================================
// src/context/WalletContext.jsx
// Global wallet state management using React Context API.
// Provides wallet connection, account info, and contract instance
// to all components in the tree.
// ============================================================

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { connectWallet, getCurrentAccount, getReadOnlyContract, formatAddress } from "../blockchain/contract";
import toast from "react-hot-toast";

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [chainId, setChainId] = useState(null);

  // ── Restore connection on page load ──────────────────────
  useEffect(() => {
    const restore = async () => {
      const addr = await getCurrentAccount();
      if (addr) {
        try {
          const { provider: p, signer, contract: c, address } = await connectWallet();
          setAccount(address);
          setProvider(p);
          setContract(c);
          setIsConnected(true);
          const network = await p.getNetwork();
          setChainId(network.chainId.toString());
        } catch {
          // Silently fail — user hasn't approved yet
        }
      }
    };
    restore();
  }, []);

  // ── Listen for MetaMask account / chain changes ───────────
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        setAccount(null);
        setContract(null);
        setProvider(null);
        setIsConnected(false);
        toast("Wallet disconnected", { icon: "🔌" });
      } else {
        // Re-initialize with new account
        connectWallet().then(({ provider: p, contract: c, address }) => {
          setAccount(address);
          setProvider(p);
          setContract(c);
          setIsConnected(true);
          toast.success(`Switched to ${formatAddress(address)}`);
        });
      }
    };

    const handleChainChanged = (id) => {
      setChainId(parseInt(id, 16).toString());
      toast("Network changed — refreshing...", { icon: "🔗" });
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  // ── Connect wallet action ─────────────────────────────────
  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      const { provider: p, signer, contract: c, address } = await connectWallet();
      setAccount(address);
      setProvider(p);
      setContract(c);
      setIsConnected(true);
      const network = await p.getNetwork();
      setChainId(network.chainId.toString());
      toast.success(`Connected: ${formatAddress(address)}`);
      return address;
    } catch (err) {
      const msg = err.code === 4001
        ? "Connection rejected by user."
        : err.message || "Failed to connect wallet.";
      toast.error(msg);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // ── Disconnect (MetaMask doesn't have a true disconnect; we clear state) ──
  const disconnect = useCallback(() => {
    setAccount(null);
    setContract(null);
    setProvider(null);
    setIsConnected(false);
    toast("Wallet disconnected", { icon: "🔌" });
  }, []);

  const value = {
    account,
    contract,
    provider,
    isConnecting,
    isConnected,
    chainId,
    connect,
    disconnect,
    formatAddress,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

// ── Custom hook for easy consumption ─────────────────────────
export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside <WalletProvider>");
  return ctx;
}
