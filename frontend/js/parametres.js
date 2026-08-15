/* =============================================
   Planif'Audit — Paramètres Page
   ============================================= */

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

async function chargerParametres() {
  const data = await apiParametresGet();
  if (!data) return;

  if (data.nom_entreprise) $('#nomEntreprise').value = data.nom_entreprise;
  $('#profilNom').value = data.nom || '';
  $('#profilEmail').value = data.email || '';

  if (data.logo_url) {
    const img = $('#logoPreview');
    img.src = data.logo_url;
    img.style.display = 'block';
    $('#logoPlaceholder').style.display = 'none';
  }

  if (data.smtp_host) $('#smtpHost').value = data.smtp_host;
  if (data.smtp_port) $('#smtpPort').value = data.smtp_port;
  if (data.smtp_user) $('#smtpUser').value = data.smtp_user;
  if (data.smtp_from) $('#smtpFrom').value = data.smtp_from;
  if (data.smtp_from_nom) $('#smtpFromNom').value = data.smtp_from_nom;

  $('#smtpStatus').textContent = data.smtp_configured
    ? 'Email : envoi via votre propre serveur SMTP.'
    : 'Email : envoi via le serveur SMTP par défaut.';
}

/* ---------- LOGO ---------- */
let fichierLogo = null;

$('#logoInput').addEventListener('change', (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  if (file.size > 500 * 1024) {
    toast('Fichier trop volumineux (maximum 500 Ko)', 'warning');
    $('#logoInput').value = '';
    return;
  }

  const types = ['image/jpeg', 'image/png', 'image/svg+xml'];
  if (!types.includes(file.type)) {
    toast('Type de fichier non autorisé (JPG, PNG ou SVG)', 'warning');
    $('#logoInput').value = '';
    return;
  }

  fichierLogo = file;
  const reader = new FileReader();
  reader.onload = () => {
    const img = $('#logoPreview');
    img.src = reader.result;
    img.style.display = 'block';
    $('#logoPlaceholder').style.display = 'none';
  };
  reader.readAsDataURL(file);
});

$('#logoUploadBtn').addEventListener('click', async () => {
  if (!fichierLogo) {
    toast('Sélectionnez d\'abord une image', 'warning');
    return;
  }
  const btn = $('#logoUploadBtn');
  btn.disabled = true; btn.textContent = 'Envoi…';
  const result = await apiParametresUpload(fichierLogo);
  btn.disabled = false; btn.textContent = 'Enregistrer le logo';

  if (result && result.error) {
    toast(result.error, 'error');
    return;
  }
  if (result && result.logo_url) {
    fichierLogo = null;
    $('#logoInput').value = '';
    toast('Logo enregistré', 'success');
    injecterBranding();
  }
});

/* ---------- INFOS ---------- */
$('#saveInfosBtn').addEventListener('click', async () => {
  const nomEntreprise = $('#nomEntreprise').value.trim();
  const btn = $('#saveInfosBtn');
  btn.disabled = true; btn.textContent = 'Enregistrement…';
  const result = await apiParametresUpdate({ nomEntreprise });
  btn.disabled = false; btn.textContent = 'Enregistrer';

  if (result && result.error) {
    toast(result.error, 'error');
    return;
  }
  toast('Paramètres enregistrés', 'success');
  injecterBranding();
});

/* ---------- SMTP ---------- */
$('#saveSmtpBtn').addEventListener('click', async () => {
  const btn = $('#saveSmtpBtn');
  const data = {
    host: $('#smtpHost').value.trim(),
    port: $('#smtpPort').value.trim(),
    user: $('#smtpUser').value.trim(),
    pass: $('#smtpPass').value,
    from: $('#smtpFrom').value.trim(),
    fromNom: $('#smtpFromNom').value.trim()
  };
  btn.disabled = true; btn.textContent = 'Enregistrement…';
  const result = await apiParametresSmtpSave(data);
  btn.disabled = false; btn.textContent = 'Enregistrer';

  if (result && result.error) {
    toast(result.error, 'error');
    return;
  }
  $('#smtpPass').value = '';
  $('#smtpTestResult').textContent = '';
  toast('Configuration SMTP enregistrée', 'success');
  $('#smtpStatus').textContent = result.smtp_configured
    ? 'Email : envoi via votre propre serveur SMTP.'
    : 'Email : envoi via le serveur SMTP par défaut.';
});

$('#testSmtpBtn').addEventListener('click', async () => {
  const btn = $('#testSmtpBtn');
  const resultEl = $('#smtpTestResult');
  btn.disabled = true; btn.textContent = 'Envoi du test…';
  resultEl.textContent = '';
  const result = await apiParametresSmtpTest();
  btn.disabled = false; btn.textContent = 'Tester l\'envoi';

  if (result && result.success) {
    resultEl.textContent = result.message;
    resultEl.style.color = '#16a34a';
  } else {
    resultEl.textContent = (result && result.error) || 'Échec de l\'envoi du test';
    resultEl.style.color = '#dc2626';
  }
});

/* ---------- MENU MOBILE ---------- */
$('#menuToggle').addEventListener('click', () => {
  $('#mainNav').classList.toggle('topbar__nav--open');
});

/* ---------- LOGOUT ---------- */
$('#logoutBtn').addEventListener('click', () => {
  clearToken(); clearUser();
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
  updateTopbarUser(getUser());
  injecterBranding();
  chargerParametres();
});
