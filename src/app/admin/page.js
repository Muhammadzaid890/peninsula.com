'use client';

import { useState, useEffect } from 'react';

const categoryMapping = {
  home: ['house', 'flat', 'portion'],
  plot: ['residential plot', 'commercial plot'],
  commercial: ['building', 'office', 'shop', 'warehouse']
};

const amenityOptions = ['Electricity', 'Water', 'Gas', 'Sewerage', 'Boundary Wall', 'Security'];

export default function MyAdsPage() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Edit Modal States
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [editMainCat, setEditMainCat] = useState('home');
  const [editSubCat, setEditSubCat] = useState('house');
  const [editAmenities, setEditAmenities] = useState([]);

  const fetchAds = async () => {
    try {
      const res = await fetch('/api/listings');
      const data = await res.json();
      if (Array.isArray(data)) setAds(data);
    } catch (err) {
      console.error("Ads fetch nahi ho sakay", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  // Delete Ad Handler
  const handleDelete = async (id, title) => {
    const confirmDelete = confirm(`Kya aap sach mein "${title}" ko delete karna chahte hain?`);
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/listings?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('🗑️ Ad successfully delete ho gaya!');
        fetchAds(); // Refresh screen listings
      } else {
        alert('❌ Delete karne mein masla aya.');
      }
    } catch (err) {
      alert('❌ Server Error! Try again.');
    }
  };

  // Promote / Refresh Logic
  const handleAction = async (id, action, type = '') => {
    try {
      const res = await fetch('/api/listings/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, type }),
      });
      if (res.ok) {
        fetchAds();
      } else {
        alert("❌ Masla aaya.");
      }
    } catch (err) {
      alert("❌ Request failed.");
    }
  };

  // Open Edit Modal
  const openEditModal = (ad) => {
    setEditingAd(ad);
    setEditMainCat(ad.main_category);
    setEditSubCat(ad.sub_category);
    setEditAmenities(ad.amenities || []);
    setIsEditOpen(true);
  };

  // Handle Amenity Checkbox inside Modal
  const handleEditAmenityChange = (amenity) => {
    if (editAmenities.includes(amenity)) {
      setEditAmenities(editAmenities.filter(item => item !== amenity));
    } else {
      setEditAmenities([...editAmenities, amenity]);
    }
  };

  // Submit Updated Ad
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const updatedData = {
      id: editingAd.id,
      title: formData.get('title'),
      price: formData.get('price'),
      location: formData.get('location'),
      description: formData.get('description'),
      purpose: formData.get('purpose'),
      main_category: editMainCat,
      sub_category: editSubCat,
      area: formData.get('area'),
      area_unit: formData.get('area_unit'),
      beds: editMainCat === 'home' ? formData.get('beds') : null,
      baths: editMainCat === 'home' ? formData.get('baths') : null,
      amenities: editAmenities
    };

    try {
      const res = await fetch('/api/listings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (res.ok) {
        alert('🎉 Ad successfully update ho gaya!');
        setIsEditOpen(false);
        fetchAds();
      } else {
        alert('❌ Update karne mein error aya.');
      }
    } catch (err) {
      alert('❌ Server Error!');
    }
  };

  return (
    <div className="min-h-screen bg-[#070F2B] text-white p-6 md:p-12 relative">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Updated with Trash Bin Button */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-amber-500/20 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-600">
              My Advertisements
            </h1>
            <p className="text-gray-400 text-sm mt-1">Manage, edit, promote, or delete your real estate listings</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto justify-end">
            <a href="/admin/trash" className="px-5 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold rounded-xl transition-all text-sm flex items-center gap-2">
              🗑️ View Trash
            </a>
            <a href="/admin/add-ad" className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-[#070F2B] font-bold rounded-xl transition-all shadow-lg shadow-amber-500/10 text-sm">
              + Create New Ad
            </a>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-amber-500 font-semibold animate-pulse">Loading Ads...</div>
        ) : ads.length === 0 ? (
          <div className="text-center py-12 text-gray-500 border border-dashed border-slate-700 rounded-2xl">
            No ads found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ads.map((ad) => (
              <div 
                key={ad.id} 
                className={`bg-[#0F172A]/80 border rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 relative ${
                  ad.ad_type === 'ultra_premium' 
                    ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]' 
                    : ad.ad_type === 'premium' 
                    ? 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
                    : 'border-slate-800'
                }`}
              >
                {/* Control Icons Bar on Top Right */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button 
                    onClick={() => openEditModal(ad)}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-2 py-1 rounded-lg text-xs font-bold transition-all"
                    title="Edit Ad"
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(ad.id, ad.title)}
                    className="bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white px-2 py-1 rounded-lg text-xs font-bold transition-all border border-red-500/30"
                    title="Delete Ad"
                  >
                    🗑️ Delete
                  </button>
                </div>

                <div className="mt-6">
                  <h3 className="font-bold text-lg text-white pr-24 truncate">{ad.title}</h3>
                  <p className="text-amber-500 font-semibold mt-1">{ad.price}</p>
                  <p className="text-xs text-gray-400 mt-1">📍 {ad.location}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-gray-300 uppercase font-semibold">{ad.purpose}</span>
                    <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-gray-300 uppercase font-semibold">{ad.sub_category}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="mt-6 border-t border-slate-800/80 pt-4 space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => handleAction(ad.id, 'refresh')} className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700">
                      <span className="text-sm">🔄</span>
                      <span className="text-[10px] text-gray-300 font-medium mt-1">Refresh</span>
                    </button>
                    <button onClick={() => handleAction(ad.id, 'promote', ad.ad_type === 'premium' ? 'simple' : 'premium')} className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all border ${ad.ad_type === 'premium' ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'}`}>
                      <span className="text-sm">⭐</span>
                      <span className="text-[10px] font-medium mt-1">Premium</span>
                    </button>
                    <button onClick={() => handleAction(ad.id, 'promote', ad.ad_type === 'ultra_premium' ? 'simple' : 'ultra_premium')} className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all border ${ad.ad_type === 'ultra_premium' ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'}`}>
                      <span className="text-sm">🔴</span>
                      <span className="text-[10px] font-medium mt-1">Ultra</span>
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* UPDATE MODAL (POPUP) */}
      {isEditOpen && editingAd && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#0F172A] border border-amber-500/30 w-full max-w-2xl rounded-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <button 
              onClick={() => setIsEditOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-lg font-bold"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold text-amber-500 mb-6 border-b border-slate-800 pb-3">Update Advertisement</h2>
            
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-amber-500/80 mb-1">Title</label>
                <input name="title" defaultValue={editingAd.title} required className="w-full px-4 py-2 bg-[#1E293B] rounded-lg border border-slate-700 text-white focus:outline-none focus:border-amber-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-amber-500/80 mb-1">Price</label>
                  <input name="price" defaultValue={editingAd.price} required className="w-full px-4 py-2 bg-[#1E293B] rounded-lg border border-slate-700 text-white focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-amber-500/80 mb-1">Location</label>
                  <input name="location" defaultValue={editingAd.location} required className="w-full px-4 py-2 bg-[#1E293B] rounded-lg border border-slate-700 text-white focus:outline-none focus:border-amber-500" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-amber-500/80 mb-1">Purpose</label>
                  <select name="purpose" defaultValue={editingAd.purpose} className="w-full px-4 py-2 bg-[#1E293B] rounded-lg border border-slate-700 text-white">
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-amber-500/80 mb-1">Main Category</label>
                  <select 
                    value={editMainCat} 
                    onChange={(e) => {
                      setEditMainCat(e.target.value);
                      setEditSubCat(categoryMapping[e.target.value][0]);
                    }}
                    className="w-full px-4 py-2 bg-[#1E293B] rounded-lg border border-slate-700 text-white"
                  >
                    <option value="home">🏠 Home</option>
                    <option value="plot">🗺️ Plot</option>
                    <option value="commercial">🏢 Commercial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-amber-500/80 mb-1">Sub-Category</label>
                  <select 
                    value={editSubCat} 
                    onChange={(e) => setEditSubCat(e.target.value)}
                    className="w-full px-4 py-2 bg-[#1E293B] rounded-lg border border-slate-700 text-white capitalize"
                  >
                    {categoryMapping[editMainCat].map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-amber-500/80 mb-1">Area / Size</label>
                  <div className="flex">
                    <input name="area" defaultValue={editingAd.area} required type="number" className="w-2/3 px-4 py-2 bg-[#1E293B] rounded-l-lg border border-slate-700 text-white focus:outline-none" />
                    <select name="area_unit" defaultValue={editingAd.area_unit} className="w-1/3 px-2 py-2 bg-[#1E293B] rounded-r-lg border-y border-r border-slate-700 text-white">
                      <option value="Sq. Yd">Sq. Yd</option>
                      <option value="Sq. Ft">Sq. Ft</option>
                    </select>
                  </div>
                </div>

                {editMainCat === 'home' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-amber-500/80 mb-1">Beds</label>
                      <select name="beds" defaultValue={editingAd.beds || 1} className="w-full px-4 py-2 bg-[#1E293B] rounded-lg border border-slate-700 text-white">
                        {[1, 2, 3, 4, 5, 6].map(num => <option key={num} value={num}>{num}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-amber-500/80 mb-1">Baths</label>
                      <select name="baths" defaultValue={editingAd.baths || 1} className="w-full px-4 py-2 bg-[#1E293B] rounded-lg border border-slate-700 text-white">
                        {[1, 2, 3, 4, 5, 6].map(num => <option key={num} value={num}>{num}</option>)}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-amber-500/80 mb-2">Amenities</label>
                <div className="grid grid-cols-3 gap-2 bg-[#1E293B] p-3 rounded-lg border border-slate-700">
                  {amenityOptions.map(amenity => (
                    <label key={amenity} className="flex items-center space-x-2 text-xs text-gray-300">
                      <input 
                        type="checkbox" 
                        checked={editAmenities.includes(amenity)}
                        onChange={() => handleEditAmenityChange(amenity)}
                        className="accent-amber-500" 
                      />
                      <span>{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-amber-500/80 mb-1">Description</label>
                <textarea name="description" defaultValue={editingAd.description} rows="3" className="w-full p-4 bg-[#1E293B] rounded-lg border border-slate-700 text-white resize-none focus:outline-none"></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsEditOpen(false)} className="px-5 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg font-bold">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}