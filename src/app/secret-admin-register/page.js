'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SecretAdminRegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    secretKey: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/register-secret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('🎉 Admin account created! Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        setMessage('❌ ' + (data.error || 'Failed to create admin account'));
      }
    } catch (err) {
      console.error(err);
      setMessage('❌ Network Connection Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070D1F] text-white flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-[#0A1128]/90 border border-amber-500/30 rounded-3xl p-8 shadow-2xl space-y-6">
        
        <div className="text-center space-y-2">
          <span className="text-3xl">👑</span>
          <h1 className="text-xl font-black uppercase tracking-wider text-amber-400">
            Create Super Admin Account
          </h1>
          <p className="text-xs text-slate-400">
            Secret Admin Portal Access Setup
          </p>
        </div>

        {message && (
          <div className={`p-3 rounded-xl text-xs font-bold text-center ${message.includes('🎉') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-red-500/20 text-red-400 border border-red-500/40'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300 mb-1">Your Full Name *</label>
            <input 
              type="text" 
              name="name" 
              required 
              placeholder="Muhammad Zaid" 
              value={formData.name} 
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 text-xs text-white p-3 rounded-xl outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300 mb-1">Admin Email Address *</label>
            <input 
              type="email" 
              name="email" 
              required 
              placeholder="admin@peninsula.com" 
              value={formData.email} 
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 text-xs text-white p-3 rounded-xl outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300 mb-1">Phone / WhatsApp Number *</label>
            <input 
              type="text" 
              name="phone" 
              required 
              placeholder="03331234567" 
              value={formData.phone} 
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 text-xs text-white p-3 rounded-xl outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300 mb-1">Create Password *</label>
            <input 
              type="password" 
              name="password" 
              required 
              placeholder="••••••••" 
              value={formData.password} 
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 text-xs text-white p-3 rounded-xl outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-amber-400 mb-1">Secret Security Key *</label>
            <input 
              type="password" 
              name="secretKey" 
              required 
              placeholder="Enter secret security key..." 
              value={formData.secretKey} 
              onChange={handleChange}
              className="w-full bg-slate-900 border border-amber-500/50 focus:border-amber-400 text-xs text-amber-300 p-3 rounded-xl outline-none font-bold"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-[#070D1F] font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg disabled:opacity-50 mt-2"
          >
            {loading ? 'Creating Admin Account...' : '🚀 Register As Super Admin'}
          </button>
        </form>

      </div>
    </div>
  );
}