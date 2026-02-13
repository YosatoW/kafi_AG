```mermaid
stateDiagram-v2

    [*] --> Z0

    state "Bereit für Getränke auswahl" as Z0
    state "Zusätze optional" as Z1
    state if_optional <<choice>>
    state "Preis Teuer" as Z2
    state "Preis Günstig" as Z3
    state "Münzzahlung" as Z4
    state "Geld prüfen" as Z5
    state "Rückgeld ausgeben" as Z6
    state "Getränk zubereitung" as Z7
    state "Getränk ausgabe" as Z8


    %% Bereit für Getränke auswahl
    Z0 --> Z1: Getränke-Taste gedrückt

    %% Zusätze optiona
    Z1 --> Z0: Abbruch
    Z1 --> if_optional
    if_optional --> Z2: True
    if_optional --> Z3: False

    %% Preis anzeigen
    Z2 --> Z4: Geldeinwurf öffnen
    Z3 --> Z4: Geldeinwurf öffnen

    %% Münzzahlung
    Z4 --> Z0: Abbruch ohne Geld
    Z4 --> Z5: Münze eingeworfen
    Z4 --> Z6: Abbruch mit Geld
    
    %% Geld prüfen
    Z5 --> Z4: Betrag < Preis
    Z5 --> Z6: Betrag > Preis
    Z5 --> Z7: Betrag = Preis


    %% Geld Rückgabe
    Z6 --> Z0: Abbruch Rückgeld 
    Z6 --> Z7

    %% Getränke zubereitung
    Z7 --> Z8: Fertig

    %% Getränke Ausgabe
    Z8 --> Z0: Becher entnommen
