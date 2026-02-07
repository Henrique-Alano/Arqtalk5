# Firebase no site Arqtalk5

O site usa o **mesmo projeto Firebase** do app Arqtalk (Flutter): Auth + Firestore.

## 1. App Web no Firebase Console

Se o projeto ainda não tiver um app **Web**:

1. Abra [Firebase Console](https://console.firebase.google.com/) → projeto **arqtalk-4ed8b**.
2. Em **Project settings** (ícone de engrenagem) → **Your apps**, clique em **Add app** → **Web** (</>).
3. Registre um nome (ex.: `arqtalk-site`) e, se quiser, marque **Firebase Hosting** (opcional).
4. Copie o objeto `firebaseConfig` gerado e atualize **`js/firebase-config.js`** com os valores corretos, em especial o **`appId`** (formato `1:752891977907:web:xxxxxxxx`).

## 2. Domínio autorizado (Auth)

O site é publicado no **GitHub Pages** com o domínio **arqtalk.com.br** (arquivo `CNAME`). Para o login (e-mail/senha e Google) funcionar no site:

1. No Firebase Console → **Authentication** → **Settings** → **Authorized domains**.
2. Adicione **`arqtalk.com.br`** (e, se usar, `seu-usuario.github.io`).
3. Sem isso, o Firebase bloqueia o login nesse domínio.

## 3. Regras Firestore

As regras em **`firebase/firestore.rules`** (no repositório do app) já incluem a coleção **`preliterary_comments`** (leitura/escrita por usuários autenticados). Faça o deploy:

```bash
cd /caminho/para/arqtalk
firebase deploy --only firestore:rules
```

## 4. O que o site usa

- **Auth:** login com e-mail/senha e Google (popup/One Tap). Sessão compartilhada com o app.
- **Firestore:**  
  - **`public_discoveries`** – feed de descobertas (leitura; mesmo dado do app).  
  - **`preliterary_comments`** – comentários da seção Pré-literária (leitura/escrita no site).
- **Páginas:** `loginarq.html` (login), `index.html`, `equipe.html`, `prelit.html`, `subaqua.html`, `zoo.html` (auth via `auth-ui.js`).

## 5. Arquivos JS do site

- `js/firebase-config.js` – config e `initializeApp`.
- `js/firebase-auth.js` – helpers de Auth (login, logout, `onAuthStateChanged`).
- `js/firebase-firestore.js` – Firestore (feed, comentários pré-literária).
- `js/auth-ui.js` – atualiza botão “Login” e perfil na navbar conforme o Auth.

---

## 6. Publicação do site (GitHub Pages)

O site já é publicado pelo **GitHub Pages** com o domínio **arqtalk.com.br** (configurado no arquivo `CNAME`).  
**Se você fez push e o site não atualizou:** o Pages publica só **uma** branch (geralmente `main`). Veja **[GITHUB-PAGES.md](GITHUB-PAGES.md)** para publicar as mudanças (merge na branch do Pages ou trocar a branch no Settings).

- **Repositório:** a branch/publicação usada para o Pages (ex.: `main` ou `gh-pages`) deve conter os arquivos do site (HTML, CSS, JS, `images/`, etc.).
- **Domínio:** o DNS do domínio comprado deve apontar para o GitHub Pages conforme a [documentação do GitHub](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site).
- **Firebase Auth:** em **Authentication → Settings → Authorized domains** do projeto `arqtalk-4ed8b`, inclua **`arqtalk.com.br`** para o login funcionar no site publicado.

Opcionalmente, existe `firebase.json` na pasta do site para usar **Firebase Hosting** no futuro; a publicação atual é via GitHub Pages.
