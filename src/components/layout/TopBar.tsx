// src/components/layout/TopBar.tsx
// Header topbar — Clean White Light Theme

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Notification } from '@/types';
import {
  Search, Bell, LogOut, User,
  Clock, Calendar, AlertCircle, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TopBarProps {
  onOpenSearch: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenSearch }) => {
  const { user, company, logout } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: 'n-1',
    company_id: 'c0000000-0000-0000-0000-000000000001',
    user_id: 'e0000000-0000-0000-0000-000000000001',
    title: 'Daily Report Flagged for Review',
    message: 'Work report from Sophia Sterling was flagged by AI Auditor for low detail score.',
    type: 'ai_alert',
    priority: 'high',
    is_read: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'n-2',
    company_id: 'c0000000-0000-0000-0000-000000000001',
    user_id: 'e0000000-0000-0000-0000-000000000001',
    title: 'Branch Geofence Check-In Success',
    message: '38 employees successfully checked in via GPS location today.',
    type: 'attendance',
    priority: 'normal',
    is_read: true,
    created_at: new Date().toISOString(),
  }
];

  useEffect(() => {
    if (!user?.id) return;

    const fetchNotifications = async () => {
      try {
        const { data } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (data && data.length > 0) {
          setNotifications(data as Notification[]);
          setUnreadCount(data.filter(n => !n.is_read).length);
        } else {
          setNotifications(DEMO_NOTIFICATIONS);
          setUnreadCount(1);
        }
      } catch (err) {
        setNotifications(DEMO_NOTIFICATIONS);
        setUnreadCount(1);
      }
    };

    fetchNotifications();
  }, [user?.id]);

  const markAllAsRead = async () => {
    if (!user?.id) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-6 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-3 px-3.5 py-2 text-xs text-slate-500 bg-slate-100/80 border border-slate-200 rounded-xl hover:border-blue-400 hover:bg-white transition-all w-64 md:w-80"
        >
          <Search size={15} className="text-slate-400" />
          <span className="flex-1 text-left font-medium">Search employees, tasks, SOPs...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white text-slate-500 rounded border border-slate-200 shadow-2xs">Ctrl+K</kbd>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(prev => !prev)}
            className="relative p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl p-4 shadow-xl z-50"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">Notifications</h4>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
                    >
                      <Check size={12} /> Mark all read
                    </button>
                  )}
                </div>

                <div className="py-2 max-h-80 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-center text-slate-400 py-6">No notifications</p>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        className={`p-3 rounded-xl border transition-all ${
                          n.is_read
                            ? 'bg-slate-50 border-slate-100 text-slate-600'
                            : 'bg-blue-50/50 border-blue-100 text-slate-900'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600 mt-0.5">
                            {n.type === 'attendance' ? <Clock size={14} /> : n.type === 'leave' ? <Calendar size={14} /> : <AlertCircle size={14} />}
                          </div>
                          <div className="flex-1">
                            <h5 className="text-xs font-bold">{n.title}</h5>
                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                            <span className="text-[10px] text-slate-400 font-semibold mt-1 block">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(prev => !prev)}
            className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all shadow-2xs"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-xs font-bold shadow-xs">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-900 leading-tight">{user?.name || 'Employee'}</p>
              <p className="text-[10px] text-blue-600 font-semibold capitalize">{user?.role?.replace(/_/g, ' ') || 'Role'}</p>
            </div>
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl p-2 shadow-xl z-50"
              >
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  <p className="text-[10px] text-blue-600 font-bold mt-1">{company?.name || 'Virtual Manager AI'}</p>
                </div>

                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors mt-1"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
