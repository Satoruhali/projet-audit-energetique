/* =============================================
   Planif'Audit — Detail Page
   ============================================= */

/* ---------- DÉTAIL CAMPAGNE ---------- */
async function showDetail(id) {
  let camp = APP.campaigns.find(c => String(c.id) === String(id));
  if (!camp) {
    const detail = await apiCampagneShow(id);
    if (detail) {
      const creneaux = detail.creneaux || [];
      camp = {
        id: detail.id,
        id_campagne: detail.id,
        adresse: detail.nom || 'Sans nom',
        nbLogements: (detail.logements && detail.logements.length) || 0,
        statut: detail.statut === 'en_cours' ? 'active' : 'termine',
        joursDisponibles: [],
        logements: (detail.logements || []).map(l => ({
          _id: l.id,
          numero: l.numero,
          etage: l.etage,
          typologie: l.typologie,
          plancher_bas: l.plancher_bas,
          plancher_haut: l.plancher_haut,
          position: l.position,
          selectionne_visite: l.selectionne_visite || false,
          locataire: l.locataire || null,
        })),
        locataires: (detail.locataires || []).map(l => {
          const logement = l.logement || l.logements?.[0] || {};
          const creneau = creneaux.find(c => String(c.locataire_id) === String(l.id));
          return {
            id: l.id,
            nom: l.nom || '',
            email: l.email || '',
            logement: logement.numero || l.numero || '',
            etage: logement.etage ?? l.etage ?? 0,
            etageLabel: (logement.etage ?? l.etage ?? 0) === 0 ? 'RDC' : (logement.etage ?? l.etage ?? 0) === -1 ? 'Sous-sol' : (logement.etage ?? l.etage ?? 0) + 'e',
            statut: creneau ? 'repondu' : 'attente',
            creneau: creneau ? {
              date: new Date(creneau.date_visite).toISOString().split('T')[0],
              debut: creneau.heure_debut,
              fin: creneau.heure_fin,
            } : null,
          };
        }),
      };
      if (detail.selection) {
        camp.selection = detail.selection;
      }
      APP.campaigns.push(camp);
    } else {
      window.location.href = '/dashboard';
      return;
    }
  }

  if ((!camp.locataires || camp.locataires.length === 0) && camp.id_campagne) {
    const detail = await apiCampagneShow(camp.id_campagne);
    if (detail) {
      camp.nbLogements = (detail.logements && detail.logements.length) || camp.nbLogements || 0;
      camp.logements = (detail.logements || []).map(l => ({
        _id: l.id,
        numero: l.numero,
        etage: l.etage,
        typologie: l.typologie,
        plancher_bas: l.plancher_bas,
        plancher_haut: l.plancher_haut,
        position: l.position,
        selectionne_visite: l.selectionne_visite || false,
        locataire: l.locataire || null,
      }));
      if (detail.selection) {
        camp.selection = detail.selection;
      }
      if (detail.locataires && detail.locataires.length > 0) {
        const creneaux = detail.creneaux || [];
        camp.locataires = detail.locataires.map(l => {
          const logement = l.logement || l.logements?.[0] || {};
          const creneau = creneaux.find(c => String(c.locataire_id) === String(l.id));
          return {
            id: l.id,
            nom: l.nom || '',
            email: l.email || '',
            logement: logement.numero || l.numero || '',
            etage: logement.etage ?? l.etage ?? 0,
            etageLabel: (logement.etage ?? l.etage ?? 0) === 0 ? 'RDC' : (logement.etage ?? l.etage ?? 0) === -1 ? 'Sous-sol' : (logement.etage ?? l.etage ?? 0) + 'e',
            statut: creneau ? 'repondu' : 'attente',
            creneau: creneau ? {
              date: new Date(creneau.date_visite).toISOString().split('T')[0],
              debut: creneau.heure_debut,
              fin: creneau.heure_fin,
            } : null,
          };
        });
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
  if (camp.id_campagne) {
    apiCampagneJoursLoad(camp.id_campagne).then(jours => {
      camp.joursDisponibles = jours;
      renderJoursDisponibles(camp);
      $('#detailSubtitle').textContent = `${jours.length} jours disponibles · ${camp.nbLogements} logements`;
    }).catch(() => {
      renderJoursDisponibles(camp);
    });
  } else {
    renderJoursDisponibles(camp);
  }
  renderEchantillonnage(camp);
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

  tbody.querySelectorAll('[data-relance]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const loc = camp.locataires.find(l => String(l.id) === btn.dataset.relance);
      if (!loc || !camp.id_campagne) return;
      btn.disabled = true;
      const result = await apiCampagneRelancer(camp.id_campagne);
      btn.disabled = false;
      if (result && !result.error) {
        const nb = result.total_envoyes || 0;
        toast(`Relance envoyée à ${loc.logement} (${nb} locataire(s) relancé(s))`, 'success');
        renderEmailHistory(camp);
      } else {
        toast('Erreur lors de la relance', 'warning');
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
        <a class="btn btn--sm btn--outline" href="/planning?id=${camp.id}">Voir</a>
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

$('#saveJoursBtn')?.addEventListener('click', async () => {
  const camp = APP.campaigns.find(c => String(c.id) === String(APP.currentCampaignId));
  if (!camp) return;

  const selected = [...$$('.jour-chip--selected')].map(chip => chip.dataset.date);

  if (selected.length === 0) {
    toast('Sélectionnez au moins un jour disponible', 'warning');
    return;
  }

  camp.joursDisponibles = selected;

  if (camp.id_campagne) {
    const result = await apiCampagneJoursSave(camp.id_campagne, selected);
    if (!result) {
      toast('Impossible de sauvegarder les jours sur le serveur, mais ils sont enregistrés localement', 'warning');
    } else {
      toast(`Jours disponibles mis à jour (${selected.length} jour(s))`, 'success');
    }
  } else {
    toast(`Jours disponibles mis à jour (${selected.length} jour(s))`, 'success');
  }

  const container = $('#joursDisponiblesContainer');
  if (container) {
    const allChips = [...container.querySelectorAll('.jour-chip')];
    const joursSet = new Set(selected);
    allChips.forEach(chip => {
      chip.classList.toggle('jour-chip--selected', joursSet.has(chip.dataset.date));
    });
  }
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
$('#backToDashboard').addEventListener('click', () => window.location.href = '/dashboard');

/* ---------- RELANCE MASSE ---------- */
$('#relanceMassBtn').addEventListener('click', async () => {
  const camp = APP.campaigns.find(c => String(c.id) === String(APP.currentCampaignId));
  if (!camp || !camp.id_campagne) return;
  const btn = $('#relanceMassBtn');
  btn.disabled = true;
  btn.textContent = 'Envoi en cours…';
  const result = await apiCampagneRelancer(camp.id_campagne);
  btn.disabled = false;
  btn.textContent = '📧 Relancer tous les non-répondants';
  if (result && !result.error) {
    const nb = result.total_envoyes || 0;
    toast(`${nb} relance(s) envoyée(s)`, 'success');
    renderEmailHistory(camp);
  } else {
    toast('Erreur lors de la relance', 'warning');
  }
});

/* ---------- GÉNÉRER LIENS ---------- */
$('#genLinksBtn').addEventListener('click', () => {
  const camp = APP.campaigns.find(c => String(c.id) === String(APP.currentCampaignId));
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

/* ---------- ÉCHANTILLONNAGE ---------- */
function renderEchantillonnage(camp) {
  const hasSelection = camp.selection && camp.selection.date_selection;
  const hasSelectedLogements = camp.logements && camp.logements.some(l => l.selectionne_visite);

  const actionsCard = $('#selectionActionsCard');
  const seuilCard = $('#selectionSeuilCard');
  const couvCard = $('#selectionCouvertureCard');
  const listCard = $('#selectionListCard');
  const emailSendCard = $('#emailSendCard');

  if (!actionsCard) return;

  if (hasSelection || hasSelectedLogements) {
    actionsCard.style.display = 'none';
    seuilCard.style.display = 'block';
    couvCard.style.display = 'block';
    listCard.style.display = 'block';
    if (emailSendCard) emailSendCard.style.display = 'block';

    const s = camp.selection;
    if (s) {
      $('#seuilRequis').textContent = s.seuil_requis || 0;
      $('#seuilObtenu').textContent = s.seuil_obtenu || 0;

      const d = new Date(s.date_selection);
      const dateStr = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      $('#selectionDateInfo').textContent = `Dernière sélection le ${dateStr}`;

      const complete = s.couvertureComplete;
      $('#couvertureStatus').textContent = complete
        ? '✅ Tous les critères sont couverts par l\'échantillon sélectionné.'
        : `⚠️ ${s.criteresManquants ? s.criteresManquants.length : 0} critère(s) non couvert(s) par l'échantillon.`;

      renderCouverture(s.couverture, s.criteresManquants || []);
    } else {
      $('#seuilRequis').textContent = '—';
      $('#seuilObtenu').textContent = '—';
      $('#selectionDateInfo').textContent = '';
      $('#couvertureStatus').textContent = 'Données de couverture non disponibles.';
    }

    renderSelectionnesListe(camp);
    renderEmailSection(camp);
    renderEmailHistory(camp);
  } else {
    actionsCard.style.display = 'block';
    seuilCard.style.display = 'none';
    couvCard.style.display = 'none';
    listCard.style.display = 'none';
    if (emailSendCard) emailSendCard.style.display = 'none';
    const emailHistoryCard = $('#emailHistoryCard');
    if (emailHistoryCard) emailHistoryCard.style.display = 'none';
  }
}

function renderCouverture(couverture, criteresManquants) {
  const container = $('#couvertureContainer');
  if (!container) return;

  const missingSet = new Set(criteresManquants);

  const groupes = [
    { titre: 'Typologies', items: couverture.typologies || [], prefix: 'typo:' },
    { titre: 'Planchers bas', items: couverture.planchersBas || [], prefix: 'pb:' },
    { titre: 'Planchers haut', items: couverture.planchersHaut || [], prefix: 'ph:' },
    { titre: 'Positions', items: couverture.positions || [], prefix: 'pos:' },
  ];

  container.innerHTML = groupes.map(g => `
    <div class="couverture-group">
      <div class="couverture-group__title">${g.titre}</div>
      <div class="couverture-grid">
        ${g.items.map(item => {
          const key = g.prefix + item;
          const isMissing = missingSet.has(key);
          return `<span class="couverture-chip ${isMissing ? 'couverture-chip--missing' : 'couverture-chip--covered'}">
            ${isMissing ? '⚠' : '✓'} ${item}
          </span>`;
        }).join('')}
        ${g.items.length === 0 ? '<span class="couverture-chip couverture-chip--empty">Aucun</span>' : ''}
      </div>
    </div>
  `).join('');
}

function renderSelectionnesListe(camp) {
  const tbody = $('#selectionList');
  const empty = $('#emptySelection');
  const badge = $('#selectionCountBadge');

  const logements = camp.logements || [];
  const selectionnes = logements.filter(l => l.selectionne_visite);

  if (selectionnes.length === 0) {
    tbody.innerHTML = '';
    if (empty) empty.style.display = 'block';
    if (badge) badge.textContent = '0';
    return;
  }

  if (empty) empty.style.display = 'none';
  if (badge) badge.textContent = selectionnes.length + ' sélectionné(s)';

  const etageOrder = { '-1': 0, '0': 1, '1': 2, '2': 3, '3': 4 };
  const sorted = [...selectionnes].sort((a, b) => (etageOrder[a.etage] || a.etage) - (etageOrder[b.etage] || b.etage));

  tbody.innerHTML = sorted.map(l => {
    const nomLoc = l.locataire ? (l.locataire.nom || '—') : '—';
    const etageLabel = l.etage === 0 ? 'RDC' : l.etage === -1 ? 'Sous-sol' : l.etage + 'e';
    return `<tr>
      <td><strong>${l.numero || l.logement || '—'}</strong></td>
      <td>${etageLabel}</td>
      <td>${l.typologie || '—'}</td>
      <td>${l.plancher_bas || '—'}</td>
      <td>${l.plancher_haut || '—'}</td>
      <td>${l.position || '—'}</td>
      <td>${nomLoc}</td>
    </tr>`;
  }).join('');
}

function renderEmailSection(camp) {
  const logements = camp.logements || [];
  const visites = logements.filter(l => l.selectionne_visite);
  const nonVisites = logements.filter(l => !l.selectionne_visite);

  const avecEmail = logements.filter(l => l.locataire && l.locataire.email);
  const visitesAvecEmail = visites.filter(l => l.locataire && l.locataire.email);
  const nonVisitesAvecEmail = nonVisites.filter(l => l.locataire && l.locataire.email);

  const info = $('#emailSendInfo');
  if (info) {
    if (avecEmail.length === 0) {
      info.textContent = 'Aucun locataire avec email dans cette campagne. L\'envoi est impossible.';
    } else {
      info.textContent = `${avecEmail.length} locataire(s) avec email · ${visitesAvecEmail.length} visite(s) programmée(s) · ${nonVisitesAvecEmail.length} sans visite.`;
    }
  }

  const visitesEl = $('#emailVisitesCount');
  const nonVisitesEl = $('#emailNonVisitesCount');
  if (visitesEl) visitesEl.textContent = visitesAvecEmail.length;
  if (nonVisitesEl) nonVisitesEl.textContent = nonVisitesAvecEmail.length;
}

function renderEmailHistory(camp) {
  const card = $('#emailHistoryCard');
  if (!card) return;

  if (!camp.id_campagne) {
    card.style.display = 'none';
    return;
  }

  apiCampagneEmailHistory(camp.id_campagne).then(emails => {
    if (emails.length === 0) {
      card.style.display = 'none';
      return;
    }
    card.style.display = 'block';

    const badge = $('#emailCountBadge');
    if (badge) badge.textContent = emails.length;

    const tbody = $('#emailHistoryList');
    const empty = $('#emptyEmailHistory');

    if (tbody) {
      tbody.innerHTML = emails.map(e => {
        const typeLabel = e.type === 'visite_programmee' ? 'Visite programmée' : e.type === 'pas_de_visite' ? 'Pas de visite' : e.type;
        const statutLabel = e.statut === 'envoye' ? '✓ Envoyé' : '✗ Échec';
        const statutClass = e.statut === 'envoye' ? 'status--repondu' : 'status--attente';
        const date = e.date_envoi ? new Date(e.date_envoi).toLocaleDateString('fr-FR', {
          day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        }) : '—';
        return `<tr>
          <td>${e.destinataire || '—'}</td>
          <td>${typeLabel}</td>
          <td><span class="status ${statutClass}">${statutLabel}</span></td>
          <td>${date}</td>
        </tr>`;
      }).join('');
    }

    if (empty) empty.style.display = 'none';
  }).catch(() => {
    card.style.display = 'none';
  });
}

$('#lancerSelectionBtn')?.addEventListener('click', async () => {
  const camp = APP.campaigns.find(c => String(c.id) === String(APP.currentCampaignId));
  if (!camp) return;

  if (!camp.id_campagne) {
    toast('API indisponible — sélection impossible en mode dégradé', 'warning');
    return;
  }

  const btn = $('#lancerSelectionBtn');
  btn.disabled = true;
  btn.textContent = 'Sélection en cours…';

  const result = await apiCampagneLancerSelection(camp.id_campagne);

  btn.disabled = false;
  btn.textContent = '🎯 Lancer la sélection';

  if (!result) {
    toast('Erreur lors du lancement de la sélection', 'warning');
    return;
  }

  camp.selection = {
    date_selection: new Date().toISOString(),
    seuil_requis: result.seuil.requis,
    seuil_obtenu: result.seuil.obtenu,
    couverture: result.couverture,
    couvertureComplete: result.couvertureComplete,
    criteresManquants: result.criteresManquants
  };

  if (camp.logements && result.selectionnes) {
    const selectedIds = new Set(result.selectionnes.filter(id => id != null).map(id => id.toString()));
    camp.logements.forEach(l => {
      const lid = (l._id || l.id || '').toString();
      l.selectionne_visite = selectedIds.has(lid);
    });
  }

  toast(result.message || 'Sélection terminée', 'success');
  renderEchantillonnage(camp);
});

$('#envoyerEmailsBtn')?.addEventListener('click', async () => {
  const camp = APP.campaigns.find(c => String(c.id) === String(APP.currentCampaignId));
  if (!camp) return;

  if (!camp.id_campagne) {
    toast('API indisponible — envoi impossible en mode dégradé', 'warning');
    return;
  }

  const btn = $('#envoyerEmailsBtn');
  btn.disabled = true;
  btn.textContent = 'Envoi en cours…';

  const result = await apiCampagneEnvoyerEmails(camp.id_campagne);

  btn.disabled = false;
  btn.textContent = '✉️ Envoyer les emails';

  if (!result || result.error) {
    toast(result?.error || 'Erreur lors de l\'envoi des emails', 'warning');
    return;
  }

  toast(result.message || `${result.total_envoyes} email(s) envoyé(s)`, 'success');
  renderEmailHistory(camp);
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

/* ---------- MENU MOBILE ---------- */
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

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (id) {
    APP.currentCampaignId = id;
    showDetail(id);
  } else {
    window.location.href = '/dashboard';
  }
});
