'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const COMMERCIAL_ZONES = [
  { id: 'business_zone', name: 'BUSINESS ZONE COM' },
  { id: 'beach_avenue', name: 'BEACH AVENUE COM' },
  { id: 'sahil_com', name: 'SAHIL COMMERCIAL' },
  { id: 'zulfiqar_com', name: 'ZULFIQAR COM' },
  { id: 'al_murtaza', name: 'AL MURTAZA COM' },
  { id: 'peninsula_com', name: 'PENINSULA COM' },
  { id: 'dha_plot_com', name: 'DHA PLOT COMMERCIAL' },
];

const RESIDENTIAL_YARD_SIZES = ['300', '500', '600', '666', '1000', '2000'];

export default function AddAdPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    price: '',
    location: 'DHA Phase 8',
    area: '1000',
    area_unit: 'sq.yd',
    purpose: 'sale',
    main_category: 'residential',
    sub_category: 'plot',
    commercial_zone: 'zulfiqar_com',
    show_on_home: false,
    description: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // 🔍 Read current user session info
    const userRole = localStorage.getItem('userRole') || 'agent';
    const rawUserInfo = localStorage.getItem('user_info');
    let userInfo = {};
    
    try {
      if (rawUserInfo) userInfo = JSON.parse(rawUserInfo);
    } catch (err) {
      console.error(err);
    }

    const agentCredits = userInfo.ad_credits !== undefined ? Number(userInfo.ad_credits) : 0;

    // ⚡ Quota Check: Agar role Agent hai aur Credits <= 0 hain, to status 'pending' rakhein
    const isPendingApproval = userRole === 'agent' && agentCredits <= 0;
    const initialStatus = isPendingApproval ? 'pending' : 'active';

    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          location: 'DHA Phase 8', // Force Phase 8
          status: initialStatus, // 'active' or 'pending'
          agent_name: userInfo.name || (userRole === 'admin' ? 'System Admin' : 'Agent'),
          agent_phone: userInfo.phone || '03331234201',
          images: []
        })
      });

      const data = await res.json();

      if (res.ok) {
        if (isPendingApproval) {
          setMessage('⏳ Aapka ad quota khatam ho chuka hai! Ad Admin Approval ke liye Inactive / Pending section mein bhej diya gaya hai.');
        } else {
          // Deduct 1 credit locally for agent if he had active quota
          if (userRole === 'agent' && agentCredits > 0) {
            userInfo.ad_credits = Math.max(0, agentCredits - 1);
            localStorage.setItem('user_info', JSON.stringify(userInfo));
          }
          setMessage('🎉 Phase 8 Listing successfully posted!');
        }

        setTimeout(() => {
          if (isPendingApproval) {
            router.push('/admin/inactive-ads');
          } else if (formData.main_category === 'residential') {
            router.push('/residential');
          } else {
            router.push('/commercial');
          }
        }, 1800);
      } else {
        setMessage(`❌ Error: ${data.error || 'Failed to post ad'}`);
      }
    } catch (err) {
      console.error(err);
      setMessage('❌ Network connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header Container */}
      <div className="bg-[#0A1128] text-white p-6 rounded-3xl border border-amber-500/20 shadow-xl flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Phase 8 Portal
          </span>
          <h1 className="text-xl md:text-2xl font-black text-amber-400 uppercase tracking-wide mt-1">
            ➕ Post New Listing
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            Add Residential Size Plots or Commercial Zone Listings for DHA Phase 8
          </p>
        </div>
        <button 
          onClick={() => router.back()}
          className="text-xs font-extrabold uppercase px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl border border-slate-700 transition-all cursor-pointer"
        >
          ← Back
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl text-xs font-bold text-center border shadow-sm transition-all ${
          message.includes('🎉') 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : message.includes('⏳')
            ? 'bg-amber-50 text-amber-800 border-amber-200'
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Main Form Container */}
      <div className="bg-white p-6 md:p-10 rounded-3xl border shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Ad Title */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">Listing Title *</label>
            <input 
              type="text" 
              name="title" 
              required 
              placeholder="e.g. 1000 Sq Yd Prime Location Plot in Phase 8" 
              value={formData.title} 
              onChange={handleChange}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-amber-500 transition-all"
            />
          </div>

          {/* Category Selector & Phase Lock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">Main Category *</label>
              <select 
                name="main_category" 
                value={formData.main_category} 
                onChange={handleChange}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-amber-500 transition-all"
              >
                <option value="residential">🏡 Residential (Phase 8)</option>
                <option value="commercial">🏢 Commercial (Phase 8)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">Location Sector</label>
              <input 
                type="text" 
                disabled 
                value="📍 DHA Phase 8 (Locked)" 
                className="w-full p-3.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-black text-amber-700 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Price & Size / Zone Logic */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">Price / Demand (PKR) *</label>
              <input 
                type="text" 
                name="price" 
                required 
                placeholder="e.g. 85,00,000" 
                value={formData.price} 
                onChange={handleChange}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-amber-500 transition-all"
              />
            </div>

            {/* If Residential -> Select Yard Size */}
            {formData.main_category === 'residential' ? (
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">Phase 8 Yard Size *</label>
                <select 
                  name="area" 
                  value={formData.area} 
                  onChange={handleChange}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-amber-500 transition-all"
                >
                  {RESIDENTIAL_YARD_SIZES.map((s) => (
                    <option key={s} value={s}>{s} YRD</option>
                  ))}
                </select>
              </div>
            ) : (
              /* If Commercial -> Area Input */
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">Area Size (Sq.Yd) *</label>
                <input 
                  type="text" 
                  name="area" 
                  required 
                  placeholder="e.g. 100, 200, 500" 
                  value={formData.area} 
                  onChange={handleChange}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-amber-500 transition-all"
                />
              </div>
            )}
          </div>

          {/* Conditional Commercial Spot Selector */}
          {formData.main_category === 'commercial' && (
            <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-200 space-y-3">
              <label className="block text-xs font-black uppercase text-amber-900">Phase 8 Commercial Zone / Spot *</label>
              <select 
                name="commercial_zone" 
                value={formData.commercial_zone} 
                onChange={handleChange}
                className="w-full p-3.5 bg-white border border-amber-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-amber-500 transition-all shadow-sm"
              >
                {COMMERCIAL_ZONES.map((zone) => (
                  <option key={zone.id} value={zone.id}>{zone.name}</option>
                ))}
              </select>

              <div className="flex items-center space-x-2.5 pt-2">
                <input 
                  type="checkbox" 
                  id="show_on_home" 
                  name="show_on_home" 
                  checked={formData.show_on_home} 
                  onChange={handleChange}
                  className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 border-gray-300"
                />
                <label htmlFor="show_on_home" className="text-xs font-extrabold text-slate-800 cursor-pointer">
                  Show inside Home Page Commercial Accordion
                </label>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">Description (Optional)</label>
            <textarea 
              name="description" 
              rows="3" 
              placeholder="Add key features, lane position, or demand rate details..." 
              value={formData.description} 
              onChange={handleChange}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-amber-500 transition-all"
            ></textarea>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-[#0A1128] hover:bg-slate-900 text-amber-400 font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-xl disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Processing Listing...' : '🚀 Post Phase 8 Listing Now'}
          </button>

        </form>
      </div>

    </div>
  );
}