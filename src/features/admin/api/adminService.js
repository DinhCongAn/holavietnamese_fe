import axiosClient from '@/shared/api/axiosClient';

const resultOf = (response) => response?.result ?? response;
const listOf = (value) => Array.isArray(value) ? value : (value?.content ?? value);
const crud = (path) => ({
  async list(params) { return resultOf(await axiosClient.get(path, { params })); },
  create(data) { return axiosClient.post(path, data); },
  update(id, data) { return axiosClient.put(`${path}/${id}`, data); },
  remove(id) { return axiosClient.delete(`${path}/${id}`); },
});
const achievements = crud('/api/admin/achievements');
const roles = crud('/api/admin/roles');
const settings = crud('/api/admin/settings');
const xpRules = crud('/api/admin/xp-rules');

export const adminService = {
  async getDashboardStats() { return resultOf(await axiosClient.get('/api/admin/dashboard/stats')); },
  async getUsers(params = {}) { return resultOf(await axiosClient.get('/api/admin/users', { params })); },
  async getUserById(id) { return resultOf(await axiosClient.get(`/api/admin/users/${id}`)); },
  updateUserStatus(id, status) { return axiosClient.patch(`/api/admin/users/${id}/status`, null, { params: { status } }); },
  updateUserRole(id, role) { return axiosClient.put(`/api/admin/users/${id}/role`, { role }); },
  async getAchievements() { return listOf(await achievements.list()); },
  createAchievement(data) { return achievements.create(data); },
  updateAchievement(id, data) { return achievements.update(id, data); },
  deleteAchievement(id) { return achievements.remove(id); },
  async getAuditLogs(params = {}) { return listOf(resultOf(await axiosClient.get('/api/admin/audit-logs', { params }))); },
  async getRoles() { return listOf(await roles.list()); },
  createRole(data) { return roles.create(data); },
  updateRole(id, data) { return roles.update(id, data); },
  deleteRole(id) { return roles.remove(id); },
  async getSystemSettings() { return settings.list(); },
  updateSystemSettings(data) { return axiosClient.put('/api/admin/settings', data); },
  deleteSystemSetting(id) { return settings.remove(id); },
  async getXpRules() { return listOf(await xpRules.list()); },
  createXpRule(data) { return xpRules.create(data); },
  updateXpRule(id, data) { return xpRules.update(id, data); },
  deleteXpRule(id) { return xpRules.remove(id); },
};
