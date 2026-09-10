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
    const contentType = response.headers.get('content-type') || '';

    if (!contentType.includes('application/json')) {
      const text = await response.text().catch(() => '');
      if (text.includes('<!DOCTYPE html>') || text.includes('<html') || !response.ok) {
        const error = new Error('Backend API unreachable or misconfigured (received HTML instead of JSON). Please check VITE_API_URL.');
        error.status = response.status === 200 ? 503 : response.status;
        error.code = 'BACKEND_UNREACHABLE';
        throw error;
      }
    }

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

/**
 * Open a team's presentation deck safely in a new tab
 * Resolves Cloudinary signed delivery URL to avoid 401 ACL/delivery restrictions
 */
export async function openTeamDeck(team) {
  if (!team) return;
  const teamIdentifier = team._id || team.id || team.regnId;
  if (!teamIdentifier) {
    alert('Invalid team identifier');
    return;
  }

  // Pre-open a blank tab synchronously to prevent browser popup blockers
  const newTab = window.open('about:blank', '_blank');
  try {
    const res = await apiRequest(`/teams/${teamIdentifier}/ppt?json=true`);
    const finalUrl = res?.url || team.ppt;
    if (finalUrl) {
      if (newTab) newTab.location.href = finalUrl;
      else window.open(finalUrl, '_blank');
    } else {
      if (newTab) newTab.close();
      alert('Presentation deck not found.');
    }
  } catch (err) {
    console.error('Failed to open presentation deck:', err);
    if (team.ppt && newTab) {
      newTab.location.href = team.ppt;
    } else {
      if (newTab) newTab.close();
      alert(err.message || 'Failed to open presentation deck.');
    }
  }
}

/**
 * Get direct backend route URL for presentation deck
 */
export function getTeamDeckDirectUrl(team) {
  const teamIdentifier = team?._id || team?.id || team?.regnId;
  const baseUrl = (API_BASE_URL || '/api').replace(/\/$/, '');
  return `${baseUrl}/teams/${teamIdentifier}/ppt`;
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
  addMyTeamMember: (data, token) => apiRequest('/teams/me/members', { method: 'POST', data, token }),
  updateMyTeamMember: (memberId, data, token) => apiRequest(`/teams/me/members/${memberId}`, { method: 'PATCH', data, token }),
  removeMyTeamMember: (memberId, token) => apiRequest(`/teams/me/members/${memberId}`, { method: 'DELETE', token }),
  addAdminTeamMember: (teamId, data, token) => apiRequest(`/admin/teams/${teamId}/members`, { method: 'POST', data, token }),
  updateAdminTeamMember: (teamId, memberId, data, token) => apiRequest(`/admin/teams/${teamId}/members/${memberId}`, { method: 'PATCH', data, token }),
  removeAdminTeamMember: (teamId, memberId, token) => apiRequest(`/admin/teams/${teamId}/members/${memberId}`, { method: 'DELETE', token }),
  openTeamDeck,
  getTeamDeckDirectUrl,
};
