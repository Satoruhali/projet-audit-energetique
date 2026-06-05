/* =============================================
   Planif'Audit — API Helpers
   ============================================= */

/* ---------- AUTH TOKENS ---------- */
function getToken() { return localStorage.getItem('planif_token'); }
function setToken(t) { localStorage.setItem('planif_token', t); }
function clearToken() { localStorage.removeItem('planif_token'); }
function getUser() {
  const raw = localStorage.getItem('planif_user');
  return raw ? JSON.parse(raw) : null;
}
function setUser(u) { localStorage.setItem('planif_user', JSON.stringify(u)); }
function clearUser() { localStorage.removeItem('planif_user'); }

/* ---------- API HELPERS ---------- */
const API_ORIGIN = 'http://localhost:3001';
const API_BASE = API_ORIGIN + '/api/entrepreneur';
const API_AUTH = API_ORIGIN + '/api/auth';
const API_PUBLIC = API_ORIGIN + '/api';

async function apiFetch(method, path, body = null, useAuth = true) {
  try {
    if (!API_BASE) return null;
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (useAuth) {
      const token = getToken();
      if (token) opts.headers['Authorization'] = 'Bearer ' + token;
    }
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${API_BASE}${path}`, opts);
    if (res.status === 401 && useAuth) {
      clearToken(); clearUser();
      window.location.href = '/auth';
      return null;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return null;
  }
}

/* ---------- AUTH API ---------- */
async function apiAuthLogin(email, password) {
  try {
    const res = await fetch(API_AUTH + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) return { error: 'Email ou mot de passe incorrect' };
    return await res.json();
  } catch { return { error: 'Serveur injoignable' }; }
}

async function apiAuthRegister(name, email, password) {
  try {
    const res = await fetch(API_AUTH + '/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom: name, email, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { error: data.message || 'Erreur lors de l\'inscription' };
    }
    return await res.json();
  } catch { return { error: 'Serveur injoignable' }; }
}

async function apiAuthMe() {
  try {
    const token = getToken();
    if (!token) return null;
    const res = await fetch(API_AUTH + '/me', {
      headers: { 'Authorization': 'Bearer ' + token },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

/* ---------- CAMPAGNE API ---------- */
async function apiCampagneCreate(data) {
  const result = await apiFetch('POST', '/campagnes', data);
  if (result && result._id) return result;
  return null;
}

async function apiCampagneLogementsStore(campagneId, logements) {
  const result = await apiFetch('POST', `/campagnes/${campagneId}/logements`, logements);
  if (result && Array.isArray(result)) return result;
  return null;
}

async function apiCampagneLocatairesStore(campagneId, locataires) {
  const result = await apiFetch('POST', `/campagnes/${campagneId}/locataires`, locataires);
  if (result && Array.isArray(result)) return result;
  return null;
}

async function apiCampagnesList() {
  const result = await apiFetch('GET', '/campagnes');
  if (result && Array.isArray(result)) return result;
  return null;
}

async function apiImmeubleCreate(data) {
  const result = await apiFetch('POST', '/immeubles', data);
  if (result && result._id) return result;
  return null;
}

async function apiCampagneShow(id) {
  const result = await apiFetch('GET', `/campagnes/${id}`);
  if (result && result._id) return result;
  return null;
}

async function apiCampagneLancerSelection(id) {
  const result = await apiFetch('POST', `/campagnes/${id}/lancer-selection`);
  if (result && result.nbSelectionnes !== undefined) return result;
  return null;
}

async function apiCampagneEnvoyerEmails(id) {
  try {
    const token = getToken();
    if (!token) return null;
    const res = await fetch(`${API_BASE}/campagnes/${id}/envoyer-emails`, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { error: err.message || 'Erreur lors de l\'envoi' };
    }
    return await res.json();
  } catch { return { error: 'Serveur injoignable' }; }
}

async function apiCampagneEmailHistory(id) {
  const result = await apiFetch('GET', `/campagnes/${id}/emails`);
  if (result && result.emails) return result.emails;
  return [];
}

async function apiCampagneJoursSave(id, jours) {
  const result = await apiFetch('PUT', `/campagnes/${id}/jours-disponibles`, { jours });
  if (result && result.jours) return result;
  return null;
}
