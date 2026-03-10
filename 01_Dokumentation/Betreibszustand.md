```mermaid
stateDiagram-v2
  [*] --> Normalbetrieb

  %% ---------------- Normalbetrieb ----------------
  state "Normalbetrieb" as Normalbetrieb

  %% ---------------- Fehlerzustände ----------------
  state "Fehler (nicht-kritisch)" as Z_ERR_UI
  state "Kritischer Fehler" as Z_ERR_CRIT

  %% ---------------- Fehlerereignisse ----------------
  Normalbetrieb --> Z_ERR_UI: Nicht-kritischer Fehler / Anzeige Frontdisplay

  Normalbetrieb --> Z_ERR_CRIT: Kritischer Fehler / Anzeige Frontdisplay \ Meldung an Zentrale

  %% ---------------- Rückkehr / Ende ----------------
  Z_ERR_UI --> Normalbetrieb: Fehler behoben\noder Abbruch

  Z_ERR_CRIT --> [*]: System gestoppt