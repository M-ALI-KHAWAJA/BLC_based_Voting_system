// ============================================================
// src/components/Navbar.jsx
// Top navigation bar with wallet connection indicator.
// ============================================================

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import WalletConnect from "./WalletConnect";
import {
  Vote,
  LayoutDashboard,
  ShieldCheck,
  BarChart3,
  Menu,
  X,
  Zap,
} from "lucide-react";

const NAV_LINKS = [
  { to: "/", label: "Home", icon: Zap },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/verify", label: "Verify", icon: ShieldCheck },
  { to: "/vote", label: "Vote", icon: Vote },
  { to: "/results", label: "Results", icon: BarChart3 },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isConnected, account, formatAddress } = useWallet();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Vote size={18} className="text-white" />
            </div>
            <span className="font-outfit font-bold text-lg tracking-tight gradient-text">
              PakVote
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-blue-500/20 text-blue-400"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Right section */}
          <div className="hidden md:flex items-center gap-3">
            {isConnected && account && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-green-400 font-mono font-medium">
                  {formatAddress(account)}
                </span>
              </div>
            )}
            <WalletConnect />
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden glass-dark border-t border-white/5 px-4 py-3 space-y-1">
          {NAV_LINKS.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-blue-500/20 text-blue-400"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-white/5">
            <WalletConnect />
          </div>
        </div>
      )}
    </nav>
  );
}
