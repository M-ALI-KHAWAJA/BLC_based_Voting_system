// src/pages/VoterVerification.jsx — updated for real contract ABI
//
// Real ABI differences:
//   verifyVoter(cnic)              → registerVoter(string _cnic, string _province)
//   hasVoted(address)              → voters(address).hasVoted
//   isCNICUsed(cnic)               → usedCNIC(cnic)  [mapping: string→bool]
//
// Province is passed as a STRING name (not an ID number) to registerVoter.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import WalletConnect from "../components/WalletConnect";
import toast from "react-hot-toast";
import { ShieldCheck, MapPin, CreditCard, ArrowRight, Loader2, AlertCircle, CheckCircle2, Info } from "lucide-react";

// Province mapping from CNIC first digit → province name string
const PROVINCE_MAP = {
  "1": { name: "KPK", color: "from-blue-500 to-cyan-500" },
  "2": { name: "Former FATA", color: "from-purple-500 to-pink-500" },
  "3": { name: "Punjab", color: "from-orange-500 to-yellow-500" },
  "4": { name: "Sindh", color: "from-green-500 to-teal-500" },
  "5": { name: "Baluchistan", color: "from-red-500 to-orange-500" },
  "6": { name: "Islamabad", color: "from-indigo-500 to-blue-500" },
  "7": { name: "Gilgit Baltistan", color: "from-emerald-500 to-green-600" },
};

function formatCNIC(raw) {
  const digits = raw.replace(/\D/g, "").slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}

export default function VoterVerification() {
  const navigate = useNavigate();
  const { isConnected, contract, account } = useWallet();

  const [cnic, setCnic] = useState("");
  const [province, setProvince] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [step, setStep] = useState(1);

  const handleCNICChange = (e) => {
    const formatted = formatCNIC(e.target.value);
    setCnic(formatted);
    const firstDigit = formatted.replace(/\D/g, "")[0];
    setProvince(firstDigit && PROVINCE_MAP[firstDigit] ? PROVINCE_MAP[firstDigit] : null);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const rawCnic = cnic.replace(/\D/g, "");
    if (rawCnic.length !== 13) return toast.error("Enter a valid 13-digit CNIC.");
    if (!isConnected || !account) return toast.error("Connect your wallet first.");
    if (!contract) return toast.error("Contract not loaded.");

    const firstDigit = rawCnic[0];
    if (!PROVINCE_MAP[firstDigit]) return toast.error("Invalid CNIC — first digit must be 1–7.");
    const provinceName = PROVINCE_MAP[firstDigit].name;

    setVerifying(true);
    const tid = toast.loading("Verifying voter on blockchain…");

    try {
      // Real ABI checks:
      //   voters(address) returns struct {isRegistered, hasVoted, isCandidate, province, votedCandidateId}
      //   usedCNIC(string) returns bool
      const [voterData, cnicUsed] = await Promise.all([
        contract.voters(account),
        contract.usedCNIC(cnic),  // pass formatted CNIC as stored
      ]);

      if (voterData.hasVoted) {
        toast.error("This wallet has already voted.", { id: tid });
        return;
      }
      if (cnicUsed) {
        toast.error("This CNIC has already been used.", { id: tid });
        return;
      }

      // Real ABI: registerVoter(string _cnic, string _province)
      // Province is passed as a STRING NAME, not an ID
      const tx = await contract.registerVoter(cnic, provinceName);
      toast.loading("Transaction pending…", { id: tid });
      await tx.wait();

      toast.success("Voter registered successfully! Proceeding to vote…", { id: tid });
      setStep(3);

      sessionStorage.setItem("voterProvince", JSON.stringify({
        name: provinceName,
        id: Number(firstDigit),
        cnic,
      }));

      setTimeout(() => navigate("/vote"), 1500);
    } catch (err) {
      const msg = err.reason || err.message || "Verification failed.";
      toast.error(msg.length > 100 ? msg.slice(0, 100) + "…" : msg, { id: tid });
    } finally {
      setVerifying(false);
    }
  };

  const rawCNIC = cnic.replace(/\D/g, "");
  const cnicValid = rawCNIC.length === 13;

  return (
    <div className="min-h-screen gradient-bg pt-20 pb-12 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-2xl mb-4 float-anim">
            <ShieldCheck size={30} className="text-white" />
          </div>
          <h1 className="font-outfit text-3xl font-black text-white mb-2">Voter Verification</h1>
          <p className="text-gray-500 text-sm">Connect your MetaMask wallet and enter your CNIC to register as a voter.</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[{ num: 1, label: "Connect Wallet" }, { num: 2, label: "Enter CNIC" }, { num: 3, label: "Registered" }].map(({ num, label }, i) => (
            <div key={num} className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${(num === 1 && isConnected) || step >= num ? "bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-lg" : "bg-gray-800 text-gray-600 border border-gray-700"}`}>
                  {(num === 1 && isConnected) || step > num ? <CheckCircle2 size={16} /> : num}
                </div>
                <span className="text-xs text-gray-600 hidden sm:block">{label}</span>
              </div>
              {i < 2 && <div className={`w-8 sm:w-16 h-0.5 mb-4 transition-colors ${step > num || (num === 1 && isConnected) ? "bg-blue-500" : "bg-gray-800"}`} />}
            </div>
          ))}
        </div>

        {/* Main Card */}
        <div className="glass rounded-3xl p-8 border border-white/8 glow-blue">

          {/* Step 1: Connect Wallet */}
          {!isConnected && (
            <div className="text-center space-y-4">
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-left">
                <div className="flex items-start gap-2">
                  <Info size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-300">You need a MetaMask wallet to participate. Your wallet address serves as your unique voter ID.</p>
                </div>
              </div>
              <WalletConnect className="w-full py-3 text-base rounded-2xl justify-center" />
            </div>
          )}

          {/* Step 2: CNIC Form */}
          {isConnected && step < 3 && (
            <form onSubmit={handleVerify} className="space-y-5">
              {/* Connected wallet badge */}
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-300 font-mono truncate">{account}</span>
              </div>

              {/* CNIC Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <CreditCard size={14} className="inline mr-1.5 text-blue-400" />
                  CNIC Number
                </label>
                <input
                  type="text"
                  value={cnic}
                  onChange={handleCNICChange}
                  placeholder="00000-0000000-0"
                  maxLength={15}
                  className="w-full px-4 py-3.5 rounded-xl bg-gray-900/60 border border-gray-700/50 text-white text-lg font-mono tracking-widest placeholder-gray-700 focus:outline-none focus:border-blue-500/60 transition-all"
                />
                <p className="text-xs text-gray-600 mt-1.5">Enter your 13-digit CNIC — province assigned from first digit.</p>
              </div>

              {/* Province Preview */}
              {province && rawCNIC.length >= 1 && (
                <div className={`p-4 rounded-xl bg-gradient-to-r ${province.color} bg-opacity-10 border border-white/10`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${province.color} flex items-center justify-center`}>
                      <MapPin size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Assigned Province</p>
                      <p className="text-white font-bold font-outfit text-lg">{province.name}</p>
                    </div>
                    <CheckCircle2 size={20} className="text-green-400 ml-auto" />
                  </div>
                </div>
              )}

              {/* Warning */}
              <div className="flex items-start gap-2 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/15">
                <AlertCircle size={14} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-500/80">Ensure your CNIC is correct. Once registered on-chain, you cannot change your province.</p>
              </div>

              <button type="submit" disabled={!cnicValid || verifying} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl btn-primary text-white font-semibold text-sm shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
                {verifying ? (
                  <><Loader2 size={16} className="animate-spin" /> Registering on Blockchain…</>
                ) : (
                  <><ShieldCheck size={16} /> Register & Proceed to Vote <ArrowRight size={14} /></>
                )}
              </button>
            </form>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} className="text-emerald-400" />
              </div>
              <h3 className="font-outfit text-xl font-bold text-white">Voter Registered!</h3>
              <p className="text-gray-400 text-sm">Redirecting you to the voting booth…</p>
              <div className="flex justify-center">
                <Loader2 size={20} className="animate-spin text-blue-400" />
              </div>
            </div>
          )}
        </div>

        {/* Province Reference Table */}
        <div className="mt-6 glass rounded-2xl p-4 border border-white/5">
          <h3 className="text-xs text-gray-600 font-semibold uppercase tracking-widest mb-3">CNIC Province Mapping</h3>
          <div className="grid grid-cols-2 gap-1.5">
            {Object.entries(PROVINCE_MAP).map(([digit, prov]) => (
              <div key={digit} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${rawCNIC[0] === digit ? "bg-blue-500/20 border border-blue-500/30" : "bg-white/3 border border-white/5"}`}>
                <span className="text-blue-400 font-bold font-mono text-sm w-4">{digit}</span>
                <span className="text-gray-400 text-xs">→</span>
                <span className={`text-xs font-medium ${rawCNIC[0] === digit ? "text-blue-200" : "text-gray-500"}`}>{prov.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
