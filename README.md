# 1. Kafi AG

<!-- ToC -->
- [1. Kafi AG](#1-kafi-ag)
- [2. Programme](#2-programme)
  - [2.1. Visual Studio Code installieren](#21-visual-studio-code-installieren)
  - [2.2. Git installieren (optional)](#22-git-installieren-optional)
- [3. Projekt herunterladen](#3-projekt-herunterladen)
  - [3.1. Option A: Git Clone](#31-option-a-git-clone)
  - [3.2. Option B: ZIP Download](#32-option-b-zip-download)
  - [3.3. Im Browser öffnen](#33-im-browser-öffnen)
- [4. Lokale Entwicklung ohne Docker](#4-lokale-entwicklung-ohne-docker)
<!-- /ToC -->
<br>

---

# 2. Programme

Die einfachste Möglichkeit, das Projekt zu starten:

## 2.1. Visual Studio Code installieren
- Falls noch nicht vorhanden:<br>
👉 [https://code.visualstudio.com/](https://code.visualstudio.com/)

## 2.2. Git installieren (optional)
- Lade Git herunter:<br>
👉 [https://git-scm.com/downloads](https://git-scm.com/downloads)
- Installiere Git, falls du den Code direkt von GitHub klonen möchtest.

<br>

---

# 3. Projekt herunterladen

## 3.1. Option A: Git Clone
- Befehl in VS Code Terminal eingeben:
```ps1
git clone https://github.com/YosatoW/kafi_AG.git
code kafi_ag
```

## 3.2. Option B: ZIP Download
- Lade das Projekt als ZIP von GitHub herunter.
- Entpacke es in einen Ordner deiner Wahl.

<br>

---

## 3.3. Im Browser öffnen
- [http://localhost:8000](http://localhost:80)
- [http://localhost:8000/sim](http://localhost:8000/sim)

<br>

---

# 4. Lokale Entwicklung ohne Docker
```ps1
npm install
npm run dev
```
