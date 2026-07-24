'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Defined Accordion Zones
const commercialZones = [
  { id: 'business_zone', name: 'BUSINESS ZONE COM' },
  { id: 'beach_avenue', name: 'BEACH AVENUE COM' },
  { id: 'sahil_com', name: 'SAHIL COMMERCIAL' },
  { id: 'zulfiqar_com', name: 'ZULFIQAR COM' },
  { id: 'al_murtaza', name: 'AL MURTAZA COM' },
  { id: 'peninsula_com', name: 'PENINSULA COM' },
  { id: 'dha_plot_com', name: 'DHA PLOT COMMERCIAL' },
];

export default function HomePage() {
  const [ads, setAds] = useState([]);
  const [filteredAds, setFilteredAds] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [openZone, setOpenZone] = useState(null);

  // Config
  const [adminConfig, setAdminConfig] = useState({
    name: '🔴 System Admin',
    email: 'admin@dhaplots.com',
    password: 'admin@123',
    phone: '03331234201', 
    displayPhone: '03331234201' 
  });

  const fetchLiveAds = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/listings');
      const data = await res.json();
      if (Array.isArray(data)) {
        setAds(data);
        setFilteredAds(data); 
      }
    } catch (err) {
      console.error("Error fetching ads:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveAds();
    const storedConfig = localStorage.getItem('admin_profile_config');
    if (storedConfig) setAdminConfig(JSON.parse(storedConfig));
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredAds(ads);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = ads.filter(ad => 
        ad.title?.toLowerCase().includes(query) ||
        ad.location?.toLowerCase().includes(query) ||
        ad.sub_category?.toLowerCase().includes(query)
      );
      setFilteredAds(filtered);
    }
  }, [searchQuery, ads]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#0F172A] font-sans flex flex-col justify-between">
      
      {/* MAIN CONTENT AREA */}
      <div className="flex-1">
        
        {/* 🌟 HERO SECTION */}
        <section className="bg-gradient-to-b from-[#0A1128] to-[#1E293B] text-white py-16 px-4 text-center border-b border-amber-500/10 relative">
          <div className="max-w-3xl mx-auto relative z-20">
            <span className="text-[10px] md:text-xs uppercase tracking-widest text-amber-500 font-extrabold px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20">
              Interactive Portal
            </span>
            <h1 className="text-3xl md:text-5xl font-black mt-4 tracking-tight leading-tight">
              DHA PLOTS Matrix
            </h1>
            <p className="text-gray-300 text-xs md:text-sm mt-3 max-w-xl mx-auto">
              Instant search filters across major commercial and residential zones of DHA Karachi.
            </p>

            <div className="mt-8 max-w-2xl mx-auto relative">
              <div className="bg-white p-2 rounded-2xl shadow-xl flex items-center border-2 border-amber-500/30">
                <span className="text-gray-400 text-lg px-3">🔍</span>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search premium properties (e.g. Phase 8, Zulfiqar)"
                  className="w-full bg-transparent text-[#0F172A] focus:outline-none text-sm md:text-base font-bold py-2.5"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-red-500 font-black px-4 text-lg transition-colors">
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 📂 ACCORDION LIST VIEW AREA */}
        <div className="max-w-7xl mx-auto px-4 py-12 md:px-8 space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((skeletonId) => (
                <div key={skeletonId} className="h-16 bg-slate-200 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            commercialZones.map((zone) => {
              const zoneListings = filteredAds.filter(ad => ad.show_on_home === true && ad.commercial_zone === zone.id);
              const isOpen = openZone === zone.id;

              return (
                <div key={zone.id} className="rounded-xl overflow-hidden shadow-sm border border-slate-200 bg-white">
                  <button 
                    onClick={() => setOpenZone(isOpen ? null : zone.id)}
                    className="w-full p-4 md:p-5 flex justify-between items-center text-left bg-slate-50 hover:bg-slate-100 transition-colors focus:outline-none"
                  >
                    <div className="flex items-center space-x-4 md:space-x-6">
                      <span className="text-[10px] md:text-xs font-black tracking-wider bg-[#0A1128] text-amber-400 px-3 py-1.5 rounded-lg min-w-[80px] text-center shadow-md">
                        {zoneListings.length} Ads
                      </span>
                      <h3 className="text-sm md:text-base font-black tracking-widest uppercase text-slate-800">{zone.name}</h3>
                    </div>
                    <span className={`text-slate-400 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
                      ▼
                    </span>
                  </button>

                  {isOpen && (
                    <div className="bg-white border-t border-slate-200 overflow-x-auto">
                      {zoneListings.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-400 font-bold bg-slate-50">
                          No commercial properties active in this zone right now.
                        </div>
                      ) : (
                        <table className="w-full text-left border-collapse text-xs min-w-[800px]">
                          <thead>
                            <tr className="bg-[#0A1128] text-amber-400 uppercase tracking-widest text-[10px]">
                              <th className="p-4 text-center">ID</th>
                              <th className="p-4 w-2/5">Property Description</th>
                              <th className="p-4">Area Size</th>
                              <th className="p-4">Location</th>
                              <th className="p-4">Demand (PKR)</th>
                              <th className="p-4">Contact Agent</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                            {zoneListings.map((ad, idx) => {
                              const contactPhone = ad.agent_phone || adminConfig.phone;
                              const contactName = ad.agent_name || 'Support';

                              return (
                                <tr key={ad.id} className="hover:bg-amber-50/50 transition-colors">
                                  <td className="p-4 text-center text-slate-400 font-black">#{70 + idx}</td>
                                  <td className="p-4">
                                    <div className="font-black text-slate-900 text-sm">{ad.title}</div>
                                    <div className="text-slate-500 text-[11px] mt-1 font-semibold">{ad.location}</div>
                                  </td>
                                  <td className="p-4">
                                    <span className="bg-slate-100 text-slate-800 px-3 py-1 rounded-md font-bold text-[11px] border border-slate-200">
                                      {ad.area} {ad.area_unit || 'Sq.Yd'}
                                    </span>
                                  </td>
                                  <td className="p-4">
                                    <span className="text-slate-700 font-bold px-2 py-1 bg-slate-50 rounded border">
                                      {ad.location?.split(',')[0]}
                                    </span>
                                  </td>
                                  <td className="p-4 font-black text-slate-900 text-sm">Rs {ad.price}</td>
                                  <td className="p-4">
                                    <div className="font-extrabold text-slate-900 text-xs">{contactName}</div>
                                    <a 
                                      href={`https://wa.me/${contactPhone}?text=Assalam-o-Alaikum, I am inquiring about Listing ID: #${70 + idx}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-emerald-600 font-black flex items-center gap-1.5 mt-1 hover:text-emerald-500 transition-colors bg-emerald-50 w-fit px-2 py-1 rounded-md border border-emerald-100"
                                    >
                                      🟢 WhatsApp
                                    </a>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}

                </div>
              );
            })
          )}

        </div>
      </div>

      {/* 🏢 FOOTER */}
      <footer className="bg-[#0A1128] border-t border-amber-500/20 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 py-12 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <img src="/logo.png" alt="DHA PLOTS" className="w-10 h-10 object-contain bg-white rounded-lg p-1" onError={(e) => e.target.style.display='none'} />
              <h4 className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
                DHA PLOTS
              </h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm font-medium">
              Karachi's premier elite real estate investment and booking portal.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-amber-500 font-extrabold border-b border-slate-800 pb-2">Quick Navigation</h4>
            <div className="flex flex-col space-y-2 text-xs text-slate-300 font-bold">
              <Link href="/" className="hover:text-amber-400 transition-colors w-fit">Home Feed</Link>
              <Link href="/residential" className="hover:text-amber-400 transition-colors w-fit">Residential Properties</Link>
              <Link href="/commercial" className="hover:text-amber-400 transition-colors w-fit">Commercial Properties</Link>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-amber-500 font-extrabold border-b border-slate-800 pb-2">Support Desk</h4>
            <div className="text-xs text-slate-300 space-y-2 font-bold">
              <p className="flex items-center gap-2"><span>📍</span> Phase 8, Commercial Hub, DHA</p>
              <p className="flex items-center gap-2">
                <span>📞</span> Call: <a href={`tel:+${adminConfig.phone}`} className="text-amber-400 hover:underline">{adminConfig.displayPhone}</a>
              </p>
            </div>
          </div>
        </div>
        <div className="bg-[#050914] py-5 border-t border-slate-900 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest flex flex-col sm:flex-row justify-center items-center gap-2">
          <span>© {new Date().getFullYear()} DHA PLOTS. All Rights Reserved.</span>
          <span className="text-amber-600 sm:before:content-['|'] sm:before:mr-2 sm:before:text-slate-700">
            A Project by Earth Developer's
          </span>
        </div>
      </footer>

    </div>
  );
}