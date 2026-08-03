// src/pages/leaves/LeaveRequestsPage.tsx
// Employee & Manager Leave Request Portal with Approval Workflow

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import {
  Calendar, Plus, Search, Filter, CheckCircle2, XCircle, Clock, FileText, Check, X
} from 'lucide-react';
import toast from 'react-hot-toast';

interface LeaveItem {
  id: string;
  employeeName: string;
  employeeCode: string;
  leaveType: 'Casual Leave' | 'Sick Leave' | 'Earned Leave' | 'Maternity / Paternity';
  fromDate: string;
  toDate: string;
  totalDays: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedOn: string;
}

const MOCK_LEAVES: LeaveItem[] = [
  { id: 'l-1', employeeName: 'Sophia Sterling', employeeCode: 'EMP-004', leaveType: 'Casual Leave', fromDate: '2026-08-10', toDate: '2026-08-12', totalDays: 3, reason: 'Personal family commitments', status: 'pending', appliedOn: '2026-08-02' },
  { id: 'l-2', employeeName: 'Rohan Sharma', employeeCode: 'EMP-005', leaveType: 'Sick Leave', fromDate: '2026-08-01', toDate: '2026-08-02', totalDays: 2, reason: 'High fever and medical rest', status: 'approved', appliedOn: '2026-07-31' },
  { id: 'l-3', employeeName: 'Priya Nair', employeeCode: 'EMP-006', leaveType: 'Earned Leave', fromDate: '2026-08-18', toDate: '2026-08-22', totalDays: 5, reason: 'Annual vacation trip', status: 'approved', appliedOn: '2026-07-25' },
  { id: 'l-4', employeeName: 'Marcus Brody', employeeCode: 'EMP-003', leaveType: 'Casual Leave', fromDate: '2026-08-05', toDate: '2026-08-05', totalDays: 1, reason: 'Urgent home maintenance', status: 'pending', appliedOn: '2026-08-03' },
];

export const LeaveRequestsPage: React.FC = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveItem[]>(MOCK_LEAVES);
  const [statusFilter, setStatusFilter] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: 'Casual Leave',
    fromDate: '',
    toDate: '',
    reason: '',
  });

  const isManager = user?.role && ['super_admin', 'company_admin', 'director', 'branch_manager'].includes(user.role);

  const filteredLeaves = statusFilter
    ? leaves.filter(l => l.status === statusFilter)
    : leaves;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fromDate || !formData.toDate || !formData.reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    const start = new Date(formData.fromDate);
    const end = new Date(formData.toDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const newItem: LeaveItem = {
      id: `l-${Date.now()}`,
      employeeName: user?.name || 'Alexander Pierce',
      employeeCode: user?.employee_code || 'EMP-001',
      leaveType: formData.leaveType as any,
      fromDate: formData.fromDate,
      toDate: formData.toDate,
      totalDays: days > 0 ? days : 1,
      reason: formData.reason,
      status: 'pending',
      appliedOn: new Date().toISOString().split('T')[0],
    };

    setLeaves([newItem, ...leaves]);
    setShowApplyModal(false);
    setFormData({ leaveType: 'Casual Leave', fromDate: '', toDate: '', reason: '' });
    toast.success('Leave application submitted for manager approval!');
  };

  const handleApprove = (id: string) => {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'approved' } : l));
    toast.success('Leave request approved!');
  };

  const handleReject = (id: string) => {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'rejected' } : l));
    toast.error('Leave request rejected');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Calendar size={24} className="text-blue-600" /> Leave Management & Approvals
          </h2>
          <p className="text-sm text-slate-500 mt-1">Apply for leaves, track quotas, and process staff leave applications</p>
        </div>

        <button
          onClick={() => setShowApplyModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold text-xs transition-all shadow-sm shadow-blue-200"
        >
          <Plus size={15} /> Apply For Leave
        </button>
      </div>

      {/* Quota Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Casual Leave (CL)</div>
          <div className="text-2xl font-extrabold text-blue-700 mt-2">8 / 12 Days</div>
          <div className="text-[11px] text-slate-400 mt-1">4 Days Used this year</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Sick Leave (SL)</div>
          <div className="text-2xl font-extrabold text-purple-700 mt-2">5 / 6 Days</div>
          <div className="text-[11px] text-slate-400 mt-1">1 Day Used this year</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Earned Leave (EL)</div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-2">10 / 15 Days</div>
          <div className="text-[11px] text-slate-400 mt-1">5 Days Used this year</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Leave Applications Roster</h3>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="form-select text-xs w-44"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
            <tr>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Leave Type</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Days</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Status</th>
              {isManager && <th className="px-4 py-3">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLeaves.map(l => (
              <tr key={l.id} className="hover:bg-slate-50/80 transition-all">
                <td className="px-4 py-3.5">
                  <div className="font-bold text-slate-900">{l.employeeName}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{l.employeeCode}</div>
                </td>
                <td className="px-4 py-3.5 font-semibold text-blue-700">{l.leaveType}</td>
                <td className="px-4 py-3.5 text-slate-600 font-medium">{l.fromDate} → {l.toDate}</td>
                <td className="px-4 py-3.5 font-bold text-slate-900">{l.totalDays} Day(s)</td>
                <td className="px-4 py-3.5 text-slate-600 max-w-xs truncate">{l.reason}</td>
                <td className="px-4 py-3.5"><StatusBadge status={l.status} /></td>
                {isManager && (
                  <td className="px-4 py-3.5">
                    {l.status === 'pending' ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApprove(l.id)}
                          className="p-1 bg-emerald-100 text-emerald-700 rounded-md hover:bg-emerald-200 transition-all"
                          title="Approve Leave"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => handleReject(l.id)}
                          className="p-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-all"
                          title="Reject Leave"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[10px]">Processed</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Apply Leave Modal */}
      <Modal isOpen={showApplyModal} onClose={() => setShowApplyModal(false)} title="Apply For Leave">
        <form onSubmit={handleApply} className="space-y-4">
          <div>
            <label className="form-label">Leave Type *</label>
            <select
              value={formData.leaveType}
              onChange={e => setFormData({ ...formData, leaveType: e.target.value as any })}
              className="form-select text-xs"
            >
              <option value="Casual Leave">Casual Leave (CL)</option>
              <option value="Sick Leave">Sick Leave (SL)</option>
              <option value="Earned Leave">Earned Leave (EL)</option>
              <option value="Maternity / Paternity">Maternity / Paternity</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">From Date *</label>
              <input
                type="date"
                required
                value={formData.fromDate}
                onChange={e => setFormData({ ...formData, fromDate: e.target.value })}
                className="form-input text-xs"
              />
            </div>
            <div>
              <label className="form-label">To Date *</label>
              <input
                type="date"
                required
                value={formData.toDate}
                onChange={e => setFormData({ ...formData, toDate: e.target.value })}
                className="form-input text-xs"
              />
            </div>
          </div>

          <div>
            <label className="form-label">Reason *</label>
            <textarea
              required
              rows={3}
              placeholder="State reason for leave request..."
              value={formData.reason}
              onChange={e => setFormData({ ...formData, reason: e.target.value })}
              className="form-input text-xs"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setShowApplyModal(false)} className="btn btn-secondary text-xs">Cancel</button>
            <button type="submit" className="btn btn-primary text-xs">Submit Application</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LeaveRequestsPage;
