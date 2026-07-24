'use client';

import { useState, useEffect } from 'react';

// Exact Yard Sizes Accordion
const YARD_SIZES = [
  { id: '300', name: '300 YRD' },
  { id: '500', name: '500 YRD' },
  { id: '600', name: '600 YRD' },
  { id: '666', name: '666 YRD' },
  { id: '1000', name: '1000 YRD' },
  { id: '2000', name: '2000 YRD' },
];

export default function ResidentialPage() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openSize, setOpenSize] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [adminConfig, setAdminConfig] = useState({
    phone: '03331234201',
    displayPhone: '03331234201'
  });

  useEffect(() => {
    async function fetchResidentialAds() {
      try {
        const res = await fetch('/api/listings?main_category=residential');
        const data = await res.json();
        if (Array.isArray(data)) {
          setAds(data);
        }
      } catch (err) {
        console.error("Error fetching residential ads:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchResidentialAds();

    const storedConfig = localStorage.getItem('admin_profile_config');
    if (storedConfig) {
      setAdminConfig(JSON.parse(storedConfig));
    }
  }, []);

  const getSizeListings = (sizeId) => {
    return ads.filter(ad => {
      const matchesSize = String(ad.area).trim() === sizeId;
      const matchesSearch = searchQuery === '' || 
        ad.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ad.location?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSize && matchesSearch;
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#0F172A] font-sans flex flex-col justify-between">
      <div>
        
        {/* HERO BANNER - SINGLE HEADING: PHASE 8 */}
        <section className="bg-gradient-to-b from-[#0A1128] to-[#1E293B] text-white py-14 px-4 text-center border-b border-amber-500/10">
          <div className="max-w-3xl mx-auto">
            <span className="text-xs uppercase tracking-widest text-amber-500 font-extrabold px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20">
              Residential Listings Matrix
            </span>
            
            <h1 className="text-3xl md:text-5xl font-black mt-3 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500">
              PHASE 8
            </h1>
            <p className="text-gray-300 text-xs md:text-sm mt-2 max-w-xl mx-auto">
              Select yard size category below to view exclusive plot listings in Phase 8.
            </p>

            <div className="mt-6 max-w-lg mx-auto">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search in Phase 8 listings..."
                className="w-full px-4 py-2.5 bg-white text-slate-900 rounded-xl text-xs font-bold border-2 border-amber-500/30 focus:outline-none shadow-lg"
              />
            </div>
          </div>
        </section>

        {/* YARD SIZES ACCORDION LIST */}
        <div className="max-w-7xl mx-auto px-4 py-10 md:px-8 space-y-4">
          
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="h-16 bg-slate-200 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            YARD_SIZES.map((size) => {
              const sizeListings = getSizeListings(size.id);
              const isOpen = openSize === size.id;

              return (
                <div key={size.id} className="rounded-xl overflow-hidden shadow-sm border border-slate-200 bg-white">
                  
                  <button 
                    onClick={() => setOpenSize(isOpen ? null : size.id)}
                    className="w-full p-4 md:p-5 flex justify-between items-center text-left bg-slate-50 hover:bg-slate-100 transition-colors focus:outline-none"
                  >
                    <div className="flex items-center space-x-4 md:space-x-6">
                      <span className="text-xs font-black tracking-wider bg-[#0A1128] text-amber-400 px-3.5 py-1.5 rounded-lg min-w-[90px] text-center shadow-md">
                        {sizeListings.length} Ads
                      </span>
                      <h3 className="text-base md:text-lg font-black tracking-widest text-slate-900">
                        {size.name}
                      </h3>
                    </div>
                    <span className={`text-slate-500 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
                      ▼
                    </span>
                  </button>

                  {isOpen && (
                    <div className="bg-white border-t border-slate-200 overflow-x-auto">
                      {sizeListings.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-400 font-bold bg-slate-50">
                          No {size.name} plot listings updated in Phase 8 currently.
                        </div>
                      ) : (
                        <table className="w-full text-left border-collapse text-xs min-w-[750px]">
                          <thead>
                            <tr className="bg-[#0A1128] text-amber-400 uppercase tracking-widest text-[10px]">
                              <th className="p-4 text-center">#</th>
                              <th className="p-4 w-2/5">Property Description</th>
                              <th className="p-4">Size</th>
                              <th className="p-4">Location</th>
                              <th className="p-4">Demand Price</th>
                              <th className="p-4">Contact Agent</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                            {sizeListings.map((ad, idx) => {
                              const contactPhone = ad.agent_phone || adminConfig.phone;
                              const contactName = ad.agent_name || 'DHA Support';

                              return (
                                <tr key={ad.id} className="hover:bg-amber-50/50 transition-colors">
                                  <td className="p-4 text-center text-slate-400 font-black">#{100 + idx}</td>
                                  <td className="p-4">
                                    <div className="font-black text-slate-900 text-sm">{ad.title}</div>
                                    <div className="text-slate-500 text-[11px] mt-0.5">{ad.description || 'Phase 8 Prime Location'}</div>
                                  </td>
                                  <td className="p-4">
                                    <span className="bg-amber-100 text-amber-900 px-3 py-1 rounded-md font-extrabold text-[11px] border border-amber-200">
                                      {ad.area} Sq.Yd
                                    </span>
                                  </td>
                                  <td className="p-4">
                                    <span className="text-slate-800 font-bold px-2 py-1 bg-slate-100 rounded border">
                                      {ad.location || 'Phase 8'}
                                    </span>
                                  </td>
                                  <td className="p-4 font-black text-slate-900 text-sm">Rs {ad.price}</td>
                                  <td className="p-4">
                                    <div className="font-extrabold text-slate-900 text-xs">{contactName}</div>
                                    <a 
                                      href={`https://wa.me/${contactPhone}?text=Assalam-o-Alaikum, I am inquiring about Phase 8 Plot (${ad.area} Sq.Yd): #${100 + idx}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-emerald-600 font-black flex items-center gap-1.5 mt-1 hover:underline text-xs"
                                    >
                                      🟢 {contactPhone}
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

      <footer className="bg-[#0A1128] border-t border-amber-500/20 text-white py-6 text-center text-xs font-bold">
        <p>© {new Date().getFullYear()} DHA PLOTS — Phase 8 Residential Portal</p>
      </footer>
    </div>
  );
}