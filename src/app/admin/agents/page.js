'use client';

import { useState, useEffect } from 'react';

export default function AgentManagementPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/agents');
      if (res.ok) {
        const data = await res.json();
        setAgents(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/create-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok) {
        setMessage('🎉 ' + data.message);
        setFormData({ name: '', email: '', phone: '', password: '' });
        fetchAgents();
      } else {
        setMessage('❌ ' + (data.error || 'Failed to create agent'));
      }
    } catch (err) {
      setMessage('❌ Network connection error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Top Banner Header */}
      <div className="bg-[#0A1128] text-white p-6 rounded-3xl border border-amber-500/20 shadow-xl">
        <h1 className="text-xl md:text-2xl font-black text-amber-400 uppercase tracking-wide">👥 Agent Management</h1>
        <p className="text-xs text-slate-400 font-semibold mt-1">Create sub-users and manage registered team agents for DHA PLOTS</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CREATE AGENT FORM */}
        <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4 h-fit">
          <h2 className="text-sm font-black uppercase text-[#0A1128] border-b pb-2">➕ Add New Sub-User (Agent)</h2>
          
          {message && (
            <div className={`p-3 rounded-xl text-xs font-bold text-center ${message.includes('🎉') ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-700 mb-1">Agent Name *</label>
              <input type="text" name="name" required placeholder="Ali Raza" value={formData.name} onChange={handleChange} className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-700 mb-1">Phone / WhatsApp *</label>
              <input type="text" name="phone" required placeholder="03331234567" value={formData.phone} onChange={handleChange} className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-700 mb-1">Login Email *</label>
              <input type="email" name="email" required placeholder="agent@dhaplots.com" value={formData.email} onChange={handleChange} className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-700 mb-1">Set Password *</label>
              <input type="password" name="password" required placeholder="••••••••" value={formData.password} onChange={handleChange} className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500" />
            </div>
            <button type="submit" disabled={submitting} className="w-full py-3 bg-[#0A1128] hover:bg-slate-900 text-amber-400 font-black text-xs uppercase rounded-xl shadow-md transition-all disabled:opacity-50">
              {submitting ? 'Registering...' : 'Register Agent'}
            </button>
          </form>
        </div>

        {/* AGENTS LIST */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border shadow-sm space-y-4">
          <h2 className="text-sm font-black uppercase text-[#0A1128] border-b pb-2">📋 Active Team Agents</h2>
          
          {loading ? (
            <div className="py-8 text-center text-xs font-bold text-gray-400">Loading agents list...</div>
          ) : agents.length === 0 ? (
            <div className="py-12 text-center text-xs font-bold text-gray-400 border-2 border-dashed rounded-2xl">
              Koi agent sub-user abhi tak create nahi hua.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-500 border-b uppercase text-[10px]">
                    <th className="p-3">Agent Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Phone / WhatsApp</th>
                    <th className="p-3">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-semibold text-slate-700">
                  {agents.map((ag) => (
                    <tr key={ag.id} className="hover:bg-slate-50">
                      <td className="p-3 font-black text-slate-900">{ag.name}</td>
                      <td className="p-3 text-slate-500">{ag.email}</td>
                      <td className="p-3 text-emerald-600 font-bold">{ag.phone}</td>
                      <td className="p-3"><span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase px-2 py-0.5 rounded">Agent</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}