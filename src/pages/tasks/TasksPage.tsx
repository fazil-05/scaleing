// src/pages/tasks/TasksPage.tsx
// Task Management Page (Kanban Board + List View with Role Access Control & Assignee Display)

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Task, TaskStatus, Employee } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import {
  CheckSquare, Plus, LayoutGrid, List,
  User, Calendar, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

const KANBAN_COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: 'pending', label: 'Pending' },
  { id: 'assigned', label: 'Assigned' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
  { id: 'blocked', label: 'Blocked' },
];

const DEMO_EMPLOYEES: Partial<Employee>[] = [
  { id: 'a0000000-0000-0000-0000-000000000004', name: 'Sophia Sterling', employee_code: 'EMP-004', role: 'employee' },
  { id: 'a0000000-0000-0000-0000-000000000003', name: 'Marcus Vance', employee_code: 'EMP-003', role: 'branch_manager' },
  { id: 'a0000000-0000-0000-0000-000000000002', name: 'Elena Rostova', employee_code: 'EMP-002', role: 'director' },
  { id: 'a0000000-0000-0000-0000-000000000001', name: 'Alexander Pierce', employee_code: 'EMP-001', role: 'super_admin' },
];

const DEMO_TASKS_LIST: Task[] = [
  {
    id: 't0000000-0000-0000-0000-000000000001',
    company_id: 'c0000000-0000-0000-0000-000000000001',
    created_by: 'e0000000-0000-0000-0000-000000000001',
    assigned_to: 'e0000000-0000-0000-0000-000000000004',
    title: 'Branch Geofence Audit & Location Calibration',
    description: 'Verify GPS radius parameters for Mumbai and Delhi main offices.',
    priority: 'high',
    status: 'in_progress',
    due_date: '2026-08-10',
    completion_percentage: 60,
    is_milestone: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 't0000000-0000-0000-0000-000000000002',
    company_id: 'c0000000-0000-0000-0000-000000000001',
    created_by: 'e0000000-0000-0000-0000-000000000002',
    assigned_to: 'e0000000-0000-0000-0000-000000000003',
    title: 'Review Q3 Staff Performance & AI Reports',
    description: 'Audit flagged work reports and generate performance review summary.',
    priority: 'critical',
    status: 'pending',
    due_date: '2026-08-15',
    completion_percentage: 10,
    is_milestone: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 't0000000-0000-0000-0000-000000000003',
    company_id: 'c0000000-0000-0000-0000-000000000001',
    created_by: 'e0000000-0000-0000-0000-000000000001',
    assigned_to: 'e0000000-0000-0000-0000-000000000004',
    title: 'Publish HR Leave & Attendance SOP Policy',
    description: 'Upload latest HR leave policy document to company SOP library.',
    priority: 'medium',
    status: 'assigned',
    due_date: '2026-08-12',
    completion_percentage: 30,
    is_milestone: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 't0000000-0000-0000-0000-000000000004',
    company_id: 'c0000000-0000-0000-0000-000000000001',
    created_by: 'e0000000-0000-0000-0000-000000000003',
    assigned_to: 'e0000000-0000-0000-0000-000000000001',
    title: 'Complete System Vercel Deployment & SSL Verification',
    description: 'Ensure clean domain SSL and SPA rewrites configuration.',
    priority: 'high',
    status: 'completed',
    due_date: '2026-08-03',
    completion_percentage: 100,
    is_milestone: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export const TasksPage: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'kanban' | 'list'>('kanban');

  // Employee list for assignment dropdown
  const [employees, setEmployees] = useState<Partial<Employee>[]>(DEMO_EMPLOYEES);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  // Check if current user has management permissions to create tasks
  const canCreateTask = user?.role && ['super_admin', 'company_admin', 'director', 'branch_manager'].includes(user.role);

  const fetchTasks = async () => {
    if (!user?.company_id) return;
    setLoading(true);

    try {
      // Load all employees in company for assignment list
      const { data: empData } = await supabase
        .from('employees')
        .select('id, name, employee_code, role')
        .eq('company_id', user.company_id);

      if (empData && empData.length > 0) {
        setEmployees(empData as Partial<Employee>[]);
      } else {
        setEmployees(DEMO_EMPLOYEES);
      }

      let query = supabase
        .from('tasks')
        .select('*')
        .eq('company_id', user.company_id);

      // If user is employee, only fetch tasks assigned to them or created by them
      if (user.role === 'employee') {
        query = query.or(`assigned_to.eq.${user.id},created_by.eq.${user.id}`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        setTasks(DEMO_TASKS_LIST);
      } else {
        setTasks(data as Task[]);
      }
    } catch (err: any) {
      setTasks(DEMO_TASKS_LIST);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user?.company_id, user?.role, user?.id]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.company_id || !user?.id) return;

    try {
      const { error } = await supabase.from('tasks').insert({
        company_id: user.company_id,
        created_by: user.id,
        assigned_to: assignedTo || null,
        title,
        description,
        priority,
        status: assignedTo ? 'assigned' : 'pending',
        due_date: dueDate || null,
      });

      if (error) throw error;

      toast.success('Task created successfully!');
      setShowCreateModal(false);
      setTitle('');
      setDescription('');
      setAssignedTo('');
      fetchTasks();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create task');
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      toast.success(`Task status updated`);
    } catch (err: any) {
      toast.error('Failed to update status');
    }
  };

  const getAssigneeName = (assignedId?: string) => {
    if (!assignedId) return 'Unassigned';
    const found = employees.find(e => e.id === assignedId);
    return found ? found.name : 'Assigned Employee';
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <CheckSquare size={24} className="text-blue-600" /> Task Management
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {canCreateTask
              ? 'Assign, track, and audit project milestones across branches'
              : 'View and update status of tasks assigned to you by your manager'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 border border-slate-200 rounded-xl p-1">
            <button
              onClick={() => setView('kanban')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${view === 'kanban' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${view === 'list' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <List size={14} />
            </button>
          </div>

          {canCreateTask && (
            <button onClick={() => setShowCreateModal(true)} className="btn btn-primary text-xs">
              <Plus size={14} /> Create Task
            </button>
          )}
        </div>
      </div>

      {/* Kanban Board View */}
      {view === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {KANBAN_COLUMNS.map(col => {
            const colTasks = tasks.filter(t => t.status === col.id);

            return (
              <div key={col.id} className="kanban-column p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">{col.label}</h4>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {colTasks.map(task => (
                    <div key={task.id} className="kanban-card space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="text-xs font-bold text-slate-900 line-clamp-2">{task.title}</h5>
                        <StatusBadge status={task.priority} size="xs" />
                      </div>

                      {task.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-2">{task.description}</p>
                      )}

                      {/* Assigned Employee (Displayed at the lower part of card) */}
                      <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <User size={13} className="text-blue-600 flex-shrink-0" />
                        <span className="truncate">
                          Assigned to: <strong className="text-slate-900 font-semibold">{getAssigneeName(task.assigned_to)}</strong>
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} className="text-slate-400" />
                          {task.due_date || 'No Date'}
                        </span>

                        {/* Move Status */}
                        <select
                          value={task.status}
                          onChange={e => handleUpdateStatus(task.id, e.target.value as TaskStatus)}
                          className="bg-white text-slate-700 text-[10px] border border-slate-200 rounded px-1.5 py-0.5 outline-none focus:border-blue-500"
                        >
                          {KANBAN_COLUMNS.map(c => (
                            <option key={c.id} value={c.id}>{c.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="table-container glass-card">
          <table>
            <thead>
              <tr>
                <th>Task Title</th>
                <th>Assigned To</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Due Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task.id}>
                  <td className="text-xs font-bold text-slate-900">{task.title}</td>
                  <td>
                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <User size={13} className="text-blue-600" />
                      {getAssigneeName(task.assigned_to)}
                    </span>
                  </td>
                  <td><StatusBadge status={task.priority} size="xs" /></td>
                  <td><StatusBadge status={task.status} size="xs" /></td>
                  <td className="text-xs text-slate-500">{task.due_date || 'N/A'}</td>
                  <td className="text-right">
                    <select
                      value={task.status}
                      onChange={e => handleUpdateStatus(task.id, e.target.value as TaskStatus)}
                      className="bg-white text-slate-700 text-xs border border-slate-200 rounded px-2 py-1 outline-none"
                    >
                      {KANBAN_COLUMNS.map(c => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Task Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Task"
        subtitle="Assign milestones, priorities, and deadlines to your team members"
        icon={<CheckSquare size={20} />}
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="form-label">Task Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Complete Q3 Branch Audit Report"
              className="form-input text-xs"
              required
            />
          </div>

          <div>
            <label className="form-label">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detailed instructions for the employee..."
              className="form-input text-xs"
            />
          </div>

          <div>
            <label className="form-label">Assign To Employee *</label>
            <select
              value={assignedTo}
              onChange={e => setAssignedTo(e.target.value)}
              className="form-input text-xs font-semibold text-slate-800"
            >
              <option value="">Select Employee to Assign...</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  👤 {emp.name} ({emp.employee_code || 'EMP'}) — {emp.role?.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                className="form-input text-xs"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="form-label">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="form-input text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-ghost text-xs">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary text-xs">
              Save & Assign Task
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
