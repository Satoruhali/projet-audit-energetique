/* =============================================
   Planif'Audit — Application JavaScript
   RG3 : Tri par étage croissant
   RG4 : Pas de chevauchement
   RG9 : Pause 15 min entre visites
   ============================================= */

/* ---------- AUTH ---------- */
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
      navigate('#auth');
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

const APP = {
  campaigns: [
    {
      id: 'c1',
      id_campagne: null,
      adresse: '12 Rue des Lilas, Paris 75011',
      joursDisponibles: ['2026-06-01','2026-06-02','2026-06-03','2026-06-04','2026-06-05','2026-06-08','2026-06-09','2026-06-10'],
      nbLogements: 6,
      statut: 'active',
      locataires: [
        { id: 'l1', nom: 'Sophie Moreau', email: 'sophie.moreau@email.fr', tel: '', logement: 'A1', etage: 0, etageLabel: 'RDC', digicode: '1234', statut: 'repondu', creneau: { date: '2026-06-02', debut: '09:00', fin: '09:30' } },
        { id: 'l2', nom: 'Pierre Durand', email: 'pierre.durand@email.fr', tel: '0611223344', logement: 'A2', etage: 0, etageLabel: 'RDC', digicode: '', statut: 'repondu', creneau: { date: '2026-06-02', debut: '09:45', fin: '10:15' } },
        { id: 'l3', nom: 'Camille Laurent', email: 'camille.l@email.fr', tel: '', logement: 'B3', etage: 1, etageLabel: '1er', digicode: '5678', statut: 'repondu', creneau: { date: '2026-06-02', debut: '10:30', fin: '11:00' } },
        { id: 'l4', nom: 'Marc Lefèvre', email: 'marc.lefevre@email.fr', tel: '0622334455', logement: 'B4', etage: 1, etageLabel: '1er', digicode: '', statut: 'attente', creneau: null },
        { id: 'l5', nom: 'Julie Petit', email: 'julie.petit@email.fr', tel: '', logement: 'C5', etage: 2, etageLabel: '2e', digicode: '9012', statut: 'repondu', creneau: { date: '2026-06-03', debut: '09:00', fin: '09:30' } },
        { id: 'l6', nom: 'Thomas Roux', email: 'thomas.roux@email.fr', tel: '0633445566', logement: 'C6', etage: 2, etageLabel: '2e', digicode: '', statut: 'attente', creneau: null },
      ]
    },
    {
      id: 'c2',
      id_campagne: null,
      adresse: '8 Avenue Victor Hugo, Lyon 69002',
      joursDisponibles: ['2026-07-15','2026-07-16','2026-07-17','2026-07-18','2026-07-21','2026-07-22','2026-07-23','2026-07-24','2026-07-25'],
      nbLogements: 4,
      statut: 'active',
      locataires: [
        { id: 'l7', nom: 'Nathalie Dupuis', email: 'nathalie.dupuis@email.fr', tel: '', logement: 'D1', etage: -1, etageLabel: 'Sous-sol', digicode: '', statut: 'repondu', creneau: { date: '2026-07-17', debut: '10:00', fin: '10:30' } },
        { id: 'l8', nom: 'Antoine Girard', email: 'antoine.girard@email.fr', tel: '0644556677', logement: 'E2', etage: 0, etageLabel: 'RDC', digicode: '3456', statut: 'repondu', creneau: { date: '2026-07-17', debut: '10:45', fin: '11:15' } },
        { id: 'l9', nom: 'Élodie Fontaine', email: 'elodie.fontaine@email.fr', tel: '', logement: 'F3', etage: 1, etageLabel: '1er', digicode: '', statut: 'relance', creneau: null },
        { id: 'l10', nom: 'David Mercier', email: 'david.mercier@email.fr', tel: '0655667788', logement: 'G4', etage: 2, etageLabel: '2e', digicode: '7890', statut: 'repondu', creneau: { date: '2026-07-18', debut: '09:00', fin: '09:30' } },
      ]
    },
    {
      id: 'c3',
      id_campagne: null,
      adresse: '3 Rue de la Paix, Marseille 13001',
      joursDisponibles: ['2026-05-01','2026-05-02','2026-05-03','2026-05-04','2026-05-05','2026-05-06'],
      nbLogements: 5,
      statut: 'termine',
      locataires: [
        { id: 'l11', nom: 'Isabelle Martinez', email: 'isabelle.m@email.fr', tel: '', logement: 'H1', etage: 0, etageLabel: 'RDC', digicode: '', statut: 'repondu', creneau: { date: '2026-05-03', debut: '08:00', fin: '08:30' } },
        { id: 'l12', nom: 'François Bernard', email: 'francois.b@email.fr', tel: '0677889900', logement: 'H2', etage: 0, etageLabel: 'RDC', digicode: '1122', statut: 'repondu', creneau: { date: '2026-05-03', debut: '08:45', fin: '09:15' } },
        { id: 'l13', nom: 'Sarah Cohen', email: 'sarah.cohen@email.fr', tel: '', logement: 'I3', etage: 1, etageLabel: '1er', digicode: '', statut: 'repondu', creneau: { date: '2026-05-03', debut: '09:30', fin: '10:00' } },
        { id: 'l14', nom: 'Lucas Dubois', email: 'lucas.dubois@email.fr', tel: '0699001122', logement: 'I4', etage: 1, etageLabel: '1er', digicode: '3344', statut: 'repondu', creneau: { date: '2026-05-03', debut: '10:15', fin: '10:45' } },
        { id: 'l15', nom: 'Marie Lambert', email: 'marie.lambert@email.fr', tel: '', logement: 'J5', etage: 2, etageLabel: '2e', digicode: '', statut: 'repondu', creneau: { date: '2026-05-04', debut: '09:00', fin: '09:30' } },
      ]
    },
  ],
  currentCampaignId: null,
  typologies: [
    { id: 'T1', label: 'T1' },
    { id: 'T2', label: 'T2' },
    { id: 'T3', label: 'T3' },
    { id: 'T4', label: 'T4' },
    { id: 'T5', label: 'T5' },
  ],
  plancherBas: [
    { id: 'pb-dalle', label: 'Dalle béton sur terre-plein' },
    { id: 'pb-cave', label: 'Plancher bas sur cave' },
    { id: 'pb-vide-sanitaire', label: 'Plancher bas sur vide sanitaire' },
    { id: 'pb-bois', label: 'Plancher bois surélevé' },
  ],
  plancherHaut: [
    { id: 'ph-combles-perdus', label: 'Plafond sous combles perdus' },
    { id: 'ph-toiture-terrasse', label: 'Toiture-terrasse' },
    { id: 'ph-combles-amenages', label: 'Combles aménagés' },
    { id: 'ph-dalle-etage', label: 'Dalle béton entre étages' },
  ],
  positions: [
    { id: 'bas', label: 'Bas (RDC/rez-de-chaussée)' },
    { id: 'intermediaire', label: 'Intermédiaire (étages courants)' },
    { id: 'haut', label: 'Haut (dernier étage/combles)' },
  ],
};

/* ---------- DOM REFS ---------- */
const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];

/* ---------- ROUTING ---------- */
function navigate(hash) {
  const path = hash.replace('#', '') || 'dashboard';
  $$('.view').forEach(v => v.classList.remove('active'));

  if (path === 'auth') {
    showAuth();
  } else if (path === 'dashboard') {
    showDashboard();
  } else if (path.startsWith('campaign/')) {
    const id = path.split('/')[1];
    APP.currentCampaignId = id;
    showDetail(id);
  } else if (path.startsWith('planning/')) {
    const id = path.split('/')[1];
    APP.currentCampaignId = id;
    showPlanning(id);
  } else if (path.startsWith('jours/')) {
    const id = path.split('/')[1];
    APP.currentCampaignId = id;
    showJoursSelection(id);
  }

  $$('[data-nav]').forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + path));
}

window.addEventListener('hashchange', () => {
  if (!window.location.pathname.startsWith('/rendez-vous/')) {
    navigate(window.location.hash);
  }
});

window.addEventListener('load', () => {
  const match = window.location.pathname.match(/^\/rendez-vous\/(.+)/);
  if (match) {
    showRdvPage(match[1]);
    return;
  }

  const user = getUser();
  const token = getToken();
  if (token && user) {
    navigate(window.location.hash || '#dashboard');
  } else {
    navigate('#auth');
  }
});

/* ---------- AUTH UI ---------- */
function showAuth() {
  const view = $('#view-auth');
  if (view) view.classList.add('active');
  const userSection = $('#topbarUser');
  if (userSection) userSection.style.display = 'none';
  const nav = $('#mainNav');
  if (nav) nav.querySelectorAll('.topbar__link').forEach(l => l.classList.remove('active'));
}

function updateTopbarUser(user) {
  const section = $('#topbarUser');
  if (!section) return;
  if (user) {
    section.style.display = 'flex';
    $('#userName').textContent = user.nom || user.email || 'Utilisateur';
  } else {
    section.style.display = 'none';
  }
}

$$('.auth-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    $$('.auth-tab').forEach(t => t.classList.remove('auth-tab--active'));
    tab.classList.add('auth-tab--active');
    const formName = tab.dataset.authTab;
    $('#loginForm').style.display = formName === 'login' ? 'block' : 'none';
    $('#registerForm').style.display = formName === 'register' ? 'block' : 'none';
    $('#loginError').textContent = '';
    $('#registerError').textContent = '';
  });
});

$('#loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = $('#loginEmail').value.trim();
  const password = $('#loginPassword').value;
  const errorEl = $('#loginError');
  errorEl.textContent = '';
  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true; btn.textContent = 'Connexion…';

  const result = await apiAuthLogin(email, password);
  btn.disabled = false; btn.textContent = 'Se connecter';

  if (result.error) { errorEl.textContent = result.error; return; }
  if (result.token) {
    setToken(result.token);
    const userData = result.entrepreneur || result.user;
    if (userData) {
      setUser(userData);
      updateTopbarUser(userData);
      toast('Connecté en tant que ' + (userData.nom || userData.email), 'success');
    } else {
      const me = await apiAuthMe();
      if (me && me.entrepreneur) { setUser(me.entrepreneur); updateTopbarUser(me.entrepreneur); }
      toast('Connecté', 'success');
    }
    navigate('#dashboard');
  }
});

$('#registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = $('#registerName').value.trim();
  const email = $('#registerEmail').value.trim();
  const password = $('#registerPassword').value;
  const confirm = $('#registerConfirm').value;
  const errorEl = $('#registerError');
  errorEl.textContent = '';

  if (password !== confirm) { errorEl.textContent = 'Les mots de passe ne correspondent pas'; return; }
  if (password.length < 6) { errorEl.textContent = 'Minimum 6 caractères pour le mot de passe'; return; }

  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true; btn.textContent = 'Inscription…';

  const result = await apiAuthRegister(name, email, password);
  btn.disabled = false; btn.textContent = 'Créer un compte';

  if (result.error) { errorEl.textContent = result.error; return; }
  if (result.token) {
    setToken(result.token);
    const userData = result.entrepreneur || result.user;
    if (userData) {
      setUser(userData);
      updateTopbarUser(userData);
      toast('Compte créé : ' + (userData.nom || userData.email), 'success');
    } else {
      const me = await apiAuthMe();
      if (me && me.entrepreneur) { setUser(me.entrepreneur); updateTopbarUser(me.entrepreneur); }
      toast('Compte créé', 'success');
    }
    navigate('#dashboard');
  } else {
    errorEl.textContent = 'Inscription réussie, mais connexion automatique impossible. Veuillez vous connecter.';
    document.querySelector('[data-auth-tab="login"]').click();
  }
});

$('#logoutBtn').addEventListener('click', () => {
  clearToken(); clearUser();
  updateTopbarUser(null);
  APP.campaigns.length = 0;
  renderCampaignList();
  updateStats();
  toast('Déconnecté', 'info');
  navigate('#auth');
});

/* ---------- TOAST ---------- */
function toast(message, type = 'success') {
  const container = $('#toastContainer');
  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

/* ---------- HELPERS ---------- */
function formatDate(d) { const date = new Date(d + 'T00:00:00'); return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
function formatDateShort(d) { const date = new Date(d + 'T00:00:00'); return date.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit' }); }

function campaignStats(camp) {
  const total = camp.locataires.length;
  const repondu = camp.locataires.filter(l => l.statut === 'repondu').length;
  const attente = camp.locataires.filter(l => l.statut === 'attente' || l.statut === 'relance').length;
  return { total, repondu, attente };
}

function optionsHtml(options, selected = '') {
  const items = options || [];
  let html = '<option value="">— Sélectionner —</option>';
  items.forEach(o => {
    const val = o.id || o.value || o;
    const label = o.label || o;
    const sel = val === selected ? ' selected' : '';
    html += `<option value="${val}"${sel}>${label}</option>`;
  });
  return html;
}

/* ---------- RG3 : TRI PAR ÉTAGE CROISSANT ---------- */
function sortByFloor(locataires) {
  return [...locataires].sort((a, b) => a.etage - b.etage);
}

/* ---------- RG4 / RG9 : GÉNÉRATION PLANNING ---------- */
function generatePlanning(locataires) {
  const repondus = locataires.filter(l => l.statut === 'repondu' && l.creneau);
  const sorted = sortByFloor(repondus);

  const plan = [];
  let lastEnd = null;

  sorted.forEach((l, idx) => {
    const creneau = l.creneau;
    const dateStr = formatDateShort(creneau.date);

    // RG4 : vérifier chevauchement (on décale si nécessaire)
    let debut = creneau.debut;
    let fin = creneau.fin;

    if (lastEnd && creneau.date === lastEnd.date) {
      // RG9 : pause 15 min
      const minStart = addMinutes(lastEnd.fin, 15);
      if (debut < minStart) {
        const diff = timeToMinutes(minStart) - timeToMinutes(debut);
        debut = minStart;
        fin = addMinutes(fin, diff);
      }
    }

    plan.push({
      idx: idx + 1,
      date: creneau.date,
      dateLabel: dateStr,
      debut,
      fin,
      etage: l.etage,
      etageLabel: l.etageLabel,
      logement: l.logement,
      nom: l.nom || '',
      duree: `${timeToMinutes(fin) - timeToMinutes(debut)} min`,
      locataireId: l.id,
    });

    lastEnd = { date: creneau.date, fin };
  });

  return plan;
}

function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function addMinutes(t, mins) {
  let total = timeToMinutes(t) + mins;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/* ---------- DASHBOARD ---------- */
async function showDashboard() {
  const view = $('#view-dashboard');
  view.classList.add('active');
  updateTopbarUser(getUser());

  // Phase 4.2 : GET /api/entrepreneur/campagnes
  const apiCampagnes = await apiCampagnesList();

  if (apiCampagnes) {
    const localIds = new Set(APP.campaigns.map(c => c.id));
    const merged = apiCampagnes.map(c => ({
      id: c._id,
      id_campagne: c._id,
      adresse: c.nom || c.adresse || 'Sans nom',
      nbLogements: c.nbLogements || 0,
      statut: c.statut === 'en_cours' ? 'active' : c.statut === 'termine' ? 'termine' : 'active',
      locataires: [],
      joursDisponibles: c.jours_disponibles
        ? c.jours_disponibles.map(d => typeof d === 'string' ? d.slice(0, 10) : new Date(d).toISOString().slice(0, 10))
        : [],
    }));
    merged.forEach(c => {
      if (!localIds.has(c.id)) APP.campaigns.unshift(c);
    });
  }

  // Stats (toujours sur APP.campaigns, qu'il vienne de l'API ou du fallback)
  const actives = APP.campaigns.filter(c => c.statut === 'active').length;
  const attentes = APP.campaigns.filter(c => c.statut === 'attente').length;
  const terminees = APP.campaigns.filter(c => c.statut === 'termine').length;
  $('#statActive').textContent = actives;
  $('#statPending').textContent = attentes;
  $('#statDone').textContent = terminees;

  // Table
  renderCampaignList();
}

function renderCampaignList() {
  const tbody = $('#campaignList');
  const empty = $('#emptyCampaigns');

  if (APP.campaigns.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  tbody.innerHTML = APP.campaigns.map(c => {
    const stats = campaignStats(c);
    const pct = stats.total > 0 ? Math.round((stats.repondu / stats.total) * 100) : 0;
    const statutClass = c.statut === 'termine' ? 'termine' : c.statut === 'active' ? 'repondu' : 'attente';
    const statutLabel = c.statut === 'termine' ? 'Terminée' : c.statut === 'active' ? 'Active' : 'En attente';

    return `
      <tr>
        <td><strong>${c.adresse}</strong></td>
        <td>${c.joursDisponibles ? c.joursDisponibles.length + ' jours' : '—'}</td>
        <td><span class="status status--${statutClass}">${statutLabel}</span></td>
        <td>
          <div style="display:flex;align-items:center;gap:8px">
            <div style="flex:1;height:6px;background:#eef2f7;border-radius:3px;max-width:100px">
              <div style="width:${pct}%;height:100%;background:#2ecc71;border-radius:3px"></div>
            </div>
            <span style="font-size:.78rem;color:#7a8a9e">${pct}%</span>
          </div>
        </td>
        <td style="text-align:center">
          <a class="btn btn--sm btn--outline" href="#campaign/${c.id}">Détail</a>
          <button class="btn btn--sm btn--outline" data-delete="${c.id}" style="color:#e74c3c">✕</button>
        </td>
      </tr>
    `;
  }).join('');

  // Delete handlers
  tbody.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.delete;
      APP.campaigns = APP.campaigns.filter(c => c.id !== id);
      toast('Campagne supprimée', 'info');
      renderCampaignList();
      updateStats();
    });
  });
}

function updateStats() {
  const actives = APP.campaigns.filter(c => c.statut === 'active').length;
  const attentes = APP.campaigns.filter(c => c.statut === 'attente').length;
  const terminees = APP.campaigns.filter(c => c.statut === 'termine').length;
  $('#statActive').textContent = actives;
  $('#statPending').textContent = attentes;
  $('#statDone').textContent = terminees;
}

/* ---------- REFERENTIEL ---------- */
function normalizeReferentielData(data) {
  if (!Array.isArray(data)) return [];
  return data.map(function (item) {
    if (typeof item === 'string') return { id: item, label: item };
    return {
      id: item.id || item._id || item.value || item.code || String(item),
      label: item.label || item.nom || item.name || item.libelle || String(item),
    };
  });
}

async function chargerReferentiels() {
  if (location.protocol === 'file:') return;
  var apiBase = location.origin + '/api/referentiel';

  async function fetchReferentiel(url) {
    try {
      var res = await fetch(url);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      var data = await res.json();
      var normalized = normalizeReferentielData(data);
      if (normalized.length > 0) return normalized;
      throw new Error('Données vides');
    } catch (err) {
      console.error('[Referentiel] Erreur ' + url + ': ' + err.message);
      return [{ id: '', label: 'Erreur chargement' }];
    }
  }

  var results = await Promise.allSettled([
    fetchReferentiel(apiBase + '/typologies'),
    fetchReferentiel(apiBase + '/plancher-bas'),
    fetchReferentiel(apiBase + '/plancher-haut'),
    fetchReferentiel(apiBase + '/positions'),
  ]);

  if (results[0].status === 'fulfilled') APP.typologies = results[0].value;
  if (results[1].status === 'fulfilled') APP.plancherBas = results[1].value;
  if (results[2].status === 'fulfilled') APP.plancherHaut = results[2].value;
  if (results[3].status === 'fulfilled') APP.positions = results[3].value;

  // Mettre à jour les lignes locataires déjà affichées
  document.querySelectorAll('.tenant-row').forEach(function (row) {
    var idx = row.dataset.index;
    var typoEl = row.querySelector('[name="tenant_typologie_' + idx + '"]');
    if (typoEl) typoEl.innerHTML = optionsHtml(APP.typologies);
    var pbEl = row.querySelector('[name="tenant_plancher_bas_' + idx + '"]');
    if (pbEl) pbEl.innerHTML = optionsHtml(APP.plancherBas);
    var phEl = row.querySelector('[name="tenant_plancher_haut_' + idx + '"]');
    if (phEl) phEl.innerHTML = optionsHtml(APP.plancherHaut);
    var posEl = row.querySelector('[name="tenant_position_' + idx + '"]');
    if (posEl) posEl.innerHTML = optionsHtml(APP.positions);
  });
}

function verifierBranchementAPI() {
  var checks = [
    { key: 'typologies', nom: 'Typologie', prefix: 'tenant_typologie_' },
    { key: 'plancherBas', nom: 'Plancher bas', prefix: 'tenant_plancher_bas_' },
    { key: 'plancherHaut', nom: 'Plancher haut', prefix: 'tenant_plancher_haut_' },
    { key: 'positions', nom: 'Position', prefix: 'tenant_position_' },
  ];

  checks.forEach(function (check) {
    var data = APP[check.key];
    var isError = !data || data.length === 0 ||
      (data.length === 1 && data[0].label === 'Erreur chargement');

    if (isError) {
      console.error('[API_BRANCH_FAIL] : ' + check.nom + ' est toujours mocké ou vide');
      document.querySelectorAll('[name^="' + check.prefix + '"]').forEach(function (el) {
        el.style.border = '2px solid red';
        setTimeout(function () { el.style.border = ''; }, 3000);
      });
      return;
    }

    data.forEach(function (item) {
      var label = item.label || '';
      if (label.toLowerCase().indexOf('mock') !== -1 || label.toLowerCase().indexOf('test') !== -1) {
        console.error('[API_BRANCH_FAIL] : ' + check.nom + ' contient une option mockée: "' + label + '"');
      }
    });
  });

  // Vérifier les options dans le DOM
  document.querySelectorAll(
    '[name^="tenant_typologie_"] option, ' +
    '[name^="tenant_plancher_bas_"] option, ' +
    '[name^="tenant_plancher_haut_"] option, ' +
    '[name^="tenant_position_"] option'
  ).forEach(function (opt) {
    var txt = opt.textContent.toLowerCase();
    if (txt.indexOf('mock') !== -1 || txt.indexOf('test') !== -1) {
      console.error('[API_BRANCH_FAIL] : Option mockée détectée dans le DOM: "' + opt.textContent + '"');
    }
  });

  console.log('[API_BRANCH] Vérification terminée');
}

document.addEventListener('DOMContentLoaded', function () {
  chargerReferentiels().then(function () {
    setTimeout(verifierBranchementAPI, 1000);
  });
});

/* ---------- CRÉATION CAMPAGNE (2 ÉTAPES) ---------- */
let tenantRowIndex = 0;

$('#showCreateForm').addEventListener('click', () => {
  $('#createForm').style.display = 'block';
  $('#showCreateForm').style.display = 'none';
  resetCampaignForm();
});

$('#cancelForm').addEventListener('click', () => {
  $('#createForm').style.display = 'none';
  $('#showCreateForm').style.display = 'inline-flex';
  resetCampaignForm();
});

function resetCampaignForm() {
  $('#campaignForm').reset();
  $('#formStep1').style.display = 'block';
  $('#formStep2').style.display = 'none';
  $('#tenantList').innerHTML = '';
  tenantRowIndex = 0;
  updateTenantCount();
}

function tenantRowHtml(index) {
  const lettres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lettre = lettres[index % 26];
  const num = index + 1;
  return `
    <div class="tenant-row" data-index="${index}" style="border:1px solid #eef2f7;border-radius:8px;padding:12px;margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <strong style="color:#2c3e50">Locataire ${lettre}${num}</strong>
        <button type="button" class="btn btn--sm btn--outline remove-tenant" style="color:#e74c3c;font-size:.75rem">✕ Supprimer</button>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Nom complet *</label>
          <input class="form-input" name="tenant_nom_${index}" value="Locataire ${lettre}${num}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Email *</label>
          <input class="form-input" type="email" name="tenant_email_${index}" placeholder="locataire@email.fr" required>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Téléphone</label>
          <input class="form-input" name="tenant_tel_${index}" placeholder="06 XX XX XX XX">
        </div>
        <div class="form-group">
          <label class="form-label">Appartement *</label>
          <input class="form-input" name="tenant_appart_${index}" value="${lettre}${num}" required>
        </div>
        <div class="form-group" style="flex:0 0 80px">
          <label class="form-label">Étage *</label>
          <input class="form-input" type="number" name="tenant_etage_${index}" value="0" min="-2" max="50" required>
        </div>
        <div class="form-group">
          <label class="form-label">Digicode</label>
          <input class="form-input" name="tenant_digicode_${index}" placeholder="Code d'accès">
        </div>
      </div>
      <div class="form-row" style="margin-top:8px">
        <div class="form-group">
          <label class="form-label">Typologie</label>
          <select class="form-input" name="tenant_typologie_${index}">
            ${optionsHtml(APP.typologies)}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Plancher bas</label>
          <select class="form-input" name="tenant_plancher_bas_${index}">
            ${optionsHtml(APP.plancherBas)}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Plancher haut</label>
          <select class="form-input" name="tenant_plancher_haut_${index}">
            ${optionsHtml(APP.plancherHaut)}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Position</label>
          <select class="form-input" name="tenant_position_${index}">
            ${optionsHtml(APP.positions)}
          </select>
        </div>
      </div>
    </div>
  `;
}

function addTenantRows(count) {
  const container = $('#tenantList');
  for (let i = 0; i < count; i++) {
    container.insertAdjacentHTML('beforeend', tenantRowHtml(tenantRowIndex));
    tenantRowIndex++;
  }
  updateTenantCount();
  attachRemoveHandlers();
}

function updateTenantCount() {
  const rows = $$('.tenant-row');
  $('#tenantCount').textContent = `(${rows.length})`;
}

function attachRemoveHandlers() {
  $$('.remove-tenant').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.tenant-row').remove();
      updateTenantCount();
    });
  });
}

$('#toStep2').addEventListener('click', () => {
  const adresse = $('#campAdresse').value.trim();
  const nbLogements = parseInt($('#campNbLogements').value);

  if (!adresse || !nbLogements) {
    toast('Veuillez remplir tous les champs de l\'étape 1', 'warning'); return;
  }

  $('#formStep1').style.display = 'none';
  $('#formStep2').style.display = 'block';
  addTenantRows(nbLogements);
});

$('#backToStep1').addEventListener('click', () => {
  $('#formStep2').style.display = 'none';
  $('#formStep1').style.display = 'block';
});

$('#addTenantBtn').addEventListener('click', () => {
  addTenantRows(1);
});

$('#importCsvBtn').addEventListener('click', () => {
  toast('Import CSV — fonctionnalité à venir', 'info');
});

$('#campaignForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const adresse = $('#campAdresse').value.trim();

  const tenantRows = $$('.tenant-row');
  if (tenantRows.length === 0) { toast('Ajoutez au moins un locataire', 'warning'); return; }

  const locataires = [];
  let valid = true;

  tenantRows.forEach((row) => {
    const index = row.dataset.index;
    const nom = row.querySelector(`[name="tenant_nom_${index}"]`).value.trim();
    const email = row.querySelector(`[name="tenant_email_${index}"]`).value.trim();
    const tel = row.querySelector(`[name="tenant_tel_${index}"]`).value.trim();
    const logement = row.querySelector(`[name="tenant_appart_${index}"]`).value.trim();
    const etage = parseInt(row.querySelector(`[name="tenant_etage_${index}"]`).value);
    const digicode = row.querySelector(`[name="tenant_digicode_${index}"]`).value.trim();
    const typologie = row.querySelector(`[name="tenant_typologie_${index}"]`).value;
    const plancherBas = row.querySelector(`[name="tenant_plancher_bas_${index}"]`).value;
    const plancherHaut = row.querySelector(`[name="tenant_plancher_haut_${index}"]`).value;
    const position = row.querySelector(`[name="tenant_position_${index}"]`).value;

    if (!nom || !email || !logement || isNaN(etage) || !typologie || !plancherBas || !plancherHaut || !position) {
      valid = false;
      row.style.borderColor = '#e74c3c';
      return;
    }
    row.style.borderColor = '#eef2f7';

    const etageLabel = etage === 0 ? 'RDC' : etage === -1 ? 'Sous-sol' : etage + 'e';
    locataires.push({
      id: 'l_' + Date.now() + '_' + index,
      nom,
      email,
      tel,
      logement,
      etage,
      etageLabel,
      digicode,
      typologie,
      plancherBas,
      plancherHaut,
      position,
      statut: 'attente',
      creneau: null,
    });
  });

  if (!valid) { toast('Certains champs obligatoires sont manquants (en rouge)', 'warning'); return; }

  // Phase 4.2 : appel API réelle (immeuble → campagne → logements), fallback mock
  async function submitCampagne() {
    let campaignId;
    try {
      const first = locataires[0] || {};
      const immeuble = await apiImmeubleCreate({
        nom: adresse,
        adresse,
        typologie: first.typologie || 'T1',
        annee_construction: 2000,
        plancher_bas: first.plancherBas || 'dalle',
        plancher_haut: first.plancherHaut || 'combles',
      });
      if (!immeuble) throw new Error('Échec création immeuble');

      const apiResult = await apiCampagneCreate({
        immeuble_id: immeuble._id,
        nom: adresse,
        statut: 'en_cours',
      });
      if (!apiResult) throw new Error('Échec création campagne');
      const id_campagne = apiResult._id;

      const logementsPayload = locataires.map(l => ({
        numero: l.logement,
        etage: l.etage,
        surface: 50,
        typologie: l.typologie || 'T1',
        plancher_bas: l.plancherBas || 'dalle',
        plancher_haut: l.plancherHaut || 'combles',
        position: l.position || 'intermediaire',
      }));
      const logementsCreated = await apiCampagneLogementsStore(id_campagne, logementsPayload);
      if (!logementsCreated) throw new Error('Échec création logements');

      campaignId = id_campagne;
      const campaign = {
        id: id_campagne,
        id_campagne,
        adresse,
        nbLogements: locataires.length,
        statut: 'active',
        locataires: locataires.map((l, i) => ({
          ...l,
          id: logementsCreated[i]?._id || l.id,
          id_logement: logementsCreated[i]?._id || null,
        })),
      };
      APP.campaigns.unshift(campaign);
      toast(`Campagne créée : ${adresse}`, 'success');
    } catch (err) {
      campaignId = 'c_' + Date.now();
      toast('API indisponible — mode dégradé (mock)', 'info');
      APP.campaigns.unshift({
        id: campaignId,
        id_campagne: null,
        adresse,
        nbLogements: locataires.length,
        statut: 'active',
        locataires,
      });
    }

    resetCampaignForm();
    $('#createForm').style.display = 'none';
    $('#showCreateForm').style.display = 'inline-flex';
    renderCampaignList();
    updateStats();
    navigate('#jours/' + campaignId);
  }

  submitCampagne();
});

/* ---------- MENU MOBILE ---------- */
$('#menuToggle').addEventListener('click', () => {
  $('#mainNav').classList.toggle('topbar__nav--open');
});
$$('[data-nav]').forEach(l => l.addEventListener('click', () => {
  $('#mainNav').classList.remove('topbar__nav--open');
}));

/* ---------- DÉTAIL CAMPAGNE ---------- */
async function showDetail(id) {
  const view = $('#view-detail');
  view.classList.add('active');

  let camp = APP.campaigns.find(c => c.id === id);
  if (!camp) { navigate('#dashboard'); return; }

  // Phase 4.2 : fetch API detail si locataires absents
  if ((!camp.locataires || camp.locataires.length === 0) && camp.id_campagne) {
    const detail = await apiCampagneShow(camp.id_campagne);
    if (detail) {
      camp.nbLogements = (detail.logements && detail.logements.length) || camp.nbLogements || 0;
      if (detail.locataires && detail.locataires.length > 0) {
        camp.locataires = detail.locataires.map(l => ({
          id: l._id,
          nom: l.nom || '',
          email: l.email || '',
          logement: l.logement || l.numero || '',
          etage: l.etage || 0,
          etageLabel: l.etage === 0 ? 'RDC' : l.etage === -1 ? 'Sous-sol' : l.etage + 'e',
          statut: l.statut || 'attente',
          creneau: l.creneau || null,
        }));
      }
    }
  }

  $('#detailTitle').textContent = camp.adresse;
  $('#detailSubtitle').textContent = `${camp.joursDisponibles ? camp.joursDisponibles.length : 0} jours disponibles · ${camp.nbLogements} logements`;

  const stats = campaignStats(camp);
  $('#detailRepondu').textContent = stats.repondu;
  $('#detailEnAttente').textContent = stats.attente;
  $('#detailTotal').textContent = stats.total;

  renderReponses(camp);
  renderPlanningTab(camp);
  renderJoursDisponibles(camp);
  activateTab('reponses');
}

function renderReponses(camp) {
  const tbody = $('#reponsesList');
  const etageOrder = { '-1': 0, '0': 1, '1': 2, '2': 3, '3': 4, '4': 5 };
  const sorted = [...camp.locataires].sort((a, b) => (etageOrder[a.etage] || a.etage) - (etageOrder[b.etage] || b.etage));

  tbody.innerHTML = sorted.map(l => {
    const statutClass = l.statut;
    const statutLabel = l.statut === 'repondu' ? 'Répondu' : l.statut === 'relance' ? 'Relancé' : 'En attente';
    const creneauStr = l.creneau ? `${formatDateShort(l.creneau.date)} ${l.creneau.debut}–${l.creneau.fin}` : '—';

    const actions = l.statut === 'attente'
      ? `<button class="btn btn--sm btn--outline" data-relance="${l.id}" style="color:#3498db">📧 Relancer</button>`
      : l.statut === 'relance'
        ? `<span style="font-size:.78rem;color:#7a8a9e">Relancé</span>`
        : `<span style="font-size:.78rem;color:#2ecc71">✓ OK</span>`;

    return `<tr>
      <td><strong>${l.logement}</strong></td>
      <td>${l.nom || '—'}</td>
      <td>${l.etageLabel}</td>
      <td><span class="status status--${statutClass}">${statutLabel}</span></td>
      <td>${creneauStr}</td>
      <td style="text-align:center">${actions}</td>
    </tr>`;
  }).join('');

  // Relance handlers
  tbody.querySelectorAll('[data-relance]').forEach(btn => {
    btn.addEventListener('click', () => {
      const loc = camp.locataires.find(l => l.id === btn.dataset.relance);
      if (loc) {
        loc.statut = 'relance';
        toast(`Relance envoyée à ${loc.logement}`, 'info');
        renderReponses(camp);
      }
    });
  });
}

function renderPlanningTab(camp) {
  const tbody = $('#planningList');
  const empty = $('#emptyPlanning');
  const plan = generatePlanning(camp.locataires);

  if (plan.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  tbody.innerHTML = plan.map(p => `
    <tr>
      <td>${p.dateLabel}</td>
      <td>${p.debut}</td>
      <td>${p.fin}</td>
      <td>${p.etageLabel}</td>
      <td><strong>${p.logement}</strong></td>
      <td>${p.nom || '—'}</td>
      <td style="text-align:center">
        <a class="btn btn--sm btn--outline" href="#planning/${camp.id}">Voir</a>
      </td>
    </tr>
  `).join('');
}

/* ---------- JOURS DISPONIBLES ---------- */
function renderJoursDisponibles(camp) {
  const container = $('#joursDisponiblesContainer');
  if (!container) return;

  const jours = camp.joursDisponibles || [];
  const joursSet = new Set(jours);

  const next30Days = [];
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const iso = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit' });
    next30Days.push({ iso, label });
  }

  container.innerHTML = next30Days.map(d => `
    <div class="jour-chip ${joursSet.has(d.iso) ? 'jour-chip--selected' : ''}" data-date="${d.iso}">
      <span>${d.label}</span>
    </div>
  `).join('');

  container.querySelectorAll('.jour-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('jour-chip--selected');
    });
  });
}

$('#saveJoursBtn')?.addEventListener('click', () => {
  const camp = APP.campaigns.find(c => c.id === APP.currentCampaignId);
  if (!camp) return;

  const selected = [...$$('.jour-chip--selected')].map(chip => chip.dataset.date);
  camp.joursDisponibles = selected;
  toast(`Jours disponibles mis à jour (${selected.length} jour(s))`, 'success');

  const container = $('#joursDisponiblesContainer');
  const allChips = [...container.querySelectorAll('.jour-chip')];
  const joursSet = new Set(selected);
  allChips.forEach(chip => {
    chip.classList.toggle('jour-chip--selected', joursSet.has(chip.dataset.date));
  });
  renderCampaignList();
  $('#detailSubtitle').textContent = `${selected.length} jours disponibles · ${camp.nbLogements} logements`;
});

/* ---------- ONGLETS ---------- */
function activateTab(name) {
  $$('.tab').forEach(t => t.classList.toggle('tab--active', t.dataset.tab === name));
  $$('.tab-content').forEach(tc => tc.classList.toggle('tab-content--active', tc.id === 'tab-' + name));
}

$$('[data-tab]').forEach(tab => {
  tab.addEventListener('click', () => activateTab(tab.dataset.tab));
});

/* ---------- BACK NAV ---------- */
$('#backToDashboard').addEventListener('click', () => navigate('#dashboard'));
$('#backToDetail').addEventListener('click', () => {
  if (APP.currentCampaignId) navigate('#campaign/' + APP.currentCampaignId);
  else navigate('#dashboard');
});

/* ---------- RELANCE MASSE ---------- */
$('#relanceMassBtn').addEventListener('click', () => {
  const camp = APP.campaigns.find(c => c.id === APP.currentCampaignId);
  if (!camp) return;
  const enAttente = camp.locataires.filter(l => l.statut === 'attente');
  enAttente.forEach(l => l.statut = 'relance');
  toast(`Relance envoyée à ${enAttente.length} locataire(s)`, 'success');
  renderReponses(camp);
});

/* ---------- GÉNÉRER LIENS ---------- */
function genererToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 24; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

$('#genLinksBtn').addEventListener('click', () => {
  const camp = APP.campaigns.find(c => c.id === APP.currentCampaignId);
  if (!camp) return;
  const baseUrl = window.location.origin + '/rendez-vous/';
  const liens = camp.locataires.map(l => {
    if (!l.token) l.token = genererToken();
    const url = baseUrl + l.token;
    return `${l.logement} (${l.nom || '?'}) : ${url}`;
  }).join('\n');
  navigator.clipboard.writeText(liens).then(() => {
    toast('Liens copiés dans le presse-papier !', 'success');
  }).catch(() => {
    toast('Liens générés (copie manuelle)', 'info');
  });
});

/* ---------- EXPORTS ---------- */
$('#exportPdfBtn').addEventListener('click', () => toast('Export PDF simulé avec succès', 'success'));
$('#exportIcalBtn').addEventListener('click', () => toast('Export iCal simulé avec succès', 'success'));
$('#planExportPdf').addEventListener('click', () => toast('Export PDF simulé avec succès', 'success'));
$('#planExportIcal').addEventListener('click', () => toast('Export iCal simulé avec succès', 'success'));

/* ---------- VUE CHOIX DES JOURS ---------- */
function showJoursSelection(id) {
  const view = $('#view-jours');
  view.classList.add('active');

  const camp = APP.campaigns.find(c => c.id === id);
  if (!camp) { navigate('#dashboard'); return; }

  $('#joursCampSubtitle').textContent = `${camp.adresse} · ${camp.nbLogements} logements — Cochez les jours disponibles pour les visites`;
  renderJourCalendar(camp);
}

function renderJourCalendar(camp) {
  const container = $('#joursCalendar');
  if (!container) return;

  const jours = camp.joursDisponibles || [];
  const joursSet = new Set(jours);

  const today = new Date();
  const months = [];

  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const iso = d.toISOString().split('T')[0];
    const monthKey = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    const monthLabel = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    const dayNum = String(d.getDate()).padStart(2, '0');
    const weekday = d.toLocaleDateString('fr-FR', { weekday: 'short' });

    if (!months.find(m => m.key === monthKey)) {
      months.push({ key: monthKey, label: monthLabel, days: [] });
    }
    const month = months.find(m => m.key === monthKey);
    month.days.push({ iso, dayNum, weekday, label: `${weekday} ${dayNum}` });
  }

  container.innerHTML = months.map(m => `
    <div class="jours-month">
      <h3 class="jours-month__title">${m.label}</h3>
      <div class="jours-grid">
        ${m.days.map(d => `
          <label class="jour-checkbox ${joursSet.has(d.iso) ? 'jour-checkbox--checked' : ''}">
            <input type="checkbox" class="jour-checkbox__input" value="${d.iso}" ${joursSet.has(d.iso) ? 'checked' : ''}>
            <span class="jour-checkbox__label">${d.label}</span>
          </label>
        `).join('')}
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.jour-checkbox__input').forEach(cb => {
    cb.addEventListener('change', () => {
      cb.closest('.jour-checkbox').classList.toggle('jour-checkbox--checked', cb.checked);
      updateJoursCount();
    });
  });

  updateJoursCount();
}

function updateJoursCount() {
  const checked = $$('#joursCalendar .jour-checkbox__input:checked').length;
  const badge = $('#joursSelectedCount');
  if (badge) badge.textContent = `${checked} jour(s) sélectionné(s)`;
}

$('#joursSaveBtn')?.addEventListener('click', () => {
  const camp = APP.campaigns.find(c => c.id === APP.currentCampaignId);
  if (!camp) return;

  const selected = [...$$('#joursCalendar .jour-checkbox__input:checked')].map(cb => cb.value);

  if (selected.length === 0) {
    toast('Sélectionnez au moins un jour disponible', 'warning');
    return;
  }

  camp.joursDisponibles = selected;

  // Simuler PUT /api/entrepreneur/campagnes/:id/jours-disponibles
  toast(`✓ ${selected.length} jour(s) enregistré(s) pour ${camp.adresse}`, 'success');

  renderCampaignList();
  navigate('#campaign/' + camp.id);
});

$('#joursSkipBtn')?.addEventListener('click', () => {
  const camp = APP.campaigns.find(c => c.id === APP.currentCampaignId);
  if (camp) toast('Vous pourrez configurer les jours plus tard depuis le détail de la campagne', 'info');
  navigate('#campaign/' + APP.currentCampaignId);
});

$('#joursSelectAll')?.addEventListener('click', () => {
  $$('#joursCalendar .jour-checkbox__input').forEach(cb => {
    cb.checked = true;
    cb.closest('.jour-checkbox').classList.add('jour-checkbox--checked');
  });
  updateJoursCount();
});

$('#joursDeselectAll')?.addEventListener('click', () => {
  $$('#joursCalendar .jour-checkbox__input').forEach(cb => {
    cb.checked = false;
    cb.closest('.jour-checkbox').classList.remove('jour-checkbox--checked');
  });
  updateJoursCount();
});

$('#joursBackBtn')?.addEventListener('click', () => {
  if (APP.currentCampaignId) navigate('#campaign/' + APP.currentCampaignId);
  else navigate('#dashboard');
});

/* ---------- VUE PLANNING OPTIMISÉ ---------- */
function showPlanning(id) {
  const view = $('#view-planning');
  view.classList.add('active');

  const camp = APP.campaigns.find(c => c.id === id);
  if (!camp) { navigate('#dashboard'); return; }

  $('#planningCampSubtitle').textContent = `${camp.adresse} · ${camp.joursDisponibles ? camp.joursDisponibles.length : 0} jours disponibles`;

  const plan = generatePlanning(camp.locataires);

  // Timeline
  renderTimeline(plan);

  // Detail table
  renderPlanningDetail(plan, camp);

  // Modification form
  renderModifForm(camp, plan);
}

function renderTimeline(plan) {
  const tl = $('#planningTimeline');
  if (plan.length === 0) {
    tl.innerHTML = '<div class="empty-state"><p>Aucune visite planifiée.</p></div>';
    return;
  }

  tl.innerHTML = plan.map((p, i) => {
    const isLast = i === plan.length - 1;
    return `
      <div class="timeline__item">
        <div class="timeline__item-header">
          <span class="timeline__item-time">${p.dateLabel} · ${p.debut}–${p.fin}</span>
          <span class="timeline__item-badge">${p.etageLabel} · ${p.logement}</span>
        </div>
        <div class="timeline__item-label">${p.nom} — Audit ${p.logement} (${p.etageLabel}) — ${p.duree}</div>
      </div>
      ${!isLast ? `<div class="timeline__item timeline__item--pause">
        <div class="timeline__item-header">
          <span class="timeline__item-time">${addMinutes(p.fin, 0)} → ${addMinutes(p.fin, 15)}</span>
          <span class="timeline__item-badge" style="background:#fef3e7;color:#d35400">Pause 15 min</span>
        </div>
        <div class="timeline__item-label">Déplacement entre les logements (RG9)</div>
      </div>` : ''}
    `;
  }).join('');
}

function renderPlanningDetail(plan, camp) {
  const tbody = $('#planningDetailList');

  if (plan.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="empty-state"><p>Aucune visite planifiée.</p></td></tr>';
    return;
  }

  tbody.innerHTML = plan.map(p => `
    <tr>
      <td>${p.idx}</td>
      <td>${p.dateLabel}</td>
      <td><strong>${p.debut}–${p.fin}</strong></td>
      <td>${p.etageLabel}</td>
      <td>${p.logement}</td>
      <td>${p.nom || '—'}</td>
      <td>${p.duree}</td>
      <td style="text-align:center">
        <button class="btn btn--sm btn--outline" data-plan-modify="${p.locataireId}" style="color:#3498db">✎</button>
      </td>
    </tr>
  `).join('');

  // Modify buttons scroll to form
  tbody.querySelectorAll('[data-plan-modify]').forEach(btn => {
    btn.addEventListener('click', () => {
      const locId = btn.dataset.planModify;
      const loc = camp.locataires.find(l => l.id === locId);
      if (!loc) return;
      $('#modifLogement').value = locId;
      if (loc.creneau) {
        $('#modifDate').value = loc.creneau.date;
        $('#modifDebut').value = loc.creneau.debut;
        $('#modifFin').value = loc.creneau.fin;
      }
      $('#modifySlotForm').scrollIntoView({ behavior: 'smooth' });
    });
  });
}

function renderModifForm(camp, plan) {
  const select = $('#modifLogement');
  select.innerHTML = camp.locataires.filter(l => l.statut === 'repondu').map(l =>
    `<option value="${l.id}">${l.logement} — ${l.nom || '?'} (${l.etageLabel})</option>`
  ).join('');
}

$('#modifySlotForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const locId = $('#modifLogement').value;
  const newDate = $('#modifDate').value;
  const newDebut = $('#modifDebut').value;
  const newFin = $('#modifFin').value;

  if (!locId || !newDate || !newDebut || !newFin) {
    toast('Veuillez remplir tous les champs', 'warning'); return;
  }
  if (newDebut >= newFin) {
    toast('La fin doit être après le début', 'warning'); return;
  }

  const camp = APP.campaigns.find(c => c.id === APP.currentCampaignId);
  if (!camp) return;

  const loc = camp.locataires.find(l => l.id === locId);
  if (!loc) return;

  loc.creneau = { date: newDate, debut: newDebut, fin: newFin };

  // Regenerate
  const plan = generatePlanning(camp.locataires);
  renderTimeline(plan);
  renderPlanningDetail(plan, camp);
  renderPlanningTab(camp);
  renderReponses(camp);
  toast(`Créneau modifié pour ${loc.logement}`, 'success');
});

/* =============================================
   PAGE PUBLIQUE — RENDEZ-VOUS / LIEN UNIQUE
   ============================================= */

/* ---------- État RDV ---------- */
const RDV = {
  token: null,
  locataire: null,
  campagne: null,
  joursDisponibles: [],
  dateChoisie: null,
};

function hideAllRdvSections() {
  ['rdv-loading', 'rdv-info', 'rdv-jours', 'rdv-heure', 'rdv-confirmation', 'rdv-erreur'].forEach(id => {
    const el = $('#' + id);
    if (el) el.style.display = 'none';
  });
}

function showRdvSection(id) {
  const el = $('#' + id);
  if (el) el.style.display = 'block';
}

/* ---------- Affichage page RDV ---------- */
async function showRdvPage(token) {
  hideAllRdvSections();
  showRdvSection('rdv-loading');

  $$('.view').forEach(v => v.classList.remove('active'));
  const view = $('#view-rdv');
  if (view) view.classList.add('active');

  const topbar = $('.topbar');
  if (topbar) topbar.style.display = 'none';

  RDV.token = token;

  try {
    const res = await fetch(API_PUBLIC + '/liens/' + token);
    if (!res.ok) {
      showRdvError('Ce lien n\'est pas valide ou a expiré.');
      return;
    }

    const data = await res.json();
    RDV.locataire = data.locataire;
    RDV.campagne = data.campagne;
    RDV.joursDisponibles = data.jours_disponibles;

    hideAllRdvSections();
    showRdvSection('rdv-info');
    showRdvSection('rdv-jours');

    $('#rdvNom').textContent = (RDV.locataire.prenom || '') + ' ' + (RDV.locataire.nom || '');
    $('#rdvLogement').textContent = 'Logement n°' + (RDV.locataire.logement || '');

    renderRdvJours();
  } catch {
    showRdvError('Impossible de charger les informations. Veuillez réessayer.');
  }
}

function showRdvError(msg) {
  hideAllRdvSections();
  showRdvSection('rdv-erreur');
  $('#rdvErreurMsg').textContent = msg || 'Ce lien n\'est pas valide ou a expiré.';
}

function renderRdvJours() {
  const container = $('#rdvJoursList');
  if (!container) return;

  if (RDV.joursDisponibles.length === 0) {
    container.innerHTML = '<p class="rdv-empty">Aucun jour disponible pour le moment.</p>';
    return;
  }

  const joursSet = new Set(RDV.joursDisponibles);

  const today = new Date();
  const next30Days = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const iso = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' });
    next30Days.push({ iso, label });
  }

  container.innerHTML = next30Days.map(d => {
    const disponible = joursSet.has(d.iso);
    return `
      <button class="rdv-jour-btn ${disponible ? 'rdv-jour-btn--dispo' : 'rdv-jour-btn--indispo'}"
              data-date="${d.iso}"
              ${!disponible ? 'disabled' : ''}>
        <span class="rdv-jour-btn__date">${d.label}</span>
        ${disponible ? '<span class="rdv-jour-btn__status">Disponible</span>' : '<span class="rdv-jour-btn__status">Indisponible</span>'}
      </button>
    `;
  }).join('');

  container.querySelectorAll('.rdv-jour-btn--dispo').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.rdv-jour-btn--dispo').forEach(b => b.classList.remove('rdv-jour-btn--selected'));
      btn.classList.add('rdv-jour-btn--selected');
      RDV.dateChoisie = btn.dataset.date;
      showRdvHeureSelection();
    });
  });
}

function showRdvHeureSelection() {
  hideAllRdvSections();
  showRdvSection('rdv-info');
  showRdvSection('rdv-heure');

  const dateObj = new Date(RDV.dateChoisie + 'T00:00:00');
  $('#rdvDateSelected').textContent = 'Date sélectionnée : ' + dateObj.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
}

$('#rdvSubmitBtn').addEventListener('click', async () => {
  const heureDebut = $('#rdvHeureDebut').value;
  const heureFin = $('#rdvHeureFin').value;

  if (!heureDebut || !heureFin) {
    toast('Veuillez remplir les heures de début et fin', 'warning');
    return;
  }

  if (heureDebut >= heureFin) {
    toast('L\'heure de fin doit être postérieure à l\'heure de début', 'warning');
    return;
  }

  const btn = $('#rdvSubmitBtn');
  btn.disabled = true;
  btn.textContent = 'Confirmation en cours…';

  try {
    const res = await fetch(API_PUBLIC + '/liens/' + RDV.token + '/creneaux', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date_visite: RDV.dateChoisie,
        heure_debut: heureDebut,
        heure_fin: heureFin,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      btn.disabled = false;
      btn.textContent = 'Confirmer mon rendez-vous';
      toast(errData.message || 'Erreur lors de la réservation', 'error');
      return;
    }

    const data = await res.json();
    hideAllRdvSections();
    showRdvSection('rdv-confirmation');

    const dateObj = new Date(RDV.dateChoisie + 'T00:00:00');
    $('#rdvConfirmDetails').innerHTML = `
      <p><strong>Date :</strong> ${dateObj.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>
      <p><strong>Créneau :</strong> ${data.creneau.heure_debut} – ${data.creneau.heure_fin}</p>
    `;
  } catch {
    btn.disabled = false;
    btn.textContent = 'Confirmer mon rendez-vous';
    toast('Erreur de connexion au serveur', 'error');
  }
});
