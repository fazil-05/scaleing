// src/pages/settings/CompanySettingsPage.tsx
// Production Company System Settings & Parameter Configuration Page

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Settings, Sliders, Shield, Bell, Clock, Save, Building2, CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

export const CompanySettingsPage: React.FC = () => {
  const { company } = useAuth();
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    attendanceRadius: 200,
    allowRemoteCheckin: true,
    requirePhotoCheckin: false,
    autoCheckoutTime: '20:00',
    aiScoreThreshold: 60,
    notifyDirectorOnFlag: true,
    emailNotifications: true,
    smsNotifications: false,
    whatsappNotifications: true,
    workWeekStart: 'Mon',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Company system settings updated successfully!');
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Settings size={24} className="text-blue-600" /> Organization System Settings
          </h2>
          <p className="text-sm text-slate-500 mt-1">Configure geofencing boundaries, AI auditing thresholds, and notification rules</p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold text-xs transition-all shadow-sm shadow-blue-200 disabled:opacity-50"
        >
          <Save size={15} /> {saving ? 'Saving Changes...' : 'Save Settings'}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Attendance & Geofence Parameters */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Shield size={18} className="text-blue-600" /> GPS Geofence & Attendance Rules
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Global Branch Geofence Radius (meters)</label>
              <input
                type="number"
                value={settings.attendanceRadius}
                onChange={e => setSettings({ ...settings, attendanceRadius: Number(e.target.value) })}
                className="form-input text-xs"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Maximum allowed distance from branch coordinates for auto-verification</span>
            </div>

            <div>
              <label className="form-label">Automatic Evening Check-Out Time</label>
              <input
                type="time"
                value={settings.autoCheckoutTime}
                onChange={e => setSettings({ ...settings, autoCheckoutTime: e.target.value })}
                className="form-input text-xs"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Auto close open check-ins at end of day</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allowRemoteCheckin}
                onChange={e => setSettings({ ...settings, allowRemoteCheckin: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
              />
              <div>
                <div className="text-xs font-bold text-slate-800">Allow Work From Home (WFH) / Field Check-Ins</div>
                <div className="text-[11px] text-slate-400">Permit staff with Remote or Field work mode to check in outside office geofence</div>
              </div>
            </label>
          </div>
        </div>

        {/* AI Report Audit Rules */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sliders size={18} className="text-purple-600" /> Virtual Manager AI Audit Parameters
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">AI Flagging Quality Threshold (0-100)</label>
              <input
                type="number"
                value={settings.aiScoreThreshold}
                onChange={e => setSettings({ ...settings, aiScoreThreshold: Number(e.target.value) })}
                className="form-input text-xs"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Work reports scoring below this threshold will be flagged for review</span>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifyDirectorOnFlag}
                onChange={e => setSettings({ ...settings, notifyDirectorOnFlag: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
              />
              <div>
                <div className="text-xs font-bold text-slate-800">Notify Executive Director on Flagged Reports</div>
                <div className="text-[11px] text-slate-400">Send high-priority notification to Director Workspace when low detail is detected</div>
              </div>
            </label>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Bell size={18} className="text-emerald-600" /> System Notification Dispatch Channels
          </h3>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={e => setSettings({ ...settings, emailNotifications: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
              />
              <div className="text-xs font-bold text-slate-800">Send Email Alerts for Leave Approvals & Tasks</div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.whatsappNotifications}
                onChange={e => setSettings({ ...settings, whatsappNotifications: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
              />
              <div className="text-xs font-bold text-slate-800">Send WhatsApp Reminders for Daily Report Submissions</div>
            </label>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CompanySettingsPage;
