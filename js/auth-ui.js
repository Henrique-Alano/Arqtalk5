/**
 * Atualiza login/perfil na navbar com base no Firebase Auth.
 * Espera elementos com id: loginBtn, userProfile, userName, userAvatar.
 */
(function() {
  function init() {
    if (typeof ArqtalkAuth === 'undefined') return;
    ArqtalkAuth.onAuthStateChanged(function(user) {
      var loginBtn = document.getElementById('loginBtn');
      var userProfile = document.getElementById('userProfile');
      var userName = document.getElementById('userName');
      var userAvatar = document.getElementById('userAvatar');
      if (user) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (userProfile) {
          userProfile.style.display = 'flex';
          userProfile.onclick = function() {
            if (confirm('Deseja sair da sua conta?')) {
              ArqtalkAuth.signOut().then(function() {
                window.location.reload();
              });
            }
          };
        }
        if (userName) userName.textContent = ArqtalkAuth.getDisplayName(user) || user.email || '';
        if (userAvatar) userAvatar.textContent = ArqtalkAuth.getInitials(user);
      } else {
        if (loginBtn) loginBtn.style.display = 'flex';
        if (userProfile) {
          userProfile.style.display = 'none';
          userProfile.onclick = null;
        }
      }
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
