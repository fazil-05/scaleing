// src/pages/dashboards/SuperAdminDashboard.tsx
// System Super Admin Executive Command Center — Multi-Tenant Management

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import {
  ShieldAlert, Building2, Users, DollarSign, Activity, Server,
  Plus, Search, Filter, ArrowUpRight, TrendingUp, CheckCircle, Lock
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Tenant {
  id: string;
  name: string;
  code: string;
  plan: 'starter' | 'professional' | 'enterprise';
  employeesCount: number;
  maxEmployees: number;
  status: 'active' | 'suspended' | 'trial';
  renewalDate: string;
  mrr: number;
}

const MOCK_TENANTS: Tenant[] = [
  { id: 't-1', name: 'Acme Global Enterprises', code: 'ACME', plan: 'enterprise', employeesCount: 48, maxEmployees: 100, status: 'active', renewalDate: '2027-01-15', mrr: 1200 },
  { id: 't-2', name: 'CyberDyne Systems Ltd', code: 'CYBER', plan: 'professional', employeesCount: 32, maxEmployees: 50, status: 'active', renewalDate: '2026-11-20', mrr: 650 },
  { id: 't-3', name: 'Apex Logistics & Freight', code: 'APEX', plan: 'enterprise', employeesCount: 85, maxEmployees: 150, status: 'active', renewalDate: '2027-03-01', mrr: 1800 },
  { id: 't-4', name: 'NextGen Financial Services', code: 'NEXT', plan: 'starter', employeesCount: 12, maxEmployees: 20, status: 'trial', renewalDate: '2026-08-25', mrr: 250 },
  { id: 't-5', name: 'Zenith BioTech Labs', code: 'ZENITH', plan: 'professional', employeesCount: 28, maxEmployees: 50, status: 'active', renewalDate: '2026-12-10', mrr: 650 }
];

export const SuperAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>(MOCK_TENANTS);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTenant, setNewTenant] = useState({ name: '', code: '', plan: 'professional', maxEmployees: 50 });

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.code.toLowerCase().includes(search.toLowerCase())
  );

  const totalUsers = tenants.reduce((acc, t) => acc + t.employeesCount, 0);
  const totalMrr = tenants.reduce((acc, t) => acc + t.mrr, 0);

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    const created: Tenant = {
      id: `t-${Date.now()}`,
      name: newTenant.name,
      code: newTenant.code.toUpperCase(),
      plan: newTenant.plan as any,
      employeesCount: 1,
      maxEmployees: Number(newTenant.maxEmployees),
      status: 'active',
      renewalDate: '2027-08-01',
      mrr: newTenant.plan === 'enterprise' ? 1200 : newTenant.plan === 'professional' ? 650 : 250
    };
    setTenants([created, ...tenants]);
    setShowAddModal(false);
    toast.success(`Tenant ${created.name} provisioned successfully!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-700 font-extrabold text-[10px] uppercase tracking-wider">Super Admin Mode</span>
            <span className="text-xs text-slate-400">Platform Control</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
            <ShieldAlert size={24} className="text-purple-600" /> Platform Multi-Tenant Overseer
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Global SaaS tenant provisioning, system health, and subscription management</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-semibold text-xs transition-all shadow-sm shadow-purple-200"
        >
          <Plus size={15} /> Provision New Tenant
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Active Tenants</span>
            <Building2 size={18} className="text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{tenants.length}</div>
          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
            <TrendingUp size={12} /> +100% Platform Growth
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Total Active Users</span>
            <Users size={18} className="text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{totalUsers}</div>
          <span className="text-[11px] font-semibold text-slate-500 mt-1">Across all organizations</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Monthly Recurring Revenue</span>
            <DollarSign size={18} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">${totalMrr.toLocaleString()}</div>
          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
            <ArrowUpRight size={12} /> ARR: ${(totalMrr * 12).toLocaleString()}
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">System Uptime</span>
            <Server size={18} className="text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2">99.98%</div>
          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
            <CheckCircle size={12} /> All Nodes Operational
          </span>
        </div>
      </div>

      {/* Tenant Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs space-y-4 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Provisioned Organization Tenants</h3>
          <div className="relative w-64">
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search tenant name or code..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="form-input pl-9 text-xs"
            />
          </div>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Organization Name</th>
              <th className="px-4 py-3">SaaS Plan</th>
              <th className="px-4 py-3">User Capacity</th>
              <th className="px-4 py-3">MRR ($)</th>
              <th className="px-4 py-3">Renewal Date</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTenants.map(t => (
              <tr key={t.id} className="hover:bg-slate-50/80 transition-all">
                <td className="px-4 py-3.5 font-mono font-bold text-purple-700">{t.code}</td>
                <td className="px-4 py-3.5 font-bold text-slate-900">{t.name}</td>
                <td className="px-4 py-3.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                    t.plan === 'enterprise' ? 'bg-purple-100 text-purple-700' :
                    t.plan === 'professional' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {t.plan}
                  </span>
                </td>
                <td className="px-4 py-3.5 font-semibold text-slate-700">
                  {t.employeesCount} / <span className="text-slate-400">{t.maxEmployees}</span>
                </td>
                <td className="px-4 py-3.5 font-bold text-emerald-600">${t.mrr}</td>
                <td className="px-4 py-3.5 text-slate-500">{t.renewalDate}</td>
                <td className="px-4 py-3.5"><StatusBadge status={t.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Provision Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Provision New Enterprise Tenant">
        <form onSubmit={handleCreateTenant} className="space-y-4">
          <div>
            <label className="form-label">Organization Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Apex Global Industries"
              value={newTenant.name}
              onChange={e => setNewTenant({ ...newTenant, name: e.target.value })}
              className="form-input text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Tenant Code *</label>
              <input
                type="text"
                required
                placeholder="APEX"
                value={newTenant.code}
                onChange={e => setNewTenant({ ...newTenant, code: e.target.value })}
                className="form-input text-xs"
              />
            </div>
            <div>
              <label className="form-label">SaaS Plan</label>
              <select
                value={newTenant.plan}
                onChange={e => setNewTenant({ ...newTenant, plan: e.target.value })}
                className="form-select text-xs"
              >
                <option value="starter">Starter ($250/mo)</option>
                <option value="professional">Professional ($650/mo)</option>
                <option value="enterprise">Enterprise ($1,200/mo)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="form-label">Employee Seat Limit</label>
            <input
              type="number"
              value={newTenant.maxEmployees}
              onChange={e => setNewTenant({ ...newTenant, maxEmployees: Number(e.target.value) })}
              className="form-input text-xs"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary text-xs">Cancel</button>
            <button type="submit" className="btn btn-primary text-xs">Provision Tenant</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SuperAdminDashboard;
