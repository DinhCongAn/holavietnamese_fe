import axiosClient from '@/shared/api/axiosClient';

function resultOf(response) {
  if (response?.success === false || (response?.code != null && response.code !== 1000)) throw new Error(response.message || 'Không xử lý được import.');
  return response?.result ?? response;
}
const jobPath = id => {
  if (!/^[a-f0-9-]{36}$/i.test(String(id))) throw new Error('Mã import không hợp lệ.');
  return `/api/admin/imports/${encodeURIComponent(String(id))}`;
};
export const contentImportService = {
  async types(options = {}) { return resultOf(await axiosClient.get('/api/admin/imports/types', options)); },
  async preview(module, file, options = {}) {
    const format = 'xlsx';
    if (!file || !file.size || !file.name.toLowerCase().endsWith('.' + format)) throw new Error('Chọn file .' + format + ' không rỗng.');
    if (file.size > 10 * 1024 * 1024) throw new Error('File Excel tối đa 10 MiB.');
    const form = new FormData(); form.append('module', module); form.append('file', file);
    return resultOf(await axiosClient.post('/api/admin/imports/preview', form, options));
  },
  async updatePreview(id, rows) {
    if (!Array.isArray(rows) || rows.length === 0) throw new Error('Bản xem trước chưa có dòng dữ liệu để kiểm tra.');
    return resultOf(await axiosClient.put(`${jobPath(id)}/preview`, { rows }));
  },
  async confirm(id) { return resultOf(await axiosClient.post(`${jobPath(id)}/confirm`, {})); },
  async history(page = 0, options = {}) { return resultOf(await axiosClient.get('/api/admin/imports', { ...options, params: { page, size: 20 } })); },
  async get(id, options = {}) { return resultOf(await axiosClient.get(jobPath(id), options)); },
  async template(module) {
    const file = await axiosClient.get('/api/admin/imports/template', { params: { module }, responseType: 'blob' });
    if (!(file instanceof Blob)) throw new Error('Không tải được mẫu Excel.');
    return file;
  },
};
