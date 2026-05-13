// ============================================================
// src/components/CountdownTimer.jsx
// Displays a live countdown to election end time.
// electionEndTime is a Unix timestamp (seconds).
// ============================================================

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

function pad(n) {
  return String(n).padStart(2, "0");
}

export default function CountdownTimer({ electionEndTime, isActive }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!electionEndTime || !isActive) {
      setTimeLeft(null);
      return;
    }

    const calc = () => {
      const now = Math.floor(Date.now() / 1000);
      const diff = Number(electionEndTime) - now;
      if (diff <= 0) return setTimeLeft({ h: 0, m: 0, s: 0, ended: true });
      setTimeLeft({
        h: Math.floor(diff / 3600),
        m: Math.floor((diff % 3600) / 60),
        s: diff % 60,
        ended: false,
      });
    };

    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [electionEndTime, isActive]);

  if (!isActive) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800/60 border border-gray-700/50">
        <Clock size={16} className="text-gray-500" />
        <span className="text-sm text-gray-500 font-medium">Election Not Active</span>
      </div>
    );
  }

  if (!timeLeft) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800/60 border border-gray-700/50">
        <Clock size={16} className="text-blue-400 animate-pulse" />
        <span className="text-sm text-gray-400">Loading timer…</span>
      </div>
    );
  }

  if (timeLeft.ended) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30">
        <Clock size={16} className="text-red-400" />
        <span className="text-sm text-red-400 font-semibold">Election Ended</span>
      </div>
    );
  }

  const urgency = timeLeft.h === 0 && timeLeft.m < 10;

  return (
    <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border ${
      urgency
        ? "bg-red-500/10 border-red-500/30"
        : "bg-blue-500/10 border-blue-500/30"
    }`}>
      <Clock size={16} className={urgency ? "text-red-400 animate-pulse" : "text-blue-400"} />
      <span className="text-xs text-gray-400 font-medium">Ends in:</span>
      <div className="flex items-center gap-1 font-mono font-bold">
        {/* Hours */}
        <span className={`text-lg ${urgency ? "text-red-400" : "text-blue-300"}`}>
          {pad(timeLeft.h)}
        </span>
        <span className="text-gray-600 text-sm">:</span>
        {/* Minutes */}
        <span className={`text-lg ${urgency ? "text-red-400" : "text-blue-300"}`}>
          {pad(timeLeft.m)}
        </span>
        <span className="text-gray-600 text-sm">:</span>
        {/* Seconds */}
        <span className={`text-lg ${urgency ? "text-red-300 animate-pulse" : "text-white"}`}>
          {pad(timeLeft.s)}
        </span>
      </div>
    </div>
  );
}
