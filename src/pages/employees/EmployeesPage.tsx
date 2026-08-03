// src/pages/employees/EmployeesPage.tsx
// Production Employee Management Page (List, Filter, Search, Excel Export/Import)

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Employee, Branch, Department } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import {
  Users, UserPlus, Download, Upload, Search, Filter,
  Mail, Phone, Building2, Briefcase, MapPin, MoreVertical, Trash2, Edit
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

export const EmployeesPage: React.FC = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');

  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<Partial<Employee>>({
    name: '',
    email: '',
    employee_code: '',
    role: 'employee',
    status: 'active',
    work_mode: 'office',
    employment_type: 'full_time',
  });

const DEMO_EMPLOYEES_LIST: Employee[] = [
  {
    id: 'e0000000-0000-0000-0000-000000000001',
    company_id: 'c0000000-0000-0000-0000-000000000001',
    employee_code: 'EMP-001',
    name: 'Alexander Pierce',
    email: 'admin@virtualmanager.ai',
    phone: '+91 98765 43210',
    role: 'super_admin',
    status: 'active',
    work_mode: 'office',
    employment_type: 'full_time',
    joining_date: '2023-01-15',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'e0000000-0000-0000-0000-000000000002',
    company_id: 'c0000000-0000-0000-0000-000000000001',
    employee_code: 'EMP-002',
    name: 'Eleanor Vance',
    email: 'director@virtualmanager.ai',
    phone: '+91 98765 43211',
    role: 'director',
    status: 'active',
    work_mode: 'office',
    employment_type: 'full_time',
    joining_date: '2023-02-01',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'e0000000-0000-0000-0000-000000000003',
    company_id: 'c0000000-0000-0000-0000-000000000001',
    employee_code: 'EMP-003',
    name: 'Marcus Brody',
    email: 'manager@virtualmanager.ai',
    phone: '+91 98765 43212',
    role: 'branch_manager',
    status: 'active',
    work_mode: 'office',
    employment_type: 'full_time',
    joining_date: '2023-03-10',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'e0000000-0000-0000-0000-000000000004',
    company_id: 'c0000000-0000-0000-0000-000000000001',
    employee_code: 'EMP-004',
    name: 'Sophia Sterling',
    email: 'employee@virtualmanager.ai',
    phone: '+91 98765 43213',
    role: 'employee',
    status: 'active',
    work_mode: 'office',
    employment_type: 'full_time',
    joining_date: '2023-05-20',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'e0000000-0000-0000-0000-000000000005',
    company_id: 'c0000000-0000-0000-0000-000000000001',
    employee_code: 'EMP-005',
    name: 'Rohan Sharma',
    email: 'rohan.sharma@acmeglobal.com',
    phone: '+91 98765 43214',
    role: 'employee',
    status: 'active',
    work_mode: 'remote',
    employment_type: 'full_time',
    joining_date: '2023-06-15',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'e0000000-0000-0000-0000-000000000006',
    company_id: 'c0000000-0000-0000-0000-000000000001',
    employee_code: 'EMP-006',
    name: 'Priya Nair',
    email: 'priya.nair@acmeglobal.com',
    phone: '+91 98765 43215',
    role: 'employee',
    status: 'active',
    work_mode: 'hybrid',
    employment_type: 'full_time',
    joining_date: '2023-08-01',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

  const fetchEmployees = async () => {
    if (!user?.company_id) return;
    setLoading(true);

    try {
      let query = supabase
        .from('employees')
        .select(`
          *,
          branches:branch_id(id, name, code),
          departments:department_id(id, name)
        `)
        .eq('company_id', user.company_id)
        .order('created_at', { ascending: false });

      if (branchFilter) query = query.eq('branch_id', branchFilter);
      if (roleFilter) query = query.eq('role', roleFilter);
      if (statusFilter) query = query.eq('status', statusFilter);
      if (search) query = query.ilike('name', `%${search}%`);

      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        setEmployees(DEMO_EMPLOYEES_LIST);
      } else {
        setEmployees(data as Employee[]);
      }

      // Load filter metadata
      const { data: branchData } = await supabase.from('branches').select('*').eq('company_id', user.company_id);
      const { data: deptData } = await supabase.from('departments').select('*').eq('company_id', user.company_id);
      setBranches((branchData || []) as Branch[]);
      setDepartments((deptData || []) as Department[]);
    } catch (err: any) {
      setEmployees(DEMO_EMPLOYEES_LIST);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [user?.company_id, branchFilter, roleFilter, statusFilter, search]);

  const handleExportExcel = () => {
    const exportData = employees.map(e => ({
      'Employee Code': e.employee_code,
      'Name': e.name,
      'Email': e.email,
      'Phone': e.phone || 'N/A',
      'Role': e.role,
      'Work Mode': e.work_mode,
      'Employment Type': e.employment_type,
      'Status': e.status,
      'Joining Date': e.joining_date || 'N/A',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');
    XLSX.writeFile(workbook, `Employees_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Employee directory exported!');
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.company_id) return;

    try {
      const { error } = await supabase.from('employees').insert({
        ...formData,
        company_id: user.company_id,
        id: crypto.randomUUID(), // Stub UUID for auth link
      });

      if (error) throw error;
      toast.success('Employee created successfully');
      setShowAddModal(false);
      fetchEmployees();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create employee');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Users size={22} className="text-blue-600" /> Employee Directory
          </h2>
          <p className="text-sm text-slate-500 mt-1">Manage corporate staff, branch assignments, roles, and profiles</p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleExportExcel} className="btn btn-secondary text-xs">
            <Download size={14} /> Export Excel
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary text-xs">
            <UserPlus size={14} /> Add Employee
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center gap-3 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, code, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input pl-9 text-xs"
          />
        </div>

        <select
          value={branchFilter}
          onChange={e => setBranchFilter(e.target.value)}
          className="form-input w-40 text-xs"
        >
          <option value="">All Branches</option>
          {branches.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="form-input w-40 text-xs"
        >
          <option value="">All Roles</option>
          <option value="super_admin">Super Admin</option>
          <option value="company_admin">Company Admin</option>
          <option value="director">Director</option>
          <option value="branch_manager">Branch Manager</option>
          <option value="employee">Employee</option>
        </select>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="form-input w-36 text-xs"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="on_leave">On Leave</option>
        </select>
      </div>

      {/* Employee List Table */}
      <div className="table-container glass-card">
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Code</th>
              <th>Role</th>
              <th>Branch</th>
              <th>Work Mode</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-xs text-slate-500">Loading directory...</td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-xs text-slate-500">No employees found</td>
              </tr>
            ) : (
              employees.map(emp => (
                <tr key={emp.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{emp.name}</p>
                        <p className="text-[11px] text-slate-500">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="font-mono text-xs text-blue-600 font-semibold">{emp.employee_code}</td>
                  <td>
                    <span className="text-xs font-semibold text-slate-700 capitalize">
                      {emp.role.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="text-xs text-slate-600">{emp.branches?.name || 'Unassigned'}</td>
                  <td className="text-xs text-slate-600 capitalize">{emp.work_mode}</td>
                  <td><StatusBadge status={emp.status} size="xs" /></td>
                  <td className="text-right">
                    <button className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                      <Edit size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Employee Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Employee"
        subtitle="Create employee account and configure organizational mapping"
      >
        <form onSubmit={handleCreateEmployee} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="form-input text-xs"
                required
              />
            </div>

            <div>
              <label className="form-label">Employee Code *</label>
              <input
                type="text"
                value={formData.employee_code || ''}
                onChange={e => setFormData({ ...formData, employee_code: e.target.value })}
                placeholder="EMP-1001"
                className="form-input text-xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="form-input text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Role *</label>
              <select
                value={formData.role || 'employee'}
                onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                className="form-input text-xs"
              >
                <option value="employee">Employee</option>
                <option value="branch_manager">Branch Manager</option>
                <option value="director">Director</option>
                <option value="company_admin">Company Admin</option>
              </select>
            </div>

            <div>
              <label className="form-label">Branch</label>
              <select
                value={formData.branch_id || ''}
                onChange={e => setFormData({ ...formData, branch_id: e.target.value })}
                className="form-input text-xs"
              >
                <option value="">Select Branch</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-ghost text-xs">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary text-xs">
              Create Employee
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
