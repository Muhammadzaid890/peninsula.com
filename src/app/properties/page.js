'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Router for the back button

export default function PropertiesPage() {
  const router = useRouter();
  const [allListings, setAllListings] = useState([]);
  const [filteredAds, setFilteredAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sectionSearchQuery, setSectionSearchQuery] = useState('');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const adsPerPage = 15;

  // Modal States
  const [selectedAd, setSelectedAd] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeImageIndices, setActiveImageIndices] = useState({});
  const [modalImageIdx, setModalImageIdx] = useState(0);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Global Target Contact Config
  const adminPhone = '923132099816';
  const displayPhone = '03132099816';

  const fetchAllAds = async () => {
    try {
      const res = await fetch('/api/listings');
      const data = await res.json();
      if (Array.isArray(data)) {
        const sorted = [...data].sort((a, b) => {
          const priority = { ultra_premium: 3, premium: 2, simple: 1 };
          const pA = priority[a.ad_type] || 1;
          const pB = priority[b.ad_type] || 1;
          if (pB !== pA) return pB - pA;
          return new Date(b.refreshed_at) - new Date(a.refreshed_at);
        });
        setAllListings(sorted);
      }
    } catch (err) {
      console.error("Error fetching ads:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAds();
  }, []);

  const propertyListings = allListings.filter(ad => ad.listing_type !== 'project');
  const projectListings = allListings.filter(ad => ad.listing_type === 'project');

  useEffect(() => {
    if (sectionSearchQuery.trim() === '') {
      setFilteredAds(propertyListings);
    } else {
      const query = sectionSearchQuery.toLowerCase();
      const filtered = propertyListings.filter(ad => 
        ad.title?.toLowerCase().includes(query) ||
        ad.location?.toLowerCase().includes(query) ||
        ad.sub_category?.toLowerCase().includes(query) ||
        ad.price?.toLowerCase().includes(query) ||
        ad.id?.toString().includes(query)
      );
      setFilteredAds(filtered);
    }
    setCurrentPage(1); 
  }, [sectionSearchQuery, allListings]);

  const indexOfLastAd = currentPage * adsPerPage;
  const indexOfFirstAd = indexOfLastAd - adsPerPage;
  const currentAds = filteredAds.slice(indexOfFirstAd, indexOfLastAd);
  const totalPages = Math.ceil(filteredAds.length / adsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nextImage = (adId, imagesLength) => {
    setActiveImageIndices(prev => ({ ...prev, [adId]: ((prev[adId] || 0) + 1) % imagesLength }));
  };

  const prevImage = (adId, imagesLength) => {
    setActiveImageIndices(prev => ({ ...prev, [adId]: ((prev[adId] || 0) - 1 + imagesLength) % imagesLength }));
  };

  const nextModalImage = (imagesLength) => { setModalImageIdx(prev => (prev + 1) % imagesLength); };
  const prevModalImage = (imagesLength) => { setModalImageIdx(prev => (prev - 1 + imagesLength) % imagesLength); };

  const handleViewAd = (ad) => {
    setSelectedAd(ad);
    setModalImageIdx(0);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#0F172A] font-sans">
      
      {/* Navbar */}
      <nav className="bg-[#0A1128] border-b border-amber-500/20 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between relative">
          <span className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
            <a href="/">PENINSULA COMMERCIAL</a>
          </span>
          <div className="hidden md:flex space-x-6 text-xs uppercase tracking-widest font-bold text-gray-300">
            <a href="/" className="hover:text-amber-400">Home</a>
            <a href="/properties" className="text-amber-500 hover:text-amber-400">Properties</a>
            <a href="/#projects" className="hover:text-amber-400">New Projects</a>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-8">
        
        {/* ELEGANT BACK NAVIGATION ANCHOR */}
        <div className="mb-6">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-[#0A1128] hover:text-amber-600 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200 transition-colors"
          >
            <span>⬅</span> <span>Go Back Home</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Properties Listings Feed */}
          <div className="lg:col-span-8 space-y-6">
            
            <div className="border-b border-gray-200 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-black uppercase tracking-wider text-[#0A1128]">All Listed Properties</h1>
                <p className="text-xs text-gray-500 font-semibold mt-0.5">Showing {indexOfFirstAd + 1}-{Math.min(indexOfLastAd, filteredAds.length)} of {filteredAds.length} properties</p>
              </div>

              <div className="relative w-full sm:w-64">
                <input 
                  type="text"
                  value={sectionSearchQuery}
                  onChange={(e) => setSectionSearchQuery(e.target.value)}
                  placeholder="Filter by title, price, or ID..."
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0A1128] pl-8 shadow-sm"
                />
                <span className="absolute left-2.5 top-2.5 text-gray-400 text-xs">🔍</span>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-20 text-[#0A1128] font-bold text-lg animate-pulse">Loading properties database...</div>
            ) : currentAds.length === 0 ? (
              <div className="text-center py-20 text-gray-500 border-2 border-dashed border-gray-300 rounded-3xl bg-white p-6">No matching entries found.</div>
            ) : (
              <div className="space-y-6">
                {currentAds.map((ad) => {
                  const adImages = ad.images && ad.images.length > 0 ? ad.images : ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'];
                  const currentImgIdx = activeImageIndices[ad.id] || 0;

                  return (
                    <div 
                      key={ad.id}
                      className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border flex flex-col sm:flex-row p-4 gap-6 relative ${
                        ad.ad_type === 'ultra_premium' ? 'border-red-500/30 bg-red-500/[0.01]' : ad.ad_type === 'premium' ? 'border-amber-500/30 bg-amber-500/[0.01]' : 'border-gray-200/80'
                      }`}
                    >
                      {/* Image Frame with Corner Badge Layout */}
                      <div className="relative w-full sm:w-52 h-40 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 group">
                        <img src={adImages[currentImgIdx]} alt={ad.title} className="w-full h-full object-cover" />
                        
                        {/* 👑 SLEEK AND COMPACT CORNER PRIORITY TYPE BADGE */}
                        {ad.ad_type !== 'simple' && (
                          <div className={`absolute top-2 right-2 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md text-white shadow ${
                            ad.ad_type === 'ultra_premium' ? 'bg-gradient-to-r from-red-500 to-rose-600' : 'bg-gradient-to-r from-amber-500 to-amber-600'
                          }`}>
                            {ad.ad_type === 'ultra_premium' ? 'Ultra' : 'Premium'}
                          </div>
                        )}

                        <div className="absolute top-2 left-2 bg-[#009640] text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shadow-md">{adImages.length}</div>
                        {adImages.length > 1 && (
                          <>
                            <button onClick={(e) => { e.stopPropagation(); prevImage(ad.id, adImages.length); }} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">❮</button>
                            <button onClick={(e) => { e.stopPropagation(); nextImage(ad.id, adImages.length); }} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">❯</button>
                          </>
                        )}
                        <span className="absolute bottom-2 left-2 bg-[#0A1128] text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded shadow">For {ad.purpose}</span>
                      </div>

                      {/* Details Content */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center flex-wrap gap-2">
                            <span className="text-xl font-black text-[#006F70]">Rs {ad.price}</span>
                          </div>
                          <div className="mt-1.5">
                            <span className="inline-block bg-[#E8F8EE] text-[#008A45] text-xs font-bold px-2.5 py-1 rounded-md capitalize">{ad.sub_category} for {ad.purpose === 'sale' ? 'Buy' : 'Rent'}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-2 font-medium line-clamp-2">{ad.location}</p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <span className="text-xs text-gray-400 font-semibold uppercase">ID: 544{ad.id}</span>
                          <div className="flex gap-2">
                            <button onClick={() => handleViewAd(ad)} className="px-3 py-1.5 bg-[#0A1128] text-white text-[11px] font-extrabold rounded-lg uppercase">View Details</button>
                            <a href={`tel:+${adminPhone}`} className="px-3 py-1.5 bg-slate-100 text-[#0A1128] border border-gray-200 text-[11px] font-extrabold rounded-lg uppercase text-center">Call</a>
                            <a href={`https://wa.me/${adminPhone}?text=Inquiry ID: 544${ad.id}`} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-[#25D366] text-white text-[11px] font-extrabold rounded-lg uppercase text-center flex items-center justify-center gap-1 shadow-sm">WhatsApp</a>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="pt-8 flex items-center justify-center space-x-2">
                <button disabled={currentPage === 1} onClick={() => paginate(currentPage - 1)} className="px-3 py-2 border rounded-xl text-xs font-bold bg-white text-gray-700 disabled:opacity-40">❮ Previous</button>
                {Array.from({ length: totalPages }, (_, index) => (
                  <button key={index + 1} onClick={() => paginate(index + 1)} className={`w-9 h-9 text-xs font-extrabold rounded-xl border ${currentPage === index + 1 ? 'bg-[#0A1128] text-white' : 'bg-white text-gray-700'}`}>{index + 1}</button>
                ))}
                <button disabled={currentPage === totalPages} onClick={() => paginate(currentPage + 1)} className="px-3 py-2 border rounded-xl text-xs font-bold bg-white text-gray-700 disabled:opacity-40">Next ❯</button>
              </div>
            )}

          </div>

          {/* Right sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">Live Booking</span>
              <h3 className="text-lg font-black text-[#0A1128] mt-2 mb-4">Newly Projects Feed</h3>
              <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                {projectListings.map((project) => (
                  <div key={project.id} onClick={() => handleViewAd(project)} className="flex items-center gap-3 pb-3 border-b hover:opacity-80 cursor-pointer group">
                    <div className="w-16 h-12 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={project.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=150&q=80'} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-gray-800 truncate">{project.title}</h4>
                      <span className="text-[11px] font-bold text-amber-600">Rs {project.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Dynamic view detail modal layout */}
      {isModalOpen && selectedAd && (
        <div className="fixed inset-0 bg-[#0A1128]/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 z-10 bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">✕</button>
            <div className="p-6 md:p-8">
              <h2 className="text-2xl font-black text-[#0A1128]">{selectedAd.title}</h2>
              <p className="text-2xl font-black text-[#006F70] mt-1">Rs {selectedAd.price}</p>
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <a href={`tel:+${adminPhone}`} className="flex-1 py-3 bg-[#0A1128] text-white text-xs font-extrabold rounded-xl uppercase text-center flex items-center justify-center">📞 Call Representative</a>
                <a href={`https://wa.me/${adminPhone}?text=Inquiry ID: 544${selectedAd.id}`} target="_blank" rel="noreferrer" className="flex-1 py-3 bg-[#25D366] text-white text-xs font-extrabold rounded-xl uppercase text-center flex items-center justify-center">💬 WhatsApp</a>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}