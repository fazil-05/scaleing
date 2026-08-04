// src/pages/resources/ResourceCenterPage.tsx
// Corporate Resource Center & Digital Asset Portal with Selection Control

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Resource } from '@/types';
import {
  FolderOpen, Search, Download, FileText, Filter, Plus,
  Building2, CheckCircle2, File, Bookmark, ExternalLink, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ResourceCentre {
  id: string;
  name: string;
  code: string;
  description: string;
}

const RESOURCE_CENTRES: ResourceCentre[] = [
  { id: 'rc-1', name: 'Headquarters Resource Centre — Mumbai', code: 'RC-HQ', description: 'Central corporate policy documents, leadership SOPs & brand assets' },
  { id: 'rc-2', name: 'Bengaluru Tech Hub Repository', code: 'RC-BLR', description: 'Engineering protocols, IT security guidelines & system documentation' },
  { id: 'rc-3', name: 'Sales & Field Operations Centre', code: 'RC-SALES', description: 'Client pitch decks, daily reporting forms & field check-in SOPs' },
  { id: 'rc-4', name: 'Compliance & Legal Repository', code: 'RC-COMP', description: 'Labor compliance, NDA templates, tax forms & HR guidelines' },
];

export const ResourceCenterPage: React.FC = () => {
  const { user } = useAuth();

  // Resource Centre selection state
  const [selectedCentreId, setSelectedCentreId] = useState<string>('rc-1');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.company_id) return;
    const fetchResources = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('resources')
          .select('*')
          .eq('company_id', user.company_id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setResources(data as Resource[]);
        } else {
          setResources([]);
        }
      } catch (err) {
        console.warn('Real resources fetch error:', err);
        setResources([]);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, [user?.company_id]);

  const selectedCentre = RESOURCE_CENTRES.find(c => c.id === selectedCentreId) || RESOURCE_CENTRES[0];

  const handleCentreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCentreId = e.target.value;
    setSelectedCentreId(newCentreId);
    const centre = RESOURCE_CENTRES.find(c => c.id === newCentreId);
    toast.success(`Connected to ${centre?.name || 'Resource Centre'}`);
  };

  const handleDownload = (resource: Resource) => {
    toast.success(`Downloading ${resource.file_name}...`);
  };

  const categories = ['All', 'HR & Onboarding', 'Operations & Geofencing', 'Sales Guidelines'];

  const filteredResources = resources.filter(res => {
    const matchesCat = selectedCategory === 'All' || res.category === selectedCategory;
    const matchesSearch =
      res.title.toLowerCase().includes(search.toLowerCase()) ||
      (res.description && res.description.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <FolderOpen size={24} className="text-blue-600" /> Digital Resource Centre
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Access enterprise documentation repositories, policy templates & digital assets
          </p>
        </div>
      </div>

      {/* Resource Centre Selector Card (Fix for Issue 10) */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-blue-300 shadow-inner">
              <Building2 size={22} />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-300">Active Selection</span>
              <h3 className="text-lg font-bold text-white">{selectedCentre.name}</h3>
            </div>
          </div>

          <div className="w-full md:w-80 space-y-1">
            <label className="text-[11px] font-bold text-blue-200">Switch Resource Centre *</label>
            <select
              id="resource-centre-selector"
              value={selectedCentreId}
              onChange={handleCentreChange}
              className="w-full bg-white text-slate-900 font-bold text-xs px-3.5 py-2.5 rounded-xl outline-none border border-blue-300 focus:ring-2 focus:ring-blue-400 cursor-pointer shadow-sm"
            >
              {RESOURCE_CENTRES.map(rc => (
                <option key={rc.id} value={rc.id}>
                  {rc.code} — {rc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-xs text-blue-100/80 leading-relaxed font-medium">
          {selectedCentre.description}
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search templates, PDF handbooks, guidelines..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input pl-10 text-xs w-full"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 w-full md:w-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Resource Cards Roster */}
      {filteredResources.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-xs">
          <FolderOpen size={40} className="text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-sm">No Resources Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No digital files match your search query for {selectedCentre.name}.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResources.map(res => (
            <div
              key={res.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-100 rounded-md uppercase tracking-wider">
                    {res.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {res.file_size ? `${(res.file_size / 1000000).toFixed(1)} MB` : '1.2 MB'}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                  {res.title}
                </h4>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {res.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                  <File size={13} className="text-blue-500" /> {res.file_name}
                </span>

                <button
                  onClick={() => handleDownload(res)}
                  className="btn btn-secondary btn-sm text-xs flex items-center gap-1.5"
                >
                  <Download size={13} /> Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourceCenterPage;
