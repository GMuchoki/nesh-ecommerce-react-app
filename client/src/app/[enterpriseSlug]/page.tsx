"use client";

import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// Admin Portal
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Smartphone, LogIn } from "lucide-react";
import AdminDashboardClient from "@/components/AdminDashboardClient";
import PosTerminalClient from "@/components/PosTerminalClient";

const ADMIN_ROUTE = process.env.NEXT_PUBLIC_ADMIN_SECRET_ROUTE || "admin";
const POS_ROUTE = process.env.NEXT_PUBLIC_POS_SECRET_ROUTE || "pos";

export default function EnterpriseGateway() {
  const { enterpriseSlug } = useParams<{ enterpriseSlug: string }>();
  const { user, profile, loading } = useAuth();
  const supabase = createClient();

  // --- State for both login forms ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  if (loading) return null;

  // ──────────────────── ADMIN PORTAL ────────────────────
  if (enterpriseSlug === ADMIN_ROUTE) {
    // If already authenticated as admin → show dashboard
    if (user && profile?.role === "admin") return <AdminDashboardClient />;

    const handleAdminLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoginLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { toast.error("Access Denied: Invalid Credentials."); setLoginLoading(false); return; }
      const { data: prof } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
      if (prof?.role !== "admin") {
        await supabase.auth.signOut();
        toast.error("TERMINAL LOCKOUT: You do not possess Executive clearance.");
      } else {
        toast.success("Authorization Confirmed. Accessing Command Center...");
      }
      setLoginLoading(false);
    };

    return (
      <div className="flex justify-center items-center h-screen w-full bg-[#0a0a0a] text-slate-200">
        <div className="bg-[#111111] p-10 rounded-2xl border border-slate-800/60 shadow-2xl w-full max-w-md relative flex flex-col items-center">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-rose-500 to-orange-500"></div>
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mb-4 shadow-inner"><span className="text-3xl font-black text-rose-500">N</span></div>
            <h1 className="text-xl font-bold tracking-widest uppercase text-slate-100">Enterprise Core</h1>
            <p className="text-xs text-rose-500/80 font-mono tracking-widest mt-2 uppercase">Executive Clearance Required</p>
          </div>
          <form onSubmit={handleAdminLogin} className="w-full flex flex-col gap-6">
            <div>
              <label className="block text-[10px] font-mono text-slate-500 mb-2 uppercase tracking-widest">Global Identifier</label>
              <input type="email" required className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700/50 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50 transition-all text-slate-200 font-mono text-sm" placeholder="admin@neshstore.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-slate-500 mb-2 uppercase tracking-widest">Access Key</label>
              <input type="password" required className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700/50 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50 transition-all text-slate-200 font-mono tracking-widest text-lg" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button type="submit" disabled={loginLoading} className="mt-4 w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-4 rounded-xl shadow-[0_0_15px_rgba(225,29,72,0.3)] hover:shadow-[0_0_25px_rgba(225,29,72,0.5)] transition-all uppercase tracking-widest text-xs disabled:opacity-50">
              {loginLoading ? "Decrypting..." : "Initiate Override"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ──────────────────── POS TERMINAL ────────────────────
  if (enterpriseSlug === POS_ROUTE) {
    if (user && profile?.role === "salesperson") return <PosTerminalClient />;

    const handlePosLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoginLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { toast.error("Incorrect Agent PIN or Email."); setLoginLoading(false); return; }
      const { data: prof } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
      if (prof?.role !== "salesperson") {
        await supabase.auth.signOut();
        toast.error("SYSTEM LOCK: This iPad is restricted to Cashier personnel only.");
      } else {
        toast.success("Agent Verified. Loading Nexus Terminal...");
      }
      setLoginLoading(false);
    };

    return (
      <div className="flex justify-center items-center h-screen w-full bg-blue-50">
        <div className="bg-white p-10 rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] w-full max-w-sm border border-blue-100 flex flex-col items-center">
          <div className="w-20 h-20 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 mb-6"><Smartphone size={32} /></div>
          <h1 className="text-2xl font-extrabold text-slate-800">Terminal Access</h1>
          <p className="text-sm font-semibold text-slate-400 mb-8 uppercase tracking-wider">Swipe or Type Credentials</p>
          <form onSubmit={handlePosLogin} className="w-full flex flex-col gap-4">
            <input type="email" required className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:outline-none focus:border-blue-500 transition-all font-bold text-center text-slate-700 placeholder:text-slate-300 placeholder:font-medium" placeholder="Agent Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" required className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:outline-none focus:border-blue-500 transition-all font-black text-center text-3xl tracking-widest text-slate-800 placeholder:text-slate-300 placeholder:tracking-normal placeholder:font-semibold placeholder:text-base" placeholder="Enter Secret Passkey" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit" disabled={loginLoading} className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-4 rounded-2xl shadow-xl shadow-blue-600/20 transition-all disabled:opacity-50">
              <LogIn size={20} /> {loginLoading ? "Authenticating..." : "Unlock Terminal"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ──────────────────── 404 ────────────────────
  return (
    <div className="flex justify-center items-center h-screen bg-slate-50">
      <div className="text-center">
        <h1 className="text-6xl font-black text-slate-200 mb-4">404</h1>
        <p className="text-slate-500">The page you&apos;re looking for doesn&apos;t exist.</p>
      </div>
    </div>
  );
}
