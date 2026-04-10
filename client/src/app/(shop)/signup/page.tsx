"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

export default function SignupPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { first_name: firstName, last_name: lastName } },
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Account created successfully!");
      router.push("/");
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: "500px" }}>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join NeshStore for a premium experience</p>
        <form onSubmit={handleSignup} className="flex flex-col gap-5">
          <div className="flex gap-4 flex-col sm:flex-row">
            <div className="flex-1">
              <label className="form-label">First Name</label>
              <input type="text" required className="form-input" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="form-label">Last Name</label>
              <input type="text" required className="form-input" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="form-label">Email Address</label>
            <input type="email" required className="form-input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Password</label>
            <input type="password" required minLength={6} className="form-input" placeholder="•••••••• (Min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 mt-2 text-base" style={{ borderRadius: "0.75rem" }}>
            <UserPlus size={18} /> {loading ? "Creating account..." : "Create Account"}
          </button>
          <p className="text-center text-sm" style={{ color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold hover:underline" style={{ color: "var(--accent)" }}>Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
