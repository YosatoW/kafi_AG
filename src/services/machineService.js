// src/services/machineService.js
import { saveMachine } from '../repositories/machineRepository.js';

// ─── SIMULATION WERTE ÄNDERN ───────────────────────────────────────────────────
export async function setSimValues(machine, payload) {
  const toPos = v => Math.max(0, Number(v));

  const {
    milk, coffee, chocolate, cupPresent, descaleIn, timeoutMs,
    insertAdd, insertSet, resetPayment,
    minMilk, minCoffee, minChocolate,
    resetIngredients, resetDescale
  } = payload;

  // ── Migration alter machine.json: coffee1/coffee2 ergänzen, falls fehlen
  if (!machine.ingredients) machine.ingredients = {};
  if (machine.ingredients.coffee1 === undefined) {
    machine.ingredients.coffee1 = Number(machine.ingredients.coffee ?? 0);
  }
  if (machine.ingredients.coffee2 === undefined) {
    machine.ingredients.coffee2 = Number(machine.ingredients.coffee ?? 0);
  }
  if (!machine.max) machine.max = {};
  if (machine.max.coffee1 === undefined) machine.max.coffee1 = Number(machine.max.coffee ?? 0);
  if (machine.max.coffee2 === undefined) machine.max.coffee2 = Number(machine.max.coffee ?? 0);
  if (!machine.minLevels) machine.minLevels = {};
  if (machine.minLevels.coffee1 === undefined) machine.minLevels.coffee1 = Number(machine.minLevels.coffee ?? 0);
  if (machine.minLevels.coffee2 === undefined) machine.minLevels.coffee2 = Number(machine.minLevels.coffee ?? 0);

  // Reset Ingredients
  if (resetIngredients) {
    machine.ingredients.milk      = machine.max.milk;
    machine.ingredients.coffee    = machine.max.coffee;
    machine.ingredients.coffee1   = machine.max.coffee1;
    machine.ingredients.coffee2   = machine.max.coffee2;
    machine.ingredients.chocolate = machine.max.chocolate;
  }

  // Reset Descale
  if (resetDescale) machine.descaleIn = 20;

  // Ingredient changes
  if (milk      !== undefined) machine.ingredients.milk      = toPos(milk);
  if (coffee    !== undefined) machine.ingredients.coffee    = toPos(coffee);
  if (payload.coffee1 !== undefined) machine.ingredients.coffee1 = toPos(payload.coffee1);
  if (payload.coffee2 !== undefined) machine.ingredients.coffee2 = toPos(payload.coffee2);
  if (chocolate !== undefined) machine.ingredients.chocolate = toPos(chocolate);

  // Descale
  if (descaleIn !== undefined) machine.descaleIn = toPos(descaleIn);

  // Screensaver
  if (timeoutMs !== undefined) machine.screensaverTimeoutMs = Math.max(1000, Number(timeoutMs));

  // Cup detection
  machine.cupPresent = (cupPresent === 'on');

  // Min levels
  if (minMilk      !== undefined) machine.minLevels.milk      = toPos(minMilk);
  if (minCoffee    !== undefined) machine.minLevels.coffee    = toPos(minCoffee);
  if (minChocolate !== undefined) machine.minLevels.chocolate = toPos(minChocolate);

  // Payment
  if (resetPayment === 'on') {
    machine.payment = { inserted: 0, change: 0 };
  } else {
    if (insertSet) machine.payment.inserted = toPos(insertSet);
    if (insertAdd) machine.payment.inserted += toPos(insertAdd);
  }

// ─── MODULE SYSTEM (nur speichern wenn Modul-Formular gesendet wurde) ─────────
  if (!machine.modules) {
    machine.modules = {
      chocolate: true,
      secondCoffee: false,
      beans: [
        { id: 'sorte1', name: 'Sorte 1', priceMod: 0 },
        { id: 'sorte2', name: 'Sorte 2', priceMod: 0 }
      ]
    };
  }

  // Erkennen ob das Modulformular abgesendet wurde:
  const isModuleForm =
    ("modulesForm" in payload) ||
    ("mod_chocolate" in payload) ||
    ("mod_secondCoffee" in payload) ||
    ("beans" in payload);

  if (isModuleForm) {
    // Checkboxen: "on" → true, sonst false (auch wenn Feld fehlt)
    machine.modules.chocolate    = payload.mod_chocolate === "on";
    machine.modules.secondCoffee = payload.mod_secondCoffee === "on";

    // Beans werden nur bei aktiver zweiter Sorte aktualisiert
    if (machine.modules.secondCoffee) {
      const beansForm = payload.beans || {};

      // Namen können als Array oder einzelner String ankommen
      const rawNames = Array.isArray(beansForm.name)
        ? beansForm.name
        : [beansForm.name].filter(Boolean);

      // priceMod kommt im Formular aktuell NUR EINMAL (für Bohne 2)
      let rawMods = beansForm.priceMod;
      if (!Array.isArray(rawMods)) rawMods = [rawMods].filter(Boolean);

      // Der Wert für Bohne 2 steht in deinem Formular an Index 0
      const rawModForBean2 = rawMods[0];

      // Komma zu Punkt konvertieren + sicher parsen
      const toNumberSafe = (v, fallback = 0) => {
        if (v === undefined || v === null || v === "") return fallback;
        const num = Number(String(v).replace(',', '.'));
        return Number.isFinite(num) ? num : fallback;
      };

      // Bisherige Werte als Fallback verwenden
      const prev = machine.modules.beans || [
        { id: "sorte1", name: "Sorte 1", priceMod: 0 },
        { id: "sorte2", name: "Sorte 2", priceMod: 0 }
      ];

      // Leere Namen: nicht speichern → alten Namen beibehalten
      const name1 = (rawNames[0] ?? '').trim();
      const name2 = (rawNames[1] ?? '').trim();

      machine.modules.beans = [
        {
          id: "sorte1",
          name: name1 !== '' ? name1 : (prev[0]?.name || "Sorte 1"),
          priceMod: 0
        },
        {
          id: "sorte2",
          name: name2 !== '' ? name2 : (prev[1]?.name || "Sorte 2"),
          priceMod: toNumberSafe(rawModForBean2, prev[1]?.priceMod ?? 0)
        }
      ];
    }
    // Wenn zweite Sorte deaktiviert wurde → Beans bewusst NICHT anfassen
  }

  await saveMachine(machine);
}

// ─── SUPERUSER SETTINGS BEARBEITEN ────────────────────────────────────────────────
export async function applySettings(machine, payload) {
  const {
    minMilk, minCoffee, minChocolate,
    descaleWarning, timeoutMin
  } = payload;

  if (minMilk       !== undefined) machine.minLevels.milk      = Number(minMilk);
  if (minCoffee     !== undefined) machine.minLevels.coffee    = Number(minCoffee);
  if (minChocolate  !== undefined) machine.minLevels.chocolate = Number(minChocolate);

  if (descaleWarning !== undefined)
    machine.descaleWarning = Number(descaleWarning);

  if (timeoutMin !== undefined) {
    let min = Number(timeoutMin);
    if (isNaN(min)) min = 1;
    min = Math.max(1, Math.min(10, min));
    machine.screensaverTimeoutMs = min * 60 * 1000;
  }

  await saveMachine(machine);
}