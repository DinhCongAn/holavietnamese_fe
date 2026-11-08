import axiosClient from '@/shared/api/axiosClient';

const resultOf = response => {
  if (response?.success === false || (typeof response?.code === 'number' && response.code !== 1000)) {
    const error = new Error(response.message || 'Không thể tải dữ liệu điểm đến.');
    error.code = response.code;
    throw error;
  }
  return response?.result ?? response;
};
const paramsOf = (filters, keys) => Object.fromEntries(keys
  .filter(key => filters[key] !== '' && filters[key] != null)
  .map(key => [key, filters[key]]));

export const destinationService = {
  async list(filters = {}, options = {}) {
    return resultOf(await axiosClient.get('/api/destinations', {
      ...options, params: paramsOf(filters, ['keyword', 'region']),
    }));
  },
  async get(id, options = {}) {
    return resultOf(await axiosClient.get(`/api/destinations/${encodeURIComponent(id)}`, options));
  },
  async getBySlug(slug, options = {}) {
    // Legacy Explore links used slugs. Resolve only published backend data, then load by ID.
    const items = await destinationService.list({}, options);
    const key = value => String(value).toLowerCase().replace(/[\s_-]/g, '');
    const published = items.filter(item => item.status === 'PUBLISHED');
    const exact = published.find(item => item.slug === slug);
    const matches = exact ? [exact] : published.filter(item => key(item.slug) === key(slug));
    if (matches.length !== 1) {
      const error = new Error('Không tìm thấy điểm đến.');
      error.status = 404;
      throw error;
    }
    return destinationService.get(matches[0].id, options);
  },
};

export const adminDestinationService = {
  async list(filters = {}, options = {}) {
    return resultOf(await axiosClient.get('/api/admin/destinations', {
      ...options, params: paramsOf(filters, ['keyword', 'status', 'region', 'page', 'size']),
    }));
  },
  async get(id, options = {}) {
    return resultOf(await axiosClient.get(`/api/admin/destinations/${encodeURIComponent(id)}`, options));
  },
  async create(payload, options = {}) {
    return resultOf(await axiosClient.post('/api/admin/destinations', payload, options));
  },
  async update(id, payload, options = {}) {
    return resultOf(await axiosClient.put(`/api/admin/destinations/${encodeURIComponent(id)}`, payload, options));
  },
  async updateManagement(id, destination, exploreContent, options = {}) {
    return resultOf(await axiosClient.put(`/api/admin/destinations/${encodeURIComponent(id)}/management`, { destination, exploreContent }, options));
  },
  async submitReview(id, options = {}) {
    return resultOf(await axiosClient.post(`/api/admin/destinations/${encodeURIComponent(id)}/submit-review`, null, options));
  },
  async review(id, decision, options = {}) {
    return resultOf(await axiosClient.post(`/api/admin/destinations/${encodeURIComponent(id)}/review`, { decision }, options));
  },
  async archive(id, options = {}) {
    return resultOf(await axiosClient.post(`/api/admin/destinations/${encodeURIComponent(id)}/archive`, null, options));
  },
  async restore(id, options = {}) {
    return resultOf(await axiosClient.post(`/api/admin/destinations/${encodeURIComponent(id)}/restore`, null, options));
  },
  async revise(id, options = {}) {
    return resultOf(await axiosClient.post(`/api/admin/destinations/${encodeURIComponent(id)}/revise`, null, options));
  },
};
