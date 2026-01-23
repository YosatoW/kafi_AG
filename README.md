# 1. Kafi AG

<!-- ToC -->
- [1. Kafi AG](#1-kafi-ag)
- [3. Programme](#3-programme)
  - [3.1. Visual Studio Code installieren](#31-visual-studio-code-installieren)
  - [3.3. Git installieren (optional)](#33-git-installieren-optional)
- [4. Projekt herunterladen](#4-projekt-herunterladen)
  - [4.1. Option A: Git Clone](#41-option-a-git-clone)
  - [4.2. Option B: ZIP Download](#42-option-b-zip-download)
- [5. .env Datei (Konfiguration)](#5-env-datei-konfiguration)
- [6. Projektstruktur](#6-projektstruktur)
- [7. überprüfen, ob Port 80 frei ist](#7-überprüfen-ob-port-80-frei-ist)
  - [7.1. Windows](#71-windows)
  - [7.2. Linux/macOS](#72-linuxmacos)
  - [7.3. Port ändern](#73-port-ändern)
- [8. Starten](#8-starten)
  - [8.1. Container bauen und starten](#81-container-bauen-und-starten)
  - [8.2. Im Browser öffnen](#82-im-browser-öffnen)
- [9. Lokale Entwicklung ohne Docker (optional)](#9-lokale-entwicklung-ohne-docker-optional)
<!-- /ToC -->
<br>

---

# 3. Programme

Die einfachste Möglichkeit, das Projekt zu starten:

## 3.1. Visual Studio Code installieren
- Falls noch nicht vorhanden:<br>
👉 [https://code.visualstudio.com/](https://code.visualstudio.com/)
- Installiere und **starte Docker Desktop**

## 3.3. Git installieren (optional)
- Lade Git herunter:<br>
👉 [https://git-scm.com/downloads](https://git-scm.com/downloads)
- Installiere Git, falls du den Code direkt von GitHub klonen möchtest.

<br>

---

# 4. Projekt herunterladen

## 4.1. Option A: Git Clone
- Befehl in VS Code Terminal eingeben:
```ps1
git clone https://github.com/YosatoW/kafi_AG
code 7th-heaven
```

## 4.2. Option B: ZIP Download
- Lade das Projekt als ZIP von GitHub herunter.
- Entpacke es in einen Ordner deiner Wahl.

<br>

---

# 5. .env Datei (Konfiguration)
Bevor du die Anwendung startest (lokal oder per Docker),
muss im Projekt-Root eine Datei namens `.env` erstellt werden.

Diese enthält deine grundlegenden Umgebungsvariablen, z. B.:
```env
DATABASE_URL=postgresql://[POSTGRES_USER]:[POSTGRES_PASSWORD]@webengineering:5432/[POSTGRES_DB]
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
```

<br>

---

# 6. Projektstruktur
```csharp
7th-heaven/
├── views/                # Pug Templates
│   ├── layout.pug
│   ├── partials/
│   └── page/
├── public/               # Statische Dateien (CSS, JS, Bilder)
├── src/                  # API / Datenbank / Utils
├── server.js             # Hauptserver
├── docker-compose.yml
├── Dockerfile
├── README.md
└── .env                  # Konfigurations Datei
```

<br>

---

# 7. überprüfen, ob Port 80 frei ist
## 7.1. Windows
1. Eingabeaufforderung (CMD oder PowerShell) öffnen
2. Befhel eingeben:
```ps1
netstat -aon | find ":80"
```
3. Wenn du eine Zeile siehst wie:
```nginx
TCP    0.0.0.0:80    0.0.0.0:0    LISTENING    1234
```
Dann ist **Port 80** belegt, und der Prozess **PID 1234** nutz ihn.

## 7.2. Linux/macOS
1. Terminal öffnen
2. Variante 1 - mit `ss` (empfohlen, moderner):
```ps1
sudo ss -tuln | grep ':80'
```

3. Variante 1 - mit `netstat`:
```ps1
sudo netstat -tuln | grep ':80'
```

4. Variante 1 - mit `lsof`:
```ps1
sudo lsof -i :80
```
- wenn du Prozesse siehst, nutzt jemand Port 80
- wenn nichts zurückkommt, ist der Port frei.

## 7.3. Port ändern
- Ändere in `docker-compose.yml` den `load-balancer` auf ein freie Port
- z.B. in  `8080:80` oder andere freie Ports.

<br>

---

# 8. Starten
## 8.1. Container bauen und starten
```ps1
docker compose up -d --build
```

## 8.2. Im Browser öffnen
- [http://localhost:80](http://localhost:80)
- [http://localhost:80/api/contact](http://localhost:80/api/contact)
- [http://localhost:80/api/newsletter](http://localhost:80/api/newsletter)

Port anpassen wenn nötig.

<br>

---

# 9. Lokale Entwicklung ohne Docker (optional)
```ps1
npm install
npm run dev
```
