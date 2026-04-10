import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { toast } from 'sonner';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleExecutiveLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            toast.error("Access Denied: Invalid Credentials.");
            setLoading(false);
            return;
        }
        
        // Strict Role Validation Array
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
        
        if (profile?.role !== 'admin') {
            await supabase.auth.signOut();
            toast.error("TERMINAL LOCKOUT: You do not possess Executive clearance.");
        } else {
            toast.success("Authorization Confirmed. Accessing Command Center...");
            // Because React AuthContext is globally listening, the state updates automatically, and App.jsx will unhide the dashboard!
        }
        setLoading(false);
    };

    return (
        <div className="flex justify-center items-center h-screen w-full bg-[#0a0a0a] text-slate-200">
            <div className="bg-[#111111] p-10 rounded-2xl border border-slate-800/60 shadow-2xl w-full max-w-md relative flex flex-col items-center">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-rose-500 to-orange-500"></div>
                 
                 <div className="mb-8 flex flex-col items-center text-center">
                     <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                         <span className="text-3xl font-black text-rose-500">N</span>
                     </div>
                     <h1 className="text-xl font-bold tracking-widest uppercase text-slate-100">Enterprise Core</h1>
                     <p className="text-xs text-rose-500/80 font-mono tracking-widest mt-2 uppercase">Executive Clearance Required</p>
                 </div>
                 
                 <form onSubmit={handleExecutiveLogin} className="w-full flex flex-col gap-6">
                     <div>
                         <label className="block text-[10px] font-mono text-slate-500 mb-2 uppercase tracking-widest">Global Identifier</label>
                         <input 
                             type="email" 
                             required 
                             className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700/50 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50 transition-all text-slate-200 font-mono text-sm"
                             placeholder="admin@neshstore.com"
                             value={email}
                             onChange={(e) => setEmail(e.target.value)}
                         />
                     </div>
                     <div>
                         <label className="block text-[10px] font-mono text-slate-500 mb-2 uppercase tracking-widest">Access Key</label>
                         <input 
                             type="password" 
                             required 
                             className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700/50 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50 transition-all text-slate-200 font-mono tracking-widest text-lg"
                             placeholder="••••••••"
                             value={password}
                             onChange={(e) => setPassword(e.target.value)}
                         />
                     </div>
                     <button 
                         type="submit" 
                         disabled={loading}
                         className="mt-4 w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-4 rounded-xl shadow-[0_0_15px_rgba(225,29,72,0.3)] hover:shadow-[0_0_25px_rgba(225,29,72,0.5)] transition-all uppercase tracking-widest text-xs disabled:opacity-50"
                     >
                         {loading ? 'Decrypting...' : 'Initiate Override'}
                     </button>
                 </form>
            </div>
        </div>
    );
};

export default AdminLogin;
