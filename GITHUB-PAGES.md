# Publicar mudanças no GitHub Pages (arqtalk.com.br)

O site é servido pelo **GitHub Pages** a partir de **uma única branch**. Se você fez commit e push em outra branch, o site não atualiza até que essa branch seja a que o Pages usa ou até que as mudanças estejam na branch configurada.

## 1. Ver qual branch o Pages usa

1. Abra o repositório: **https://github.com/Henrique-Alano/Arqtalk5**
2. **Settings** → **Pages** (menu lateral).
3. Em **Build and deployment** → **Source**, veja qual branch está selecionada (ex.: `main`).

## 2. Fazer o site atualizar

**Opção A – O Pages está em `main` (comum)**  
Suas mudanças precisam estar na branch `main`:

```bash
cd /caminho/para/Arqtalk5
git checkout main
git pull origin main
git merge guilherme/firebase    # (ou a branch onde você fez as mudanças)
git push origin main
```

Depois de alguns minutos, o site em https://arqtalk.com.br deve refletir as mudanças.

**Opção B – Usar sua branch no Pages**  
Se quiser que o Pages sirva a branch `guilherme/firebase`:

1. No GitHub: **Settings** → **Pages**.
2. Em **Source**, escolha **Deploy from a branch**.
3. Em **Branch**, selecione `guilherme/firebase` e **/ (root)**.
4. Salve. O site passará a ser gerado a partir dessa branch.

## 3. Cache e atraso

- O GitHub leva **1–2 minutos** (às vezes mais) para atualizar o Pages após o push.
- Se ainda vir a versão antiga: **atualização forçada** (Ctrl+F5 ou Cmd+Shift+R) ou abra em **aba anônima** para evitar cache do navegador.

## 4. Conferir o que está na branch publicada

No GitHub, abra a branch que está em **Pages** (ex.: `main`) e confira se `index.html`, `comunidade.html`, etc. estão atualizados com seu último commit.
