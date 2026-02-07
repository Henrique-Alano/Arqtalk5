/**
 * Firestore — mesmo backend do app: public_discoveries (feed) e preliterary_comments.
 */

const ArqtalkFirestore = (function() {
  function getFirestore() {
    return typeof firebase !== 'undefined' && firebase.firestore ? firebase.firestore() : null;
  }

  /** Lista public_discoveries (feed comunidade), ordenado por createdAt desc. */
  function getPublicDiscoveries(limitCount) {
    const db = getFirestore();
    if (!db) return Promise.resolve([]);
    var ref = db.collection('public_discoveries').orderBy('createdAt', 'desc');
    if (limitCount) ref = ref.limit(limitCount);
    return ref.get().then(function(snapshot) {
      return snapshot.docs.map(function(doc) {
        var d = doc.data();
        return {
          id: doc.id,
          title: d.title || '',
          description: d.description || null,
          siteName: d.siteName || null,
          authorId: d.authorId || null,
          authorName: d.authorName || null,
          category: d.category || null,
          latitude: d.latitude != null ? d.latitude : null,
          longitude: d.longitude != null ? d.longitude : null,
          createdAt: d.createdAt && d.createdAt.toDate ? d.createdAt.toDate() : null
        };
      });
    }).catch(function() { return []; });
  }

  /** Comentários da publicação (users/{authorId}/discoveries/{discoveryId}/comments). */
  function getCommentsForDiscovery(authorId, discoveryId) {
    const db = getFirestore();
    if (!db || !authorId || !discoveryId) return Promise.resolve([]);
    return db.collection('users').doc(authorId).collection('discoveries').doc(discoveryId).collection('comments')
      .orderBy('createdAt', 'asc')
      .get()
      .then(function(snapshot) {
        return snapshot.docs.map(function(doc) {
          var d = doc.data();
          return {
            id: doc.id,
            text: d.text || '',
            authorLabel: d.authorLabel || 'Participante',
            createdAt: d.createdAt && d.createdAt.toDate ? d.createdAt.toDate() : new Date()
          };
        });
      }).catch(function() { return []; });
  }

  /** Comentários do usuário atual na publicação (como no app: users/currentUser.uid/discoveries/{discoveryId}/comments). */
  function getMyCommentsForDiscovery(discoveryId) {
    const db = getFirestore();
    const auth = typeof ArqtalkAuth !== 'undefined' ? ArqtalkAuth.getAuth() : null;
    const uid = auth && auth.currentUser ? auth.currentUser.uid : null;
    if (!db || !uid || !discoveryId) return Promise.resolve([]);
    return db.collection('users').doc(uid).collection('discoveries').doc(discoveryId).collection('comments')
      .orderBy('createdAt', 'asc')
      .get()
      .then(function(snapshot) {
        return snapshot.docs.map(function(doc) {
          var d = doc.data();
          return {
            id: doc.id,
            text: d.text || '',
            authorLabel: d.authorLabel || 'Participante',
            createdAt: d.createdAt && d.createdAt.toDate ? d.createdAt.toDate() : new Date()
          };
        });
      }).catch(function() { return []; });
  }

  /** Fotos da descoberta (users/{authorId}/discoveries/{discoveryId}/photos — campo data em base64). */
  function getDiscoveryPhotos(authorId, discoveryId) {
    const db = getFirestore();
    if (!db || !authorId || !discoveryId) return Promise.resolve([]);
    return db.collection('users').doc(authorId).collection('discoveries').doc(discoveryId).collection('photos')
      .get()
      .then(function(snapshot) {
        var out = snapshot.docs.map(function(doc) {
          var d = doc.data();
          var b64 = d.data;
          if (typeof b64 !== 'string' || !b64) return null;
          return { id: doc.id, src: 'data:image/jpeg;base64,' + b64 };
        }).filter(Boolean);
        out.sort(function(a, b) { return String(a.id).localeCompare(String(b.id), undefined, { numeric: true }); });
        return out.map(function(x) { return x.src; });
      }).catch(function() { return []; });
  }

  /** Adiciona comentário em uma publicação (users/{currentUser.uid}/discoveries/{discoveryId}/comments). */
  function addCommentToDiscovery(discoveryId, text, authorLabel) {
    const db = getFirestore();
    const auth = ArqtalkAuth.getAuth();
    if (!db || !auth || !auth.currentUser) return Promise.resolve(false);
    var user = auth.currentUser;
    var ref = db.collection('users').doc(user.uid).collection('discoveries').doc(discoveryId).collection('comments');
    var label = (authorLabel && authorLabel.trim()) ? authorLabel.trim() : (ArqtalkAuth.getDisplayName(user) || user.email || 'Participante');
    return ref.add({
      text: (text || '').trim(),
      authorId: user.uid,
      authorLabel: label,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(function() { return true; }).catch(function() { return false; });
  }

  // --- Preliterary comments (site) ---
  function getPreliteraryComments() {
    const db = getFirestore();
    if (!db) return Promise.resolve([]);
    return db.collection('preliterary_comments').orderBy('createdAt', 'desc').get()
      .then(function(snapshot) {
        return snapshot.docs.map(function(doc) {
          var d = doc.data();
          return {
            id: doc.id,
            author: d.author || 'Anônimo',
            text: d.text || '',
            type: d.type || 'question',
            depth: d.depth != null ? d.depth : 0,
            createdAt: d.createdAt && d.createdAt.toDate ? d.createdAt.toDate() : new Date()
          };
        });
      }).catch(function() { return []; });
  }

  function addPreliteraryComment(author, text, type, depth) {
    const db = getFirestore();
    const auth = ArqtalkAuth.getAuth();
    if (!db || !auth || !auth.currentUser) return Promise.resolve(null);
    return db.collection('preliterary_comments').add({
      author: (author || '').trim() || (ArqtalkAuth.getDisplayName(auth.currentUser) || auth.currentUser.email || 'Anônimo'),
      text: (text || '').trim(),
      type: type || 'question',
      depth: depth != null ? depth : 0,
      authorId: auth.currentUser.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(function(docRef) { return docRef.id; }).catch(function() { return null; });
  }

  function deletePreliteraryComment(commentId) {
    const db = getFirestore();
    const auth = ArqtalkAuth.getAuth();
    if (!db || !auth || !auth.currentUser) return Promise.resolve(false);
    return db.collection('preliterary_comments').doc(commentId).delete().then(function() { return true; }).catch(function() { return false; });
  }

  /** Listener em tempo real para comentários pré-literários. */
  function onPreliteraryComments(callback) {
    const db = getFirestore();
    if (!db) { if (callback) callback([]); return function() {}; }
    var unsubscribe = db.collection('preliterary_comments').orderBy('createdAt', 'desc').onSnapshot(
      function(snapshot) {
        var list = snapshot.docs.map(function(doc) {
          var d = doc.data();
          return {
            id: doc.id,
            author: d.author || 'Anônimo',
            text: d.text || '',
            type: d.type || 'question',
            depth: d.depth != null ? d.depth : 0,
            createdAt: d.createdAt && d.createdAt.toDate ? d.createdAt.toDate() : new Date()
          };
        });
        if (callback) callback(list);
      },
      function() { if (callback) callback([]); }
    );
    return function() { unsubscribe(); };
  }

  return {
    getFirestore: getFirestore,
    getPublicDiscoveries: getPublicDiscoveries,
    getCommentsForDiscovery: getCommentsForDiscovery,
    getMyCommentsForDiscovery: getMyCommentsForDiscovery,
    getDiscoveryPhotos: getDiscoveryPhotos,
    addCommentToDiscovery: addCommentToDiscovery,
    getPreliteraryComments: getPreliteraryComments,
    addPreliteraryComment: addPreliteraryComment,
    deletePreliteraryComment: deletePreliteraryComment,
    onPreliteraryComments: onPreliteraryComments
  };
})();
