import axiosClient from '@/shared/api/axiosClient';

const unwrapResult = (response) => response?.result ?? response;

export const notificationService = {
  async getPage({ page = 1, size = 10, isRead } = {}) {
    const params = { page, size };
    if (typeof isRead === 'boolean') params.isRead = isRead;
    return unwrapResult(await axiosClient.get('/api/notifications', { params }));
  },
  async getAll() {
    return unwrapResult(await axiosClient.get('/api/notifications/all'));
  },
  async getUnreadCount() {
    const result = unwrapResult(await axiosClient.get('/api/notifications/unread-count'));
    if (typeof result === 'number') return result;
    return Number(result?.unreadCount ?? result?.count ?? 0);
  },
  markAsRead(id) {
    return axiosClient.put(`/api/notifications/${encodeURIComponent(id)}/read`);
  },
  markAllAsRead() {
    return axiosClient.put('/api/notifications/read-all');
  },
  delete(id) {
    return axiosClient.delete(`/api/notifications/${encodeURIComponent(id)}`);
  },
};

export default notificationService;
