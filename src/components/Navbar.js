'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showContactPopup, setShowContactPopup] = useState(false);

  const [adminConfig, setAdminConfig] = useState({
    displayPhone: '03331234201',
    phone: '03331234201'
  });

  useEffect(() => {
    const savedRole = localStorage.getItem('userRole');
    if (savedRole && (savedRole === 'admin' || savedRole === 'agent')) {
      setIsLoggedIn(true);
    }

    const storedConfig = localStorage.getItem('admin_profile_config');
    if (storedConfig) {
      try {
        setAdminConfig(JSON.parse(storedConfig));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // ⚡ HARD NAVIGATION FOR ADMIN DASHBOARD
  const goToAdmin = (e) => {
    if (e) e.preventDefault();
    setMobileMenuOpen(false);
    window.location.href = '/admin';
  };

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Residential', href: '/residential' },
    { label: 'Commercial', href: '/commercial' },
  ];

  return (
    <>
      {/* 🌟 GLASSMORPHISM NAVBAR BAR */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#0A1128]/75 border-b border-amber-500/20 shadow-lg shadow-black/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Branding */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
              <img src="/logo.png" alt="DHA PLOTS Logo" className="relative w-9 h-9 object-contain" onError={(e) => e.target.style.display='none'} />
            </div>
            <span className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500">
              DHA PLOTS
            </span>
          </Link>

          {/* Desktop Glass Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-900/40 p-1.5 rounded-full border border-white/10 backdrop-blur-lg">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-[#070F2B] shadow-md shadow-amber-500/20'
                      : 'text-gray-300 hover:text-amber-400 hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <button
              onClick={() => setShowContactPopup(true)}
              className="px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest text-gray-300 hover:text-amber-400 hover:bg-white/5 transition-all duration-300"
            >
              Contact
            </button>
          </nav>

          {/* Desktop Right Action */}
          <div className="hidden md:flex items-center space-x-3">
            {isLoggedIn ? (
              <button
                onClick={goToAdmin}
                className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-[#070F2B] font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-amber-500/10 flex items-center gap-1.5 cursor-pointer"
              >
                <span>📊</span> Portal Dashboard
              </button>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 text-amber-400 font-black text-xs uppercase tracking-wider rounded-xl border border-amber-500/30 transition-all backdrop-blur-md"
              >
                🔐 Login
              </Link>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-amber-400 bg-slate-800/60 rounded-xl border border-slate-700/60 backdrop-blur-md"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Dropdown Glass Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0A1128]/95 backdrop-blur-2xl border-b border-amber-500/20 px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider ${
                    pathname === link.href ? 'bg-amber-500 text-[#070F2B]' : 'text-gray-200 hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={() => { setShowContactPopup(true); setMobileMenuOpen(false); }}
                className="text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-gray-200 hover:bg-white/5"
              >
                Contact
              </button>
            </div>

            <div className="pt-2 border-t border-slate-800">
              {isLoggedIn ? (
                <button
                  onClick={goToAdmin}
                  className="w-full text-center py-3 bg-amber-500 text-[#070F2B] font-black text-xs uppercase rounded-xl cursor-pointer"
                >
                  📊 Open Admin Dashboard
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center py-3 bg-slate-800 text-amber-400 font-black text-xs uppercase rounded-xl border border-amber-500/30"
                >
                  🔐 Login to Portal
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Contact Glass Modal */}
      {showContactPopup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
          <div className="bg-[#0A1128]/90 border border-amber-500/30 max-w-sm w-full rounded-3xl p-8 shadow-2xl relative text-center text-white backdrop-blur-xl">
            <button
              onClick={() => setShowContactPopup(false)}
              className="absolute top-4 right-5 text-gray-400 hover:text-amber-400 font-bold text-lg"
            >
              ✕
            </button>
            <div className="w-16 h-16 bg-amber-500/20 border border-amber-500/40 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              📞
            </div>
            <h3 className="text-xl font-black text-white">DHA PLOTS Representative</h3>
            <p className="text-gray-400 text-xs font-semibold mt-2 mb-6">Call directly for Phase 8 inquiries</p>
            <a
              href={`tel:+${adminConfig.phone}`}
              className="block w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-[#070F2B] font-black rounded-xl text-lg shadow-lg shadow-amber-500/20 hover:from-amber-500 hover:to-amber-600 transition-all"
            >
              {adminConfig.displayPhone}
            </a>
          </div>
        </div>
      )}
    </>
  );
}