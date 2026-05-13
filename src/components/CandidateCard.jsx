// ============================================================
// src/components/CandidateCard.jsx
// Displays candidate info and vote button on Voting Page.
// ============================================================

import { useState } from "react";
import { User, MapPin, BarChart2, CheckCircle, Loader2 } from "lucide-react";
import { useWallet } from "../context/WalletContext";
import toast from "react-hot-toast";

export default function CandidateCard({
  candidate,          // { id, name, wallet, province, voteCount }
  isElectionActive,
  hasVoted,
  isCandidate,        // is the current user a candidate?
  onVoteSuccess,      // callback to refresh data
}) {
  const { contract, account } = useWallet();
  const [voting, setVoting] = useState(false);
  const [voted, setVoted] = useState(false);

  const canVote =
    isElectionActive &&
    !hasVoted &&
    !voted &&
    !isCandidate &&
    account;

  const handleVote = async () => {
    if (!contract) return toast.error("Wallet not connected.");
    if (!canVote) return;

    setVoting(true);
    const toastId = toast.loading("Submitting your vote to blockchain…");
    try {
      const tx = await contract.vote(candidate.id);
      toast.loading(`Transaction pending… Hash: ${tx.hash.slice(0, 10)}…`, { id: toastId });
      await tx.wait();
      toast.success(
        <div>
          <p className="font-semibold">Vote cast successfully! 🎉</p>
          <p className="text-xs text-gray-400 font-mono mt-1 truncate">
            TX: {tx.hash.slice(0, 22)}…
          </p>
        </div>,
        { id: toastId, duration: 6000 }
      );
      setVoted(true);
      onVoteSuccess?.();
    } catch (err) {
      const msg = err.reason || err.message || "Transaction failed.";
      toast.error(msg.length > 80 ? msg.slice(0, 80) + "…" : msg, { id: toastId });
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className="glass rounded-2xl p-5 border border-white/8 card-hover flex flex-col gap-4 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-600/10 to-transparent rounded-bl-full pointer-events-none" />

      {/* Avatar & Name */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg">
          <User size={22} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-outfit font-bold text-white text-lg leading-tight truncate">
            {candidate.name}
          </h3>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin size={12} className="text-blue-400 flex-shrink-0" />
            <span className="text-xs text-blue-300 font-medium truncate">
              {candidate.province}
            </span>
          </div>
        </div>
      </div>

      {/* Vote Count */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/5">
        <BarChart2 size={15} className="text-violet-400" />
        <span className="text-sm text-gray-400">Votes:</span>
        <span className="text-sm font-bold text-violet-300 ml-auto">
          {candidate.voteCount?.toString() ?? "—"}
        </span>
      </div>

      {/* Wallet address */}
      <p className="text-xs text-gray-600 font-mono truncate">
        {candidate.wallet}
      </p>

      {/* Vote Button */}
      <button
        onClick={handleVote}
        disabled={!canVote || voting}
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
          voted || hasVoted
            ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 cursor-default"
            : canVote
            ? "btn-primary text-white shadow-lg"
            : "bg-gray-800/60 border border-gray-700/40 text-gray-600 cursor-not-allowed"
        }`}
      >
        {voting ? (
          <><Loader2 size={15} className="animate-spin" /> Submitting…</>
        ) : voted || hasVoted ? (
          <><CheckCircle size={15} /> Voted</>
        ) : !isElectionActive ? (
          "Election Closed"
        ) : isCandidate ? (
          "Candidates Cannot Vote"
        ) : !account ? (
          "Connect Wallet First"
        ) : (
          "Cast Vote"
        )}
      </button>
    </div>
  );
}
