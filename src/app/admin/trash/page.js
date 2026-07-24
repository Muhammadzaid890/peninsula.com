'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Top Banner Header */}
      <div className="bg-[#0A1128] text-white p-6 rounded-3xl border border-red-500/20 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-amber-400 font-bold mb-1">
            <Link href="/admin" className="hover:underline">Dashboard</Link>
            <span>/</span>
            <span className="text-red-400">Trash Bin</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-red-400 uppercase tracking-wide">
            🗑️ Deleted Advertisements
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Restore or repost temporarily deleted listings for DHA PLOTS
          </p>
        </div>
        <Link 
          href="/admin" 
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-extrabold text-xs uppercase rounded-xl border border-slate-700 transition-all"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 font-bold text-xs animate-pulse">
          Loading Deleted Ads...
        </div>
      ) : deletedAds.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border text-center text-slate-400 font-bold text-xs shadow-sm">
          <span className="text-3xl block mb-2">🗑️</span>
          Trash Bin khali ha! Koi ad delete nahi hua.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deletedAds.map((ad) => (
            <div 
              key={ad.id} 
              className="bg-white border border-slate-200/80 rounded-3xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all"
            >
              <div>
                <h3 className="font-black text-base text-slate-900 truncate">{ad.title}</h3>
                <p className="text-red-600 font-extrabold text-sm mt-1">Rs {ad.price}</p>
                <p className="text-xs text-slate-500 font-semibold mt-1">📍 {ad.location}</p>
                <div className="flex gap-2 mt-3 flex-wrap">
                  <span className="text-[10px] bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded border border-red-100 uppercase">{ad.purpose}</span>
                  <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded uppercase">{ad.sub_category}</span>
                </div>
              </div>

              {/* Restore / Repost Button */}
              <div className="mt-6 border-t pt-4">
                <button 
                  onClick={() => handleRestore(ad.id, ad.title)}
                  className="w-full py-3 bg-[#0A1128] hover:bg-slate-900 text-amber-400 font-black rounded-xl transition-all shadow-md text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <span>🔄</span> Repost & Restore Ad
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}