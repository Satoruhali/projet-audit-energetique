/* =============================================
   Planif'Audit — Utilitaires partagés
   RG3 : Tri par étage croissant
   RG4 : Pas de chevauchement
   RG9 : Pause 15 min entre visites
   ============================================= */

/* ---------- DOM HELPERS ---------- */
const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];

/* ---------- TOAST ---------- */
function toast(message, type = 'success') {
  const container = $('#toastContainer');
  if (!container) return;
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

    let debut = creneau.debut;
    let fin = creneau.fin;

    if (lastEnd && creneau.date === lastEnd.date) {
      const minStart = addMinutes(lastEnd.fin, 15);
      if (debut < minStart) {
        debut = minStart;
        fin = addMinutes(fin, timeToMinutes(minStart) - timeToMinutes(debut));
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

/* ---------- GÉNÉRER TOKEN ---------- */
function genererToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 24; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/* ---------- APPLICATION STATE ---------- */
const IS_DEV = location.hostname === 'localhost' || location.hostname === '127.0.0.1';

const APP = {
  campaigns: IS_DEV ? [
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
      ],
      logements: [
        { _id: 'lg1', numero: 'A1', etage: 0, typologie: 'T2', plancher_bas: 'Dalle pleine', plancher_haut: 'Dalle pleine', position: 'bas', selectionne_visite: true, locataire: { nom: 'Sophie Moreau' } },
        { _id: 'lg2', numero: 'A2', etage: 0, typologie: 'T1', plancher_bas: 'Dalle pleine', plancher_haut: 'Dalle pleine', position: 'bas', selectionne_visite: true, locataire: { nom: 'Pierre Durand' } },
        { _id: 'lg3', numero: 'B3', etage: 1, typologie: 'T3', plancher_bas: 'Dalle pleine', plancher_haut: 'Plancher bois', position: 'intermediaire', selectionne_visite: false, locataire: { nom: 'Camille Laurent' } },
        { _id: 'lg4', numero: 'B4', etage: 1, typologie: 'T2', plancher_bas: 'Dalle alvéolée', plancher_haut: 'Dalle pleine', position: 'intermediaire', selectionne_visite: true, locataire: { nom: 'Marc Lefèvre' } },
        { _id: 'lg5', numero: 'C5', etage: 2, typologie: 'T3', plancher_bas: 'Dalle alvéolée', plancher_haut: 'Plancher bois', position: 'haut', selectionne_visite: true, locataire: { nom: 'Julie Petit' } },
        { _id: 'lg6', numero: 'C6', etage: 2, typologie: 'T2', plancher_bas: 'Dalle pleine', plancher_haut: 'Plancher bois', position: 'haut', selectionne_visite: false, locataire: { nom: 'Thomas Roux' } },
      ],
      selection: {
        date_selection: '2026-06-01T10:00:00.000Z',
        seuil_requis: 2,
        seuil_obtenu: 4,
        couverture: { typologies: ['T1', 'T2', 'T3'], planchersBas: ['Dalle pleine', 'Dalle alvéolée'], planchersHaut: ['Dalle pleine', 'Plancher bois'], positions: ['bas', 'intermediaire', 'haut'] },
        couvertureComplete: true,
        criteresManquants: []
      }
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
  ] : [],
  currentCampaignId: null,
  typologies: [
    { id: 'T1', label: 'T1' },
    { id: 'T2', label: 'T2' },
    { id: 'T3', label: 'T3' },
    { id: 'T4', label: 'T4' },
    { id: 'T5', label: 'T5' },
  ],
  plancherBas: [
    { id: 'dalle-béton', label: 'Dalle béton' },
    { id: 'terre-plein', label: 'Sur terre-plein' },
    { id: 'vide-sanitaire', label: 'Sur vide sanitaire' },
    { id: 'sous-sol', label: 'Sur sous-sol' },
  ],
  plancherHaut: [
    { id: 'combles-perdus', label: 'Combles non aménagés' },
    { id: 'toiture-terrasse', label: 'Toiture terrasse' },
    { id: 'rampants', label: 'Rampants' },
  ],
  positions: [
    { id: 'bas', label: 'Bas (RDC/rez-de-chaussée)' },
    { id: 'intermediaire', label: 'Intermédiaire (étages courants)' },
    { id: 'haut', label: 'Haut (dernier étage/combles)' },
  ],
};

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
