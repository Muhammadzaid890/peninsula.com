'use client';

import { useState, useEffect } from 'react';

export default function InactiveAdsPage() {
  const [pendingAds, setPendingAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('agent');
  const [message, setMessage] = useState('');

  const fetchInactiveAds = async () => {
    setLoading(true);
    try {
      const role = localStorage.getItem('userRole') || 'agent';
      setUserRole(role);

      const res = await fetch('/api/listings/inactive');
      if (res.ok) {
        const data = await res.json();
        setPendingAds(data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInactiveAds();
  }, []);

  // Admin Approve Action
  const handleApprove = async (adId, title) => {
    try {
      const res = await fetch('/api/listings/approve', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: adId, status: 'active' })
      });

      if (res.ok) {
        setPendingAds(prev => prev.filter(ad => ad.id !== adId));
        setMessage(`🎉 "${title}" ko approve karke Live/Active kar diya gaya hai!`);
        setTimeout(() => setMessage(''), 3500);
      }
    } catch (err) {
      setMessage('❌ Approval error');
    }
  };

  // Admin / Agent Delete Action
  const handleDelete = async (adId, title) => {
    if (!window.confirm(`Kya aap "${title}" ko delete karna chahte hain?`)) return;

    try {
      const res = await fetch(`/api/listings?id=${adId}`, { method: 'DELETE' });
      if (res.ok) {
        setPendingAds(prev => prev.filter(ad => ad.id !== adId));
        setMessage(`🗑️ Ad "${title}" delete ho gaya.`);
        setTimeout(() => setMessage(''), 3500);
      }
    } catch (err) {
      setMessage('❌ Deletion error');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      
      {/* Header Banner */}
      <div className="bg-[#0A1128] text-white p-6 rounded-3xl border border-amber-500/20 shadow-xl flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Approval Management
          </span>
          <h1 className="text-xl md:text-2xl font-black text-amber-400 uppercase tracking-wide mt-1.5">
            ⏳ Pending & Inactive Listings
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            {userRole === 'admin' 
              ? 'Approve or delete pending ads posted by agents with zero quota limit.' 
              : 'Track your posted ads waiting for Admin approval.'}
          </p>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-2xl text-xs font-bold text-center border shadow-sm bg-emerald-50 text-emerald-800 border-emerald-200">
          {message}
        </div>
      )}

      {/* Ads Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs font-bold text-slate-400 animate-pulse">
          Loading pending listings...
        </div>
      ) : pendingAds.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border text-center text-xs text-slate-400 font-bold shadow-sm">
          <span className="text-3xl block mb-2">✅</span>
          Koi pending ya inactive ad nahi hai. Sab listings approved hain!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingAds.map((ad) => (
            <div key={ad.id} className="bg-white border border-slate-200/80 rounded-3xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-black px-2.5 py-1 rounded-full border border-amber-200">
                    ⏳ Pending Approval
                  </span>
                  <span className="text-xs font-black text-slate-900">Rs {ad.price}</span>
                </div>

                <h3 className="font-black text-slate-900 text-base">{ad.title}</h3>
                <p className="text-xs text-slate-500 font-bold mt-1">📍 {ad.location}</p>
                <p className="text-[11px] text-slate-400 font-medium mt-1">Agent: <span className="text-slate-700 font-bold">{ad.agent_name || 'Agent'}</span></p>

                <div className="flex gap-2 mt-3">
                  <span className="text-[10px] bg-slate-100 text-slate-700 font-extrabold px-2 py-0.5 rounded uppercase">{ad.main_category}</span>
                  <span className="text-[10px] bg-amber-50 text-amber-700 font-extrabold px-2 py-0.5 rounded uppercase">{ad.area} Sq.Yd</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 border-t pt-4 flex gap-2">
                {userRole === 'admin' && (
                  <button
                    onClick={() => handleApprove(ad.id, ad.title)}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    ✅ Approve
                  </button>
                )}
                
                <button
                  onClick={() => handleDelete(ad.id, ad.title)}
                  className="flex-1 py-2.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white font-bold text-xs uppercase rounded-xl border border-red-200 transition-all cursor-pointer"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}