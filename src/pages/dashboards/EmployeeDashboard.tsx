// src/pages/dashboards/EmployeeDashboard.tsx
// Employee Self-Service Workspace Portal

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Link } from 'react-router-dom';
import {
  UserCheck, Clock, Calendar, CheckSquare, FileText,
  MapPin, Award, ArrowRight, ShieldCheck, Sparkles
} from 'lucide-react';

export const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-teal-100 text-teal-700 font-extrabold text-[10px] uppercase tracking-wider">Employee Workspace</span>
            <span className="text-xs text-slate-400">Personal Portal</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
            <UserCheck size={24} className="text-teal-600" /> Welcome back, {user?.name || 'Alexander'}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Your daily work check-in, assigned tasks, leave balances & report score</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/attendance/mark"
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 font-semibold text-xs transition-all shadow-sm shadow-teal-200"
          >
            <Clock size={15} /> Mark Daily Attendance
          </Link>
          <Link
            to="/reports/daily"
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 font-semibold text-xs transition-all shadow-xs"
          >
            <FileText size={15} /> Submit Work Report
          </Link>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Today's Attendance</span>
            <Clock size={18} className="text-emerald-600" />
          </div>
          <div className="text-xl font-extrabold text-emerald-600 mt-2">08:52 AM Check-In</div>
          <span className="text-[11px] font-semibold text-emerald-600 mt-1">Verified On-Site (45m radius)</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Assigned Tasks</span>
            <CheckSquare size={18} className="text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">3 Pending</div>
          <span className="text-[11px] font-semibold text-blue-600 mt-1">1 Task Due Today</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Casual Leave Balance</span>
            <Calendar size={18} className="text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">8 / 12 Days</div>
          <span className="text-[11px] font-semibold text-slate-500 mt-1">4 Days Used this year</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Latest AI Audit Score</span>
            <Sparkles size={18} className="text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-teal-600 mt-2">92 / 100</div>
          <span className="text-[11px] font-semibold text-emerald-600 mt-1">Excellent Detail Quality</span>
        </div>
      </div>

      {/* Task & Leave Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">My Active Tasks</h3>
            <Link to="/tasks" className="text-xs font-bold text-teal-600 hover:underline flex items-center gap-1">
              View All Tasks <ArrowRight size={13} />
            </Link>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span>Branch Geofence Audit & Location Calibration</span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px]">In Progress</span>
              </div>
              <p className="text-slate-600">Verify GPS radius parameters for Mumbai main office.</p>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full w-[60%]" />
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span>Publish HR Leave & Attendance SOP Policy</span>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-[10px]">Assigned</span>
              </div>
              <p className="text-slate-600">Upload latest HR leave policy document to company SOP library.</p>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-600 h-full w-[30%]" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">My Leave Quota Overview</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-xl text-center">
              <div className="text-xs text-slate-500 font-semibold">Casual Leave</div>
              <div className="text-xl font-extrabold text-blue-700 mt-1">8 Days</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Remaining</div>
            </div>
            <div className="p-3.5 bg-purple-50 border border-purple-100 rounded-xl text-center">
              <div className="text-xs text-slate-500 font-semibold">Sick Leave</div>
              <div className="text-xl font-extrabold text-purple-700 mt-1">5 Days</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Remaining</div>
            </div>
            <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
              <div className="text-xs text-slate-500 font-semibold">Earned Leave</div>
              <div className="text-xl font-extrabold text-emerald-700 mt-1">10 Days</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Remaining</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
