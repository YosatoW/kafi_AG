<!-- ToC -->
- [1. KAFI AG | FEHLER- UND STATUSLISTE](#1-kafi-ag--fehler--und-statusliste)
  - [1.1. KRITISCHE HARDWARE-FEHLER  (SYSTEM STOPPT)](#11-kritische-hardware-fehler--system-stoppt)
  - [1.2. SOFTWARE-FEHLER (STATE MACHINE / STEUERUNG)](#12-software-fehler-state-machine--steuerung)
  - [1.3. BENUTZERFEHLER (NICHT KRITISCH)](#13-benutzerfehler-nicht-kritisch)
  - [1.4. WARNUNGEN (NICHT SYSTEMKRITISCH)](#14-warnungen-nicht-systemkritisch)
  - [1.5. INFOCODES (KEINE FEHLER)](#15-infocodes-keine-fehler)
  - [1.6. SUPERUSER – CHECKLISTE](#16-superuser--checkliste)
  - [1.7. TECHNIKER – EINSATZFÄLLE](#17-techniker--einsatzfälle)
<!-- /ToC -->
-----
# 1. KAFI AG | FEHLER- UND STATUSLISTE

## 1.1. KRITISCHE HARDWARE-FEHLER  (SYSTEM STOPPT)

CODE   | BESCHREIBUNG                      | SYMPTOME                               | SUPERUSER | TECHNIKER
-------|-----------------------------------|------------------------------------------|-----------|-----------
E01    | Wassertank leer                   | Keine Getränke                           | Tank füllen | Wenn Sensor defekt
E02    | Milch leer / Sensorfehler         | Milchgetränke deaktiviert                | Milch füllen | Sensor prüfen
E03    | Bohnen leer                       | Kaffee-Drinks grau                       | Bohnen nachfüllen | Mahlwerk prüfen
E04    | Schokolade leer                   | Schoko-Drinks grau                       | Schokolade füllen | Fördermechanik prüfen
E05    | Wasserpumpe Fehler                | Keine Förderung                          | Neustart | Pumpe/Sensor tauschen
E06    | Heizelement Fehler                | Getränke kalt                             | Neustart | Heizelement tauschen
E07    | Mahlwerk blockiert                | Kaffeeproduktion stoppt                  | Bohnen lockern | Mahlwerk tauschen
E08    | Tassen-Sensor Fehler              | Start blockiert                          | Sensor reinigen | Sensor tauschen
E09    | Münzeinheit blockiert             | Münzen akzeptiert nicht                  | Münzkanal reinigen | Münzprüfer tauschen
E10    | Münzrückgabe blockiert            | Rückgeld festgefahren                     | Öffnung reinigen | Mechanik tauschen

-----
## 1.2. SOFTWARE-FEHLER (STATE MACHINE / STEUERUNG)

CODE   | BESCHREIBUNG                      | SYMPTOME                               | SUPERUSER | TECHNIKER
-------|-----------------------------------|------------------------------------------|-----------|-----------
S01    | Ungültiger Zustand                | Bedienfeld reagiert nicht               | Neustart | Firmware prüfen
S02    | Brewing-Timeout                   | Zubereitung hängt                       | Neustart | Ursache im Heizblock
S03    | Payment Error                     | Preis/Inserted mismatch                  | Payment reset | Münzeinheit prüfen
S04    | Card-Payment Timeout              | Kartenleser bricht ab                   | Payment wiederholen | Leser prüfen
S05    | Touchscreen unresponsive          | Touch tot oder springt                   | Neustart | Display tauschen
S06    | LowStock-Mismatch                 | Drink bleibt grau trotz Zutaten          | Zutaten neu setzen | Systemprüfung

-----
## 1.3. BENUTZERFEHLER (NICHT KRITISCH)

CODE   | BESCHREIBUNG                      | SYMPTOME                               | SUPERUSER | TECHNIKER
-------|-----------------------------------|------------------------------------------|-----------|-----------
U01    | Tasse fehlt                       | Auto-Start blockiert                     | Tasse platzieren | -
U02    | Ungültige Münze                   | Münze fällt durch / wird abgewiesen      | Info für Kunde | -
U03    | Getränk nicht entnommen           | Gerät wartet                             | Tasse entnehmen | -
U04    | Mehrfachbedienung                 | Eingaben gesperrt                        | Nutzung erklären | -

-----
## 1.4. WARNUNGEN (NICHT SYSTEMKRITISCH)

CODE   | BESCHREIBUNG                      | SUPERUSER-AKTION                        | TECHNIKER
-------|-----------------------------------|------------------------------------------|-----------
W01    | Entkalkung fällig                 | Entkalkung durchführen                   | -
W02    | Mindestbestand unterschritten     | Zutaten nachfüllen                       | -
W03    | Reinigung notwendig               | Reinigungsprogramm starten               | -
W04    | Temperatur außerhalb Norm         | Neustart                                 | Sensor prüfen

-----
## 1.5. INFOCODES (KEINE FEHLER)

CODE   | BEDEUTUNG
-------|-----------------------------------------
I01    | Bereit
I02    | Zahlung läuft
I03    | Zubereitung läuft
I04    | Tassenentnahme erforderlich
I05    | Admin-Modus aktiv

-----
## 1.6. SUPERUSER – CHECKLISTE

✔ Zutaten auffüllen  
✔ Münzeinheit reinigen  
✔ Reinigung/Entkalkung  
✔ Machine-Settings anpassen  
✔ Drink-Rezepte anpassen  
✔ Simulation nutzen  

✖ Elektronik öffnen  
✖ Sensoren tauschen  
✖ Mechanik/Heizung zerlegen  
✖ Münzprüfer justieren  
✖ Firmware flashen  

-----
## 1.7. TECHNIKER – EINSATZFÄLLE

- Hardwaredefekt (E05–E10)
- Wiederkehrende Softwarefehler (S01–S03)
- Display-Ausfall
- Pumpen- / Heizungs-Probleme
- Wiederholte Temperaturschwankungen
- Sensor-Defekte (Tasse, Milch, Wasser)
- Mechanische Blockaden
