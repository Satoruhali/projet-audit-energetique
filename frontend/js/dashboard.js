/* =============================================
   Planif'Audit — Dashboard Page
   ============================================= */

/* ---------- DASHBOARD ---------- */
async function showDashboard() {
  updateTopbarUser(getUser());

  const apiCampagnes = await apiCampagnesList();

  if (apiCampagnes) {
    const localIds = new Set(APP.campaigns.map(c => c.id));
    const merged = apiCampagnes.map(c => ({
      id: c.id,
      id_campagne: c.id,
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

  const actives = APP.campaigns.filter(c => c.statut === 'active').length;
  const attentes = APP.campaigns.filter(c => c.statut === 'attente').length;
  const terminees = APP.campaigns.filter(c => c.statut === 'termine').length;
  $('#statActive').textContent = actives;
  $('#statPending').textContent = attentes;
  $('#statDone').textContent = terminees;

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
          <a class="btn btn--sm btn--outline" href="/detail?id=${c.id}">Détail</a>
          <button class="btn btn--sm btn--outline" data-delete="${c.id}" style="color:#e74c3c">✕</button>
        </td>
      </tr>
    `;
  }).join('');

  tbody.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.delete;
      APP.campaigns = APP.campaigns.filter(c => String(c.id) !== id);
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
        immeuble_id: immeuble.id,
        nom: adresse,
        statut: 'en_cours',
      });
      if (!apiResult) throw new Error('Échec création campagne');
      const id_campagne = apiResult.id;

      const logementsPayload = locataires.map(l => ({
        numero: l.logement,
        etage: l.etage,
        surface: 50,
        typologie: l.typologie || 'T1',
        plancher_bas: l.plancherBas || 'dalle-béton',
        plancher_haut: l.plancherHaut || 'combles-perdus',
        position: l.position || 'intermediaire',
      }));
      const logementsCreated = await apiCampagneLogementsStore(id_campagne, logementsPayload);
      if (!logementsCreated) throw new Error('Échec création logements');

      const locatairesPayload = locataires.map((l, i) => {
        const parts = l.nom.trim().split(/\s+/);
        const prenom = parts[0] || '';
        const nom = parts.slice(1).join(' ') || parts[0] || '';
        return {
          logement_id: logementsCreated[i].id,
          nom,
          prenom,
          email: l.email,
          telephone: l.tel,
        };
      });
      const locatairesCreated = await apiCampagneLocatairesStore(id_campagne, locatairesPayload);
      if (!locatairesCreated) throw new Error('Échec création locataires');

      campaignId = id_campagne;
      const campaign = {
        id: id_campagne,
        id_campagne,
        adresse,
        nbLogements: locataires.length,
        statut: 'active',
        locataires: locataires.map((l, i) => ({
          ...l,
          id: logementsCreated[i]?.id || l.id,
          id_logement: logementsCreated[i]?.id || null,
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
    window.location.href = '/jours?id=' + campaignId;
  }

  submitCampagne();
});

/* ---------- MENU MOBILE ---------- */
$('#menuToggle').addEventListener('click', () => {
  $('#mainNav').classList.toggle('topbar__nav--open');
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
  APP.campaigns.length = 0;
  renderCampaignList();
  updateStats();
  toast('Déconnecté', 'info');
  window.location.href = '/auth';
});

/* ---------- INIT ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const token = getToken();
  if (!token) {
    window.location.href = '/auth';
    return;
  }
  showDashboard();
  chargerReferentiels().then(function () {
    setTimeout(verifierBranchementAPI, 1000);
  });
});
