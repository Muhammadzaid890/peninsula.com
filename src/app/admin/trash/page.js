'use client';

import { useState, useEffect } from 'react';

export default function TrashAdsPage() {
  const [deletedAds, setDeletedAds] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDeletedAds = async () => {
    try {
      const res = await fetch('/api/listings/trash');
      const data = await res.json();
      if (Array.isArray(data)) setDeletedAds(data);
    } catch (err) {
      console.error("Deleted ads fetch karne mein masla aya", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedAds();
  }, []);

  // Restore/Repost function
  const handleRestore = async (id, title) => {
    try {
      const res = await fetch('/api/listings/trash', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        alert(`🎉 "${title}" ko successfully repost kar diya gaya ha!`);
        fetchDeletedAds(); // Refresh trash list
      } else {
        alert('❌ Ad restore karne mein masla aya.');
      }
    } catch (err) {
      alert('❌ Connection error!');
    }
  };

  return (
    <div className="min-h-screen bg-[#070F2B] text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Navigation / Breadcrumb Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-red-500/20 pb-6 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs text-amber-500 font-semibold mb-1">
              <a href="/admin" className="hover:underline">Dashboard</a>
              <span>/</span>
              <span className="text-red-400">Trash Bin</span>
            </div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">
              🗑️ Deleted Advertisements
            </h1>
            <p className="text-gray-400 text-sm mt-1">Restore or repost your temporarily deleted real estate listings</p>
          </div>
          <a href="/admin" className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all text-sm border border-slate-700">
            ← Back to Active Ads
          </a>
        </div>

        {loading ? (
          <div className="text-center py-12 text-red-400 font-semibold animate-pulse">Loading Deleted Ads...</div>
        ) : deletedAds.length === 0 ? (
          <div className="text-center py-16 text-gray-500 border border-dashed border-red-500/10 rounded-2xl bg-[#0F172A]/30">
            <span className="text-4xl block mb-3">🗑️</span>
            Trash Bin khali ha! Koi ad delete nahi hua.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deletedAds.map((ad) => (
              <div 
                key={ad.id} 
                className="bg-[#0F172A]/80 border border-red-500/20 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 opacity-80 hover:opacity-100"
              >
                <div>
                  <h3 className="font-bold text-lg text-gray-300 truncate">{ad.title}</h3>
                  <p className="text-red-400 font-semibold mt-1">{ad.price}</p>
                  <p className="text-xs text-gray-500 mt-1">📍 {ad.location}</p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <span className="text-[10px] bg-red-950/30 border border-red-900/50 px-2 py-1 rounded text-red-400 uppercase font-semibold">{ad.purpose}</span>
                    <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-gray-400 uppercase font-semibold">{ad.sub_category}</span>
                  </div>
                </div>

                {/* Restore / Repost Button */}
                <div className="mt-6 border-t border-slate-800/80 pt-4">
                  <button 
                    onClick={() => handleRestore(ad.id, ad.title)}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-[#070F2B] font-extrabold rounded-xl transition-all duration-300 shadow-md shadow-emerald-500/10 text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <span>🔄</span> Repost & Restore Ad
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}