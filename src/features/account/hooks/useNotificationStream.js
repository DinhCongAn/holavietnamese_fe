import { useEffect, useRef } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const INITIAL_RETRY_MS = 1000;
const MAX_RETRY_MS = 30000;

function tokenExpiresAt(token) {
  try {
    const raw = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const encoded = raw.padEnd(Math.ceil(raw.length / 4) * 4, '=');
    const payload = JSON.parse(atob(encoded));
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function useNotificationStream({ token, onNotification, onRead, onReadAll, onDelete }) {
  const callbacksRef = useRef({ onNotification, onRead, onReadAll, onDelete });
  useEffect(() => {
    callbacksRef.current = { onNotification, onRead, onReadAll, onDelete };
  }, [onNotification, onRead, onReadAll, onDelete]);

  useEffect(() => {
    if (!token || typeof EventSource === 'undefined') return undefined;
    let source;
    let retryTimer;
    let expiryTimer;
    let stopped = false;
    let retryDelay = INITIAL_RETRY_MS;
    const expiresAt = tokenExpiresAt(token);

    const close = () => {
      source?.close();
      source = undefined;
      window.clearTimeout(retryTimer);
      window.clearTimeout(expiryTimer);
    };
    const parse = (event, callback) => {
      try { callback?.(JSON.parse(event.data)); }
      catch (error) { console.warn('[Notifications] Invalid SSE payload', error); }
    };
    const connect = () => {
      if (stopped || (expiresAt && Date.now() >= expiresAt)) return close();
      source = new EventSource(`${API_BASE_URL}/api/notifications/stream?token=${encodeURIComponent(token)}`);
      source.onopen = () => { retryDelay = INITIAL_RETRY_MS; };
      source.onmessage = (event) => parse(event, callbacksRef.current.onNotification);
      source.addEventListener('notification', (event) => parse(event, callbacksRef.current.onNotification));
      source.addEventListener('notification.created', (event) => parse(event, callbacksRef.current.onNotification));
      source.addEventListener('notification.read', (event) => parse(event, callbacksRef.current.onRead));
      source.addEventListener('notification.read-all', (event) => parse(event, callbacksRef.current.onReadAll));
      source.addEventListener('notification.deleted', (event) => parse(event, callbacksRef.current.onDelete));
      source.onerror = () => {
        source?.close();
        source = undefined;
        if (stopped || (expiresAt && Date.now() >= expiresAt)) return;
        retryTimer = window.setTimeout(connect, retryDelay);
        retryDelay = Math.min(retryDelay * 2, MAX_RETRY_MS);
      };
    };
    if (expiresAt) expiryTimer = window.setTimeout(close, Math.max(0, expiresAt - Date.now()));
    connect();
    return () => { stopped = true; close(); };
  }, [token]);
}

export default useNotificationStream;
