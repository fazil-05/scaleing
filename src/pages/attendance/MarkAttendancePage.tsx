// src/pages/attendance/MarkAttendancePage.tsx
// Production GPS Attendance Check-In / Check-Out Page

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGeolocation, calculateDistance } from '@/hooks/useGeolocation';
import { supabase } from '@/lib/supabase';
import type { Branch, Attendance } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Clock, MapPin, CheckCircle, AlertTriangle, ShieldCheck, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

export const MarkAttendancePage: React.FC = () => {
  const { user } = useAuth();
  const { location, error: geoError, loading: geoLoading, refreshLocation } = useGeolocation();

  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isInsideGeofence, setIsInsideGeofence] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const todayStr = new Date().toISOString().split('T')[0];

  // Clock ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch today's attendance record and branch geofence
  useEffect(() => {
    if (!user?.id) return;

    const loadData = async () => {
      // Load branch geofence info
      if (user.branch_id) {
        const { data: branchData } = await supabase
          .from('branches')
          .select('*')
          .eq('id', user.branch_id)
          .single();
        if (branchData) setBranch(branchData as Branch);
      }

      // Load today's attendance
      const { data: att } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', user.id)
        .eq('date', todayStr)
        .maybeSingle();

      if (att) setTodayAttendance(att as Attendance);
    };

    loadData();
  }, [user?.id, user?.branch_id, todayStr]);

  // Compute geofence distance
  useEffect(() => {
    if (location && branch?.latitude && branch?.longitude) {
      const dist = calculateDistance(
        location.latitude,
        location.longitude,
        Number(branch.latitude),
        Number(branch.longitude)
      );
      setDistance(dist);
      setIsInsideGeofence(dist <= (branch.radius || 200));
    }
  }, [location, branch]);

  const handleCheckIn = async () => {
    if (!user?.id || !location) {
      toast.error('Location unavailable');
      return;
    }

    if (todayAttendance?.check_in) {
      toast.error('You have already checked in today.');
      return;
    }

    setSubmitting(true);
    try {
      const now = new Date().toISOString();
      const status = location.timestamp ? 'present' : 'present';

      const { data, error } = await supabase.from('attendance').insert({
        employee_id: user.id,
        company_id: user.company_id,
        branch_id: user.branch_id,
        date: todayStr,
        check_in: now,
        check_in_latitude: location.latitude,
        check_in_longitude: location.longitude,
        check_in_accuracy: location.accuracy,
        check_in_distance: distance,
        status,
        device: navigator.userAgent,
        ip_address: 'Logged',
      }).select().single();

      if (error) throw error;

      setTodayAttendance(data as Attendance);
      toast.success('Check-in recorded successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Check-in failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckOut = async () => {
    if (!user?.id || !todayAttendance?.id || !location) {
      toast.error('Cannot check out before check in.');
      return;
    }

    if (todayAttendance.check_out) {
      toast.error('You have already checked out today.');
      return;
    }

    setSubmitting(true);
    try {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('attendance')
        .update({
          check_out: now,
          check_out_latitude: location.latitude,
          check_out_longitude: location.longitude,
          check_out_accuracy: location.accuracy,
          check_out_distance: distance,
        })
        .eq('id', todayAttendance.id)
        .select()
        .single();

      if (error) throw error;

      setTodayAttendance(data as Attendance);
      toast.success('Check-out recorded successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Check-out failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-extrabold text-slate-900 flex items-center justify-center gap-2">
          <Clock size={26} className="text-blue-600" /> GPS Attendance Portal
        </h2>
        <p className="text-sm text-slate-500">Verifying location accuracy against office geofence</p>
      </div>

      {/* Clock Display */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-2 shadow-sm">
        <p className="text-5xl font-extrabold font-mono text-blue-600 tracking-wider">
          {currentTime.toLocaleTimeString()}
        </p>
        <p className="text-sm font-semibold text-slate-500">
          {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Location Geofence Status */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <MapPin size={18} className="text-blue-600" /> Geofence Verification
          </h3>
          <button onClick={refreshLocation} className="text-xs text-blue-600 hover:underline font-semibold">
            Refresh GPS
          </button>
        </div>

        {geoLoading ? (
          <p className="text-sm text-slate-500">Acquiring high-accuracy GPS fix...</p>
        ) : geoError ? (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
            <AlertTriangle size={16} /> {geoError}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <p className="text-[10px] text-slate-500 font-semibold uppercase">Latitude</p>
              <p className="text-xs font-bold font-mono text-slate-800">{location?.latitude.toFixed(5)}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <p className="text-[10px] text-slate-500 font-semibold uppercase">Longitude</p>
              <p className="text-xs font-bold font-mono text-slate-800">{location?.longitude.toFixed(5)}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-center">
              <p className="text-[10px] text-blue-600 font-semibold uppercase">Distance to Office</p>
              <p className="text-xs font-bold font-mono text-blue-700">{distance ? `${distance}m` : 'N/A'}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <p className="text-[10px] text-slate-500 font-semibold uppercase">Geofence Status</p>
              <span className={`text-xs font-bold ${isInsideGeofence ? 'text-emerald-600' : 'text-amber-600'}`}>
                {isInsideGeofence ? '✓ Inside (Valid)' : '⚠ Outside'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons & Attendance Status */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-6 shadow-sm">
        {todayAttendance ? (
          <div className="space-y-5">
            <div className="flex items-center justify-center gap-2">
              <StatusBadge status={todayAttendance.status} size="md" />
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <p className="text-[10px] text-emerald-700 font-bold uppercase">Check-In Time</p>
                <p className="text-lg font-bold text-slate-900 mt-1">
                  {todayAttendance.check_in ? new Date(todayAttendance.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Not Checked In'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <p className="text-[10px] text-blue-700 font-bold uppercase">Check-Out Time</p>
                <p className="text-lg font-bold text-slate-900 mt-1">
                  {todayAttendance.check_out ? new Date(todayAttendance.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending'}
                </p>
              </div>
            </div>

            {todayAttendance.check_in && !todayAttendance.check_out && (
              <button
                onClick={handleCheckOut}
                disabled={submitting || !location}
                className="btn btn-danger btn-lg w-full max-w-sm"
              >
                <Clock size={18} /> {submitting ? 'Recording Check-Out...' : 'Check-Out Now'}
              </button>
            )}

            {todayAttendance.check_in && todayAttendance.check_out && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold">
                ✓ You have completed your attendance for today.
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            <p className="text-sm text-slate-500">Ready for daily check-in verification</p>
            <button
              onClick={handleCheckIn}
              disabled={submitting || !location}
              className="btn btn-primary btn-lg w-full max-w-sm"
            >
              <CheckCircle size={18} /> {submitting ? 'Recording Check-In...' : 'Check-In Now'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
