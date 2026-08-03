// src/lib/analytics.ts
// Website analytics tracker — works with React SPA routing

import { supabase } from './supabase';

let sessionId = sessionStorage.getItem('vm_session_id') || crypto.randomUUID();
sessionStorage.setItem('vm_session_id', sessionId);

let pageStartTime = Date.now();
let currentPath = '';

export async function trackPageView(path: string, title?: string) {
  if (path === currentPath) return;
  
  const now = Date.now();
  const duration = Math.round((now - pageStartTime) / 1000);

  // Record previous page duration
  if (currentPath && duration > 0) {
    await supabase.from('website_analytics').insert({
      session_id: sessionId,
      page_path: currentPath,
      event_type: 'pageview',
      duration_seconds: duration,
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
    }).then(() => {});
  }

  currentPath = path;
  pageStartTime = now;

  // Track new pageview
  await supabase.from('website_analytics').insert({
    session_id: sessionId,
    page_path: path,
    page_title: title || document.title,
    event_type: 'pageview',
    user_agent: navigator.userAgent,
    referrer: document.referrer || null,
    device_type: getDeviceType(),
    browser: getBrowser(),
  }).then(() => {});
}

export async function trackEvent(
  eventType: 'click' | 'form_submit' | 'error',
  pagePath: string,
  metadata?: Record<string, unknown>
) {
  await supabase.from('website_analytics').insert({
    session_id: sessionId,
    page_path: pagePath,
    event_type: eventType,
    user_agent: navigator.userAgent,
    metadata: metadata || {},
  }).then(() => {});
}

function getDeviceType(): string {
  const ua = navigator.userAgent;
  if (/Mobi|Android/i.test(ua)) return 'mobile';
  if (/Tablet|iPad/i.test(ua)) return 'tablet';
  return 'desktop';
}

function getBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  return 'Unknown';
}
