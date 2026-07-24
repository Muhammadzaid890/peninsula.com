'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ totalAds: 0, activeAgents: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user_info');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("User parse error", e);
      }
    }

    async function loadStats() {
      try {
        const adsRes = await fetch('/api/listings');
        const adsData = await adsRes.json();

        const agentsRes = await fetch('/api/admin/agents');
        const agentsData = await agentsRes.json();

        setStats({
          totalAds: Array.isArray(adsData) ? adsData.length : 0,
          activeAgents: Array.isArray(agentsData) ? agentsData.length : 0
        });
      } catch (e) {
        console.error("Stats load error:", e);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Top Welcome Header */}
      <div className="bg-[#0A1128] text-white p-6 md:p-8 rounded-3xl border border-amber-500/20 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full">
            Portal Control Center
          </span>
          <h1 className="text-2xl md:text-3xl font-black mt-2 uppercase tracking-wide">
            Welcome, {user?.name || 'Administrator'}! 👋
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            DHA PLOTS Real Estate Portal Management Control Panel
          </p>
        </div>
        <Link 
          href="/admin/add-ad" 
          className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-[#070D1F] font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all"
        >
          ➕ Post New Listing
        </Link>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-black uppercase tracking-wider">Total Listings</span>
            <span className="text-xl">🏢</span>
          </div>
          <div className="text-3xl font-black text-[#0A1128]">
            {loading ? '...' : stats.totalAds}
          </div>
          <p className="text-[11px] font-semibold text-slate-500">Commercial & Residential Ads</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-black uppercase tracking-wider">Active Team Agents</span>
            <span className="text-xl">👥</span>
          </div>
          <div className="text-3xl font-black text-[#0A1128]">
            {loading ? '...' : stats.activeAgents}
          </div>
          <p className="text-[11px] font-semibold text-slate-500">Registered Portal Agents</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-black uppercase tracking-wider">System Role</span>
            <span className="text-xl">🛡️</span>
          </div>
          <div className="text-2xl font-black text-amber-600 capitalize">
            {user?.role || 'Admin'} Account
          </div>
          <p className="text-[11px] font-semibold text-slate-500">Full Administrative Access Authorized</p>
        </div>

      </div>

      {/* Quick Action Navigation Grid */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <h2 className="text-sm font-black uppercase tracking-wider text-[#0A1128] border-b pb-3">
          ⚡ Quick Portal Shortcuts
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link href="/admin/add-ad" className="p-4 bg-slate-50 hover:bg-amber-50 rounded-2xl border border-slate-200 text-center transition-all block">
            <div className="text-2xl mb-1">➕</div>
            <div className="text-xs font-black text-[#0A1128]">Post Listing</div>
          </Link>
          <Link href="/admin/agents" className="p-4 bg-slate-50 hover:bg-amber-50 rounded-2xl border border-slate-200 text-center transition-all block">
            <div className="text-2xl mb-1">👥</div>
            <div className="text-xs font-black text-[#0A1128]">Agents Panel</div>
          </Link>
          <Link href="/admin/wallet" className="p-4 bg-slate-50 hover:bg-amber-50 rounded-2xl border border-slate-200 text-center transition-all block">
            <div className="text-2xl mb-1">💼</div>
            <div className="text-xs font-black text-[#0A1128]">Wallet Ads</div>
          </Link>
          <Link href="/" className="p-4 bg-slate-50 hover:bg-amber-50 rounded-2xl border border-slate-200 text-center transition-all block">
            <div className="text-2xl mb-1">🌐</div>
            <div className="text-xs font-black text-[#0A1128]">View Website</div>
          </Link>
        </div>
      </div>

    </div>
  );
}