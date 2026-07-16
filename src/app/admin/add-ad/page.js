'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const categoryMapping = {
  home: ['house', 'flat', 'portion'],
  plot: ['residential plot', 'commercial plot'],
  commercial: ['building', 'office', 'shop', 'warehouse']
};

const amenityOptions = [
  'Electricity', 'Water', 'Gas', 'Sewerage', 'Boundary Wall', 'Security'
];

export default function AddAdPage() {
  const router = useRouter();
  const [listingType, setListingType] = useState('property'); // 'property' or 'project'
  const [mainCat, setMainCat] = useState('home');
  const [subCat, setSubCat] = useState('house');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🟢 Accordion Placement States
  const [showOnHome, setShowOnHome] = useState(false);
  const [commercialZone, setCommercialZone] = useState('business_zone');

  const handleAmenityChange = (amenity) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter(item => item !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.target);
    const imageFiles = formData.getAll('images'); 

    let uploadedImageUrls = [];

    // 1. Upload Images to Cloudinary if selected
    if (imageFiles && imageFiles.length > 0 && imageFiles[0].size > 0) {
      setUploading(true);
      try {
        for (const file of imageFiles) {
          const uploadData = new FormData();
          uploadData.append('file', file);

          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: uploadData,
          });

          const uploadResult = await uploadRes.json();
          if (uploadResult.success) {
            uploadedImageUrls.push(uploadResult.url);
          }
        }
      } catch (err) {
        console.error("Upload error:", err);
        alert("❌ Images upload karne mein masla aaya!");
        setUploading(false);
        setIsSubmitting(false);
        return;
      }
      setUploading(false);
    }

    // 2. Build Payload matching the updated listings route
    const adData = {
      title: formData.get('title'),
      price: formData.get('price'),
      location: formData.get('location'),
      description: formData.get('description'),
      purpose: formData.get('purpose'),
      main_category: mainCat,
      sub_category: subCat,
      images: uploadedImageUrls, 
      area: formData.get('area'),
      area_unit: formData.get('area_unit'),
      beds: mainCat === 'home' ? formData.get('beds') : null,
      baths: mainCat === 'home' ? formData.get('baths') : null,
      amenities: selectedAmenities,
      listing_type: listingType,
      show_on_home: showOnHome, // Sent to backend boolean field
      commercial_zone: showOnHome ? commercialZone : null // Target accordion bar mapping
    };

    try {
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adData),
      });

      const result = await response.json();
      if (result.success) {
        alert('🎉 Ad/Project successfully publish ho gaya!');
        e.target.reset();
        setSelectedAmenities([]);
        setListingType('property');
        setShowOnHome(false);
        
        // Redirect based on routing selection
        router.push(showOnHome ? '/' : '/properties');
      } else {
        alert(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      alert('❌ Connection failed!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#0F172A] font-sans py-12 px-4">
      
      {/* 🟢 TOP NAVIGATION BUTTONS (BACK ANCHORS) */}
      <div className="max-w-3xl mx-auto mb-6 flex flex-wrap gap-4">
        <button 
          onClick={() => router.push('/admin')}
          className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-[#0A1128] hover:text-amber-600 bg-white px-4 py-2.5 rounded-xl shadow-sm border border-gray-200 transition-colors focus:outline-none"
        >
          <span>⬅</span> <span>Back to Admin Dashboard</span>
        </button>
        <button 
          onClick={() => router.push('/')}
          className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-[#0A1128] hover:text-amber-600 bg-white px-4 py-2.5 rounded-xl shadow-sm border border-gray-200 transition-colors focus:outline-none"
        >
          <span>🏠</span> <span>Back to Home</span>
        </button>
      </div>

      <div className="max-w-3xl mx-auto bg-white border border-gray-200/80 rounded-3xl overflow-hidden shadow-2xl">
        
        {/* Navy Blue Header Panel matching the brand */}
        <div className="bg-[#0A1128] text-white p-6 md:p-8 border-b border-amber-500/20">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full">
            Admin Management
          </span>
          <h1 className="text-2xl md:text-3xl font-black mt-2">
            Create Listing / Booking Entry
          </h1>
          <p className="text-gray-300 text-xs mt-1">Publish standard listings or newly launching booking projects.</p>
        </div>

        {/* Content Form Body */}
        <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-6">
          
          {/* SYSTEM SELECTOR: Property vs Booking Project */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-2">Classification / Ad Type</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setListingType('property')}
                className={`py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all border ${
                  listingType === 'property' 
                    ? 'bg-[#0A1128] text-white border-[#0A1128] shadow-md' 
                    : 'bg-slate-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                }`}
              >
                🏠 Standard Property Ad
              </button>
              <button
                type="button"
                onClick={() => setListingType('project')}
                className={`py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all border ${
                  listingType === 'project' 
                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/10' 
                    : 'bg-slate-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                }`}
              >
                🏗️ New Project / Booking Scheme
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#0A1128] font-bold mb-2">Title / Advertisement Header</label>
            <input 
              name="title" 
              required 
              placeholder={listingType === 'project' ? "e.g., Peninsula Mall & Residency - 3 Bed Booking" : "e.g., DHA Phase 8 - Zone D - Residential Plot"} 
              className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl font-semibold text-sm focus:outline-none focus:border-[#0A1128]"
            />
          </div>

          {/* Price & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#0A1128] font-bold mb-2">
                {listingType === 'project' ? "Booking Starting From / Price" : "Price / Demand (Rs)"}
              </label>
              <input 
                name="price" 
                required 
                placeholder="e.g., 90,000,000 or 15 Lacs Down" 
                className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl font-semibold text-sm focus:outline-none focus:border-[#0A1128]"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#0A1128] font-bold mb-2">Location / Site Address</label>
              <input 
                name="location" 
                required 
                placeholder="e.g., Bukhari Commercial, DHA Phase 6, Karachi" 
                className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl font-semibold text-sm focus:outline-none focus:border-[#0A1128]"
              />
            </div>
          </div>

          {/* Purpose & Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#0A1128] font-bold mb-2">Purpose</label>
              <select name="purpose" className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl font-semibold text-sm focus:outline-none">
                <option value="sale">For Sale / Booking</option>
                <option value="rent">For Rent</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#0A1128] font-bold mb-2">Main Category</label>
              <select 
                value={mainCat} 
                onChange={(e) => {
                  setMainCat(e.target.value);
                  setSubCat(categoryMapping[e.target.value][0]);
                }}
                className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl font-semibold text-sm focus:outline-none"
              >
                <option value="home">🏠 Home / Building / Flat</option>
                <option value="plot">🗺️ Plot</option>
                <option value="commercial">🏢 Commercial Hub</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#0A1128] font-bold mb-2">Sub-Category</label>
              <select 
                value={subCat} 
                onChange={(e) => setSubCat(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl font-semibold text-sm focus:outline-none capitalize"
              >
                {categoryMapping[mainCat].map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 🟢 DYNAMIC GATEWAY: SHOW ON ACCORDION TARGETING BAR */}
          <div className="p-4 bg-amber-500/5 rounded-2xl border-2 border-dashed border-amber-500/20 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs uppercase text-[#0A1128] font-black">Show on Home Page Accordion List?</label>
                <span className="text-[10px] text-gray-400 block lowercase font-normal mt-0.5">If yes, this listing will render inside the text matrix lists on home.</span>
              </div>
              <input 
                type="checkbox" 
                checked={showOnHome} 
                onChange={(e) => setShowOnHome(e.target.checked)} 
                className="w-5 h-5 accent-[#0A1128] cursor-pointer"
              />
            </div>

            {showOnHome && (
              <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                <label className="block text-[11px] uppercase mb-1 text-amber-700 font-black">Select Target Commercial Accordion Bar:</label>
                <select 
                  value={commercialZone} 
                  onChange={(e) => setCommercialZone(e.target.value)}
                  className="w-full p-3 bg-white border border-amber-300 rounded-xl text-slate-900 font-black focus:outline-none text-xs"
                >
                  <option value="business_zone">BUSINESS ZONE COM</option>
                  <option value="beach_avenue">BEACH AVENUE COM</option>
                  <option value="sahil_com">SAHIL COMMERCIAL</option>
                  <option value="zulfiqar_com">ZULFIQAR COM</option>
                  <option value="al_murtaza">AL MURTAZA COM</option>
                  <option value="peninsula_com">PENINSULA COM</option>
                  <option value="dha_plot_com">DHA PLOT COMMERCIAL</option>
                </select>
              </div>
            )}
          </div>

          {/* Specifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#0A1128] font-bold mb-2">Total Cover Area / Size</label>
              <div className="flex">
                <input 
                  name="area" 
                  required 
                  type="number" 
                  placeholder="500" 
                  className="w-2/3 px-4 py-3 bg-slate-50 border border-gray-200 rounded-l-xl font-semibold text-sm focus:outline-none"
                />
                <select name="area_unit" className="w-1/3 px-2 py-3 bg-slate-100 border-y border-r border-gray-200 rounded-r-xl font-bold text-xs">
                  <option value="sq.yd">Sq. Yd</option>
                  <option value="sq.ft">Sq. Ft</option>
                </select>
              </div>
            </div>

            {mainCat === 'home' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#0A1128] font-bold mb-2">Beds</label>
                  <select name="beds" className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl font-semibold text-sm focus:outline-none">
                    {[1, 2, 3, 4, 5, 6].map(num => <option key={num} value={num}>{num}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#0A1128] font-bold mb-2">Baths</label>
                  <select name="baths" className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl font-semibold text-sm focus:outline-none">
                    {[1, 2, 3, 4, 5, 6].map(num => <option key={num} value={num}>{num}</option>)}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Cloudinary Image Input */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#0A1128] font-bold mb-2">Upload High-Res Media Showcase</label>
            <input 
              name="images" 
              type="file" 
              multiple 
              accept="image/*"
              className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl cursor-pointer text-xs font-semibold text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-[#0A1128] file:text-white hover:file:bg-slate-800"
            />
          </div>

          {/* Amenities Features Checkbox grid */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#0A1128] font-bold mb-3">Amenities Included</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-gray-200">
              {amenityOptions.map(amenity => (
                <label key={amenity} className="flex items-center space-x-3 text-xs font-bold text-gray-600 cursor-pointer hover:text-[#0A1128]">
                  <input 
                    type="checkbox" 
                    checked={selectedAmenities.includes(amenity)}
                    onChange={() => handleAmenityChange(amenity)}
                    className="accent-[#0A1128] w-4 h-4 rounded" 
                  />
                  <span>{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#0A1128] font-bold mb-2">Detailed Synopsis / Instalment Structure</label>
            <textarea 
              name="description" 
              rows="4" 
              placeholder="Provide clear landmark updates or payment instalment breakdown here..." 
              className="w-full p-4 bg-slate-50 border border-gray-200 rounded-xl font-semibold text-sm focus:outline-none focus:border-[#0A1128] resize-none"
            ></textarea>
          </div>

          {/* Action Submission Trigger Button */}
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`w-full py-4 text-xs font-extrabold uppercase tracking-widest text-white rounded-xl transition-all duration-300 shadow-xl ${
              listingType === 'project' 
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950' 
                : 'bg-gradient-to-r from-[#0A1128] to-slate-800 hover:from-slate-900 hover:to-slate-950'
            } ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {uploading 
              ? '⚡ Uploading Visual Assets to Cloudinary...' 
              : isSubmitting 
              ? '⏳ Registering Entry into System...' 
              : `🚀 Publish New ${listingType === 'project' ? 'Project Booking' : 'Property Ad'}`
            }
          </button>

        </form>
      </div>
    </div>
  );
}