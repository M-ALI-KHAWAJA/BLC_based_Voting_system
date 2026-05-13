// src/pages/VotingPage.jsx — updated for real contract ABI
//
// Real ABI differences:
//   isElectionActive()     → electionStarted() && !electionEnded()
//   electionEndTime()      → endTime()
//   hasVoted(address)      → voters(address).hasVoted
//   isCandidate(address)   → voters(address).isCandidate
//   getVoterProvince(addr) → voters(address).province  (returns string)
//   getCandidateCount()    → candidateCount() public var
//   getCandidate(i)        → candidates(i) — struct {id,name,province,wallet,voteCount,exists}
//
// getCandidatesByProvince(string) is available and is used here for efficiency.

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import CandidateCard from "../components/CandidateCard";
import CountdownTimer from "../components/CountdownTimer";
import { SkeletonCard, InlineLoader } from "../components/Loader";
import WalletConnect from "../components/WalletConnect";
import toast from "react-hot-toast";
import { MapPin, Vote, AlertCircle, RefreshCw, Users, ArrowLeft, Info } from "lucide-react";

export default function VotingPage() {
  const navigate = useNavigate();
  const { isConnected, contract, account } = useWallet();

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [isCandidate, setIsCandidate] = useState(false);
  const [electionActive, setElectionActive] = useState(false);
  const [endTime, setEndTime] = useState(null);
  const [voterInfo, setVoterInfo] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Get voter province from sessionStorage (set by VoterVerification page)
  useEffect(() => {
    const stored = sessionStorage.getItem("voterProvince");
    if (stored) {
      try { setVoterInfo(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!contract) return;

    try {
      // Election status via real ABI
      const [started, ended, end] = await Promise.all([
        contract.electionStarted(),
        contract.electionEnded(),
        contract.endTime(),
      ]);
      const active = started && !ended;
      setElectionActive(active);
      setEndTime(end);

      if (account) {
        // voters(address) returns struct: {isRegistered, hasVoted, isCandidate, province, votedCandidateId}
        const voterData = await contract.voters(account);
        setHasVoted(voterData.hasVoted);
        setIsCandidate(voterData.isCandidate);

        // If province wasn't in sessionStorage, get it from chain
        if (!voterInfo && voterData.isRegistered && voterData.province) {
          setVoterInfo({ name: voterData.province, cnic: "" });
        }
      }

      // Determine which province to filter by
      const provinceName = voterInfo?.name || (() => {
        if (!account) return null;
        return null; // will be resolved from chain above on next render
      })();

      if (!provinceName) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Use getCandidatesByProvince(string) — returns Candidate[] for the province
      const provCandidates = await contract.getCandidatesByProvince(provinceName);
      const cands = provCandidates
        .filter((c) => c.exists)
        .map((c) => ({
          id: Number(c.id),
          name: c.name,
          wallet: c.wallet,
          province: c.province,
          voteCount: c.voteCount,
        }));
      setCandidates(cands);
    } catch (err) {
      console.error("Voting page fetch error:", err);
      toast.error("Failed to load voting data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [contract, account, voterInfo]);

  useEffect(() => {
    if (contract && voterInfo !== undefined) {
      fetchData();
    }
  }, [fetchData, contract, voterInfo]);

  const handleRefresh = () => { setRefreshing(true); fetchData(); };

  if (!isConnected) {
    return (
      <div className="min-h-screen gradient-bg pt-20 flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto">
            <Vote size={28} className="text-blue-400" />
          </div>
          <h2 className="font-outfit text-2xl font-bold text-white">Connect to Vote</h2>
          <p className="text-gray-500 text-sm">Connect your wallet to access the voting booth.</p>
          <WalletConnect className="justify-center py-3 px-8" />
        </div>
      </div>
    );
  }

  if (!voterInfo && !loading) {
    return (
      <div className="min-h-screen gradient-bg pt-20 flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mx-auto">
            <AlertCircle size={28} className="text-yellow-400" />
          </div>
          <h2 className="font-outfit text-2xl font-bold text-white">Register First</h2>
          <p className="text-gray-500 text-sm">You must complete voter registration with your CNIC before voting.</p>
          <button onClick={() => navigate("/verify")} className="flex items-center gap-2 mx-auto px-6 py-2.5 rounded-xl btn-primary text-white font-semibold text-sm">
            <ArrowLeft size={15} /> Go to Verification
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg pt-20 pb-12">
      <div className="fixed top-32 right-0 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <button onClick={() => navigate("/verify")} className="flex items-center gap-1.5 text-gray-500 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft size={15} /> Back to Verification
          </button>

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Vote size={20} className="text-blue-400" />
                <span className="text-xs text-blue-400 font-semibold uppercase tracking-widest">Voting Booth</span>
              </div>
              <h1 className="font-outfit text-3xl font-black text-white">Cast Your Vote</h1>
              {voterInfo && (
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <MapPin size={14} className="text-blue-400" />
                    <span className="text-sm text-blue-300 font-semibold">{voterInfo.name}</span>
                  </div>
                  <span className="text-xs text-gray-600">Your assigned province</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <CountdownTimer electionEndTime={endTime} isActive={electionActive} />
              <button onClick={handleRefresh} disabled={refreshing} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors">
                <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              </button>
            </div>
          </div>
        </div>

        {/* Status Banners */}
        {!electionActive && !loading && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
            <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-300"><span className="font-semibold">Election is not active.</span> Voting is currently closed.</p>
          </div>
        )}

        {hasVoted && !loading && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
            <Info size={18} className="text-emerald-400 flex-shrink-0" />
            <p className="text-sm text-emerald-300"><span className="font-semibold">Your vote has been recorded.</span> Thank you for participating!</p>
          </div>
        )}

        {isCandidate && !loading && (
          <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-3">
            <AlertCircle size={18} className="text-yellow-400 flex-shrink-0" />
            <p className="text-sm text-yellow-300"><span className="font-semibold">You are a candidate.</span> Candidates cannot vote.</p>
          </div>
        )}

        {/* Candidates Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : candidates.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-gray-800/60 flex items-center justify-center mx-auto mb-4">
              <Users size={32} className="text-gray-600" />
            </div>
            <h3 className="font-outfit text-xl font-bold text-white mb-2">No Candidates Found</h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              No candidates are registered for {voterInfo?.name} yet. Check back later.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-5">
              {candidates.length} candidate{candidates.length !== 1 ? "s" : ""} in {voterInfo?.name}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {candidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  isElectionActive={electionActive}
                  hasVoted={hasVoted}
                  isCandidate={isCandidate}
                  onVoteSuccess={() => { setHasVoted(true); fetchData(); }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
