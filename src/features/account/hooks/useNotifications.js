import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/context/AuthContext';
import { notificationService } from '@/features/account/api/notificationService';
import { useNotificationStream } from '@/features/account/hooks/useNotificationStream';
import { normalizeNotification, unwrapSseNotification } from '@/constants/notifications';

const NotificationContext = createContext(null);
const EMPTY_PAGE = { content: [], page: 1, size: 10, totalElements: 0, totalPages: 0 };

function normalizePage(result, fallback) {
  const content = (Array.isArray(result) ? result : result?.content || []).map(normalizeNotification).filter(Boolean);
  return {
    content,
    page: Number(result?.page ?? fallback.page),
    size: Number(result?.size ?? fallback.size),
    totalElements: Number(result?.totalElements ?? content.length),
    totalPages: Number(result?.totalPages ?? (content.length ? 1 : 0)),
  };
}

const updateItem = (list, id, changes) => list.map((item) =>
  String(item.id) === String(id) ? { ...item, ...changes } : item);

export function NotificationProvider({ children }) {
  const { accessToken, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [recent, setRecent] = useState([]);
  const [pageData, setPageData] = useState(EMPTY_PAGE);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState({ page: 1, size: 10, isRead: undefined });
  const seenIdsRef = useRef(new Set());
  const readEventIdsRef = useRef(new Set());

  const loadRecent = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const [result, count] = await Promise.all([
        notificationService.getPage({ page: 1, size: 10 }),
        notificationService.getUnreadCount(),
      ]);
      const items = normalizePage(result, { page: 1, size: 10 }).content;
      items.forEach((item) => seenIdsRef.current.add(String(item.id)));
      setRecent(items);
      setUnreadCount(count);
      setError('');
    } catch (requestError) {
      setError(requestError.message || 'Không thể tải thông báo.');
    }
  }, [isAuthenticated]);

  const loadPage = useCallback(async (nextQuery = { page: 1, size: 10 }, { silent = false } = {}) => {
    if (!isAuthenticated) return;
    const source = nextQuery;
    const normalizedQuery = {
      page: Math.max(1, Number(source.page) || 1),
      size: Math.max(1, Number(source.size) || 10),
      isRead: typeof source.isRead === 'boolean' ? source.isRead : undefined,
    };
    setQuery(normalizedQuery);
    if (!silent) setLoading(true);
    try {
      const result = await notificationService.getPage(normalizedQuery);
      setPageData(normalizePage(result, normalizedQuery));
      setError('');
    } catch (requestError) {
      setError(requestError.message || 'Không thể tải thông báo.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && accessToken) loadRecent();
    else {
      setRecent([]);
      setPageData(EMPTY_PAGE);
      setUnreadCount(0);
      seenIdsRef.current.clear();
      readEventIdsRef.current.clear();
    }
  }, [isAuthenticated, accessToken, loadRecent]);

  const handleNew = useCallback((payload) => {
    const item = unwrapSseNotification(payload);
    if (!item) return;
    const id = String(item.id);
    if (seenIdsRef.current.has(id)) return;
    seenIdsRef.current.add(id);
    readEventIdsRef.current.delete(id);
    setRecent((current) => [item, ...current].slice(0, 10));
    if (!item.isRead) setUnreadCount((count) => count + 1);
    setPageData((current) => {
      if (query.page !== 1 || (query.isRead === false && item.isRead)
        || current.content.some((entry) => String(entry.id) === String(item.id))) return current;
      return {
        ...current,
        content: [item, ...current.content].slice(0, query.size),
        totalElements: current.totalElements + 1,
        totalPages: Math.ceil((current.totalElements + 1) / query.size),
      };
    });
    toast(item.title, {
      description: item.message,
      action: item.linkUrl ? { label: 'Xem ngay', onClick: () => navigate(item.linkUrl) } : undefined,
    });
  }, [navigate, query]);

  const handleReadEvent = useCallback((payload) => {
    const data = payload?.result ?? payload;
    const id = data?.notificationId ?? data?.id ?? data;
    if (id == null) return;
    const eventKey = String(id);
    if (readEventIdsRef.current.has(eventKey)) return;
    readEventIdsRef.current.add(eventKey);
    setRecent((items) => updateItem(items, id, { isRead: true, read: true }));
    setPageData((current) => query.isRead === false
      ? { ...current, content: current.content.filter((item) => String(item.id) !== eventKey), totalElements: Math.max(0, current.totalElements - 1) }
      : { ...current, content: updateItem(current.content, id, { isRead: true, read: true }) });
    setUnreadCount((count) => Math.max(0, count - 1));
  }, [query.isRead]);

  const handleReadAllEvent = useCallback(() => {
    setRecent((items) => items.map((item) => ({ ...item, isRead: true, read: true })));
    setPageData((current) => query.isRead === false
      ? { ...current, content: [], totalElements: 0, totalPages: 0 }
      : { ...current, content: current.content.map((item) => ({ ...item, isRead: true, read: true })) });
    setUnreadCount(0);
  }, [query.isRead]);

  const handleDeleteEvent = useCallback((payload) => {
    const data = payload?.result ?? payload;
    const id = data?.notificationId ?? data?.id ?? data;
    if (id == null) return;
    setRecent((items) => items.filter((item) => String(item.id) !== String(id)));
    setPageData((current) => ({ ...current, content: current.content.filter((item) => String(item.id) !== String(id)) }));
    notificationService.getUnreadCount().then(setUnreadCount).catch(() => {});
  }, []);

  useNotificationStream({ token: isAuthenticated ? accessToken : null, onNotification: handleNew,
    onRead: handleReadEvent, onReadAll: handleReadAllEvent, onDelete: handleDeleteEvent });

  const markAsRead = useCallback(async (id) => {
    const target = [...recent, ...pageData.content].find((item) => String(item.id) === String(id));
    if (!target || target.isRead) return;
    setBusy(true);
    try {
      await notificationService.markAsRead(id);
      handleReadEvent({ id });
      if (query.isRead === false) await loadPage(query, { silent: true });
    } catch (requestError) {
      toast.error(requestError.message || 'Không thể đánh dấu đã đọc.');
    } finally { setBusy(false); }
  }, [recent, pageData.content, handleReadEvent, loadPage, query]);

  const markAllAsRead = useCallback(async () => {
    if (!unreadCount) return;
    setBusy(true);
    try {
      await notificationService.markAllAsRead();
      handleReadAllEvent();
      toast.success('Đã đánh dấu tất cả thông báo là đã đọc.');
    } catch (requestError) {
      toast.error(requestError.message || 'Không thể đánh dấu tất cả đã đọc.');
    } finally { setBusy(false); }
  }, [unreadCount, handleReadAllEvent]);

  const deleteNotification = useCallback(async (id) => {
    const target = [...recent, ...pageData.content].find((item) => String(item.id) === String(id));
    setBusy(true);
    try {
      await notificationService.delete(id);
      handleDeleteEvent({ id });
      if (target && !target.isRead) setUnreadCount((count) => Math.max(0, count - 1));
      await loadPage(query, { silent: true });
      toast.success('Đã xóa thông báo.');
    } catch (requestError) {
      toast.error(requestError.message || 'Không thể xóa thông báo.');
    } finally { setBusy(false); }
  }, [recent, pageData.content, handleDeleteEvent, loadPage, query]);

  const value = useMemo(() => ({ notifications: recent, pageData, unreadCount, loading, busy, error, query,
    reload: loadRecent, loadPage, markAsRead, markAllAsRead, deleteNotification }),
  [recent, pageData, unreadCount, loading, busy, error, query, loadRecent, loadPage, markAsRead, markAllAsRead, deleteNotification]);
  return createElement(NotificationContext.Provider, { value }, children);
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
}

export default useNotifications;
