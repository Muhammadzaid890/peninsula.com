'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DeletedAdsPage() {
  const router = useRouter();
  const [deletedAds, setDeletedAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdIds, setSelectedAdIds] = useState([]);

  // Fetch only ads whose status is 'deleted'
  const fetchDeletedAds = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/listings');
      const data = await res.json();
      if (Array.isArray(data)) {
        // Filter out only soft-deleted ads
        const trash = data.filter(ad => ad.status === 'deleted');
        setDeletedAds(trash);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedAds();
  }, []);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedAdIds(deletedAds.map(ad => ad.id));
    } else {
      setSelectedAdIds([]);
    }
  };

  const handleSelectAd = (id) => {
    if (selectedAdIds.includes(id)) {
      setSelectedAdIds(selectedAdIds.filter(item => item !== id));
    } else {
      setSelectedAdIds([...selectedAdIds, id]);
    }
  };

  // 🔴 BULK PERMANENT DELETE
  const handleBulkPermanentDelete = async () => {
    if (selectedAdIds.length === 0) return;
    if (!confirm(`⚠️ WARNING! Kya aap in ${selectedAdIds.length} selected ads ko database se HAMESHA ke liye khatam karna chahte hain? Yeh wapas nahi aaskte.`)) return;

    try {
      // Calling delete API with permanent=true flag
      const deletePromises = selectedAdIds.map(id => 
        fetch(`/api/listings?id=${id}&permanent=true`, { method: 'DELETE' })
      );
      
      await Promise.all(deletePromises);
      
      setDeletedAds(deletedAds.filter(ad => !selectedAdIds.includes(ad.id)));
      setSelectedAdIds([]);
      alert('🔥 Selected ads permanently database se delete ho gaye!');
    } catch (err) {
      console.error(err);
      alert('❌ Permanent deletion failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#0F172A] font-sans p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* TOP BAR NAVIGATION */}
        <div className="flex items-center justify-between bg-[#0A1128] text-white p-4 rounded-2xl shadow-md border border-amber-500/20">
          <div className="flex items-center space-x-3">
            <span className="text-xl">🗑️</span>
            <div>
              <h1 className="text-base font-black uppercase tracking-wider">Trash Bin / Deleted Ads</h1>
              <p className="text-[10px] text-gray-400 font-semibold">Permanently purge or review system drops.</p>
            </div>
          </div>
          
          {/* ⬅️ BACK TO ADMIN DASHBOARD BUTTON */}
          <button 
            onClick={() => router.push('/admin')}
            className="flex items-center space-x-2 text-[11px] font-black uppercase tracking-wider text-[#0A1128] bg-amber-500 hover:bg-amber-600 px-4 py-2.5 rounded-xl transition-all focus:outline-none"
          >
            <span>⬅</span> <span>Back to Admin Dashboard</span>
          </button>
        </div>

        {/* BULK ACTION PANEL */}
        <div className="bg-white rounded-3xl border p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <span className="text-xs font-bold text-gray-500">Total Trash Count: {deletedAds.length} items</span>
            
            {selectedAdIds.length > 0 && (
              <button
                onClick={handleBulkPermanentDelete}
                className="w-full sm:w-auto px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg transition-all"
              >
                💥 Permanently Delete Selected ({selectedAdIds.length})
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-10 font-bold text-gray-400 animate-pulse">Loading Trash Items...</div>
          ) : deletedAds.length === 0 ? (
            <div className="text-center py-16 text-xs text-gray-400 font-bold border-2 border-dashed rounded-2xl bg-slate-50">
              Trash list bilkul khali hai! Koi deleted ad nahi mila.
            </div>
          ) : (
            <div className="overflow-x-auto border rounded-2xl">
              <table className="w-full text-left border-collapse text-xs font-semibold min-w-[600px]">
                <thead>
                  <tr className="bg-slate-100 text-gray-500 border-b border-gray-200 uppercase tracking-wider text-[10px]">
                    <th className="p-4 w-12 text-center">
                      <input 
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={selectedAdIds.length === deletedAds.length}
                        className="w-4 h-4 accent-[#0A1128] cursor-pointer"
                      />
                    </th>
                    <th className="p-4 w-16 text-center">ID</th>
                    <th className="p-4">Property Description</th>
                    <th className="p-4">Demand</th>
                    <th className="p-4">Zone Target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white font-medium text-gray-700">
                  {deletedAds.map((ad, idx) => {
                    const isChecked = selectedAdIds.includes(ad.id);
                    return (
                      <tr key={ad.id} className={`hover:bg-red-50/30 transition-colors ${isChecked ? 'bg-red-50/50' : ''}`}>
                        <td className="p-4 text-center">
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleSelectAd(ad.id)}
                            className="w-4 h-4 accent-[#0A1128] cursor-pointer"
                          />
                        </td>
                        <td className="p-4 text-center text-gray-400 font-bold">#{70 + idx}</td>
                        <td className="p-4">
                          <div className="font-black text-slate-800 text-sm">{ad.title}</div>
                          <div className="text-gray-400 text-[11px] mt-0.5">📍 {ad.location}</div>
                        </td>
                        <td className="p-4 font-black text-slate-900">Rs {ad.price}</td>
                        <td className="p-4">
                          <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                            {ad.show_on_home ? ad.commercial_zone?.replace('_', ' ') : 'Properties Feed'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}