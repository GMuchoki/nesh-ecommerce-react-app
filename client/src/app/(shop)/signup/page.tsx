"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

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
    <div className="container mx-auto py-12 flex justify-center items-center min-h-[70vh]">
      <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] w-full max-w-lg border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-red-600"></div>
        <h1 className="text-3xl font-extrabold text-[#111] mb-2 text-center mt-2">Create Account</h1>
        <p className="text-gray-500 text-center mb-8">Join NeshStore for a premium experience</p>
        <form onSubmit={handleSignup} className="flex flex-col gap-5">
          <div className="flex gap-4 flex-col sm:flex-row">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">First Name</label>
              <input type="text" required className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all bg-gray-50/50 text-[#111]" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name</label>
              <input type="text" required className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all bg-gray-50/50 text-[#111]" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
            <input type="email" required className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all bg-gray-50/50 text-[#111]" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input type="password" required minLength={6} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all bg-gray-50/50 text-[#111]" placeholder="•••••••• (Min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="mt-2 w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3.5 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed">
            {loading ? "Creating account..." : "Sign up securely"}
          </button>
          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account? <Link href="/login" className="text-red-500 font-semibold hover:underline">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
