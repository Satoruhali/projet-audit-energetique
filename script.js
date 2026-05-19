/* =============================================
   Planif'Audit — Application JavaScript
   RG3 : Tri par étage croissant
   RG4 : Pas de chevauchement
   RG9 : Pause 15 min entre visites
   ============================================= */

/* ---------- MOCK DATA ---------- */
const APP = {
  campaigns: [
    {
      id: 'c1',
      adresse: '12 Rue des Lilas, Paris 75011',
      dateDebut: '2026-06-01',
      dateFin: '2026-06-10',
      nbLogements: 6,
      statut: 'active',
      locataires: [
        { id: 'l1', logement: 'A1', etage: 0, etageLabel: 'RDC', statut: 'repondu', creneau: { date: '2026-06-02', debut: '09:00', fin: '09:30' } },
        { id: 'l2', logement: 'A2', etage: 0, etageLabel: 'RDC', statut: 'repondu', creneau: { date: '2026-06-02', debut: '09:45', fin: '10:15' } },
        { id: 'l3', logement: 'B3', etage: 1, etageLabel: '1er', statut: 'repondu', creneau: { date: '2026-06-02', debut: '10:30', fin: '11:00' } },
        { id: 'l4', logement: 'B4', etage: 1, etageLabel: '1er', statut: 'attente', creneau: null },
        { id: 'l5', logement: 'C5', etage: 2, etageLabel: '2e', statut: 'repondu', creneau: { date: '2026-06-03', debut: '09:00', fin: '09:30' } },
        { id: 'l6', logement: 'C6', etage: 2, etageLabel: '2e', statut: 'attente', creneau: null },
      ]
    },
    {
      id: 'c2',
      adresse: '8 Avenue Victor Hugo, Lyon 69002',
      dateDebut: '2026-07-15',
      dateFin: '2026-07-25',
      nbLogements: 4,
      statut: 'active',
      locataires: [
        { id: 'l7', logement: 'D1', etage: -1, etageLabel: 'Sous-sol', statut: 'repondu', creneau: { date: '2026-07-17', debut: '10:00', fin: '10:30' } },
        { id: 'l8', logement: 'E2', etage: 0, etageLabel: 'RDC', statut: 'repondu', creneau: { date: '2026-07-17', debut: '10:45', fin: '11:15' } },
        { id: 'l9', logement: 'F3', etage: 1, etageLabel: '1er', statut: 'relance', creneau: null },
        { id: 'l10', logement: 'G4', etage: 2, etageLabel: '2e', statut: 'repondu', creneau: { date: '2026-07-18', debut: '09:00', fin: '09:30' } },
      ]
    },
    {
      id: 'c3',
      adresse: '3 Rue de la Paix, Marseille 13001',
      dateDebut: '2026-05-01',
      dateFin: '2026-05-08',
      nbLogements: 5,
      statut: 'termine',
      locataires: [
        { id: 'l11', logement: 'H1', etage: 0, etageLabel: 'RDC', statut: 'repondu', creneau: { date: '2026-05-03', debut: '08:00', fin: '08:30' } },
        { id: 'l12', logement: 'H2', etage: 0, etageLabel: 'RDC', statut: 'repondu', creneau: { date: '2026-05-03', debut: '08:45', fin: '09:15' } },
        { id: 'l13', logement: 'I3', etage: 1, etageLabel: '1er', statut: 'repondu', creneau: { date: '2026-05-03', debut: '09:30', fin: '10:00' } },
        { id: 'l14', logement: 'I4', etage: 1, etageLabel: '1er', statut: 'repondu', creneau: { date: '2026-05-03', debut: '10:15', fin: '10:45' } },
        { id: 'l15', logement: 'J5', etage: 2, etageLabel: '2e', statut: 'repondu', creneau: { date: '2026-05-04', debut: '09:00', fin: '09:30' } },
      ]
    },
  ],
  currentCampaignId: null,
};

/* ---------- DOM REFS ---------- */
const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];

/* ---------- ROUTING ---------- */
function navigate(hash) {
  const path = hash.replace('#', '') || 'dashboard';
  $$('.view').forEach(v => v.classList.remove('active'));

  if (path === 'dashboard') {
    showDashboard();
  } else if (path.startsWith('campaign/')) {
    const id = path.split('/')[1];
    APP.currentCampaignId = id;
    showDetail(id);
  } else if (path.startsWith('planning/')) {
    const id = path.split('/')[1];
    APP.currentCampaignId = id;
    showPlanning(id);
  }

  $$('[data-nav]').forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + path));
}

window.addEventListener('hashchange', () => navigate(window.location.hash));
window.addEventListener('load', () => navigate(window.location.hash || '#dashboard'));

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
function showDashboard() {
  const view = $('#view-dashboard');
  view.classList.add('active');

  // Stats
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
        <td>${formatDate(c.dateDebut)} — ${formatDate(c.dateFin)}</td>
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

/* ---------- CRÉATION CAMPAGNE ---------- */
$('#showCreateForm').addEventListener('click', () => {
  $('#createForm').style.display = 'block';
  $('#showCreateForm').style.display = 'none';
});

$('#cancelForm').addEventListener('click', () => {
  $('#createForm').style.display = 'none';
  $('#showCreateForm').style.display = 'inline-flex';
  $('#campaignForm').reset();
});

$('#campaignForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const adresse = $('#campAdresse').value.trim();
  const dateDebut = $('#campDebut').value;
  const dateFin = $('#campFin').value;
  const nbLogements = parseInt($('#campNbLogements').value);

  if (!adresse || !dateDebut || !dateFin) { toast('Veuillez remplir tous les champs', 'warning'); return; }
  if (dateDebut > dateFin) { toast('La date de fin doit être après la date de début', 'warning'); return; }

  const etagesDispos = [0, 0, 1, 1, 2, 2, 3, 3, 4];
  const locataires = Array.from({ length: nbLogements }, (_, i) => {
    const etage = etagesDispos[i % etagesDispos.length];
    const etageLabel = etage === 0 ? 'RDC' : etage === -1 ? 'Sous-sol' : etage + 'e';
    return {
      id: 'l_' + Date.now() + '_' + i,
      logement: String.fromCharCode(65 + (i % 26)) + (i + 1),
      etage,
      etageLabel,
      statut: Math.random() > 0.6 ? 'repondu' : 'attente',
      creneau: null,
    };
  });

  const campaign = {
    id: 'c_' + Date.now(),
    adresse,
    dateDebut,
    dateFin,
    nbLogements,
    statut: 'active',
    locataires,
  };

  APP.campaigns.unshift(campaign);
  toast(`Campagne créée : ${adresse}`, 'success');
  $('#campaignForm').reset();
  $('#createForm').style.display = 'none';
  $('#showCreateForm').style.display = 'inline-flex';
  renderCampaignList();
  updateStats();
});

/* ---------- MENU MOBILE ---------- */
$('#menuToggle').addEventListener('click', () => {
  $('#mainNav').classList.toggle('topbar__nav--open');
});
$$('[data-nav]').forEach(l => l.addEventListener('click', () => {
  $('#mainNav').classList.remove('topbar__nav--open');
}));

/* ---------- DÉTAIL CAMPAGNE ---------- */
function showDetail(id) {
  const view = $('#view-detail');
  view.classList.add('active');

  const camp = APP.campaigns.find(c => c.id === id);
  if (!camp) { navigate('#dashboard'); return; }

  $('#detailTitle').textContent = camp.adresse;
  $('#detailSubtitle').textContent = `${formatDate(camp.dateDebut)} — ${formatDate(camp.dateFin)} · ${camp.nbLogements} logements`;

  const stats = campaignStats(camp);
  $('#detailRepondu').textContent = stats.repondu;
  $('#detailEnAttente').textContent = stats.attente;
  $('#detailTotal').textContent = stats.total;

  renderReponses(camp);
  renderPlanningTab(camp);
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
      <td style="text-align:center">
        <a class="btn btn--sm btn--outline" href="#planning/${camp.id}">Voir</a>
      </td>
    </tr>
  `).join('');
}

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
$('#genLinksBtn').addEventListener('click', () => {
  const camp = APP.campaigns.find(c => c.id === APP.currentCampaignId);
  if (!camp) return;
  const liens = camp.locataires.map(l =>
    `${l.logement} : https://planifaudit.fr/invitation/${camp.id}/${l.id}`
  ).join('\n');
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

/* ---------- VUE PLANNING OPTIMISÉ ---------- */
function showPlanning(id) {
  const view = $('#view-planning');
  view.classList.add('active');

  const camp = APP.campaigns.find(c => c.id === id);
  if (!camp) { navigate('#dashboard'); return; }

  $('#planningCampSubtitle').textContent = `${camp.adresse} · ${formatDate(camp.dateDebut)} — ${formatDate(camp.dateFin)}`;

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
        <div class="timeline__item-label">Audit ${p.logement} (${p.etageLabel}) — ${p.duree}</div>
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
    tbody.innerHTML = '<tr><td colspan="7" class="empty-state"><p>Aucune visite planifiée.</p></td></tr>';
    return;
  }

  tbody.innerHTML = plan.map(p => `
    <tr>
      <td>${p.idx}</td>
      <td>${p.dateLabel}</td>
      <td><strong>${p.debut}–${p.fin}</strong></td>
      <td>${p.etageLabel}</td>
      <td>${p.logement}</td>
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
    `<option value="${l.id}">${l.logement} (${l.etageLabel})</option>`
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
