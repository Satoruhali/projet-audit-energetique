/* =============================================
   Planif'Audit — Jours Page
   ============================================= */

/* ---------- VUE CHOIX DES JOURS ---------- */
function showJoursSelection(id) {
  const camp = APP.campaigns.find(c => c.id === id);
  if (!camp) { window.location.href = '/dashboard'; return; }

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

$('#joursSaveBtn')?.addEventListener('click', async () => {
  const camp = APP.campaigns.find(c => c.id === APP.currentCampaignId);
  if (!camp) return;

  const selected = [...$$('#joursCalendar .jour-checkbox__input:checked')].map(cb => cb.value);

  if (selected.length === 0) {
    toast('Sélectionnez au moins un jour disponible', 'warning');
    return;
  }

  camp.joursDisponibles = selected;

  if (camp.id_campagne) {
    const result = await apiCampagneJoursSave(camp.id_campagne, selected);
    if (!result) {
      toast('Impossible de sauvegarder les jours sur le serveur, mais ils sont enregistrés localement', 'warning');
      window.location.href = '/detail?id=' + camp.id;
      return;
    }
  }

  toast(`✓ ${selected.length} jour(s) enregistré(s) pour ${camp.adresse}`, 'success');
  window.location.href = '/detail?id=' + camp.id;
});

$('#joursSkipBtn')?.addEventListener('click', () => {
  const camp = APP.campaigns.find(c => c.id === APP.currentCampaignId);
  if (camp) toast('Vous pourrez configurer les jours plus tard depuis le détail de la campagne', 'info');
  window.location.href = '/detail?id=' + APP.currentCampaignId;
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
  if (APP.currentCampaignId) window.location.href = '/detail?id=' + APP.currentCampaignId;
  else window.location.href = '/dashboard';
});

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
    showJoursSelection(id);
  } else {
    window.location.href = '/dashboard';
  }
});
