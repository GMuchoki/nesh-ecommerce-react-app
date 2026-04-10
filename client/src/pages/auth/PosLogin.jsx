import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { toast } from 'sonner';
import { Smartphone, LogIn } from 'lucide-react';

const PosLogin = () => {
    const [pin, setPin] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePosLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: pin });
        if (error) {
            toast.error("Incorrect Agent PIN or Email.");
            setLoading(false);
            return;
        }
        
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
        
        if (profile?.role !== 'salesperson') {
            await supabase.auth.signOut();
            toast.error("SYSTEM LOCK: This iPad is restricted to Cashier personnel only.");
        } else {
            toast.success("Agent Verified. Loading Nexus Terminal...");
        }
        setLoading(false);
    };

    return (
        <div className="flex justify-center items-center h-screen w-full bg-blue-50">
            <div className="bg-white p-10 rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] w-full max-w-sm border border-blue-100 flex flex-col items-center">
                 <div className="w-20 h-20 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 mb-6">
                    <Smartphone size={32} />
                 </div>
                 
                 <h1 className="text-2xl font-extrabold text-slate-800">Terminal Access</h1>
                 <p className="text-sm font-semibold text-slate-400 mb-8 uppercase tracking-wider">Swipe or Type Credentials</p>
                 
                 <form onSubmit={handlePosLogin} className="w-full flex flex-col gap-4">
                     <input 
                         type="email" 
                         required 
                         className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:outline-none focus:border-blue-500 transition-all font-bold text-center text-slate-700 placeholder:text-slate-300 placeholder:font-medium"
                         placeholder="Agent Email"
                         value={email}
                         onChange={(e) => setEmail(e.target.value)}
                     />
                     <input 
                         type="password" 
                         required 
                         className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:outline-none focus:border-blue-500 transition-all font-black text-center text-3xl tracking-widest text-slate-800 placeholder:text-slate-300 placeholder:tracking-normal placeholder:font-semibold placeholder:text-base"
                         placeholder="Enter Secret Passkey"
                         value={pin}
                         onChange={(e) => setPin(e.target.value)}
                     />
                     <button 
                         type="submit" 
                         disabled={loading}
                         className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-4 rounded-2xl shadow-xl shadow-blue-600/20 transition-all disabled:opacity-50"
                     >
                         <LogIn size={20} />
                         {loading ? 'Authenticating...' : 'Unlock Terminal'}
                     </button>
                 </form>
            </div>
        </div>
    );
};

export default PosLogin;
