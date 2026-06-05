/* =============================================
   Planif'Audit — RDV Public Page
   ============================================= */

const $ = (s, ctx) => (ctx || document).querySelector(s);
const $$ = (s, ctx) => [...(ctx || document).querySelectorAll(s)];

const API_ORIGIN = 'http://localhost:3001';
const API_PUBLIC = API_ORIGIN + '/api';

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

async function showRdvPage(token) {
  hideAllRdvSections();
  showRdvSection('rdv-loading');

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

function toast(message, type) {
  alert(message);
}

/* ---------- INIT ---------- */
window.addEventListener('load', () => {
  const match = window.location.pathname.match(/^\/rendez-vous\/(.+)/);
  if (match) {
    showRdvPage(match[1]);
  }
});
