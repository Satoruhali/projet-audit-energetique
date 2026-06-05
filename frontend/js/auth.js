/* =============================================
   Planif'Audit — Auth Page
   ============================================= */

/* ---------- AUTH UI ---------- */
function showAuth() {
  const user = getUser();
  updateTopbarUser(user);
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
    window.location.href = '/dashboard';
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
    window.location.href = '/dashboard';
  } else {
    errorEl.textContent = 'Inscription réussie, mais connexion automatique impossible. Veuillez vous connecter.';
    document.querySelector('[data-auth-tab="login"]').click();
  }
});

/* ---------- INIT ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const token = getToken();
  if (token) {
    window.location.href = '/dashboard';
    return;
  }
  showAuth();
});
