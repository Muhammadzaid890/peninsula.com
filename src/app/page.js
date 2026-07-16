'use client';

import { useState, useEffect } from 'react';

// DHA Karachi Phase and Key Commercial Areas suggestions list
const dhaAreas = [
  'DHA Phase 1', 'DHA Phase 2', 'DHA Phase 4', 'DHA Phase 5', 'DHA Phase 6', 'DHA Phase 7', 'DHA Phase 8', 
  'DHA Phase 8 - Zone A', 'DHA Phase 8 - Zone B', 'DHA Phase 8 - Zone C', 'DHA Phase 8 - Zone D', 'DHA Phase 8 - Zone E',
  'DHA Phase 8 Extension', 'Sahil Commercial', 'Al Murtaza Commercial', 'Bukhari Commercial', 'Shahbaz Commercial', 'Badar Commercial'
];

// Defined Accordion Zones Matching Database Mapping Properties
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

  // Accordion Expand Toggle State
  const [openZone, setOpenZone] = useState(null);

  // Authentication states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('user'); 
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  // Contact Popup State
  const [showContactPopup, setShowContactPopup] = useState(false);

  // Admin Operational Config Profile
  const [adminConfig, setAdminConfig] = useState({
    name: '🔴 System Admin',
    email: 'admin@peninsula.com',
    password: 'admin@123',
    phone: '03331234201', 
    displayPhone: '03331234201' 
  });

  // Settings form input states
  const [settingName, setSettingName] = useState('');
  const [settingEmail, setSettingEmail] = useState('');
  const [settingPassword, setSettingPassword] = useState('');
  const [settingPhone, setSettingPhone] = useState('');

  // Login form input states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4000);
  };

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
      triggerToast('❌ Network connection error. Data load nahi ho saka!', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveAds();
    const savedRole = localStorage.getItem('userRole');
    if (savedRole) {
      setIsLoggedIn(true);
      setUserRole(savedRole);
    }

    const storedConfig = localStorage.getItem('admin_profile_config');
    if (storedConfig) {
      const parsed = JSON.parse(storedConfig);
      setAdminConfig(parsed);
    }
  }, []);

  // Real-time filtering based on Search input
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredAds(ads);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = ads.filter(ad => {
        return (
          ad.title?.toLowerCase().includes(query) ||
          ad.location?.toLowerCase().includes(query) ||
          ad.sub_category?.toLowerCase().includes(query)
        );
      });
      setFilteredAds(filtered);
    }
  }, [searchQuery, ads]);

  // Login handler
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (loginEmail === adminConfig.email && loginPassword === adminConfig.password) {
      setIsLoggedIn(true);
      setUserRole('admin');
      localStorage.setItem('userRole', 'admin');
      
      // Middleware session cookie deployment logic
      document.cookie = "userRole=admin; path=/; max-age=86400"; 
      
      triggerToast('🎉 Welcome back, Admin!', 'success');
    } else {
      setIsLoggedIn(true);
      setUserRole('user');
      localStorage.setItem('userRole', 'user');
      triggerToast('👤 Logged in as standard user.', 'success');
    }
    setShowLoginModal(false);
    setShowAuthDropdown(false);
    setLoginEmail('');
    setLoginPassword('');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole('user');
    localStorage.removeItem('userRole');
    
    // Clear session cookies for route guard block safety
    document.cookie = "userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    
    setShowAuthDropdown(false);
    triggerToast('🚪 Session logged out.', 'info');
  };

  // Profile Settings handler
  const handleSettingsSave = (e) => {
    e.preventDefault();
    const rawPhone = settingPhone.trim();
    const formattedPhoneLink = rawPhone.startsWith('0') ? '92' + rawPhone.slice(1) : rawPhone;
    const formattedDisplay = rawPhone.startsWith('92') ? '0' + rawPhone.slice(2) : rawPhone;

    const updated = {
      name: settingName || adminConfig.name,
      email: settingEmail || adminConfig.email,
      password: settingPassword || adminConfig.password,
      phone: formattedPhoneLink || adminConfig.phone,
      displayPhone: formattedDisplay || adminConfig.displayPhone
    };
    setAdminConfig(updated);
    localStorage.setItem('admin_profile_config', JSON.stringify(updated));
    triggerToast('⚙️ Settings synchronized globally!', 'success');
    setShowSettingsModal(false);
  };

  const openSettingsModal = () => {
    setSettingName(adminConfig.name);
    setSettingEmail(adminConfig.email);
    setSettingPassword(adminConfig.password);
    setSettingPhone(adminConfig.displayPhone);
    setShowSettingsModal(true);
    setShowAuthDropdown(false);
  };

  const handleSelectArea = (area) => {
    setSearchQuery(area);
    setShowSuggestions(false); 
  };

  const toggleZone = (zoneId) => {
    setOpenZone(openZone === zoneId ? null : zoneId);
  };

  // Explicitly gets listings that are tagged for homepage under the corresponding zone ID
  const getZoneListings = (zoneId) => {
    return filteredAds.filter(ad => {
      return ad.show_on_home === true && ad.commercial_zone === zoneId;
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#0F172A] font-sans relative flex flex-col justify-between">
      
      <div>
        {/* TOAST CONTAINER */}
        {toast.show && (
          <div className="fixed bottom-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl border border-emerald-200 bg-emerald-50 text-emerald-800 animate-in fade-in slide-in-from-bottom-5 duration-300">
            <span>{toast.message}</span>
          </div>
        )}

        {/* 1. NAVBAR */}
        <nav className="bg-[#0A1128] border-b border-amber-500/20 sticky top-0 z-40 shadow-md">
          <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between relative">
            <div className="flex items-center space-x-3">
              <span className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
                <a href="/">PENINSULA COMMERCIAL</a>
              </span>
            </div>
            
            <div className="hidden md:flex space-x-6 text-xs uppercase tracking-widest font-bold text-gray-300">
              <a href="/" className=" hover:text-amber-400">Home</a>
              <a href="/properties" className="hover:text-amber-400">Properties</a>
              <button onClick={() => setShowContactPopup(true)} className="hover:text-amber-400 uppercase tracking-widest font-bold focus:outline-none">Contact</button>
            </div>

            <div className="flex items-center space-x-3 relative">
              {isLoggedIn && userRole === 'admin' && (
                <a href="/admin/add-ad" className="hidden sm:inline-block px-4 py-2 bg-amber-500 hover:bg-amber-600 text-[#070F2B] font-extrabold rounded-lg text-xs uppercase tracking-wider transition-all">
                  + Post Ad
                </a>
              )}

              <button 
                onClick={(e) => { e.stopPropagation(); setShowAuthDropdown(!showAuthDropdown); setShowMobileMenu(false); }}
                className="w-9 h-10 rounded-full bg-slate-800 border-2 border-amber-500/30 flex items-center justify-center text-white text-base hover:border-amber-500 transition-all shadow-md focus:outline-none"
              >
                👤
              </button>

              <button 
                onClick={(e) => { e.stopPropagation(); setShowMobileMenu(!showMobileMenu); setShowAuthDropdown(false); }}
                className="md:hidden w-9 h-9 flex items-center justify-center bg-slate-800 border border-gray-700 text-white rounded-lg text-lg focus:outline-none"
              >
                {showMobileMenu ? '✕' : '☰'}
              </button>

              {showAuthDropdown && (
                <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden divide-y divide-gray-100 text-[#0F172A]" onClick={(e) => e.stopPropagation()}>
                  {!isLoggedIn ? (
                    <div className="p-4 space-y-3">
                      <p className="text-xs text-gray-500 font-semibold text-center">Manage listings and view exclusive deals</p>
                      <button onClick={() => { setShowLoginModal(true); setShowAuthDropdown(false); }} className="w-full py-2 bg-[#0A1128] text-white font-extrabold text-xs rounded-xl transition-all uppercase">Login / Sign Up</button>
                    </div>
                  ) : (
                    <div>
                      <div className="p-4 bg-slate-50">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Signed In As</p>
                        <p className="text-sm font-black text-[#0A1128] capitalize mt-0.5">{userRole === 'admin' ? adminConfig.name : 'Standard User'}</p>
                      </div>
                      <div className="p-2 space-y-1">
                        {userRole === 'admin' && (
                          <>
                            <a href="/admin" className="block w-full px-3 py-2 text-xs font-bold rounded-lg text-gray-700 hover:bg-amber-500/10 transition-all">📊 Go to Admin Dashboard</a>
                            <a href="/admin/add-ad" className="block w-full px-3 py-2 text-xs font-bold rounded-lg text-gray-700 hover:bg-amber-500/10 transition-all">➕ Post New Ad Form</a>
                            <button onClick={openSettingsModal} className="w-full text-left px-3 py-2 text-xs font-bold rounded-lg text-gray-700 hover:bg-amber-500/10 transition-all">⚙️ Account Settings</button>
                          </>
                        )}
                        <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-xs font-bold rounded-lg text-red-500 hover:bg-red-50 transition-all">🚪 Logout Session</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {showMobileMenu && (
            <div className="absolute top-16 left-0 right-0 bg-[#0A1128] p-4 flex flex-col space-y-3 z-50 text-center md:hidden border-b border-amber-500/20" onClick={(e) => e.stopPropagation()}>
              <a href="/" onClick={() => setShowMobileMenu(false)} className="text-amber-500 font-bold text-sm py-1 border-b border-slate-800/60">Home</a>
              <a href="/properties" onClick={() => setShowMobileMenu(false)} className="text-gray-300 font-bold text-sm py-1 border-b border-slate-800/60 hover:text-amber-400">Properties</a>
              <button onClick={() => { setShowContactPopup(true); setShowMobileMenu(false); }} className="text-gray-300 font-bold text-sm py-2 hover:text-amber-400 block w-full text-center">Contact</button>
            </div>
          )}
        </nav>

        {/* 2. HERO SECTION */}
        <section className="bg-gradient-to-b from-[#0A1128] to-[#1E293B] text-white py-16 px-4 text-center border-b border-amber-500/10 relative overflow-visible">
          <div className="max-w-3xl mx-auto relative z-20">
            <span className="text-xs uppercase tracking-widest text-amber-500 font-extrabold px-3 py-1 bg-amber-500/10 rounded-full">Interactive Portal</span>
            <h1 className="text-3xl md:text-5xl font-black mt-3 tracking-tight">DHA Commercial Plot Matrix</h1>
            <p className="text-gray-300 text-xs md:text-sm mt-3 max-w-xl mx-auto">Instant search filters across major business commercial zones of DHA Karachi.</p>

            <div className="mt-8 max-w-2xl mx-auto relative" onClick={(e) => e.stopPropagation()}>
              <div className="bg-white p-2 rounded-2xl shadow-xl flex items-center border-2 border-amber-500/30">
                <span className="text-gray-400 text-lg px-3">🔍</span>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)} 
                  placeholder="Search premium properties..."
                  className="w-full bg-transparent text-[#0F172A] focus:outline-none text-sm md:text-base font-semibold py-2.5"
                />
                {searchQuery && <button onClick={() => { setSearchQuery(''); setShowSuggestions(true); }} className="text-gray-400 hover:text-gray-600 font-black px-3 text-sm">✕</button>}
              </div>

              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white text-[#0F172A] rounded-2xl shadow-2xl border border-gray-100 max-h-60 overflow-y-auto text-left z-30 divide-y divide-gray-100">
                  <div className="p-3 bg-gray-50 text-[10px] font-extrabold tracking-wider text-gray-400 uppercase">DHA Phases & Commercial Sectors</div>
                  {dhaAreas
                    .filter(area => area.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((area, idx) => (
                      <button key={idx} onClick={() => handleSelectArea(area)} className="w-full px-4 py-3 text-sm hover:bg-slate-50 text-left font-bold text-slate-800 flex items-center justify-between">
                        <span>📍 {area}</span>
                        <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded uppercase font-bold">Map Filter</span>
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>
          {showSuggestions && <div className="fixed inset-0 z-10" onClick={() => setShowSuggestions(false)}></div>}
        </section>

        {showAuthDropdown && <div className="fixed inset-0 z-10" onClick={() => setShowAuthDropdown(false)}></div>}
        {showMobileMenu && <div className="fixed inset-0 z-10" onClick={() => setShowMobileMenu(false)}></div>}

        {/* 3. COMMERCIAL ACCORDION LIST VIEW AREA */}
        <div className="max-w-7xl mx-auto px-4 py-12 md:px-8 space-y-4">
          
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((skeletonId) => (
                <div key={skeletonId} className="h-16 bg-[#0A1128]/50 border border-slate-800 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            commercialZones.map((zone) => {
              const zoneListings = getZoneListings(zone.id);
              const isOpen = openZone === zone.id;

              return (
                <div key={zone.id} className="rounded-xl overflow-hidden shadow-sm border border-slate-800 bg-[#0A1128] text-white">
                  
                  {/* Accordion Zone Header Bar */}
                  <button 
                    onClick={() => toggleZone(zone.id)}
                    className="w-full p-4 flex justify-between items-center text-left hover:bg-slate-900/60 transition-all focus:outline-none"
                  >
                    <div className="flex items-center space-x-6">
                      <span className="text-xs font-bold tracking-wider bg-black/40 px-3 py-1.5 rounded-md min-w-[85px] text-center border border-slate-700">
                        {zoneListings.length} listings
                      </span>
                      <h3 className="text-sm md:text-base font-black tracking-widest uppercase text-slate-100">{zone.name}</h3>
                    </div>
                    <span className={`text-sm transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
                      ▼
                    </span>
                  </button>

                  {/* Dropdown Container Area */}
                  {isOpen && (
                    <div className="bg-white text-slate-900 border-t border-slate-800 overflow-x-auto animate-in slide-in-from-top-2 duration-200">
                      {zoneListings.length === 0 ? (
                        <div className="p-8 text-center text-xs text-gray-400 font-bold bg-slate-50">
                          No commercial active items currently updated in this partition.
                        </div>
                      ) : (
                        <table className="w-full text-left border-collapse text-xs font-semibold min-w-[800px]">
                          <thead>
                            <tr className="bg-slate-100 text-gray-500 border-b border-gray-200 uppercase tracking-wider text-[10px]">
                              <th className="p-3 w-16 text-center">#</th>
                              <th className="p-3 w-2/5">Description</th>
                              <th className="p-3">Size</th>
                              <th className="p-3">Floor</th>
                              <th className="p-3">Phase</th>
                              <th className="p-3">Features</th>
                              <th className="p-3">Price / Sq.Yd</th>
                              <th className="p-3">Agent Anchor</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 bg-white font-medium text-gray-700">
                            {zoneListings.map((ad, idx) => (
                              <tr key={ad.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="p-3 text-center text-gray-400 font-bold">#{70 + idx}</td>
                                <td className="p-3">
                                  <div className="font-black text-slate-900 text-sm">{ad.title}</div>
                                  <div className="text-gray-400 text-[11px] mt-0.5">{ad.location || 'Lane Address Specified'}</div>
                                </td>
                                <td className="p-3">
                                  <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md font-bold text-[11px] border">
                                    {ad.area} {ad.area_unit || 'sq.yd'}
                                  </span>
                                </td>
                                <td className="p-3 text-gray-400">—</td>
                                <td className="p-3">
                                  <span className="bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-md border border-blue-100">
                                    {ad.location?.split(',')[0] || 'DHA'}
                                  </span>
                                </td>
                                <td className="p-3 text-gray-400">—</td>
                                <td className="p-3 font-bold text-slate-900">Rs {ad.price}</td>
                                <td className="p-3">
                                  <div className="font-bold text-slate-900">Peninsula Support</div>
                                  <a 
                                    href={`https://wa.me/${adminConfig.phone}?text=Assalam-o-Alaikum, I am inquiring about Commercial Listing ID: #${70 + idx}`}
                                    target="_blank"
                                    className="text-emerald-600 font-bold flex items-center gap-1 mt-0.5 hover:underline"
                                  >
                                    🟢 {adminConfig.displayPhone}
                                  </a>
                                </td>
                              </tr>
                            ))}
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

      {/* 4. PREMIUM COMPACT CONTACT MODAL POPUP */}
      {showContactPopup && (
        <div className="fixed inset-0 bg-[#0A1128]/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 md:p-8 shadow-2xl relative text-center border">
            <button onClick={() => setShowContactPopup(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-sm">✕</button>
            <div className="w-16 h-16 bg-amber-500/10 text-amber-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">📞</div>
            <h3 className="text-xl font-black text-[#0A1128]">Contact Representative</h3>
            <p className="text-xs text-gray-400 mt-1 mb-6">Peninsula Commercial Hot Support Desk</p>
            <div className="bg-slate-50 border rounded-2xl p-4 mb-6">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Official Number</span>
              <p className="text-xl font-black text-[#0A1128] tracking-wide mt-0.5">{adminConfig.displayPhone}</p>
            </div>
            <div className="space-y-3">
              <a href={`tel:+${adminConfig.phone}`} className="block w-full py-3 bg-[#0A1128] text-white font-black text-xs uppercase tracking-wider rounded-xl text-center">📞 Direct Phone Call</a>
              <a href={`https://wa.me/${adminConfig.phone}?text=Hello Peninsula Commercial, I want to inquire about DHA properties.`} target="_blank" rel="noreferrer" className="block w-full py-3 bg-[#25D366] text-white font-black text-xs uppercase tracking-wider rounded-xl text-center">💬 WhatsApp</a>
            </div>
          </div>
        </div>
      )}

      {/* Administrative Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-[#0A1128]/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 md:p-8 shadow-2xl relative text-left">
            <button onClick={() => setShowSettingsModal(false)} className="absolute top-4 right-4 text-gray-400 font-bold text-sm">✕</button>
            <h3 className="text-xl font-black text-[#0A1128] mb-4">⚙️ Account Settings</h3>
            <form onSubmit={handleSettingsSave} className="space-y-4">
              <input type="text" value={settingName} onChange={(e) => setSettingName(e.target.value)} placeholder="Name" className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl" />
              <input type="email" value={settingEmail} onChange={(e) => setSettingEmail(e.target.value)} placeholder="Email" className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl" />
              <input type="text" value={settingPassword} onChange={(e) => setSettingPassword(e.target.value)} placeholder="Password" className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl" />
              <input type="text" value={settingPhone} onChange={(e) => setSettingPhone(e.target.value)} placeholder="03132099816" className="w-full px-4 py-2.5 bg-slate-50 border border-amber-300 rounded-xl text-amber-700 font-black" />
              <button type="submit" className="w-full py-3 bg-[#0A1128] text-white font-black text-xs uppercase rounded-xl">Save Updates</button>
            </form>
          </div>
        </div>
      )}

      {/* Login Form Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-[#0A1128]/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl relative border">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-gray-400 font-bold text-sm">✕</button>
            <h3 className="text-xl font-black text-[#0A1128] mb-4">Welcome Back</h3>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="Email" className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl" />
              <input type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl" />
              <button type="submit" className="w-full py-3 bg-[#0A1128] text-white font-black text-xs uppercase tracking-wider rounded-xl">Log In Securely</button>
            </form>
          </div>
        </div>
      )}

      {/* 5. PREMIUM LUXURY DARK NAVY FOOTER WITH EARTH DEVELOPER'S BRANDING */}
      <footer className="bg-[#0A1128] border-t border-amber-500/20 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 py-12 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Column 1: Brand Pitch */}
          <div className="space-y-3">
            <h4 className="text-base font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
              PENINSULA COMMERCIAL
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              DHA Karachi's premier elite real estate investment and booking portal. Providing ultra priority solutions for plots, structures, and premium apartments.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-2">
            <h4 className="text-xs uppercase tracking-widest text-amber-500 font-extrabold">Quick Navigation</h4>
            <div className="flex flex-col space-y-1.5 text-xs text-gray-400 font-medium">
              <a href="/" className="hover:text-amber-400 transition-colors">Home Feed</a>
              <a href="/properties" className="hover:text-amber-400 transition-colors">All Listed Properties</a>
            </div>
          </div>

          {/* Column 3: Global Verified Contact Support Desk */}
          <div className="space-y-2">
            <h4 className="text-xs uppercase tracking-widest text-amber-500 font-extrabold">Support Desk</h4>
            <div className="text-xs text-gray-400 space-y-1">
              <p className="font-semibold text-gray-300">📍 Phase 8, Commercial Hub, DHA, Karachi</p>
              <p className="pt-1">📞 Call Support: <a href={`tel:+${adminConfig.phone}`} className="text-amber-400 font-bold underline">{adminConfig.displayPhone}</a></p>
              <p>💬 WhatsApp: <a href={`https://wa.me/${adminConfig.phone}`} target="_blank" rel="noreferrer" className="text-emerald-400 font-bold underline">{adminConfig.displayPhone}</a></p>
            </div>
          </div>

        </div>

        {/* Dynamic Copyright Bar containing Earth Developer's Partnership node */}
        <div className="bg-[#070F2B] py-4 border-t border-slate-900 text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest flex flex-col sm:flex-row justify-center items-center gap-1">
          <span>© {new Date().getFullYear()} Peninsula Commercial. All Rights Reserved.</span>
          <span className="text-amber-500 font-black sm:before:content-['|'] sm:before:mr-1 sm:before:text-gray-600">
            A Project by Earth Developer's
          </span>
        </div>
      </footer>

    </div>
  );
}