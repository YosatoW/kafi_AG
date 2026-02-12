<!-- ToC -->
- [1. KAFI AG | FEHLER- UND STATUSLISTE](#1-kafi-ag--fehler--und-statusliste)
  - [1.1. HARDWARE-FEHLER](#11-hardware-fehler)
  - [1.2. BENUTZERFEHLER (NICHT KRITISCH)](#12-benutzerfehler-nicht-kritisch)
  - [1.3. WARNUNGEN (NICHT SYSTEMKRITISCH)](#13-warnungen-nicht-systemkritisch)
<!-- /ToC -->
-----
# 1. KAFI AG | FEHLER- UND STATUSLISTE

## 1.1. HARDWARE-FEHLER

CODE   | BESCHREIBUNG                        | SYMPTOME                                 | SUPERUSER           | TECHNIKER
-------|-------------------------------------|------------------------------------------|---------------------|-----------
A01.1  | Bohnen1 Mind. unterschritten        | Warnhinweis                              | Bohnen1 füllen      | -
A01.2  | Bohnen2 Mind. unterschritten        | Warnhinweis                              | Bohnen2 füllen      | -
A02    | Milch Mind. unterschritten          | Warnhinweis                              | Milch füllen        | -
A03    | Schokolade Mind. unterschritten     | Warnhinweis                              | Schokolade füllen   | -
A04.1  | Bohnen1 Bestand < benötigt Menge    | Kaffee-Drinks1 grau                      | Bohnen1 füllen      | -
A04.2  | Bohnen1 Bestand < benötigt Menge    | Kaffee-Drinks2 grau                      | Bohnen2 füllen      | -
A05    | Milch Bestand < benötigt Menge      | Milchgetränke grau                       | Milch füllen        | -
A06    | Schokolade Bestand < benötigt Menge | Schoko-Drinks grau                       | Milch füllen        | -
A07.1  | Bohnen1 Sensorfehler                | Kaffee-Drinks1 grau                      | -                   | Sensor
A07.2  | Bohnen2 Sensorfehler                | Kaffee-Drinks1 grau                      | -                   | Sensor
A08    | Milch Sensorfehler                  | Milchgetränke grau                       | -                   | Sensor
A09    | Schokolade Sensorfehler             | Schoko-Drinks grau                       | -                   | Sensor
A10    | Wasserpumpe Fehler                  | Keine Förderung                          | Neustart            | Pumpe/Sensor tauschen
A11    | Heizelement Fehler                  | Getränke kalt                            | Neustart            | Heizelement tauschen
A12    | Mahlwerk blockiert                  | Kaffeeproduktion stoppt                  | Bohnen lockern      | Mahlwerk tauschen
A13    | Tassen-Sensor Fehler                | Start blockiert                          | Sensor reinigen     | Sensor tauschen
A14    | Münzeinheit blockiert               | Münzen akzeptiert nicht                  | Münzkanal reinigen  | Münzprüfer tauschen
A15    | Münzrückgabe blockiert              | Rückgeld festgefahren                    | Öffnung reinigen    | Mechanik tauschen

-----
## 1.2. BENUTZERFEHLER (NICHT KRITISCH)

CODE   | BESCHREIBUNG                        | SYMPTOME                                 | SUPERUSER           | TECHNIKER
-------|-------------------------------------|------------------------------------------|---------------------|-----------
U01    | Tasse fehlt                         | Auto-Start blockiert                     | Tasse platzieren    | -
U02    | Ungültige Münze                     | Münze fällt durch / wird abgewiesen      | Info für Kunde      | -
U03    | Getränk nicht entnommen             | Gerät wartet                             | Tasse entnehmen     | -
U04    | Mehrfachbedienung                   | Eingaben gesperrt                        | Nutzung erklären    | -

-----
## 1.3. WARNUNGEN (NICHT SYSTEMKRITISCH)

CODE   | BESCHREIBUNG                        | SUPERUSER-AKTION                         | TECHNIKER
-------|-------------------------------------|------------------------------------------|-----------
W01    | Entkalkung fällig                   | Entkalkung durchführen                   | -
W02    | Mindestbestand unterschritten       | Zutaten nachfüllen                       | -
W03    | Reinigung notwendig                 | Reinigungsprogramm starten               | -
W04    | Temperatur außerhalb Norm           | Neustart                                 | Sensor prüfen