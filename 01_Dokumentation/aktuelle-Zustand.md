```mermaid
%% WIP
stateDiagram-v2
    [*] --> Home

    state "Home / Getränkeauswahl\n(Preis wird angezeigt)" as Home
    state "Screensaver" as Saver
    state "Pay-Screen\n(Guthaben anzeigen)" as Pay
    state "Startbedingungen erfüllt\n(Timer läuft)" as ReadyTimer
    state "Zubereitung" as Brew
    state "Fertig-Hinweis\n(Tasse entfernen)" as RemoveCup
    state "Retourgeld-Auszahlung" as CashOut

    %% --- Screensaver (Touchpanel-Inaktivität) ---
    Home --> Saver: Inaktivität abgelaufen
    Pay  --> Saver: Inaktivität abgelaufen
    RemoveCup --> Saver: Inaktivität abgelaufen

    Saver --> Home: Touch / Interaktion

    %% --- Auswahl: Preis ist schon sichtbar, Auswahl führt zum Pay-Screen ---
    Home --> Pay: Getränk gewählt

    %% --- Pay-Screen: Guthaben sammeln / Bedingungen prüfen ---
    Pay --> Pay: Zahlungsmittel eingeworfen\n/ Guthaben erhöhen
    Pay --> Pay: Tasse hingestellt\n/ cupPresent = true
    Pay --> Pay: Tasse entfernt\n/ cupPresent = false

    %% Wenn Benutzer abbrechen will: zurück zur Auswahl (Guthaben bleibt bestehen)
    Pay --> Home: Abbruch

    %% Explizite Auszahlung: Guthaben als Rückgeld ausgeben, danach zurück Home
    Pay --> CashOut: "Retourgeld auszahlen" gedrückt
    CashOut --> Home: Auszahlung abgeschlossen\n/ Guthaben = 0

    %% --- Start-Timer-Logik ---
    %% Sobald Guthaben >= Preis UND Tasse vorhanden, startet Timer
    Pay --> ReadyTimer: [Guthaben >= Preis && cupPresent]

    %% Timer läuft. Wenn Bedingung wieder wegfällt, zurück zu Pay
    ReadyTimer --> Pay: [Guthaben < Preis || !cupPresent]
    ReadyTimer --> Brew: Start-Timer abgelaufen

    %% --- Zubereitung und Rückkehr ---
    Brew --> RemoveCup: Getränk fertig
    RemoveCup --> Home: Tasse entfernt