// ============================================================
// src/components/ProtectedRoute.jsx
// Route guard that ensures only the manager wallet can access
// protected pages like the Manager Dashboard.
// ============================================================

import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import { FullPageLoader } from "./Loader";
import toast from "react-hot-toast";
import { ShieldOff } from "lucide-react";

export default function ProtectedRoute({ children, managerOnly = false }) {
  const { isConnected, contract, account } = useWallet();
  const [checking, setChecking] = useState(true);
  const [isManager, setIsManager] = useState(false);

  useEffect(() => {
    const check = async () => {
      if (!isConnected || !contract || !account) {
        setChecking(false);
        return;
      }
      if (!managerOnly) {
        setChecking(false);
        return;
      }
      try {
        const manager = await contract.manager();
        setIsManager(manager.toLowerCase() === account.toLowerCase());
      } catch {
        setIsManager(false);
      } finally {
        setChecking(false);
      }
    };
    check();
  }, [isConnected, contract, account, managerOnly]);

  if (checking) return <FullPageLoader message="Verifying access…" />;

  if (!isConnected) {
    toast.error("Please connect your wallet first.");
    return <Navigate to="/" replace />;
  }

  if (managerOnly && !isManager) {
    return (
      <div className="min-h-screen gradient-bg flex flex-col items-center justify-center gap-6 p-6">
        <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
          <ShieldOff size={36} className="text-red-400" />
        </div>
        <div className="text-center max-w-sm">
          <h2 className="text-2xl font-bold font-outfit text-white mb-2">Access Denied</h2>
          <p className="text-gray-400 text-sm">
            This page is restricted to the <span className="text-red-400 font-semibold">Election Commission Manager</span>.
            Your connected wallet does not have manager privileges.
          </p>
        </div>
        <Navigate to="/" replace />
      </div>
    );
  }

  return children;
}
