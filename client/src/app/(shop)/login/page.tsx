"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    // Zero-Trust Boundary
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", authData.user.id).single();
    if (profile?.role === "admin" || profile?.role === "salesperson") {
      await supabase.auth.signOut();
      toast.error("Staff accounts must authenticate via secure internal routing.");
      setLoading(false);
      return;
    }

    toast.success("Welcome back!");
    router.push("/");
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your NeshStore account</p>
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <label className="form-label">Email Address</label>
            <input type="email" required className="form-input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Password</label>
            <input type="password" required className="form-input" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 mt-2 text-base" style={{ borderRadius: "0.75rem" }}>
            <LogIn size={18} /> {loading ? "Signing in..." : "Sign In"}
          </button>
          <p className="text-center text-sm" style={{ color: "var(--text-muted)" }}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold hover:underline" style={{ color: "var(--accent)" }}>Create one</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
