/* =============================================
   Planif'Audit — Planning Page
   ============================================= */

/* ---------- VUE PLANNING OPTIMISÉ ---------- */
function showPlanning(id) {
  const camp = APP.campaigns.find(c => c.id === id);
  if (!camp) { window.location.href = '/dashboard'; return; }

  $('#planningCampSubtitle').textContent = `${camp.adresse} · ${camp.joursDisponibles ? camp.joursDisponibles.length : 0} jours disponibles`;

  const plan = generatePlanning(camp.locataires);

  renderTimeline(plan);
  renderPlanningDetail(plan, camp);
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

  const plan = generatePlanning(camp.locataires);
  renderTimeline(plan);
  renderPlanningDetail(plan, camp);
  toast(`Créneau modifié pour ${loc.logement}`, 'success');
});

$('#backToDetail').addEventListener('click', () => {
  if (APP.currentCampaignId) window.location.href = '/detail?id=' + APP.currentCampaignId;
  else window.location.href = '/dashboard';
});

$('#planExportPdf').addEventListener('click', () => toast('Export PDF simulé avec succès', 'success'));
$('#planExportIcal').addEventListener('click', () => toast('Export iCal simulé avec succès', 'success'));

/* ---------- AUTH UI ---------- */
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

$('#logoutBtn').addEventListener('click', () => {
  clearToken(); clearUser();
  updateTopbarUser(null);
  toast('Déconnecté', 'info');
  window.location.href = '/auth';
});

$('#menuToggle').addEventListener('click', () => {
  $('#mainNav').classList.toggle('topbar__nav--open');
});

/* ---------- INIT ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const token = getToken();
  if (!token) {
    window.location.href = '/auth';
    return;
  }
  updateTopbarUser(getUser());
  injecterBranding();

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (id) {
    APP.currentCampaignId = id;
    showPlanning(id);
  } else {
    window.location.href = '/dashboard';
  }
});
