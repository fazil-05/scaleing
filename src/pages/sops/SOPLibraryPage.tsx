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

const DEMO_CATEGORIES: SOPCategory[] = [
  { id: 'cat-1', company_id: 'c0000000-0000-0000-0000-000000000001', name: 'Operations', icon: '⚡', description: 'Daily office operations & GPS geofencing guidelines', sort_order: 1, created_at: new Date().toISOString() },
  { id: 'cat-2', company_id: 'c0000000-0000-0000-0000-000000000001', name: 'HR & Compliance', icon: '📋', description: 'Employee handbook, leave policy & code of conduct', sort_order: 2, created_at: new Date().toISOString() },
  { id: 'cat-3', company_id: 'c0000000-0000-0000-0000-000000000001', name: 'Sales & Field Protocols', icon: '🎯', description: 'Client meeting reports & daily submission standard', sort_order: 3, created_at: new Date().toISOString() },
  { id: 'cat-4', company_id: 'c0000000-0000-0000-0000-000000000001', name: 'IT & Security', icon: '🔒', description: 'Data privacy, passwords & remote work security', sort_order: 4, created_at: new Date().toISOString() },
];

const DEMO_SOPS: SOP[] = [
  {
    id: 'sop-1',
    company_id: 'c0000000-0000-0000-0000-000000000001',
    category_id: 'cat-1',
    created_by: 'e0000000-0000-0000-0000-000000000001',
    title: 'GPS Attendance Check-In & Geofence Verification Protocol',
    content: 'All field and office staff must enable device location when marking daily attendance. Attendance marked within 200m of assigned branch geofence radius will be auto-verified as On-Site.',
    summary: 'Rules and distance thresholds for daily GPS mobile check-ins.',
    tags: ['attendance', 'gps', 'geofence'],
    version: '2.1',
    is_published: true,
    view_count: 142,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'sop-2',
    company_id: 'c0000000-0000-0000-0000-000000000001',
    category_id: 'cat-3',
    created_by: 'e0000000-0000-0000-0000-000000000002',
    title: 'Daily Work Report Submission & AI Audit Standard',
    content: 'Reports must be submitted daily before 7:00 PM IST detailing client interactions, products discussed, and key achievements. Submissions are audited by Virtual Manager AI for completeness and clarity.',
    summary: 'Standardized format for daily activity reporting and score thresholds.',
    tags: ['report', 'ai-audit', 'daily-work'],
    version: '1.4',
    is_published: true,
    view_count: 98,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'sop-3',
    company_id: 'c0000000-0000-0000-0000-000000000001',
    category_id: 'cat-2',
    created_by: 'e0000000-0000-0000-0000-000000000002',
    title: 'Paid Leave Application & Branch Manager Approval Chain',
    content: 'Leave requests exceeding 3 consecutive days require documentation and approval from both Branch Manager and HR Director at least 48 hours prior to leave start date.',
    summary: 'Leave policy guidelines, notice periods, and approval escalation workflow.',
    tags: ['leave', 'hr', 'approval'],
    version: '3.0',
    is_published: true,
    view_count: 215,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

    const loadSOPs = async () => {
      setLoading(true);
      try {
        const { data: catData } = await supabase
          .from('sop_categories')
          .select('*')
          .eq('company_id', user.company_id);

        setCategories(catData && catData.length > 0 ? (catData as SOPCategory[]) : DEMO_CATEGORIES);

        let query = supabase
          .from('sops')
          .select('*')
          .eq('company_id', user.company_id)
          .eq('is_published', true);

        if (selectedCat) query = query.eq('category_id', selectedCat);
        if (search) query = query.ilike('title', `%${search}%`);

        const { data: sopData } = await query;
        setSops(sopData && sopData.length > 0 ? (sopData as SOP[]) : DEMO_SOPS);
      } catch (err) {
        setCategories(DEMO_CATEGORIES);
        setSops(DEMO_SOPS);
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
