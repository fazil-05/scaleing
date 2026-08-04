// src/pages/sops/SOPLibraryPage.tsx
// Standard Operating Procedures (SOP) Knowledge Base — Light Theme

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { SOP, SOPCategory } from '@/types';
import { BookOpen, Search, Bookmark, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export const SOPLibraryPage: React.FC = () => {
  const { user } = useAuth();
  const [sops, setSops] = useState<SOP[]>([]);
  const [categories, setCategories] = useState<SOPCategory[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.company_id) {
      setLoading(false);
      return;
    }

    const loadSOPs = async () => {
      setLoading(true);
      try {
        const { data: catData } = await supabase
          .from('sop_categories')
          .select('*')
          .eq('company_id', user.company_id);

        setCategories((catData || []) as SOPCategory[]);

        let query = supabase
          .from('sops')
          .select('*')
          .eq('company_id', user.company_id)
          .eq('is_published', true);

        if (selectedCat) query = query.eq('category_id', selectedCat);
        if (search) query = query.ilike('title', `%${search}%`);

        const { data: sopData } = await query;
        setSops((sopData || []) as SOP[]);
      } catch (err) {
        console.warn('Real SOP fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSOPs();
  }, [user?.company_id, selectedCat, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <BookOpen size={24} className="text-blue-600" /> SOP Knowledge Base
        </h2>
        <p className="text-sm text-slate-500 mt-1">Standard Operating Procedures, Product Manuals &amp; HR Policies</p>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search SOPs, sales guidelines, technical manuals..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input pl-10 text-sm"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 flex-wrap">
          <button
            onClick={() => setSelectedCat('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedCat === ''
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            All Categories
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedCat === cat.id
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {cat.icon || '📄'} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* SOP Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-sm text-slate-500 col-span-full text-center py-12">Loading SOPs...</p>
        ) : sops.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <BookOpen size={48} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-semibold">No SOPs found</p>
            <p className="text-slate-400 text-sm mt-1">Try adjusting your search or category filter</p>
          </div>
        ) : (
          sops.map(sop => (
            <div key={sop.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 flex flex-col justify-between hover:border-blue-300 hover:shadow-md transition-all shadow-sm">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 rounded">
                    v{sop.version}
                  </span>
                  <button className="text-slate-400 hover:text-blue-600 transition-colors">
                    <Bookmark size={15} />
                  </button>
                </div>
                <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{sop.title}</h4>
                <p className="text-xs text-slate-500 line-clamp-3">{sop.summary || sop.content}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                <span className="flex items-center gap-1"><Eye size={13} /> {sop.view_count || 0} views</span>
                <button className="btn btn-secondary btn-sm text-xs">Read SOP</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
