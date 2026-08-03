// src/pages/attendance/LiveMapPage.tsx
// Live GPS Location Tracking & Geofence Verification Log Stream

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Navigation, MapPin, ShieldCheck, Clock, RefreshCw, CheckCircle, Radio } from 'lucide-react';

interface LiveCheckIn {
  id: string;
  name: string;
  code: string;
  branch: string;
  time: string;
  lat: number;
  lng: number;
  distance: string;
  accuracy: string;
  status: 'verified' | 'flagged';
}

const MOCK_LIVE_FEED: LiveCheckIn[] = [
  { id: 'lc-1', name: 'Alexander Pierce', code: 'EMP-001', branch: 'Headquarters — Mumbai', time: '08:52 AM', lat: 19.0661, lng: 72.8682, distance: '45m from center', accuracy: '±6m', status: 'verified' },
  { id: 'lc-2', name: 'Eleanor Vance', code: 'EMP-002', branch: 'Headquarters — Mumbai', time: '09:05 AM', lat: 19.0664, lng: 72.8680, distance: '12m from center', accuracy: '±4m', status: 'verified' },
  { id: 'lc-3', name: 'Marcus Brody', code: 'EMP-003', branch: 'Headquarters — Mumbai', time: '08:45 AM', lat: 19.0658, lng: 72.8685, distance: '80m from center', accuracy: '±8m', status: 'verified' },
  { id: 'lc-4', name: 'Sophia Sterling', code: 'EMP-004', branch: 'Headquarters — Mumbai', time: '09:22 AM', lat: 19.0670, lng: 72.8690, distance: '110m from center', accuracy: '±10m', status: 'verified' },
  { id: 'lc-5', name: 'Rohan Sharma', code: 'EMP-005', branch: 'Tech Hub — Bengaluru', time: '09:00 AM', lat: 12.9261, lng: 77.6843, distance: 'WFH Verified', accuracy: '±12m', status: 'verified' },
];

export const LiveMapPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1">
              <Radio size={12} className="animate-pulse" /> Live GPS Stream
            </span>
            <span className="text-xs text-slate-400">Real-Time Geofencing</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
            <Navigation size={24} className="text-emerald-600" /> GPS Geofence & Check-In Log Stream
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Real-time mobile GPS check-in verification feed & distance calculations</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Visualizer Mock */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin size={18} className="text-blue-600" /> Active Geofence Radar View
            </h3>
            <span className="text-xs text-slate-400 font-semibold">Updated 5s ago</span>
          </div>

          <div className="h-80 bg-slate-900 rounded-xl relative overflow-hidden border border-slate-800 flex items-center justify-center p-6 text-center">
            {/* Soft Radar Rings */}
            <div className="absolute w-72 h-72 rounded-full border border-emerald-500/20 animate-ping" />
            <div className="absolute w-48 h-48 rounded-full border border-blue-500/30" />
            <div className="absolute w-24 h-24 rounded-full border border-blue-500/50 bg-blue-500/10" />

            <div className="relative z-10 space-y-2">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-blue-500/40">
                <Navigation size={24} className="animate-bounce" />
              </div>
              <h4 className="text-white font-bold text-sm">GPS Geofence Radar Operational</h4>
              <p className="text-slate-400 text-xs max-w-sm">
                4 Branches Active • Geofence Radius: 200m • GPS Accuracy Threshold: ±15m
              </p>
            </div>
          </div>
        </div>

        {/* Live Stream List */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-600" /> Today's Check-In Feed
          </h3>

          <div className="space-y-3">
            {MOCK_LIVE_FEED.map(f => (
              <div key={f.id} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                <div className="flex items-center justify-between font-bold text-xs text-slate-900">
                  <span>{f.name}</span>
                  <span className="text-[10px] font-mono text-emerald-600 font-semibold">{f.time}</span>
                </div>
                <div className="text-[11px] text-slate-500">{f.branch}</div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold pt-1 border-t border-slate-100">
                  <span>{f.distance}</span>
                  <span className="text-slate-500">Acc: {f.accuracy}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMapPage;
