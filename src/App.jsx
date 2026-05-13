// ============================================================
// src/App.jsx
// Root component with React Router setup and layout.
// ============================================================

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { WalletProvider } from "./context/WalletContext";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import ManagerDashboard from "./pages/ManagerDashboard";
import VoterVerification from "./pages/VoterVerification";
import VotingPage from "./pages/VotingPage";
import Results from "./pages/Results";

export default function App() {
  return (
    <BrowserRouter>
      <WalletProvider>
        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#111827",
              color: "#f9fafb",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px",
              fontSize: "13px",
              padding: "12px 16px",
              backdropFilter: "blur(20px)",
            },
            success: {
              iconTheme: {
                primary: "#34d399",
                secondary: "#111827",
              },
            },
            error: {
              iconTheme: {
                primary: "#f87171",
                secondary: "#111827",
              },
            },
          }}
        />

        {/* Navigation */}
        <Navbar />

        {/* Page Routes */}
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/results" element={<Results />} />

          {/* Voter routes — require wallet connection */}
          <Route
            path="/verify"
            element={
              <ProtectedRoute>
                <VoterVerification />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vote"
            element={
              <ProtectedRoute>
                <VotingPage />
              </ProtectedRoute>
            }
          />

          {/* Manager-only route */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute managerOnly>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />

          {/* 404 fallback */}
          <Route
            path="*"
            element={
              <div className="min-h-screen gradient-bg flex flex-col items-center justify-center gap-4">
                <h1 className="font-outfit text-6xl font-black gradient-text">404</h1>
                <p className="text-gray-500">Page not found.</p>
                <a href="/" className="px-6 py-2.5 rounded-xl btn-primary text-white text-sm font-semibold">
                  Go Home
                </a>
              </div>
            }
          />
        </Routes>
      </WalletProvider>
    </BrowserRouter>
  );
}
