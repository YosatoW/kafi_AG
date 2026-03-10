```mermaid
stateDiagram-v2
  [*] --> INIT

  %%  Start / Konfiguration 
  state "Maschine startet" as INIT
  state C <<choice>>

  INIT --> C: Konfiguration prüfen (Mahlwerke)
  C --> Z0: [mahlwerke==1] / mode=ONE
  C --> Z0: [mahlwerke==2] / mode=TWO

  %%  Hauptzustände 
  state "Bereit für Getränkeauswahl" as Z0
  state "Getränk zubereitung" as Z7
  state "Getränk ausgabe" as Z8

  %% Rückgeld-Ausgabe (NUR aus Z0 erreichbar!)
  state "Rückgeld-Hardware" as RH {
    [*] --> RH_Aktiv
    state "Rückgeld ausgeben" as RH_Aktiv
    RH_Aktiv --> [*]: Rückgeld fertig
  }

  %%  Getränkeauswahl 
  Z0 --> Bedienzustand: Getränke-Taste gedrückt

  %%  Bedien-Screen 
  state "Bezahlen & Becher & (optional) Kaffeesorte" as Bedienzustand {

    %% Zahlung
    state Zahlung {
      [*] --> Z4
      state "Münzzahlung" as Z4
      state "Geld prüfen" as Z5

      Z4 --> Z5: Münze eingeworfen
      Z5 --> Z4: Betrag < Preis

      %% Zahlung abgeschlossen, Rückgeld ggf. vormerken
      Z5 --> [*]: Betrag = Preis
      Z5 --> [*]: Betrag > Preis / rueckgeldOffen=true
    }

    --
    %% Becher
    state Becher {
      [*] --> B0
      state "Kein Becher" as B0
      state "Becher vorhanden" as B1
      B0 --> B1: Becher hingestellt
      B1 --> B0: Becher entfernt
    }

    --
    %% Kaffeesorte
    state Kaffeesorte {
      [*] --> K0
      state "Sorte nicht gewählt" as K0
      state "Sorte gewählt" as K1

      K0 --> K1: [mode==ONE] / sorte=DEFAULT
      K0 --> K1: [mode==TWO] Arabica gewählt
      K0 --> K1: [mode==TWO] Robusta gewählt
    }

    --
    %% Timer
    state Timer {
      [*] --> T0
      state "Timer inaktiv" as T0
      state "Timer läuft" as T1

      T0 --> T1: Zahlung ok & Becher da & Sorte gewählt
      T1 --> T0: Becher entfernt
    }
  }

  %%  Abbruch / Abschluss 
  Bedienzustand --> Z0: Abbruch
  Bedienzustand --> Z7: Timer abgelaufen

  %%  Rückgeld nur im Zustand Z0 
  Z0 --> RH: [rueckgeldOffen==true]
  RH --> Z0: Rückgeld fertig / rueckgeldOffen=false

  %%  Zubereitung & Ausgabe 
  Z7 --> Z8: Fertig
  Z8 --> Z0: Becher entnommen