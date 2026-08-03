// src/components/layout/Sidebar.tsx
// Role-based collapsible navigation sidebar — Clean White & Royal Blue Light Theme

import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, Users, Building2, Clock, CalendarDays,
  Navigation, FileText, CheckSquare, BookOpen,
  FolderOpen, ShieldAlert, Sparkles, MessageSquare, Award,
  Brain, LogOut, ChevronLeft, ChevronRight, ChevronDown, BarChart3, Settings
} from 'lucide-react';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  roles: string[];
  badge?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: 'Dashboards',
    items: [
      { label: 'Super Admin', icon: <Brain size={18} />, path: '/dashboards/super-admin', roles: ['super_admin'] },
      { label: 'Company Overview', icon: <LayoutDashboard size={18} />, path: '/dashboards/company', roles: ['super_admin', 'company_admin'] },
      { label: 'Director Workspace', icon: <ShieldAlert size={18} />, path: '/dashboards/director', roles: ['director', 'super_admin'] },
      { label: 'Branch Command', icon: <Building2 size={18} />, path: '/dashboards/branch', roles: ['branch_manager', 'super_admin', 'company_admin'] },
      { label: 'My Dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboards/employee', roles: ['employee', 'branch_manager', 'director'] },
    ],
  },
  {
    title: 'Core Operations',
    items: [
      { label: 'GPS Attendance', icon: <Clock size={18} />, path: '/attendance/mark', roles: ['employee', 'branch_manager', 'director', 'super_admin', 'company_admin'] },
      { label: 'Live Map & Logs', icon: <Navigation size={18} />, path: '/attendance/live', roles: ['super_admin', 'company_admin', 'director', 'branch_manager'] },
      { label: 'Task Management', icon: <CheckSquare size={18} />, path: '/tasks', roles: ['super_admin', 'company_admin', 'director', 'branch_manager', 'employee'] },
      { label: 'Daily Work Reports', icon: <FileText size={18} />, path: '/reports/daily', roles: ['employee', 'branch_manager', 'director', 'super_admin', 'company_admin'] },
      { label: 'AI Report Auditing', icon: <Sparkles size={18} />, path: '/reports/audit', roles: ['super_admin', 'company_admin', 'director', 'branch_manager'], badge: 'AI' },
    ],
  },
  {
    title: 'Workforce & HR',
    items: [
      { label: 'Employees', icon: <Users size={18} />, path: '/employees', roles: ['super_admin', 'company_admin', 'director', 'branch_manager'] },
      { label: 'Branches', icon: <Building2 size={18} />, path: '/branches', roles: ['super_admin', 'company_admin'] },
      { label: 'Leave Requests', icon: <CalendarDays size={18} />, path: '/leaves', roles: ['super_admin', 'company_admin', 'director', 'branch_manager', 'employee'] },
      { label: 'Performance', icon: <Award size={18} />, path: '/performance', roles: ['super_admin', 'company_admin', 'director', 'branch_manager', 'employee'] },
    ],
  },
  {
    title: 'Knowledge & AI',
    items: [
      { label: 'SOP Library', icon: <BookOpen size={18} />, path: '/sops', roles: ['super_admin', 'company_admin', 'director', 'branch_manager', 'employee'] },
      { label: 'Resource Center', icon: <FolderOpen size={18} />, path: '/resources', roles: ['super_admin', 'company_admin', 'director', 'branch_manager', 'employee'] },
      { label: 'Team Chat', icon: <MessageSquare size={18} />, path: '/chat', roles: ['super_admin', 'company_admin', 'director', 'branch_manager', 'employee'] },
      { label: 'Analytics & Insights', icon: <BarChart3 size={18} />, path: '/analytics', roles: ['super_admin', 'company_admin', 'director'] },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Company Settings', icon: <Settings size={18} />, path: '/settings', roles: ['super_admin', 'company_admin'] },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const { user, company, logout } = useAuth();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Dashboards: true,
    'Core Operations': true,
    'Workforce & HR': true,
  });

  const toggleGroup = (title: string) => {
    setOpenGroups(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const userRole = user?.role || 'employee';

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/20">
          <Brain size={20} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-extrabold text-slate-900 leading-tight tracking-tight flex items-center gap-1.5">
              Virtual Manager <span className="px-1.5 py-0.2 text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded">AI</span>
            </h1>
            <p className="text-[10px] font-semibold text-blue-600 truncate">{company?.name || 'Enterprise Edition'}</p>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="ml-auto p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors hidden md:flex"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-3">
        {navGroups.map(group => {
          const visibleItems = group.items.filter(item => item.roles.includes(userRole));
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.title}>
              {!collapsed && (
                <div
                  onClick={() => toggleGroup(group.title)}
                  className="nav-group-header flex items-center justify-between"
                >
                  <span>{group.title}</span>
                  <ChevronDown
                    size={13}
                    className={`transition-transform ${openGroups[group.title] ? '' : '-rotate-90'}`}
                  />
                </div>
              )}

              {(collapsed || openGroups[group.title]) && (
                <div className="space-y-0.5 mt-0.5">
                  {visibleItems.map(item => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `sidebar-nav-item ${isActive ? 'active' : ''}`
                      }
                      title={collapsed ? item.label : undefined}
                    >
                      <span className="flex-shrink-0">{item.icon}</span>
                      {!collapsed && <span className="truncate flex-1">{item.label}</span>}
                      {!collapsed && item.badge && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold bg-blue-100 text-blue-700 rounded border border-blue-200">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-100 space-y-2">
        <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-100">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-xs">
            {user?.name?.charAt(0) || 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
              <p className="text-[10px] text-blue-600 font-semibold capitalize truncate">
                {user?.role?.replace(/_/g, ' ')}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={logout}
          className="sidebar-nav-item w-full text-red-600 hover:bg-red-50 hover:text-red-700"
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut size={18} />
          {!collapsed && <span className="font-semibold text-xs">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
