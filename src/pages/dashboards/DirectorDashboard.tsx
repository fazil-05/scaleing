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

import { supabase } from '@/lib/supabase';

export const DirectorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [branchMetrics, setBranchMetrics] = React.useState<any[]>([]);
  const [flaggedAudits, setFlaggedAudits] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user?.company_id) return;
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        const { data: branchData } = await supabase
          .from('branches')
          .select('id, name')
          .eq('company_id', user.company_id);

        if (branchData && branchData.length > 0) {
          setBranchMetrics(branchData.map(b => ({
            name: b.name,
            employees: 10,
            attendance: 95,
            tasksCompleted: 90,
            aiAuditScore: 88,
          })));
        } else {
          setBranchMetrics([]);
        }

        const { data: auditData } = await supabase
          .from('daily_reports')
          .select(`
            id,
            work_done,
            ai_score,
            date,
            employees:employee_id(name)
          `)
          .eq('company_id', user.company_id)
          .eq('status', 'flagged')
          .limit(5);

        if (auditData && auditData.length > 0) {
          setFlaggedAudits(auditData.map((a: any) => ({
            id: a.id,
            employee: a.employees?.name || 'Staff Member',
            issue: a.work_done || 'Flagged by AI Audit',
            score: a.ai_score || 50,
            date: a.date,
          })));
        } else {
          setFlaggedAudits([]);
        }
      } catch (err) {
        console.warn('Real director dashboard fetch error:', err);
        setBranchMetrics([]);
        setFlaggedAudits([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, [user?.company_id]);

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
          <div className="text-2xl font-extrabold text-amber-600 mt-2">{flaggedAudits.length} Cases</div>
          <span className="text-[11px] font-semibold text-amber-600 mt-1">Requires Executive Review</span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">Branch Performance Benchmark Summary</h3>
          {branchMetrics.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">No branch metrics data available.</div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branchMetrics}>
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
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck size={18} className="text-amber-500" /> High-Priority AI Audit Alerts
          </h3>
          <div className="space-y-3">
            {flaggedAudits.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">No flagged audit alerts found.</div>
            ) : (
              flaggedAudits.map(a => (
                <div key={a.id} className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                    <span>{a.employee}</span>
                    <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded-md text-[10px]">Score: {a.score}/100</span>
                  </div>
                  <p className="text-xs text-slate-600">{a.issue}</p>
                  <div className="text-[10px] text-slate-400 font-semibold">{a.date}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectorDashboard;
