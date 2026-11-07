import axiosClient from '@/shared/api/axiosClient';

const resultOf = (response) => response?.result ?? response;
const paramsOf = filters => Object.fromEntries(['keyword', 'status', 'partOfSpeech', 'page', 'size']
  .filter(key => filters[key] !== '' && filters[key] != null).map(key => [key, filters[key]]));

export const adminVocabularyService = {
  async search(filters = {}, options = {}) {
    return resultOf(await axiosClient.get('/api/admin/vocabulary/search', { ...options, params: paramsOf(filters) }));
  },
  async list(filters = {}, options = {}) {
    return resultOf(
      await axiosClient.get('/api/admin/vocabulary', {
        ...options,
        params: paramsOf(filters),
      })
    );
  },

  async get(id, options = {}) {
    return resultOf(
      await axiosClient.get(`/api/admin/vocabulary/${id}`, {
        ...options,
      })
    );
  },

  async create(data, options = {}) {
    return resultOf(
      await axiosClient.post('/api/admin/vocabulary', data, {
        ...options,
      })
    );
  },

  async update(id, data, options = {}) {
    return resultOf(
      await axiosClient.put(`/api/admin/vocabulary/${id}`, data, {
        ...options,
      })
    );
  },

  async submitReview(id, options = {}) {
    return resultOf(await axiosClient.post(`/api/admin/vocabulary/${id}/submit-review`, null, options));
  },

  async review(id, decision, options = {}) {
    return resultOf(await axiosClient.post(`/api/admin/vocabulary/${id}/review`, { decision }, options));
  },
  async approveAllPending(options = {}) {
    return resultOf(await axiosClient.post('/api/admin/vocabulary/review/approve-all', null, options));
  },
  async archive(id, options = {}) {
    return resultOf(await axiosClient.post(`/api/admin/vocabulary/${id}/archive`, null, options));
  },
  async restore(id, options = {}) {
    return resultOf(await axiosClient.post(`/api/admin/vocabulary/${id}/restore`, null, options));
  },
  async revise(id, options = {}) {
    return resultOf(await axiosClient.post(`/api/admin/vocabulary/${id}/revise`, null, options));
  },

};
