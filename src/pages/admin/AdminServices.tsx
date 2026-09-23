import React, { useState } from 'react';
import { Plus, Search, Wrench, MoreVertical, X } from 'lucide-react';
import type { ServiceCategory } from '../../types.ts';

interface AdminServicesProps {
  services: ServiceCategory[];
  onAddService: (data: any) => Promise<void>;
}

export function AdminServices({ services, onAddService }: AdminServicesProps) {
  const [search, setSearch] = useState('');
  const [newServiceOpen, setNewServiceOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState(299);
  const [desc, setDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.categoryGroup.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onAddService({
      name,
      categoryGroup: category,
      basePrice: price,
      description: desc,
      iconName: 'Wrench'
    });
    setIsSubmitting(false);
    setNewServiceOpen(false);
    setName('');
    setCategory('');
    setDesc('');
    setPrice(299);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Service Catalog</h2>
          <p className="text-sm text-slate-400">Manage offerings, categories, and base pricing.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text"
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-4 py-2 bg-[#061017] border border-teal-900/40 rounded-xl text-sm text-white focus:border-[#0df2a4] outline-none transition-colors"
            />
          </div>

          <button 
            onClick={() => setNewServiceOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0df2a4] hover:bg-[#0df2a4]/90 text-[#061017] font-bold rounded-xl text-sm transition-colors shadow-[0_0_15px_rgba(13,242,164,0.3)]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Service</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((srv) => (
          <div key={srv.id} className="bg-[#061017] border border-teal-900/40 rounded-2xl p-5 shadow-xl group hover:border-[#0df2a4]/50 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20 text-[#0df2a4]">
                  <Wrench className="w-6 h-6" />
                </div>
                <button className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                {srv.categoryGroup}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{srv.name}</h3>
              <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                {srv.description}
              </p>
            </div>
            
            <div className="mt-6 pt-4 border-t border-teal-900/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-medium text-emerald-400">Active</span>
              </div>
              <div className="text-sm font-mono font-bold text-white bg-white/5 px-3 py-1 rounded-lg border border-white/10">
                ₹{srv.basePrice} <span className="text-[10px] text-slate-400 font-sans">Base</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ADD MODAL */}
      {newServiceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#061017] w-full max-w-md rounded-3xl shadow-2xl border border-teal-900/60 p-6 sm:p-8 relative">
            
            <button 
              onClick={() => setNewServiceOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-6">Add New Service</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Service Title</label>
                <input 
                  required
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Premium Deep Cleaning"
                  className="w-full bg-[#0a1824] border border-teal-900/40 rounded-xl px-4 py-2.5 text-white focus:border-[#0df2a4] outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Category Group</label>
                <input 
                  required
                  type="text" 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Home Cleaning"
                  className="w-full bg-[#0a1824] border border-teal-900/40 rounded-xl px-4 py-2.5 text-white focus:border-[#0df2a4] outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Base Price (₹)</label>
                <input 
                  required
                  type="number" 
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full bg-[#0a1824] border border-teal-900/40 rounded-xl px-4 py-2.5 text-white font-mono focus:border-[#0df2a4] outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
                <textarea 
                  required
                  rows={3}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Describe what this service includes..."
                  className="w-full bg-[#0a1824] border border-teal-900/40 rounded-xl px-4 py-2.5 text-white focus:border-[#0df2a4] outline-none transition-colors resize-none"
                />
              </div>

              <div className="pt-2">
                <button 
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full py-3 bg-[#0df2a4] hover:bg-[#0df2a4]/90 text-[#061017] font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(13,242,164,0.2)] hover:shadow-[0_0_30px_rgba(13,242,164,0.4)] disabled:opacity-50"
                >
                  {isSubmitting ? 'Adding...' : 'Add to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
