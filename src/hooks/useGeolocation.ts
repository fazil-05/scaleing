// src/hooks/useGeolocation.ts
// Hook for managing browser GPS positioning

import { useState, useEffect, useCallback } from 'react';
import type { GPSLocation } from '@/types';

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watch?: boolean;
}

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const [location, setLocation] = useState<GPSLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const {
    enableHighAccuracy = true,
    timeout = 15000,
    maximumAge = 0,
    watch = false,
  } = options;

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          timestamp: position.timestamp,
        });
        setLoading(false);
      },
      (err) => {
        let msg = 'Failed to get location.';
        switch (err.code) {
          case err.PERMISSION_DENIED:
            msg = 'Location permission denied. Please allow GPS access in browser settings.';
            break;
          case err.POSITION_UNAVAILABLE:
            msg = 'Location information unavailable.';
            break;
          case err.TIMEOUT:
            msg = 'Location request timed out.';
            break;
        }
        setError(msg);
        setLoading(false);
      },
      { enableHighAccuracy, timeout, maximumAge }
    );
  }, [enableHighAccuracy, timeout, maximumAge]);

  useEffect(() => {
    getLocation();

    if (watch && navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            timestamp: position.timestamp,
          });
        },
        (err) => setError(err.message),
        { enableHighAccuracy, timeout, maximumAge }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [getLocation, watch, enableHighAccuracy, timeout, maximumAge]);

  return { location, error, loading, refreshLocation: getLocation };
}

// Distance calculation using Haversine formula (returns meters)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}
