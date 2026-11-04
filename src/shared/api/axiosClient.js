import axios from 'axios';

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) || 'http://localhost:8080';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Public API endpoints that don't need a Bearer token
const PUBLIC_API_PREFIXES = [
  '/api/auth/token',
  '/api/auth/logout',
  '/api/auth/refresh',
  '/api/auth/google',
  '/api/auth/register',
  '/api/users/register',
  '/api/auth/verify-email',
  '/api/auth/forgot-password',
  '/api/culture',
];

const isPublicApiRequest = (url = '') => PUBLIC_API_PREFIXES.some((prefix) => url.startsWith(prefix));

// REQUEST interceptor: auto-attach Bearer token
axiosClient.interceptors.request.use(
  (config) => {
    // Let the browser create the multipart boundary for file uploads.
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      if (typeof config.headers?.delete === 'function') config.headers.delete('Content-Type');
      else delete config.headers['Content-Type'];
    }
    const isPublic = isPublicApiRequest(config.url);
    if (!isPublic) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

const clearAuthStorage = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  ['userId', 'username', 'fullName', 'role', 'roles'].forEach((key) => localStorage.removeItem(key));
};

// RESPONSE interceptor: unwrap ApiResponse and centralize authentication failures
axiosClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    // Request cancellation is expected during navigation and React StrictMode
    // remounts. Preserve the original cancellation metadata so feature hooks
    // can ignore it instead of presenting "canceled" as an application error.
    if (
      axios.isCancel(error)
      || error?.code === 'ERR_CANCELED'
      || error?.name === 'CanceledError'
      || error?.name === 'AbortError'
    ) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const responseBody = error.response?.data;
    const originalRequest = error.config;
    const isPublic = PUBLIC_API_PREFIXES.some(prefix => originalRequest?.url?.startsWith(prefix));

    // Access tokens may expire while the user is studying. Try the existing
    // refresh endpoint once before forcing a logout. Without this, AI calls
    // immediately became 401 even though the session could be refreshed.
    if (status === 401 && !isPublic && !originalRequest?._retry) {
      const currentToken = localStorage.getItem('token');
      if (currentToken) {
        originalRequest._retry = true;
        try {
          const refreshResponse = await axiosClient.post('/api/auth/refresh', { token: currentToken });
          const refreshPayload = refreshResponse?.result ?? refreshResponse?.data ?? refreshResponse;
          const refreshedToken = refreshPayload?.token ?? refreshPayload?.accessToken;

          if (refreshedToken) {
            localStorage.setItem('token', refreshedToken);
            window.dispatchEvent(new CustomEvent('hola:auth-token-changed', { detail: { token: refreshedToken } }));
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${refreshedToken}`;
            return axiosClient(originalRequest);
          }
        } catch (refreshError) {
          console.warn('[Auth] Token refresh failed:', refreshError.message);
        }
      }
    }

    if (status === 401) {
      const path = window.location.pathname;
      clearAuthStorage();
      if (!isPublicApiRequest(error.config?.url) && path !== '/login') {
        const returnTo = `${path}${window.location.search}`;
        window.location.assign(`/login?from=${encodeURIComponent(returnTo)}`);
      }
    } else if (status === 403 && !isPublicApiRequest(error.config?.url) && window.location.pathname !== '/forbidden') {
      window.location.assign('/forbidden');
    }

    const normalizedError = new Error(responseBody?.message || error.message || 'Không thể kết nối đến máy chủ.');
    normalizedError.status = status;
    normalizedError.code = responseBody?.code;
    normalizedError.details = responseBody?.error ?? responseBody?.details ?? responseBody;
    normalizedError.result = responseBody?.result;
    return Promise.reject(normalizedError);
  },
);

export default axiosClient;
