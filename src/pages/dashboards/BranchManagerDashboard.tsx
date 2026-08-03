// src/pages/dashboards/BranchManagerDashboard.tsx
// Branch Manager Operational Command Page

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Building2, Users, Clock, MapPin, CheckCircle, AlertCircle,
  FileCheck, Calendar, Shield, ArrowRight
} from 'lucide-react';

interface BranchStaff {
  id: string;
  name: string;
  code: string;
  role: string;
  checkInTime: string;
  distance: string;
  status: 'present' | 'late' | 'absent' | 'leave';
}

const MOCK_BRANCH_STAFF: BranchStaff[] = [
  { id: 's-1', name: 'Alexander Pierce', code: 'EMP-001', role: 'Super Admin', checkInTime: '08:52 AM', distance: '45m inside geofence', status: 'present' },
  { id: 's-2', name: 'Eleanor Vance', code: 'EMP-002', role: 'Director', checkInTime: '09:05 AM', distance: '12m inside geofence', status: 'present' },
  { id: 's-3', name: 'Marcus Brody', code: 'EMP-003', role: 'Branch Manager', checkInTime: '08:45 AM', distance: '80m inside geofence', status: 'present' },
  { id: 's-4', name: 'Sophia Sterling', code: 'EMP-004', role: 'Staff Employee', checkInTime: '09:22 AM', distance: '110m inside geofence', status: 'late' },
  { id: 's-5', name: 'Rohan Sharma', code: 'EMP-005', role: 'Remote Staff', checkInTime: '09:00 AM', distance: 'WFH Verified', status: 'present' },
  { id: 's-6', name: 'Priya Nair', code: 'EMP-006', role: 'Staff Employee', checkInTime: '—', distance: '—', status: 'absent' },
];

export const BranchManagerDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 font-extrabold text-[10px] uppercase tracking-wider">Branch Command</span>
            <span className="text-xs text-slate-400">Headquarters — Mumbai</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
            <Building2 size={24} className="text-emerald-600" /> Branch Manager Operations
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Live daily staff check-in roster, geofence radius monitor, and shift compliance</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Branch Total Staff</span>
            <Users size={18} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">24 Staff</div>
          <span className="text-[11px] font-semibold text-slate-500 mt-1">Assigned to Mumbai HQ</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Present Today</span>
            <CheckCircle size={18} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2">21 Present</div>
          <span className="text-[11px] font-semibold text-emerald-600 mt-1">87.5% Attendance Rate</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Late Check-Ins</span>
            <Clock size={18} className="text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 mt-2">2 Late</div>
          <span className="text-[11px] font-semibold text-slate-500 mt-1">15-min grace period policy</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Geofence Status</span>
            <Shield size={18} className="text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-blue-600 mt-2">200m Active</div>
          <span className="text-[11px] font-semibold text-blue-600 mt-1">Location auto-verification ON</span>
        </div>
      </div>

      {/* Staff Roster Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs space-y-4 p-5">
        <h3 className="text-base font-bold text-slate-900">Today's Branch Staff Attendance Roster</h3>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Check-In Time</th>
              <th className="px-4 py-3">GPS Location Distance</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_BRANCH_STAFF.map(s => (
              <tr key={s.id} className="hover:bg-slate-50/80 transition-all">
                <td className="px-4 py-3.5 font-mono font-bold text-emerald-700">{s.code}</td>
                <td className="px-4 py-3.5 font-bold text-slate-900">{s.name}</td>
                <td className="px-4 py-3.5 text-slate-600">{s.role}</td>
                <td className="px-4 py-3.5 font-semibold text-slate-800">{s.checkInTime}</td>
                <td className="px-4 py-3.5 text-slate-500 font-medium">{s.distance}</td>
                <td className="px-4 py-3.5"><StatusBadge status={s.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BranchManagerDashboard;
