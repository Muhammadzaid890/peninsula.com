'use client';

import { useState, useEffect } from 'react';

export default function WalletPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Custom Professional Modal State
  const [deleteModal, setDeleteModal] = useState({ open: false, agentId: null, agentName: '' });
  const [deleting, setDeleting] = useState(false);

  // 1. Fetch Agents
  const fetchAgentsAndCredits = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/agents');
      if (res.ok) {
        const data = await res.json();
        setAgents(data);
      }
    } catch (err) {
      console.error("Agents fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentsAndCredits();
  }, []);

  // 2. Add / Subtract Credits (Backend Sync)
  const handleUpdateCredit = async (agentId, agentName, action) => {
    try {
      const res = await fetch('/api/admin/update-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, action }),
      });

      if (res.ok) {
        setAgents(prev => prev.map(ag => {
          if (ag.id === agentId) {
            const currentCredits = ag.ad_credits || 0;
            const newCredits = action === 'increment' 
              ? currentCredits + 1 
              : Math.max(0, currentCredits - 1);
            return { ...ag, ad_credits: newCredits };
          }
          return ag;
        }));

        setMessage(`✅ ${agentName} ka quota ${action === 'increment' ? '+1 update' : '-1 deduct'} ho gaya!`);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ Credit update nahi ho saka.');
      }
    } catch (err) {
      setMessage('❌ Network connection error');
    }
  };

  // 3. Confirm Delete Agent (Backend API Call)
  const confirmDeleteAgent = async () => {
    if (!deleteModal.agentId) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/delete-agent?id=${deleteModal.agentId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setAgents(prev => prev.filter(ag => ag.id !== deleteModal.agentId));
        setMessage(`🗑️ Agent "${deleteModal.agentName}" backend database se delete ho gaya!`);
        setTimeout(() => setMessage(''), 3500);
      } else {
        setMessage('❌ Delete karne mein masla aya.');
      }
    } catch (err) {
      setMessage('❌ Network error');
    } finally {
      setDeleting(false);
      setDeleteModal({ open: false, agentId: null, agentName: '' });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      
      {/* Header Banner */}
      <div className="bg-[#0A1128] text-white p-6 md:p-8 rounded-3xl border border-amber-500/20 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Quota Control Center
          </span>
          <h1 className="text-xl md:text-2xl font-black text-amber-400 uppercase tracking-wide mt-2">
            💼 Agent Wallet & Ad Limits
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Assign ad posting quotas and delete agents permanently from backend.
          </p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl text-xs font-bold text-center border shadow-sm transition-all ${
          message.includes('✅') || message.includes('🗑️')
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Agents Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-sm font-black uppercase tracking-wider text-[#0A1128]">
            👥 Registered Team Agents
          </h2>
          <span className="text-xs font-bold text-slate-500">
            Total Active: <span className="text-amber-600 font-black">{agents.length}</span>
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs font-bold text-slate-400 animate-pulse">
            Loading agent wallet credits...
          </div>
        ) : agents.length === 0 ? (
          <div className="py-12 text-center text-xs font-bold text-slate-400 border-2 border-dashed rounded-2xl">
            Koi agent nahi mila.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[650px]">
              <thead>
                <tr className="bg-[#0A1128] text-amber-400 uppercase text-[10px] tracking-widest">
                  <th className="p-4 rounded-tl-xl">Agent Detail</th>
                  <th className="p-4">Phone / WhatsApp</th>
                  <th className="p-4 text-center">Ad Quota Left</th>
                  <th className="p-4 text-center">Quota Actions</th>
                  <th className="p-4 text-center rounded-tr-xl">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {agents.map((ag) => {
                  const credits = ag.ad_credits || 0;

                  return (
                    <tr key={ag.id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="p-4">
                        <div className="font-black text-slate-900 text-sm">{ag.name}</div>
                        <div className="text-slate-500 text-[11px] font-medium">{ag.email}</div>
                      </td>
                      <td className="p-4 font-bold text-emerald-600">
                        📞 {ag.phone || 'N/A'}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1.5 rounded-xl font-black text-xs border ${
                          credits > 0 ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {credits} {credits === 1 ? 'Ad' : 'Ads'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleUpdateCredit(ag.id, ag.name, 'decrement')}
                            disabled={credits <= 0}
                            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-red-500 hover:text-white text-slate-700 font-black text-base border border-slate-200 flex items-center justify-center transition-all disabled:opacity-30 cursor-pointer active:scale-95"
                            title="Deduct 1 Quota"
                          >
                            ➖
                          </button>
                          <button
                            onClick={() => handleUpdateCredit(ag.id, ag.name, 'increment')}
                            className="w-9 h-9 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#070F2B] font-black text-base border border-amber-600/30 flex items-center justify-center transition-all cursor-pointer active:scale-95"
                            title="Add 1 Quota"
                          >
                            ➕
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setDeleteModal({ open: true, agentId: ag.id, agentName: ag.name })}
                          className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white font-black text-sm border border-red-200 flex items-center justify-center transition-all mx-auto cursor-pointer active:scale-95"
                          title="Delete Agent"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 🔴 PROFESSIONAL GLASSMORPHIC DELETE POPUP MODAL */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0A1128] border border-red-500/30 max-w-md w-full rounded-3xl p-6 md:p-8 shadow-2xl text-center text-white space-y-5 relative">
            <div className="w-16 h-16 bg-red-500/20 border border-red-500/40 text-red-400 rounded-full flex items-center justify-center mx-auto text-3xl">
              🗑️
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Delete Agent Permanently?</h3>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Kya aap waqai <span className="text-amber-400 font-bold">"{deleteModal.agentName}"</span> ko database se delete karna chahte hain? Yeh action revert nahi hoga.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setDeleteModal({ open: false, agentId: null, agentName: '' })}
                disabled={deleting}
                className="py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase rounded-xl border border-slate-700 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAgent}
                disabled={deleting}
                className="py-3 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}