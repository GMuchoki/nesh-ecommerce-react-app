import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            toast.error(error.message);
        } else {
            toast.success("Welcome back!");
            navigate('/');
        }
        setLoading(false);
    };

    return (
        <div className="container mx-auto py-12 flex justify-center items-center min-h-[70vh]">
            <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] w-full max-w-md border border-gray-100 relative overflow-hidden">
                {/* Decorative Accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-red-600"></div>
                
                <h1 className="text-3xl font-extrabold text-[#111] mb-2 text-center mt-2">Sign In</h1>
                <p className="text-gray-500 text-center mb-8">Access your NeshStore account</p>
                
                <form onSubmit={handleLogin} className="flex flex-col gap-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                        <input 
                            type="email" 
                            required 
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all bg-gray-50/50 text-[#111]"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                        <input 
                            type="password" 
                            required 
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all bg-gray-50/50 text-[#111]"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="mt-2 w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3.5 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Entering secure portal...' : 'Log in securely'}
                    </button>
                    <p className="text-center text-sm text-gray-500 mt-4">
                        Don't have an account? <Link to="/signup" className="text-red-500 font-semibold hover:underline">Create one</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
