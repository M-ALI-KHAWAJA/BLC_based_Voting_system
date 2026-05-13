// ============================================================
// src/components/Loader.jsx
// Full-screen and inline loading states.
// ============================================================

import { Loader2 } from "lucide-react";

export function FullPageLoader({ message = "Loading…" }) {
  return (
    <div className="min-h-screen gradient-bg flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-2xl">
          <Loader2 size={28} className="text-white animate-spin" />
        </div>
      </div>
      <p className="text-gray-400 text-sm font-medium animate-pulse">{message}</p>
    </div>
  );
}

export function InlineLoader({ message = "Loading…", size = 20 }) {
  return (
    <div className="flex items-center gap-2 text-gray-400">
      <Loader2 size={size} className="animate-spin text-blue-400" />
      <span className="text-sm">{message}</span>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="glass rounded-2xl p-5 border border-white/5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full shimmer" />
        <div className="flex-1 space-y-2">
          <div className="h-4 shimmer rounded-lg w-3/4" />
          <div className="h-3 shimmer rounded-lg w-1/2" />
        </div>
      </div>
      <div className="h-8 shimmer rounded-xl mb-3" />
      <div className="h-9 shimmer rounded-xl" />
    </div>
  );
}

export default FullPageLoader;
