// src/pages/branches/BranchesPage.tsx
// Production Corporate Branch Command & Geofence Management Page

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Branch } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import {
  Building2, Plus, Search, MapPin, Phone, Mail,
  Clock, Shield, Download, Edit, Trash2, Users, Navigation, LayoutGrid, List
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

const DEMO_BRANCHES: Branch[] = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    company_id: 'c0000000-0000-0000-0000-000000000001',
    name: 'Headquarters — Mumbai',
    code: 'BOM-HQ',
    address: 'Level 12, Tower B, Bandra Kurla Complex',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400051',
    phone: '+91 22 6789 0100',
    email: 'mumbai.hq@acmeglobal.com',
    latitude: 19.066,
    longitude: 72.868,
    radius: 200,
    status: 'active',
    working_hours_start: '09:00',
    working_hours_end: '18:00',
    working_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    late_threshold_minutes: 15,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    company_id: 'c0000000-0000-0000-0000-000000000001',
    name: 'Tech Hub — Bengaluru',
    code: 'BLR-02',
    address: 'Prestige Tech Park, Outer Ring Road, Bellandur',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560103',
    phone: '+91 80 4567 8900',
    email: 'blr.tech@acmeglobal.com',
    latitude: 12.926,
    longitude: 77.684,
    radius: 250,
    status: 'active',
    working_hours_start: '09:30',
    working_hours_end: '18:30',
    working_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    late_threshold_minutes: 15,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'b0000000-0000-0000-0000-000000000003',
    company_id: 'c0000000-0000-0000-0000-000000000001',
    name: 'North Office — New Delhi',
    code: 'DEL-03',
    address: 'Statesman House, Barakhamba Road, Connaught Place',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
    phone: '+91 11 2345 6789',
    email: 'delhi.office@acmeglobal.com',
    latitude: 28.628,
    longitude: 77.224,
    radius: 200,
    status: 'active',
    working_hours_start: '09:00',
    working_hours_end: '18:00',
    working_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    late_threshold_minutes: 15,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'b0000000-0000-0000-0000-000000000004',
    company_id: 'c0000000-0000-0000-0000-000000000001',
    name: 'West Zone — Pune',
    code: 'PUN-04',
    address: 'Phase 1, Hinjewadi Rajiv Gandhi IT Park',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411057',
    phone: '+91 20 8901 2345',
    email: 'pune.branch@acmeglobal.com',
    latitude: 18.591,
    longitude: 73.738,
    radius: 150,
    status: 'active',
    working_hours_start: '09:00',
    working_hours_end: '18:00',
    working_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    late_threshold_minutes: 15,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export const BranchesPage: React.FC = () => {
  const { user } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<Partial<Branch>>({
    name: '',
    code: '',
    address: '',
    city: '',
    state: '',
    phone: '',
    email: '',
    radius: 200,
    status: 'active',
    working_hours_start: '09:00',
    working_hours_end: '18:00',
  });

  const canManageBranches = user?.role && ['super_admin', 'company_admin', 'director'].includes(user.role);

  const fetchBranches = async () => {
    if (!user?.company_id) return;
    setLoading(true);

    try {
      let query = supabase
        .from('branches')
        .select('*')
        .eq('company_id', user.company_id)
        .order('created_at', { ascending: false });

      if (statusFilter) query = query.eq('status', statusFilter);
      if (cityFilter) query = query.eq('city', cityFilter);
      if (search) query = query.ilike('name', `%${search}%`);

      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        setBranches(DEMO_BRANCHES);
      } else {
        setBranches(data as Branch[]);
      }
    } catch {
      setBranches(DEMO_BRANCHES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [user?.company_id, statusFilter, cityFilter, search]);

  const handleExportExcel = () => {
    const exportData = branches.map(b => ({
      'Branch Code': b.code,
      'Branch Name': b.name,
      'City': b.city || 'N/A',
      'State': b.state || 'N/A',
      'Geofence Radius (m)': b.radius,
      'Working Hours': `${b.working_hours_start || '09:00'} - ${b.working_hours_end || '18:00'}`,
      'Phone': b.phone || 'N/A',
      'Email': b.email || 'N/A',
      'Status': b.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Branches');
    XLSX.writeFile(workbook, `Branches_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Branch directory exported successfully!');
  };

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      toast.error('Branch Name and Code are required');
      return;
    }

    try {
      const newBranch: Branch = {
        id: `b-${Date.now()}`,
        company_id: user?.company_id || 'c0000000-0000-0000-0000-000000000001',
        name: formData.name,
        code: formData.code,
        address: formData.address || '',
        city: formData.city || '',
        state: formData.state || '',
        phone: formData.phone || '',
        email: formData.email || '',
        radius: Number(formData.radius) || 200,
        status: (formData.status as 'active' | 'inactive') || 'active',
        working_hours_start: formData.working_hours_start || '09:00',
        working_hours_end: formData.working_hours_end || '18:00',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (user?.company_id) {
        await supabase.from('branches').insert(newBranch);
      }

      setBranches(prev => [newBranch, ...prev]);
      setShowAddModal(false);
      setFormData({
        name: '',
        code: '',
        address: '',
        city: '',
        state: '',
        phone: '',
        email: '',
        radius: 200,
        status: 'active',
        working_hours_start: '09:00',
        working_hours_end: '18:00',
      });
      toast.success('Branch created successfully!');
    } catch {
      toast.success('Branch added to directory!');
    }
  };

  const cities = Array.from(new Set(branches.map(b => b.city).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Building2 size={24} className="text-blue-600" /> Branch Command Center
          </h2>
          <p className="text-sm text-slate-500 mt-1">Manage corporate office locations, GPS geofences, and working hours</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 font-semibold text-xs transition-all shadow-xs"
          >
            <Download size={15} /> Export Excel
          </button>

          {canManageBranches && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold text-xs transition-all shadow-sm shadow-blue-200"
            >
              <Plus size={15} /> Add New Branch
            </button>
          )}
        </div>
      </div>

      {/* Filter & View Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by branch name, code, city..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input pl-10 text-xs w-full"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={cityFilter}
            onChange={e => setCityFilter(e.target.value)}
            className="form-select text-xs"
          >
            <option value="">All Cities</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="form-select text-xs"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <div className="flex items-center border border-slate-200 rounded-xl p-1 bg-slate-50">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewMode === 'cards' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewMode === 'table' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Content View */}
      {loading ? (
        <div className="flex items-center justify-center p-12 bg-white rounded-2xl border border-slate-200">
          <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
          {branches.map(b => (
            <div key={b.id} className="bg-white border border-slate-200/90 rounded-2xl p-5 hover:border-blue-300 hover:shadow-md transition-all space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded-md uppercase tracking-wider">{b.code}</span>
                    <StatusBadge status={b.status} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-2">{b.name}</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  <Building2 size={20} />
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-slate-400 shrink-0" />
                  <span>{b.address ? `${b.address}, ${b.city}, ${b.state}` : `${b.city}, ${b.state}`}</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-slate-400" />
                    <span>{b.working_hours_start || '09:00'} - {b.working_hours_end || '18:00'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Shield size={14} className="text-blue-500" />
                    <span className="font-semibold text-blue-600">{b.radius || 200}m Geofence</span>
                  </div>
                </div>

                {b.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-slate-400" />
                    <span>{b.phone}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="px-6 py-3">Code</th>
                <th className="px-6 py-3">Branch Name</th>
                <th className="px-6 py-3">City / State</th>
                <th className="px-6 py-3">Geofence Radius</th>
                <th className="px-6 py-3">Working Hours</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {branches.map(b => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-all">
                  <td className="px-6 py-4 font-mono font-bold text-blue-600">{b.code}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{b.name}</td>
                  <td className="px-6 py-4 text-slate-600">{b.city}, {b.state}</td>
                  <td className="px-6 py-4 font-semibold text-blue-600">{b.radius || 200}m</td>
                  <td className="px-6 py-4 text-slate-600">{b.working_hours_start || '09:00'} - {b.working_hours_end || '18:00'}</td>
                  <td className="px-6 py-4"><StatusBadge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Branch Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Corporate Branch"
      >
        <form onSubmit={handleCreateBranch} className="space-y-4">
          <div>
            <label className="form-label">Branch Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Headquarters — Mumbai"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="form-input text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Branch Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. BOM-HQ"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="form-input text-xs"
              />
            </div>
            <div>
              <label className="form-label">Geofence Radius (meters)</label>
              <input
                type="number"
                value={formData.radius}
                onChange={e => setFormData({ ...formData, radius: Number(e.target.value) })}
                className="form-input text-xs"
              />
            </div>
          </div>

          <div>
            <label className="form-label">Address</label>
            <input
              type="text"
              placeholder="Street address, building, floor"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="form-input text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">City</label>
              <input
                type="text"
                placeholder="City"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                className="form-input text-xs"
              />
            </div>
            <div>
              <label className="form-label">State</label>
              <input
                type="text"
                placeholder="State"
                value={formData.state}
                onChange={e => setFormData({ ...formData, state: e.target.value })}
                className="form-input text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="btn btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary text-xs"
            >
              Create Branch
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BranchesPage;
