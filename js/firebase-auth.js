/**
 * Auth com Firebase — sessão única com o app.
 * Uso: incluir após firebase-config.js e os SDKs (app, auth).
 */

const ArqtalkAuth = (function() {
  let authUnsubscribe = null;

  function getAuth() {
    return typeof firebase !== 'undefined' && firebase.auth ? firebase.auth() : null;
  }

  function getCurrentUser() {
    const auth = getAuth();
    return auth ? auth.currentUser : null;
  }

  /** Nome para exibição: displayName ou email. */
  function getDisplayName(user) {
    if (!user) return null;
    if (user.displayName && user.displayName.trim()) return user.displayName.trim();
    return user.email || null;
  }

  /** Iniciais para avatar (2 letras). */
  function getInitials(user) {
    if (!user) return '?';
    const name = getDisplayName(user) || user.email || '';
    if (name.length >= 2) {
      const parts = name.split(/\s+/).filter(Boolean);
      if (parts.length >= 2) {
        const a = parts[0][0] || '';
        const b = parts[parts.length - 1][0] || '';
        return (a + b).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (name.length === 1) return (name + name).toUpperCase();
    if (user.email && user.email.length >= 2) return user.email.substring(0, 2).toUpperCase();
    return '?';
  }

  /** Objeto no formato antigo do localStorage (arqtalk_user) para compatibilidade. */
  function userToLegacy(user) {
    if (!user) return null;
    return {
      uid: user.uid,
      email: user.email || '',
      name: getDisplayName(user),
      photo: user.photoURL || null,
      initials: getInitials(user),
      provider: user.providerData && user.providerData[0] ? user.providerData[0].providerId : 'password'
    };
  }

  /**
   * Registra listener de mudança de auth. Chama callback(user) quando logado, callback(null) quando deslogado.
   * Retorna função para cancelar o listener.
   */
  function onAuthStateChanged(callback) {
    const auth = getAuth();
    if (!auth) {
      if (callback) callback(null);
      return function() {};
    }
    authUnsubscribe = auth.onAuthStateChanged(function(user) {
      if (callback) callback(user);
    });
    return function() {
      if (authUnsubscribe) authUnsubscribe();
      authUnsubscribe = null;
    };
  }

  /** Login com e-mail e senha. Retorna Promise que resolve com user ou rejeita com erro. */
  function signInWithEmailAndPassword(email, password) {
    const auth = getAuth();
    if (!auth) return Promise.reject(new Error('Firebase Auth não disponível'));
    return auth.signInWithEmailAndPassword(email, password).then(function(res) { return res.user; });
  }

  /** Registro com e-mail e senha. Retorna Promise que resolve com user ou rejeita com erro. */
  function createUserWithEmailAndPassword(email, password, displayName) {
    const auth = getAuth();
    if (!auth) return Promise.reject(new Error('Firebase Auth não disponível'));
    return auth.createUserWithEmailAndPassword(email, password).then(function(res) {
      var user = res.user;
      if (displayName && user.updateProfile) {
        return user.updateProfile({ displayName: displayName }).then(function() { return user; });
      }
      return user;
    });
  }

  /** Login com Google (popup). Retorna Promise que resolve com user ou rejeita com erro. */
  function signInWithGoogle() {
    const auth = getAuth();
    if (!auth) return Promise.reject(new Error('Firebase Auth não disponível'));
    var provider = new firebase.auth.GoogleAuthProvider();
    return auth.signInWithPopup(provider).then(function(res) { return res.user; });
  }

  /** Logout. */
  function signOut() {
    const auth = getAuth();
    if (auth) return auth.signOut();
    return Promise.resolve();
  }

  return {
    getAuth: getAuth,
    getCurrentUser: getCurrentUser,
    getDisplayName: getDisplayName,
    getInitials: getInitials,
    userToLegacy: userToLegacy,
    onAuthStateChanged: onAuthStateChanged,
    signInWithEmailAndPassword: signInWithEmailAndPassword,
    createUserWithEmailAndPassword: createUserWithEmailAndPassword,
    signInWithGoogle: signInWithGoogle,
    signOut: signOut
  };
})();
