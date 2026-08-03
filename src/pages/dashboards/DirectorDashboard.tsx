// src/pages/dashboards/DirectorDashboard.tsx
// Executive Director Strategic Workspace — High-Level Insights & Compliance

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Briefcase, TrendingUp, Building2, AlertTriangle, CheckCircle2,
  PieChart, BarChart2, ShieldCheck, ArrowUpRight, Award, Clock
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area
} from 'recharts';

const BRANCH_METRICS = [
  { name: 'Mumbai HQ', employees: 24, attendance: 96, tasksCompleted: 92, aiAuditScore: 88 },
  { name: 'Bengaluru Tech', employees: 14, attendance: 94, tasksCompleted: 95, aiAuditScore: 91 },
  { name: 'New Delhi North', employees: 6, attendance: 90, tasksCompleted: 86, aiAuditScore: 82 },
  { name: 'Pune West', employees: 4, attendance: 92, tasksCompleted: 89, aiAuditScore: 85 },
];

const FLAGGED_AUDITS = [
  { id: 'a-1', employee: 'Sophia Sterling', branch: 'Mumbai HQ', issue: 'Repeated verbatim daily report entries', score: 45, date: 'Today' },
  { id: 'a-2', employee: 'Rohan Sharma', branch: 'Bengaluru Tech', issue: 'Out-of-geofence check-in attempt (1.2 km distance)', score: 52, date: 'Yesterday' }
];

export const DirectorDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-700 font-extrabold text-[10px] uppercase tracking-wider">Director Workspace</span>
            <span className="text-xs text-slate-400">Executive Suite</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
            <Briefcase size={24} className="text-blue-600" /> Strategic Executive Dashboard
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">High-level corporate oversight, branch productivity benchmarks & AI risk audits</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Overall Productivity</span>
            <Award size={18} className="text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">91.4%</div>
          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
            <TrendingUp size={12} /> +3.2% vs last month
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Active Branches</span>
            <Building2 size={18} className="text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">4 Offices</div>
          <span className="text-[11px] font-semibold text-slate-500 mt-1">Mumbai, Blr, Delhi, Pune</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Avg Attendance Rate</span>
            <CheckCircle2 size={18} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">93.8%</div>
          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
            <ArrowUpRight size={12} /> On-time check-in rate: 89%
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">AI Flagged Audits</span>
            <AlertTriangle size={18} className="text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 mt-2">2 Cases</div>
          <span className="text-[11px] font-semibold text-amber-600 mt-1">Requires Executive Review</span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">Branch Performance Benchmark Summary</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={BRANCH_METRICS}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Bar dataKey="attendance" name="Attendance %" fill="#2563eb" radius={[6, 6, 0, 0]} />
                <Bar dataKey="tasksCompleted" name="Task Completion %" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="aiAuditScore" name="AI Quality Score" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck size={18} className="text-amber-500" /> High-Priority AI Audit Alerts
          </h3>
          <div className="space-y-3">
            {FLAGGED_AUDITS.map(a => (
              <div key={a.id} className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span>{a.employee}</span>
                  <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded-md text-[10px]">Score: {a.score}/100</span>
                </div>
                <p className="text-xs text-slate-600">{a.issue}</p>
                <div className="text-[10px] text-slate-400 font-semibold">{a.branch} • {a.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectorDashboard;
