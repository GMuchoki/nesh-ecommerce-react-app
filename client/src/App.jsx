import React, { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Loader from "./components/Loader";
import { useAuth } from "./context/AuthContext";

// Public routes
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";

const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Dashboard = lazy(() => import("./pages/Dashboard"));

// Internal portals
const PosTerminal = lazy(() => import("./pages/PosTerminal"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

// Zero-Trust Gateways
const AdminLogin = lazy(() => import("./pages/auth/AdminLogin"));
const PosLogin = lazy(() => import("./pages/auth/PosLogin"));

const AdminGuard = ({ children }) => {
    const { user, profile, loading } = useAuth();
    if (loading || (user && profile === null)) return null; // Prevent race-condition flash
    if (!user) return <AdminLogin />;
    if (profile?.role === 'admin') return children;
    return (
        <div className="flex items-center justify-center h-screen bg-slate-900 overflow-hidden font-sans">
            <div className="p-8 text-center bg-red-600/10 border border-red-500 rounded-xl max-w-md w-full mx-4 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
                <div className="text-red-500 mb-2 font-mono">CRITICAL EXCEPTION 0x00A</div>
                <h1 className="text-xl font-bold text-red-500 uppercase tracking-widest mb-4">Security Breach</h1>
                <p className="text-red-400/80 mb-6 font-mono text-sm">Session role mismatch. Active session does not possess Executive Clearance for this node.</p>
                <a href="/" className="text-xs text-white bg-red-600 px-4 py-2 hover:bg-red-500 rounded font-bold uppercase transition-all tracking-wider">Evacuate to Storefront</a>
            </div>
        </div>
    );
};

const PosGuard = ({ children }) => {
    const { user, profile, loading } = useAuth();
    if (loading || (user && profile === null)) return null; // Prevent race-condition flash
    if (!user) return <PosLogin />;
    if (profile?.role === 'salesperson') return children;
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-blue-50 font-sans">
            <div className="p-8 text-center bg-white border-2 border-red-100 rounded-3xl max-w-sm w-full mx-4 shadow-xl">
                <h1 className="text-2xl font-black text-slate-800 uppercase tracking-widest mb-2">Restricted Terminal</h1>
                <p className="text-slate-500 mb-8 font-semibold">Only actively provisioned Cashiers may access this iPad's till system.</p>
                <a href="/" className="text-sm shadow-md text-white bg-slate-900 px-6 py-3 hover:bg-slate-800 rounded-xl font-bold shadow transition-all">Return Home</a>
            </div>
        </div>
    );
};

const StorefrontGuard = ({ children }) => {
    const { user, profile, loading } = useAuth();
    if (loading || (user && profile === null)) return null;
    
    if (user && profile && profile.role !== 'member') {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-50 font-sans p-4 text-center">
                 <div className="p-10 bg-white shadow-2xl rounded-3xl max-w-sm w-full border border-slate-100">
                     <h1 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-wide">Session Blocked</h1>
                     <p className="text-slate-500 mb-8 text-sm font-medium">You are currently authenticated as an internal employee. Public retail modules are strictly restricted to customer accounts.</p>
                     
                     <div className="flex flex-col gap-3">
                         {profile.role === 'admin' && (
                             <a href={import.meta.env.VITE_ADMIN_SECRET_ROUTE || "/admin"} className="w-full py-4 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all uppercase tracking-widest text-xs">Return to Command Center</a>
                         )}
                         {profile.role === 'salesperson' && (
                             <a href={import.meta.env.VITE_POS_SECRET_ROUTE || "/pos"} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all uppercase tracking-widest text-xs">Return to Cashier Till</a>
                         )}
                     </div>
                 </div>
            </div>
        );
    }
    return children;
};

const StorefrontLayout = () => {
    return (
        <StorefrontGuard>
            <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow">
                    <Suspense fallback={<Loader />}>
                        <Outlet />
                    </Suspense>
                </main>
                <Footer />
            </div>
        </StorefrontGuard>
    );
};

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Storefront Layout */}
                <Route element={<StorefrontLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                </Route>
                
                {/* Zero-Trust Proxies (Isolated Layouts) */}
                <Route path={import.meta.env.VITE_POS_SECRET_ROUTE || "/pos"} element={
                    <Suspense fallback={<Loader />}>
                        <PosGuard><PosTerminal /></PosGuard>
                    </Suspense>
                } />
                <Route path={import.meta.env.VITE_ADMIN_SECRET_ROUTE || "/admin"} element={
                    <Suspense fallback={<Loader />}>
                        <AdminGuard><AdminDashboard /></AdminGuard>
                    </Suspense>
                } />
            </Routes>
        </BrowserRouter>
    );
}

export default App;