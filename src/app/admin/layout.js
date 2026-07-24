'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Sidebar states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    // Client-side authentication check
    const savedUser = localStorage.getItem('user_info');
    const savedRole = localStorage.getItem('userRole');

    if (!savedRole || (savedRole !== 'admin' && savedRole !== 'agent')) {
      router.replace('/login');
    } else {
      try {
        setUser(savedUser ? JSON.parse(savedUser) : { role: savedRole, name: savedRole === 'admin' ? 'Admin' : 'Agent' });
      } catch (e) {
        setUser({ role: savedRole, name: savedRole === 'admin' ? 'Admin' : 'Agent' });
      }
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('user_info');
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.replace('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A1128] text-amber-400 flex items-center justify-center font-bold text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading DHA PLOTS Portal...</span>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';

  const sidebarNavItems = [
    { label: '📊 Home Matrix', href: '/', icon: '📊' },
    { label: '➕ Post Listing', href: '/admin/add-ad', icon: '➕' },
    ...(isAdmin ? [{ label: '👥 Agent Management', href: '/admin/agents', icon: '👥' }] : []),
    { label: isAdmin ? '💼 Admin Wallet' : '💼 Agent Wallet', href: '/admin/wallet', icon: '💼' },
    { label: '🚫 Inactive Ads', href: '/admin/inactive-ads', icon: '🚫' },
    { label: '🗑️ Deleted Ads', href: '/admin/trash', icon: '🗑️' },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#0F172A] font-sans flex flex-col md:flex-row">
      
      {/* MOBILE TOP TOGGLE BAR */}
      <div className="md:hidden bg-[#0A1128] text-white p-4 flex items-center justify-between border-b border-amber-500/20 sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <img src="/logo.png" alt="DHA PLOTS Logo" className="w-7 h-7 object-contain" onError={(e) => e.target.style.display='none'} />
          <span className="font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500 text-sm">
            DHA PLOTS
          </span>
        </div>
        <button 
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)} 
          className="text-lg bg-slate-800 p-2 rounded-lg border border-slate-700"
        >
          {mobileSidebarOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* 🔴 DYNAMIC COLLAPSIBLE SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 bg-[#0A1128] text-white border-r border-amber-500/20 p-4 flex flex-col justify-between transition-all duration-300 ease-in-out md:sticky md:top-0 md:h-screen
        ${sidebarCollapsed ? 'md:w-20' : 'md:w-64'}
        ${mobileSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="space-y-6">
          
          {/* Header with Logo and Custom Toggle Icon */}
          <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
            {!sidebarCollapsed && (
              <Link href="/" className="flex items-center space-x-2.5">
                <img src="/logo.png" alt="DHA PLOTS" className="w-8 h-8 object-contain" onError={(e) => e.target.style.display='none'} />
                <div>
                  <span className="text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500 block leading-none">
                    DHA PLOTS
                  </span>
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full inline-block mt-1">
                    {isAdmin ? 'Admin' : 'Agent'}
                  </span>
                </div>
              </Link>
            )}
            
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`hidden md:flex items-center justify-center p-2 rounded-xl bg-slate-800/80 hover:bg-amber-500 text-amber-400 hover:text-black transition-all border border-slate-700/80 shadow-md ${sidebarCollapsed ? 'mx-auto' : ''}`}
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {sidebarCollapsed ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="4 6 8 10 4 14" />
                  <line x1="11" y1="6" x2="20" y2="6" />
                  <line x1="11" y1="10" x2="20" y2="10" />
                  <line x1="11" y1="14" x2="20" y2="14" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="6" x2="13" y2="6" />
                  <line x1="4" y1="10" x2="13" y2="10" />
                  <line x1="4" y1="14" x2="13" y2="14" />
                  <polyline points="20 6 16 10 20 14" />
                </svg>
              )}
            </button>
          </div>

          {/* Logged User Info Badge */}
          <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-2xl flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-black flex items-center justify-center text-xs shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            {!sidebarCollapsed && (
              <div className="overflow-hidden">
                <p className="text-xs font-black text-white truncate">{user?.name || (isAdmin ? 'Admin' : 'Agent')}</p>
                <p className="text-[9px] text-amber-400 font-bold uppercase tracking-wider">{user?.role}</p>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {sidebarNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-xl text-xs font-bold transition-all ${
                    isActive 
                      ? 'bg-amber-500 text-[#0A1128] font-black shadow-lg scale-[1.02]' 
                      : 'text-gray-300 hover:bg-slate-900 hover:text-amber-400'
                  } ${sidebarCollapsed ? 'justify-center' : ''}`}
                  title={sidebarCollapsed ? item.label : ''}
                >
                  <span className="text-base">{item.icon}</span>
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

        </div>

        {/* Logout Footer */}
        <div className="border-t border-slate-800 pt-3">
          <button 
            onClick={handleLogout}
            className={`w-full py-2.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white font-bold text-xs rounded-xl border border-red-500/20 transition-all flex items-center justify-center space-x-2 ${sidebarCollapsed ? 'px-0' : ''}`}
            title="Logout"
          >
            <span>🚪</span>
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>

      </aside>

      {/* DYNAMIC CONTENT AREA */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto min-h-screen">
        {children}
      </main>

    </div>
  );
}