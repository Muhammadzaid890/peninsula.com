'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        // Save session details to LocalStorage
        localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('user_info', JSON.stringify(data.user));

        // Hard redirect so Next.js Admin Sidebar Layout initializes cleanly
        window.location.href = '/admin';
      } else {
        setErrorMessage(data.error || 'Invalid email or password. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Network error. Unable to connect to authorization server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070D1F] text-white flex flex-col justify-between font-sans selection:bg-amber-500 selection:text-black">
      
      {/* Background Subtle Glow Accent */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-amber-500/10 blur-[140px] pointer-events-none rounded-full"></div>

      {/* Top Header Link */}
      <header className="p-6 max-w-7xl mx-auto w-full flex justify-between items-center z-10">
        <a href="/" className="text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
          PENINSULA COMMERCIAL
        </a>
        <a 
          href="/" 
          className="text-xs font-extrabold uppercase tracking-widest text-slate-400 hover:text-amber-400 transition-colors flex items-center space-x-1"
        >
          <span>← Back to Website</span>
        </a>
      </header>

      {/* Main Login Card Section */}
      <main className="flex-1 flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-md bg-[#0A1128]/80 backdrop-blur-xl border border-amber-500/20 rounded-3xl p-8 md:p-10 shadow-2xl shadow-black/60 relative space-y-8">
          
          {/* Card Header Branding */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xl mb-2">
              🔐
            </div>
            <h1 className="text-2xl font-black uppercase tracking-wider text-white">
              Portal Authentication
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Enter your credentials to access Admin or Agent Panel
            </p>
          </div>

          {/* Error Banner Notification */}
          {errorMessage && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs font-bold text-center animate-in fade-in zoom-in-95 duration-200">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleLogin} className="space-y-5">
            
            {/* Email Input */}
            <div className="space-y-1">
              <label className="block text-[11px] font-black uppercase tracking-widest text-slate-300">
                Email Address
              </label>
              <div className="relative flex items-center">
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="agent@peninsula.com" 
                  className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-amber-500 text-slate-100 placeholder-slate-500 text-xs font-semibold rounded-2xl px-4 py-3.5 outline-none transition-all focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative flex items-center">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••" 
                  className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-amber-500 text-slate-100 placeholder-slate-500 text-xs font-semibold rounded-2xl px-4 py-3.5 pr-12 outline-none transition-all focus:ring-2 focus:ring-amber-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-xs font-black text-slate-400 hover:text-amber-400 focus:outline-none transition-colors uppercase tracking-wider"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-[#070D1F] font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-amber-500/20 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mt-4"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#070D1F] border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Authorize & Login →</span>
              )}
            </button>

          </form>

          {/* Security Assurance Badge */}
          <div className="pt-2 border-t border-slate-800/80 text-center">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center justify-center space-x-1">
              <span>🛡️ Encrypted End-To-End Authentication</span>
            </p>
          </div>

        </div>
      </main>

      {/* Footer Branding */}
      <footer className="p-6 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest z-10">
        © {new Date().getFullYear()} Peninsula Commercial. Built by Earth Developer's
      </footer>

    </div>
  );
}