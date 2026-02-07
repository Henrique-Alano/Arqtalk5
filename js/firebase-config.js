/**
 * Firebase config — mesmo projeto do app Arqtalk (Flutter).
 * Se o projeto não tiver um app Web, adicione em Firebase Console > Project settings > Your apps > Web app
 * e substitua os valores abaixo pelos do snippet gerado.
 */
const firebaseConfig = {
  apiKey: "AIzaSyBibRakKiiBwbbToNpb9HaB2rNeg3iYMvw",
  authDomain: "arqtalk-4ed8b.firebaseapp.com",
  projectId: "arqtalk-4ed8b",
  storageBucket: "arqtalk-4ed8b.firebasestorage.app",
  messagingSenderId: "752891977907",
  appId: "1:752891977907:web:652139d364d6aff23cd0c6",
  measurementId: "G-H83TGCC978"
};

// Inicialização (compat SDK). Se o projeto não tiver app Web, adicione em Firebase Console e substitua appId.
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
