// src/pages/ManagerDashboard.jsx — updated for real contract ABI
//
// Real ABI differences vs placeholder:
//   createProvince   → addProvince(string _province)
//   addCandidate     → addCandidate(string _name, string _province, address _wallet)
//   getProvinceCount → getProvinces() returns string[]
//   getCandidateCount→ candidateCount() public var
//   getTotalVotes    → totalVotes() public var
//   isElectionActive → electionStarted() && !electionEnded()
//   electionEndTime  → endTime()
//   getCandidate(i)  → candidates(i) mapping: {id,name,province,wallet,voteCount,exists}

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "../context/WalletContext";
import StatsCard from "../components/StatsCard";
import { InlineLoader } from "../components/Loader";
import toast from "react-hot-toast";
import { MapPin, Plus, Users, Timer, Square, Vote, BarChart3, Shield, Loader2, RefreshCw } from "lucide-react";

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center">
        <Icon size={18} className="text-blue-400" />
      </div>
      <div>
        <h2 className="font-outfit font-bold text-white text-lg">{title}</h2>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function ManagerDashboard() {
  const { contract, account } = useWallet();

  const [provinceName, setProvinceName] = useState("");
  const [candName, setCandName] = useState("");
  const [candWallet, setCandWallet] = useState("");
  const [candProvince, setCandProvince] = useState("");
  const [duration, setDuration] = useState("");

  const [loadingProvince, setLoadingProvince] = useState(false);
  const [loadingCandidate, setLoadingCandidate] = useState(false);
  const [loadingStart, setLoadingStart] = useState(false);
  const [loadingEnd, setLoadingEnd] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [stats, setStats] = useState({});
  const [candidates, setCandidates] = useState([]);
  const [provinces, setProvinces] = useState([]); // string[]

  // ── Fetch dashboard data using real ABI ──────────────────
  const fetchData = useCallback(async () => {
    if (!contract) return;
    setRefreshing(true);
    try {
      // getProvinces() returns string[], candidateCount/totalVotes are public vars
      const [provList, candCount, votes, started, ended] = await Promise.all([
        contract.getProvinces(),
        contract.candidateCount(),
        contract.totalVotes(),
        contract.electionStarted(),
        contract.electionEnded(),
      ]);

      const isActive = started && !ended;
      setProvinces(provList); // string[]
      setStats({
        provinceCount: provList.length.toString(),
        candidateCount: candCount.toString(),
        totalVotes: votes.toString(),
        isActive,
      });

      // Fetch candidates via candidates(i) mapping (1-indexed)
      const count = Number(candCount);
      const candList = [];
      for (let i = 1; i <= count; i++) {
        try {
          const c = await contract.candidates(i);
          // struct: {id, name, province(string), wallet, voteCount, exists}
          if (c.exists) {
            candList.push({
              id: i,
              name: c.name,
              province: c.province,
              wallet: c.wallet,
              voteCount: c.voteCount.toString(),
            });
          }
        } catch { /* skip */ }
      }
      setCandidates(candList);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      toast.error("Failed to load dashboard data.");
    } finally {
      setRefreshing(false);
    }
  }, [contract]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Add Province — real function: addProvince(string) ────
  const handleAddProvince = async (e) => {
    e.preventDefault();
    if (!provinceName.trim()) return toast.error("Province name is required.");
    setLoadingProvince(true);
    const tid = toast.loading("Adding province…");
    try {
      const tx = await contract.addProvince(provinceName.trim());
      await tx.wait();
      toast.success(`Province "${provinceName}" added!`, { id: tid });
      setProvinceName("");
      fetchData();
    } catch (err) {
      toast.error(err.reason || err.message || "Failed to add province.", { id: tid });
    } finally {
      setLoadingProvince(false);
    }
  };

  // ── Add Candidate — real signature: addCandidate(name, province_string, wallet) ─
  const handleAddCandidate = async (e) => {
    e.preventDefault();
    if (!candName.trim()) return toast.error("Candidate name is required.");
    if (!candWallet.trim()) return toast.error("Candidate wallet is required.");
    if (!candProvince) return toast.error("Please select a province.");
    setLoadingCandidate(true);
    const tid = toast.loading("Adding candidate…");
    try {
      // Note: ABI order is (name, province_string, wallet) — NOT (name, wallet, id)
      const tx = await contract.addCandidate(candName.trim(), candProvince, candWallet.trim());
      await tx.wait();
      toast.success(`Candidate "${candName}" added!`, { id: tid });
      setCandName(""); setCandWallet(""); setCandProvince("");
      fetchData();
    } catch (err) {
      toast.error(err.reason || err.message || "Failed to add candidate.", { id: tid });
    } finally {
      setLoadingCandidate(false);
    }
  };

  // ── Start Election ────────────────────────────────────────
  const handleStartElection = async (e) => {
    e.preventDefault();
    if (!duration || Number(duration) < 1) return toast.error("Enter a valid duration (min 1 minute).");
    setLoadingStart(true);
    const tid = toast.loading("Starting election…");
    try {
      const tx = await contract.startElection(Number(duration));
      await tx.wait();
      toast.success(`Election started for ${duration} minutes!`, { id: tid });
      setDuration("");
      fetchData();
    } catch (err) {
      toast.error(err.reason || err.message || "Failed to start election.", { id: tid });
    } finally {
      setLoadingStart(false);
    }
  };

  // ── End Election ──────────────────────────────────────────
  const handleEndElection = async () => {
    if (!window.confirm("Are you sure you want to end the election?")) return;
    setLoadingEnd(true);
    const tid = toast.loading("Ending election…");
    try {
      const tx = await contract.endElection();
      await tx.wait();
      toast.success("Election ended successfully.", { id: tid });
      fetchData();
    } catch (err) {
      toast.error(err.reason || err.message || "Failed to end election.", { id: tid });
    } finally {
      setLoadingEnd(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl bg-gray-900/60 border border-gray-700/50 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500/60 focus:bg-gray-900 transition-all";

  return (
    <div className="min-h-screen gradient-bg pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield size={20} className="text-blue-400" />
              <span className="text-xs text-blue-400 font-semibold uppercase tracking-widest">Election Commission</span>
            </div>
            <h1 className="font-outfit text-3xl font-black text-white">Manager Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1 font-mono">{account}</p>
          </div>
          <button onClick={fetchData} disabled={refreshing} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all self-start sm:self-auto">
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard title="Provinces" value={stats.provinceCount} icon={MapPin} color="blue" />
          <StatsCard title="Candidates" value={stats.candidateCount} icon={Users} color="purple" />
          <StatsCard title="Votes Cast" value={stats.totalVotes} icon={Vote} color="green" />
          <StatsCard title="Status" value={stats.isActive ? "LIVE" : "Inactive"} icon={BarChart3} color={stats.isActive ? "green" : "orange"} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Add Province */}
          <div className="glass rounded-2xl p-6 border border-white/6">
            <SectionHeader icon={MapPin} title="Add Province" subtitle="Register a new voting province" />
            <form onSubmit={handleAddProvince} className="space-y-4">
              <input className={inputClass} placeholder="Province Name (e.g. Punjab)" value={provinceName} onChange={(e) => setProvinceName(e.target.value)} />
              <button type="submit" disabled={loadingProvince} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl btn-primary text-white font-semibold text-sm">
                {loadingProvince ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                Add Province
              </button>
            </form>
          </div>

          {/* Add Candidate */}
          <div className="glass rounded-2xl p-6 border border-white/6">
            <SectionHeader icon={Users} title="Add Candidate" subtitle="Register a new candidate" />
            <form onSubmit={handleAddCandidate} className="space-y-4">
              <input className={inputClass} placeholder="Candidate Name" value={candName} onChange={(e) => setCandName(e.target.value)} />
              <input className={inputClass} placeholder="Candidate Wallet Address (0x…)" value={candWallet} onChange={(e) => setCandWallet(e.target.value)} />
              {/* Province is selected from actual on-chain string[] — NOT a numeric ID */}
              <select className={`${inputClass} cursor-pointer`} value={candProvince} onChange={(e) => setCandProvince(e.target.value)}>
                <option value="">Select Province</option>
                {provinces.length > 0
                  ? provinces.map((p) => <option key={p} value={p}>{p}</option>)
                  : ["KPK", "Former FATA", "Punjab", "Sindh", "Baluchistan", "Islamabad", "Gilgit Baltistan"].map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))
                }
              </select>
              <button type="submit" disabled={loadingCandidate} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl btn-primary text-white font-semibold text-sm">
                {loadingCandidate ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                Add Candidate
              </button>
            </form>
          </div>

          {/* Start Election */}
          <div className="glass rounded-2xl p-6 border border-white/6">
            <SectionHeader icon={Timer} title="Start Election" subtitle="Set duration and begin voting" />
            <form onSubmit={handleStartElection} className="space-y-4">
              <div className="relative">
                <input type="number" min="1" className={inputClass} placeholder="Duration in minutes" value={duration} onChange={(e) => setDuration(e.target.value)} />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-600">minutes</span>
              </div>
              <button type="submit" disabled={loadingStart || stats.isActive} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl btn-green text-white font-semibold text-sm">
                {loadingStart ? <Loader2 size={16} className="animate-spin" /> : <Timer size={16} />}
                {stats.isActive ? "Election Already Running" : "Start Election"}
              </button>
            </form>
          </div>

          {/* End Election */}
          <div className="glass rounded-2xl p-6 border border-white/6">
            <SectionHeader icon={Square} title="End Election" subtitle="Terminate the active election" />
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border text-sm ${stats.isActive ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-gray-800/40 border-gray-700/40 text-gray-500"}`}>
                Current status: <span className="font-bold">{stats.isActive ? "🟢 Election is LIVE" : "⚫ Election is Inactive"}</span>
              </div>
              <button onClick={handleEndElection} disabled={loadingEnd || !stats.isActive} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl btn-danger text-white font-semibold text-sm">
                {loadingEnd ? <Loader2 size={16} className="animate-spin" /> : <Square size={16} />}
                End Election
              </button>
            </div>
          </div>
        </div>

        {/* Candidate Table */}
        <div className="mt-8 glass rounded-2xl p-6 border border-white/6">
          <SectionHeader icon={Users} title="Candidates Overview" subtitle={`${candidates.length} total`} />

          {refreshing && candidates.length === 0 ? (
            <div className="py-8 flex justify-center"><InlineLoader message="Loading candidates…" /></div>
          ) : candidates.length === 0 ? (
            <div className="py-10 text-center text-gray-600">
              <Users size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No candidates registered yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-900/60 border-b border-white/5">
                    <th className="px-4 py-3 text-left text-xs text-gray-500 font-semibold uppercase tracking-wider">#</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 font-semibold uppercase tracking-wider">Candidate</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 font-semibold uppercase tracking-wider">Province</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 font-semibold uppercase tracking-wider">Wallet</th>
                    <th className="px-4 py-3 text-right text-xs text-gray-500 font-semibold uppercase tracking-wider">Votes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {candidates.map((c, idx) => (
                    <tr key={c.id} className="hover:bg-white/3 transition-colors">
                      <td className="px-4 py-3 text-gray-600">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white">
                            {c.name[0]}
                          </div>
                          <span className="text-white font-medium">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-lg bg-blue-500/10 text-blue-300 text-xs font-medium border border-blue-500/20">
                          {c.province}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">
                        {c.wallet.slice(0, 8)}…{c.wallet.slice(-6)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-emerald-400 font-bold">{c.voteCount}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
