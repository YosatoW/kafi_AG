```mermaid
stateDiagram-v2
  [*] --> Z0

  state "Bereit für Getränkeauswahl" as Z0
  state "Zusätze optional" as Z1
  state if_optional <<choice>>
  state "Preis Teuer" as Z2
  state "Preis Günstig" as Z3
  state "Getränk zubereitung" as Z7
  state "Getränk ausgabe" as Z8

  %% Hauptablauf (oben)
  Z0 --> Z1: Getränke-Taste gedrückt
  Z1 --> Z0: Abbruch
  Z1 --> if_optional: Weiter

  if_optional --> Z2: Zusatz = true
  if_optional --> Z3: Zusatz = false

  Z2 --> Münzeinheit: Geldeinwurf öffnen
  Z3 --> Münzeinheit: Geldeinwurf öffnen

  %% Münzeinheit verlassen
  Münzeinheit --> Z0: Abbruch
  Münzeinheit --> Z7: Zahlung ok

  %% Composite State: Münzeinheit
  state "Münzeinheit" as Münzeinheit {
    [*] --> Z4

    state "Münzzahlung" as Z4
    state "Geld prüfen" as Z5
    state "Rückgeld ausgeben" as Z6

    %% --- Abbruch ohne Geld (z.B. Abbruch gedrückt, bevor Münze eingeworfen)
    Z4 --> [*]: Abbruch ohne Geld

    %% --- Münze eingeworfen -> prüfen
    Z4 --> Z5: Münze eingeworfen

    %% --- Abbruch mit Geld (Münze ist schon drin, aber Benutzer bricht ab)
    Z4 --> Z6: Abbruch mit Geld

    %% --- Geld prüfen
    Z5 --> Z4: Betrag < Preis
    Z5 --> Z6: Betrag > Preis
    Z5 --> [*]: Betrag == Preis

    %% --- Rückgeld ausgeben
    %% (gilt sowohl bei "Abbruch mit Geld" als auch bei "Betrag > Preis")
    Z6 --> [*]: Rückgeld fertig
  }

  %% Nach Zahlung / Zubereitung / Ausgabe
  Z7 --> Z8: Fertig
  Z8 --> Z0: Becher entnommen