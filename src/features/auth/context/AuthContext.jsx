import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authApi from '@/shared/api/authApi';
import { markHasAccount } from '@/utils/userState';
import { getRegistrationVerificationState } from '@/features/auth/emailVerificationFlow';

const AuthContext = createContext(null);

const normalizeRole = (role, fallback = '') => {
  const value = typeof role === 'string' ? role : (role?.name || role?.authority);
  return value ? value.replace(/^ROLE_/, '') : fallback;
};

const normalizePermissions = (permissions) => {
  const list = Array.isArray(permissions) ? permissions : permissions ? [permissions] : [];
  return list.map((permission) => typeof permission === 'string' ? permission : (permission.name || permission.authority)).filter(Boolean);
};

const normalizeUser = (userInfo) => ({
  ...userInfo,
  role: normalizeRole(userInfo?.role),
  permissions: normalizePermissions(userInfo?.permissions),
});

const persistUser = (userInfo) => {
  const normalizedUser = normalizeUser(userInfo);
  localStorage.setItem('user', JSON.stringify(normalizedUser));
  localStorage.removeItem('roles');
  ['userId', 'username', 'fullName', 'role', 'permissions'].forEach((key) => {
    if (normalizedUser[key] !== undefined) localStorage.setItem(key, key === 'permissions' ? JSON.stringify(normalizedUser[key]) : String(normalizedUser[key]));
  });
};

const loadPersistedUser = () => {
  const saved = localStorage.getItem('user');
  if (!saved) return null;
  try {
    const normalizedUser = normalizeUser(JSON.parse(saved));
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    localStorage.removeItem('roles');
    return normalizedUser;
  } catch {
    localStorage.removeItem('user');
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));
  const [user, setUser] = useState(loadPersistedUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncToken = (event) => {
      const nextToken = event?.detail?.token ?? localStorage.getItem('token');
      setAccessToken(nextToken || null);
      setIsAuthenticated(Boolean(nextToken));
    };
    const syncStorageToken = (event) => {
      if (event.key === 'token') syncToken();
    };
    window.addEventListener('hola:auth-token-changed', syncToken);
    window.addEventListener('storage', syncStorageToken);
    return () => {
      window.removeEventListener('hola:auth-token-changed', syncToken);
      window.removeEventListener('storage', syncStorageToken);
    };
  }, []);

  // Fetch user profile when authenticated
  const fetchProfile = useCallback(async () => {
    if (!localStorage.getItem('token')) {
      setUser(null);
      setLoading(false);
      return null;
    }
    try {
      setLoading(true);
      const data = await authApi.getProfile();
      if (data && data.code === 1000) {
        const profile = data.result;
        setUser(prev => {
          const merged = normalizeUser({ ...prev, ...profile });
          persistUser(merged);
          return merged;
        });
        return data.result;
      }
      return null;
    } catch (error) {
      console.error('Failed to load profile:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCurrentUser = useCallback((changes) => {
    setUser((previous) => {
      const merged = { ...previous, ...changes };
      persistUser(merged);
      return merged;
    });
  }, []);

  // On mount: if token exists, load profile
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, fetchProfile]);

  // LOGIN: call API, store token + user info with one role
  const login = async (username, password) => {
    try {
      const data = await authApi.login(username, password);

      if (data && data.code === 1000 && data.result?.token) {
        const { token, userId, username: uname, fullName, role, permissions, onboardingCompleted } = data.result;

        localStorage.setItem('token', token);
        window.dispatchEvent(new CustomEvent('hola:auth-token-changed', { detail: { token } }));
        markHasAccount();

        const userInfo = {
          userId,
          username: uname,
          fullName: fullName || uname,
          role: normalizeRole(role),
          permissions: normalizePermissions(permissions),
          onboardingCompleted: onboardingCompleted === true,
        };
        persistUser(userInfo);
        setUser(userInfo);

        const profile = await fetchProfile();
        setAccessToken(token);
        setIsAuthenticated(true);
        return { success: true, user: { ...userInfo, ...profile } };
      }
      return { success: false, message: data?.message || 'Invalid credentials' };
    } catch (error) {
      return {
        success: false,
        status: error?.status,
        code: error?.code,
        data: error?.result,
        message: error?.message || 'Login failed. Please try again.',
      };
    }
  };

  // REGISTER: create an unverified account. Authentication only happens after
  // email verification and a separate login request.
  const register = async (payload) => {
    try {
      const data = await authApi.register(payload);
      const registration = getRegistrationVerificationState(data, import.meta.env.DEV);
      if (registration.success) {
        markHasAccount();
        return {
          success: true,
          data: data.result,
          email: registration.email,
          developmentOtp: registration.developmentOtp,
          message: registration.message,
        };
      }
      return {
        success: false,
        code: data?.code,
        message: data?.message || 'Đăng ký không thành công.',
      };
    } catch (error) {
      const errData = error;
      return {
        success: false,
        code: errData?.code,
        message: errData?.message || error?.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại.',
      };
    }
  };

  // LOGIN WITH GOOGLE: send Google credential to BE
  const loginWithGoogle = async (credential) => {
    try {
      const data = await authApi.loginWithGoogle(credential);

      if (data && data.code === 1000 && data.result?.token) {
        const { token, userId, username: uname, fullName, role, permissions, onboardingCompleted } = data.result;

        localStorage.setItem('token', token);
        window.dispatchEvent(new CustomEvent('hola:auth-token-changed', { detail: { token } }));
        markHasAccount();

        const userInfo = {
          userId,
          username: uname,
          fullName: fullName || uname,
          role: normalizeRole(role),
          permissions: normalizePermissions(permissions),
          onboardingCompleted: onboardingCompleted === true,
        };
        persistUser(userInfo);
        setUser(userInfo);

        const profile = await fetchProfile();
        setAccessToken(token);
        setIsAuthenticated(true);
        return { success: true, user: { ...userInfo, ...profile } };
      }
      return { success: false, message: data?.message || 'Google login failed' };
    } catch (error) {
      return { success: false, message: error?.message || 'Google login failed. Please try again.' };
    }
  };

  // LOGOUT: call API, clear everything
  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await authApi.logout(token);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      window.dispatchEvent(new CustomEvent('hola:auth-token-changed', { detail: { token: null } }));
      localStorage.removeItem('user');
      ['userId', 'username', 'fullName', 'role', 'roles', 'permissions'].forEach((key) => localStorage.removeItem(key));
      setAccessToken(null);
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const hasRole = (role) => {
    if (!user?.role) return false;
    return normalizeRole(user.role, '') === normalizeRole(role, '');
  };

  const hasPermission = (permission) => Boolean(user?.permissions?.includes(permission));

  const isAdmin = hasRole('ADMIN');
  const isContentManager = hasRole('CONTENT');
  const isLearner = hasRole('LEARNER');

  const contextValue = {
    accessToken,
    isAuthenticated,
    user,
    loading,
    login,
    loginWithGoogle,
    register,
    logout,
    hasRole,
    hasPermission,
    isAdmin,
    isContentManager,
    isLearner,
    fetchProfile,
    updateCurrentUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
