const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

let authTokenGetter = null;

/**
 * Configure global token retriever (hooked from Clerk useAuth())
 */
export function setAuthTokenGetter(getter) {
  authTokenGetter = getter;
}

/**
 * Standard fetch wrapper with automatic Clerk Token integration & error handling
 */
export async function apiRequest(endpoint, { method = 'GET', data, token, headers = {} } = {}) {
  const url = `${API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

  const requestHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Determine active auth token (explicit > registered getter > cached session)
  let activeToken = token;
  if (!activeToken && typeof authTokenGetter === 'function') {
    try {
      activeToken = await authTokenGetter();
    } catch {
      // Fallback
    }
  }

  if (!activeToken && typeof window !== 'undefined') {
    activeToken = sessionStorage.getItem('tnx_clerk_token') || localStorage.getItem('tnx_clerk_token');
  }

  if (activeToken) {
    requestHeaders['Authorization'] = `Bearer ${activeToken}`;
  }

  // Allow dev mock user email in development
  if (typeof window !== 'undefined') {
    const devEmail = localStorage.getItem('dev_user_email');
    if (devEmail && !activeToken) {
      requestHeaders['x-dev-user-email'] = devEmail;
    }
  }

  const config = {
    method,
    headers: requestHeaders,
  };

  if (data) {
    if (data instanceof FormData) {
      delete requestHeaders['Content-Type']; // Let browser set multipart boundary
      config.body = data;
    } else {
      config.body = JSON.stringify(data);
    }
  }

  try {
    const response = await fetch(url, config);
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(result.message || result.error || `HTTP error! status: ${response.status}`);
      error.status = response.status;
      error.code = result.error;
      error.details = result.details;
      throw error;
    }

    return result;
  } catch (err) {
    console.error(`API Error [${method} ${endpoint}]:`, err);
    throw err;
  }
}

export const api = {
  getHealth: () => apiRequest('/health'),
  getEventInfo: () => apiRequest('/event-info'),
  getPublicTeams: () => apiRequest('/teams/public'),
  getMe: (token) => apiRequest('/users/me', { token }),
  getMyTeam: (token) => apiRequest('/teams/me', { token }),
  updateMyName: (name, token) => apiRequest('/users/me', { method: 'PATCH', data: { name }, token }),
  updateTeamName: (teamName, token) => apiRequest('/teams/me', { method: 'PATCH', data: { teamName }, token }),
  uploadTeamPPT: (formData, token) => apiRequest('/teams/me/ppt', { method: 'POST', data: formData, token }),
};
