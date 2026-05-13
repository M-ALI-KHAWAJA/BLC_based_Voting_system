// src/pages/Home.jsx — updated for real contract ABI
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import WalletConnect from "../components/WalletConnect";
import CountdownTimer from "../components/CountdownTimer";
import StatsCard from "../components/StatsCard";
import { InlineLoader } from "../components/Loader";
import { Vote, MapPin, Users, BarChart3, Shield, ArrowRight, Zap, Globe, Lock, CheckCircle } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const { isConnected, contract, account } = useWallet();

  const [stats, setStats] = useState({ provinceCount: null, candidateCount: null, totalVotes: null, isActive: false, endTime: null });
  const [loadingStats, setLoadingStats] = useState(false);

  // Real ABI: getProvinces()→string[], candidateCount() public var, totalVotes() public var,
  // electionStarted()+electionEnded() for status, endTime() for countdown
  const fetchStats = useCallback(async () => {
    if (!contract) return;
    setLoadingStats(true);
    try {
      const [provinces, candCount, votes, started, ended, endTime] = await Promise.all([
        contract.getProvinces(),
        contract.candidateCount(),
        contract.totalVotes(),
        contract.electionStarted(),
        contract.electionEnded(),
        contract.endTime(),
      ]);
      setStats({
        provinceCount: provinces.length.toString(),
        candidateCount: candCount.toString(),
        totalVotes: votes.toString(),
        isActive: started && !ended,
        endTime,
      });
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoadingStats(false);
    }
  }, [contract]);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const PROVINCE_DIGITS = [
    { digit: 1, name: "KPK" }, { digit: 2, name: "Former FATA" }, { digit: 3, name: "Punjab" },
    { digit: 4, name: "Sindh" }, { digit: 5, name: "Baluchistan" }, { digit: 6, name: "Islamabad" },
    { digit: 7, name: "Gilgit Baltistan" },
  ];

  return (
    <div className="min-h-screen gradient-bg">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
            <Zap size={14} className="text-blue-400" />
            <span className="text-xs text-blue-300 font-semibold tracking-wide uppercase">Powered by Ethereum Blockchain</span>
          </div>

          <h1 className="font-outfit text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-tight">
            <span className="text-white">Pakistan's First</span><br />
            <span className="gradient-text">Blockchain Voting</span><br />
            <span className="text-white">System</span>
          </h1>

          <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
            Transparent, tamper-proof, and decentralized provincial elections. Every vote is permanently recorded on-chain.
          </p>

          {/* Election Status */}
          <div className="flex justify-center mb-8">
            {loadingStats ? <InlineLoader message="Checking election status…" /> : (
              <div className={`flex items-center gap-2 px-5 py-2.5 rounded-full border font-semibold text-sm ${stats.isActive ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-gray-800/60 border-gray-700/40 text-gray-400"}`}>
                <div className={`w-2.5 h-2.5 rounded-full ${stats.isActive ? "bg-emerald-400 animate-pulse" : "bg-gray-600"}`} />
                {stats.isActive ? "Election is LIVE" : "Election is Inactive"}
              </div>
            )}
          </div>

          {stats.isActive && (
            <div className="flex justify-center mb-10">
              <CountdownTimer electionEndTime={stats.endTime} isActive={stats.isActive} />
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {!isConnected ? (
              <WalletConnect className="px-8 py-3 text-base rounded-2xl" />
            ) : (
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle size={16} className="text-emerald-400" />
                <span className="text-emerald-400 text-sm font-semibold">Wallet Connected</span>
              </div>
            )}
            <button onClick={() => navigate("/verify")} className="flex items-center gap-2 px-8 py-3 rounded-2xl text-base font-semibold bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all duration-200">
              Enter Voting System <ArrowRight size={16} />
            </button>
          </div>

          {isConnected && account && (
            <p className="mt-4 text-xs text-gray-600 font-mono">{account}</p>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-white text-center mb-8 font-outfit">Live Election Statistics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard title="Total Provinces" value={loadingStats ? "…" : (stats.provinceCount ?? "—")} icon={MapPin} color="blue" subtitle="Active provinces" />
            <StatsCard title="Total Candidates" value={loadingStats ? "…" : (stats.candidateCount ?? "—")} icon={Users} color="purple" subtitle="Registered candidates" />
            <StatsCard title="Total Votes Cast" value={loadingStats ? "…" : (stats.totalVotes ?? "—")} icon={Vote} color="green" subtitle="On-chain votes" />
            <StatsCard title="Election Status" value={loadingStats ? "…" : (stats.isActive ? "LIVE" : "Inactive")} icon={BarChart3} color={stats.isActive ? "green" : "orange"} subtitle={stats.isActive ? "Voting is open" : "Not started"} />
          </div>
        </div>
      </section>

      {/* Features + Province Map */}
      <section className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center font-outfit mb-2">
            <span className="gradient-text">Why Blockchain Voting?</span>
          </h2>
          <p className="text-center text-gray-500 text-sm mb-10">Built for Pakistan's provinces with complete transparency</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            {[
              { icon: Shield, title: "Tamper-Proof", desc: "Every vote is immutably recorded on Ethereum — no one can alter results once submitted.", color: "blue" },
              { icon: Globe, title: "Province-Based", desc: "Voters are automatically assigned their province from CNIC first digit (1→KPK … 7→Gilgit).", color: "purple" },
              { icon: Lock, title: "CNIC Verified", desc: "One wallet, one CNIC, one vote — cryptographic guarantees prevent double voting.", color: "green" },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="glass rounded-2xl p-6 border border-white/6 card-hover">
                <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${color === "blue" ? "bg-blue-500/20" : color === "purple" ? "bg-violet-500/20" : "bg-emerald-500/20"}`}>
                  <Icon size={22} className={color === "blue" ? "text-blue-400" : color === "purple" ? "text-violet-400" : "text-emerald-400"} />
                </div>
                <h3 className="font-outfit font-bold text-white text-lg mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="glass rounded-2xl p-6 border border-white/6">
            <h3 className="font-outfit font-semibold text-white mb-4 flex items-center gap-2">
              <MapPin size={16} className="text-blue-400" />
              Pakistan Provinces (CNIC Digit Mapping)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {PROVINCE_DIGITS.map(({ digit, name }) => (
                <div key={digit} className="text-center p-2 rounded-lg bg-white/5 border border-white/5">
                  <div className="text-2xl font-bold font-outfit text-blue-400">{digit}</div>
                  <div className="text-xs text-gray-400 mt-1 leading-tight">{name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
