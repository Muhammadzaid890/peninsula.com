'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdIds, setSelectedAdIds] = useState([]); // Track selected checkboxes

  const [adminConfig, setAdminConfig] = useState({
    name: '🔴 System Admin',
    displayPhone: '03331234201'
  });

  // Fetch all ads and filter only active ones for main view dashboard
  const fetchAllAds = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/listings');
      const data = await res.json();
      if (Array.isArray(data)) {
        // Only render active ads here, soft-deleted ones move to trash view
        const activeAds = data.filter(ad => ad.status === 'active' || !ad.status);
        setAds(activeAds);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAds();
    const storedConfig = localStorage.getItem('admin_profile_config');
    if (storedConfig) {
      setAdminConfig(JSON.parse(storedConfig));
    }
  }, []);

  // 🟢 SELECT ALL / TOGGLE LOGIC
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = ads.map(ad => ad.id);
      setSelectedAdIds(allIds);
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

  // 📦 SOFT DELETE HANDLER (Moves ad directly to the Trash list page)
  const handleDeleteSingle = async (id) => {
    if (!confirm('Kya aap is ad ko live feed se hata kar Trash folder me bhejna chahte hain?')) return;
    try {
      const res = await fetch(`/api/listings?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAds(ads.filter(ad => ad.id !== id));
        setSelectedAdIds(selectedAdIds.filter(itemId => itemId !== id));
        alert('📦 Ad dynamic soft-delete ho kar Trash View me shift ho gaya!');
      } else {
        alert('❌ Soft deletion failed!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 📦 BULK SOFT DELETE HANDLER
  const handleBulkDelete = async () => {
    if (selectedAdIds.length === 0) return;
    if (!confirm(`Kya aap in ${selectedAdIds.length} selected ads ko live feed se hata kar Trash View me bhejna chahte hain?`)) return;

    try {
      const deletePromises = selectedAdIds.map(id => 
        fetch(`/api/listings?id=${id}`, { method: 'DELETE' })
      );
      
      await Promise.all(deletePromises);
      
      setAds(ads.filter(ad => !selectedAdIds.includes(ad.id)));
      setSelectedAdIds([]);
      alert('📦 Selected items successfully trash section me drop kar diye gaye hain!');
    } catch (err) {
      console.error(err);
      alert('❌ Bulk operation mapping break exception.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#0F172A] font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* TOP BAR WITH NAVIGATION ANCHORS */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            {/* 🏠 BACK TO HOME LINK */}
            <button 
              onClick={() => router.push('/')}
              className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-white bg-[#0A1128] hover:bg-slate-900 px-5 py-3 rounded-xl transition-all focus:outline-none shadow-md"
            >
              <span>🏠</span> <span>Back to Home</span>
            </button>
            <button 
              onClick={() => router.push('/admin/add-ad')}
              className="text-xs font-black uppercase tracking-wider text-[#0A1128] border border-amber-500 hover:bg-amber-500/10 px-5 py-3 rounded-xl transition-all focus:outline-none"
            >
              ➕ Post New Ad
            </button>
            
            {/* 🗑️ LINK TO RECYCLE BIN TRASH FOLDER */}
            <button 
              onClick={() => router.push('/admin/deleted-ads')}
              className="text-xs font-black uppercase tracking-wider text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 px-5 py-3 rounded-xl transition-all focus:outline-none flex items-center space-x-1"
            >
              <span>🗑️</span> <span>View Trash Folder</span>
            </button>
          </div>
          <span className="text-xs font-bold text-gray-400">Logged In: {adminConfig.name}</span>
        </div>

        {/* STATS & OPERATIONS TABLE CONTEXT */}
        <div className="bg-white rounded-3xl border p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-black text-[#0A1128] uppercase tracking-wide">📊 DATABASE AD RECORD INDEX</h2>
              <p className="text-xs text-gray-400 font-semibold mt-0.5">Manage live properties and execute bulk transformations securely.</p>
            </div>

            {/* BULK TRACKER ACTION TRIGGER */}
            {selectedAdIds.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="w-full md:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-red-600/10 transition-all"
              >
                🗑️ Move Selected to Trash ({selectedAdIds.length})
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-10 font-bold text-gray-400 animate-pulse">Fetching inventory lists...</div>
          ) : ads.length === 0 ? (
            <div className="text-center py-16 text-xs text-gray-400 font-bold border-2 border-dashed rounded-2xl bg-slate-50">
              No live matching entries registered in data arrays currently.
            </div>
          ) : (
            <div className="overflow-x-auto border rounded-2xl">
              <table className="w-full text-left border-collapse text-xs font-semibold min-w-[700px]">
                <thead>
                  <tr className="bg-slate-100 text-gray-500 border-b border-gray-200 uppercase tracking-wider text-[10px]">
                    
                    {/* 🟢 SELECT ALL BOX */}
                    <th className="p-4 w-12 text-center">
                      <input 
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={selectedAdIds.length === ads.length && ads.length > 0}
                        className="w-4 h-4 accent-[#0A1128] cursor-pointer"
                      />
                    </th>

                    <th className="p-4 w-16 text-center">#</th>
                    <th className="p-4">Description</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Placement Status</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white font-medium text-gray-700">
                  {ads.map((ad, idx) => {
                    const isChecked = selectedAdIds.includes(ad.id);
                    return (
                      <tr key={ad.id} className={`hover:bg-slate-50/80 transition-colors ${isChecked ? 'bg-amber-500/[0.02]' : ''}`}>
                        
                        {/* INDIVIDUAL ROW BOX SELECTOR */}
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
                          <div className="font-black text-slate-900 text-sm">{ad.title}</div>
                          <div className="text-gray-400 text-[11px] mt-0.5">📍 {ad.location} | Size: {ad.area} {ad.area_unit}</div>
                        </td>
                        <td className="p-4 font-black text-emerald-700">Rs {ad.price}</td>
                        <td className="p-4">
                          {ad.show_on_home ? (
                            <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-md text-[9px] uppercase font-bold tracking-wider">
                              Home Accordion ({ad.commercial_zone?.replace('_', ' ')})
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-600 border px-2.5 py-1 rounded-md text-[9px] uppercase font-bold tracking-wider">
                              Properties Page Only
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleDeleteSingle(ad.id)}
                            className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold transition-all"
                          >
                            Move to Trash
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

      </div>
    </div>
  );
}