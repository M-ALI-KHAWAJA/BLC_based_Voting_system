// src/pages/Results.jsx — updated for real contract ABI
//
// Real ABI differences:
//   getProvinceCount()  → getProvinces() returns string[]
//   getCandidateCount() → candidateCount() public var
//   getTotalVotes()     → totalVotes() public var
//   isElectionActive()  → electionStarted() && !electionEnded()
//   getCandidate(i)     → candidates(i) struct {id,name,province,wallet,voteCount,exists}
//
// getWinner(string _province) → returns (winnerName, winnerVotes) — used per province

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "../context/WalletContext";
import StatsCard from "../components/StatsCard";
import { SkeletonCard } from "../components/Loader";
import toast from "react-hot-toast";
import { Trophy, MapPin, Users, Vote, BarChart3, Crown, Medal, RefreshCw, Star, TrendingUp } from "lucide-react";

function WinnerCard({ candidate, rank, province }) {
  const medals = {
    1: { icon: Crown, color: "from-yellow-500 to-amber-600", badge: "bg-yellow-500/20 border-yellow-500/30 text-yellow-400", label: "1st Place" },
    2: { icon: Medal, color: "from-gray-400 to-gray-500", badge: "bg-gray-500/20 border-gray-500/30 text-gray-400", label: "2nd Place" },
    3: { icon: Medal, color: "from-amber-700 to-orange-700", badge: "bg-orange-500/20 border-orange-500/30 text-orange-400", label: "3rd Place" },
  };
  const m = medals[rank] || medals[3];
  const Icon = m.icon;

  return (
    <div className={`glass rounded-2xl p-5 border card-hover relative overflow-hidden ${rank === 1 ? "border-yellow-500/30 glow-purple" : "border-white/6"}`}>
      {rank === 1 && <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-bl-full pointer-events-none" />}
      <div className="flex items-center justify-between mb-4">
        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${m.badge}`}>{m.label}</span>
        <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center`}>
          <Icon size={15} className="text-white" />
        </div>
      </div>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${m.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
          <span className="text-white font-bold text-lg">{candidate.name?.[0] || "?"}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-outfit font-bold text-white text-base leading-tight truncate">{candidate.name}</h3>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin size={12} className="text-blue-400" />
            <span className="text-xs text-blue-300">{province}</span>
          </div>
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Votes</span>
          <span className="text-white font-bold">{candidate.voteCount?.toString() ?? "0"}</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div className={`h-full bg-gradient-to-r ${m.color} rounded-full transition-all duration-1000`} style={{ width: `${candidate.percentage ?? 0}%` }} />
        </div>
        <div className="text-right text-xs text-gray-600">{candidate.percentage?.toFixed(1) ?? "0"}% of votes</div>
      </div>
      <p className="text-xs text-gray-700 font-mono mt-3 truncate">{candidate.wallet}</p>
    </div>
  );
}

export default function Results() {
  const { contract } = useWallet();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({});
  const [provinceResults, setProvinceResults] = useState([]);
  const [overallWinner, setOverallWinner] = useState(null);

  const fetchResults = useCallback(async () => {
    if (!contract) return;
    try {
      // Use real ABI: getProvinces()→string[], candidateCount()/totalVotes() public vars
      const [provList, candCount, totalVotes, started, ended] = await Promise.all([
        contract.getProvinces(),
        contract.candidateCount(),
        contract.totalVotes(),
        contract.electionStarted(),
        contract.electionEnded(),
      ]);

      const isActive = started && !ended;
      setStats({
        provinceCount: provList.length.toString(),
        candidateCount: candCount.toString(),
        totalVotes: totalVotes.toString(),
        isActive,
      });

      const tv = Number(totalVotes);

      // Fetch all candidates via candidates(i) mapping
      const count = Number(candCount);
      const allCandidates = [];
      for (let i = 1; i <= count; i++) {
        try {
          const c = await contract.candidates(i);
          if (c.exists) {
            allCandidates.push({
              id: i,
              name: c.name,
              province: c.province, // string
              wallet: c.wallet,
              voteCount: Number(c.voteCount),
              percentage: tv > 0 ? (Number(c.voteCount) / tv) * 100 : 0,
            });
          }
        } catch { /* skip */ }
      }

      // Group by province (province is now a string, not an ID)
      const grouped = {};
      for (const cand of allCandidates) {
        if (!grouped[cand.province]) grouped[cand.province] = [];
        grouped[cand.province].push(cand);
      }

      const provResults = Object.entries(grouped).map(([provinceName, cands]) => {
        const sorted = [...cands].sort((a, b) => b.voteCount - a.voteCount);
        return { provinceName, candidates: sorted, winner: sorted[0] || null };
      });

      setProvinceResults(provResults);

      // Overall winner
      if (allCandidates.length > 0) {
        const top = [...allCandidates].sort((a, b) => b.voteCount - a.voteCount)[0];
        setOverallWinner(top);
      }
    } catch (err) {
      console.error("Results fetch error:", err);
      toast.error("Failed to load results.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [contract]);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  const handleRefresh = () => { setRefreshing(true); fetchResults(); };

  return (
    <div className="min-h-screen gradient-bg pt-20 pb-12">
      <div className="fixed top-32 left-0 w-80 h-80 bg-yellow-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trophy size={20} className="text-yellow-400" />
              <span className="text-xs text-yellow-400 font-semibold uppercase tracking-widest">Election Results</span>
            </div>
            <h1 className="font-outfit text-3xl font-black text-white">Live Results</h1>
            <p className="text-gray-500 text-sm mt-1">Province-wise rankings and winner announcements.</p>
          </div>
          <button onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all self-start">
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            Refresh Results
          </button>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard title="Provinces" value={loading ? "…" : stats.provinceCount} icon={MapPin} color="blue" />
          <StatsCard title="Candidates" value={loading ? "…" : stats.candidateCount} icon={Users} color="purple" />
          <StatsCard title="Total Votes" value={loading ? "…" : stats.totalVotes} icon={Vote} color="green" />
          <StatsCard title="Status" value={loading ? "…" : (stats.isActive ? "LIVE" : "Closed")} icon={BarChart3} color={stats.isActive ? "green" : "orange"} />
        </div>

        {/* Overall Winner */}
        {!loading && overallWinner && overallWinner.voteCount > 0 && (
          <div className="mb-8 glass rounded-3xl p-8 border border-yellow-500/20 glow-purple relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/5 to-transparent" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <Star size={18} className="text-yellow-400 fill-yellow-400" />
                <h2 className="font-outfit text-xl font-bold text-white">Overall Winning Candidate</h2>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-2xl flex-shrink-0">
                  <span className="text-white font-black text-4xl font-outfit">{overallWinner.name?.[0]}</span>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-xs text-yellow-500 font-semibold uppercase tracking-widest mb-1">Winner</p>
                  <h3 className="font-outfit text-4xl font-black text-white mb-1">{overallWinner.name}</h3>
                  <div className="flex items-center gap-2 justify-center sm:justify-start mb-3">
                    <MapPin size={14} className="text-blue-400" />
                    <span className="text-blue-300 text-sm">{overallWinner.province}</span>
                  </div>
                  <div className="flex items-center gap-4 justify-center sm:justify-start">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-yellow-400 font-outfit">{overallWinner.voteCount}</p>
                      <p className="text-xs text-gray-500">Total Votes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-emerald-400 font-outfit">{overallWinner.percentage.toFixed(1)}%</p>
                      <p className="text-xs text-gray-500">Vote Share</p>
                    </div>
                  </div>
                </div>
                <div className="hidden sm:flex w-20 h-20 items-center justify-center">
                  <Trophy size={64} className="text-yellow-400 fill-yellow-400/20" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Province-wise Results */}
        <h2 className="font-outfit text-xl font-bold text-white mb-5 flex items-center gap-2">
          <TrendingUp size={18} className="text-blue-400" />
          Province-wise Rankings
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : provinceResults.length === 0 ? (
          <div className="text-center py-16">
            <Trophy size={40} className="mx-auto text-gray-700 mb-4" />
            <h3 className="font-outfit text-xl font-bold text-gray-600">No Results Yet</h3>
            <p className="text-gray-700 text-sm mt-1">Results appear once candidates are registered and votes are cast.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {provinceResults.map(({ provinceName, candidates, winner }) => (
              <div key={provinceName} className="glass rounded-2xl p-6 border border-white/6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <MapPin size={18} className="text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-outfit font-bold text-white text-lg">{provinceName}</h3>
                    <p className="text-xs text-gray-500">{candidates.length} candidates</p>
                  </div>
                  {winner && (
                    <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                      <Crown size={14} className="text-yellow-400" />
                      <span className="text-xs text-yellow-400 font-semibold">{winner.name}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {candidates.slice(0, 6).map((cand, idx) => (
                    <WinnerCard key={cand.id} candidate={cand} rank={idx + 1} province={provinceName} />
                  ))}
                </div>

                {/* Vote distribution bar */}
                {candidates.length > 1 && (
                  <div className="mt-4 p-4 rounded-xl bg-white/3 border border-white/5">
                    <p className="text-xs text-gray-500 mb-3 font-semibold uppercase tracking-wider">Vote Distribution</p>
                    <div className="space-y-2">
                      {candidates.map((c) => {
                        const total = candidates.reduce((s, x) => s + x.voteCount, 0);
                        const pct = total > 0 ? (c.voteCount / total) * 100 : 0;
                        return (
                          <div key={c.id} className="flex items-center gap-3">
                            <span className="text-xs text-gray-400 w-28 truncate">{c.name}</span>
                            <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-gray-500 w-20 text-right">{c.voteCount} ({pct.toFixed(1)}%)</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
