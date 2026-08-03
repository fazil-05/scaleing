// src/pages/performance/PerformancePage.tsx
// Employee Performance Review & Productivity Scoring Portal

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Award, TrendingUp, Star, CheckSquare, Clock, Sparkles, FileText
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

interface ReviewItem {
  id: string;
  employeeName: string;
  employeeCode: string;
  role: string;
  period: string;
  punctualityScore: number;
  taskCompletionScore: number;
  reportQualityScore: number;
  overallScore: number;
  grade: 'A+' | 'A' | 'B+' | 'B';
}

const MOCK_REVIEWS: ReviewItem[] = [
  { id: 'r-1', employeeName: 'Alexander Pierce', employeeCode: 'EMP-001', role: 'Super Admin', period: 'July 2026', punctualityScore: 98, taskCompletionScore: 95, reportQualityScore: 96, overallScore: 96.3, grade: 'A+' },
  { id: 'r-2', employeeName: 'Eleanor Vance', employeeCode: 'EMP-002', role: 'Director', period: 'July 2026', punctualityScore: 95, taskCompletionScore: 94, reportQualityScore: 92, overallScore: 93.6, grade: 'A+' },
  { id: 'r-3', employeeName: 'Marcus Brody', employeeCode: 'EMP-003', role: 'Branch Manager', period: 'July 2026', punctualityScore: 92, taskCompletionScore: 90, reportQualityScore: 89, overallScore: 90.3, grade: 'A' },
  { id: 'r-4', employeeName: 'Sophia Sterling', employeeCode: 'EMP-004', role: 'Staff Employee', period: 'July 2026', punctualityScore: 88, taskCompletionScore: 86, reportQualityScore: 85, overallScore: 86.3, grade: 'B+' },
];

export const PerformancePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Award size={24} className="text-amber-500" /> Performance Appraisal & Productivity Scoring
          </h2>
          <p className="text-sm text-slate-500 mt-1">Monthly staff appraisal, punctuality scores, task completion rates & AI report quality</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Average Company Rating</span>
            <Star size={18} className="text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">91.6 / 100</div>
          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
            <TrendingUp size={12} /> Grade A Average
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Punctuality Score</span>
            <Clock size={18} className="text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-blue-600 mt-2">93.2%</div>
          <span className="text-[11px] font-semibold text-slate-500 mt-1">Based on GPS check-in times</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Task Completion Rate</span>
            <CheckSquare size={18} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2">91.2%</div>
          <span className="text-[11px] font-semibold text-emerald-600 mt-1">On-time delivery</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">AI Work Report Score</span>
            <Sparkles size={18} className="text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-purple-600 mt-2">90.5 / 100</div>
          <span className="text-[11px] font-semibold text-slate-500 mt-1">Audited daily reports</span>
        </div>
      </div>

      {/* Review Roster */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs p-5 space-y-4">
        <h3 className="text-base font-bold text-slate-900">Monthly Performance Scorecard Roster</h3>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
            <tr>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Period</th>
              <th className="px-4 py-3">Punctuality (30%)</th>
              <th className="px-4 py-3">Task Completion (40%)</th>
              <th className="px-4 py-3">AI Report Quality (30%)</th>
              <th className="px-4 py-3">Overall Score</th>
              <th className="px-4 py-3">Grade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_REVIEWS.map(r => (
              <tr key={r.id} className="hover:bg-slate-50/80 transition-all">
                <td className="px-4 py-3.5">
                  <div className="font-bold text-slate-900">{r.employeeName}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{r.employeeCode} • {r.role}</div>
                </td>
                <td className="px-4 py-3.5 text-slate-600 font-medium">{r.period}</td>
                <td className="px-4 py-3.5 font-semibold text-blue-600">{r.punctualityScore}%</td>
                <td className="px-4 py-3.5 font-semibold text-emerald-600">{r.taskCompletionScore}%</td>
                <td className="px-4 py-3.5 font-semibold text-purple-600">{r.reportQualityScore}%</td>
                <td className="px-4 py-3.5 font-extrabold text-slate-900">{r.overallScore} / 100</td>
                <td className="px-4 py-3.5">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-black ${
                    r.grade === 'A+' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                    r.grade === 'A' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {r.grade}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PerformancePage;
