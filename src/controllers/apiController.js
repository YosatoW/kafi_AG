// src/controllers/apiController.js
import { canMake, consumeIngredients, moneyState } from '../services/drinksService.js';
import { saveMachine } from '../repositories/machineRepository.js';
import { DEFAULT_BREW_MS } from '../config/constants.js';

export function getStatus(drinks, machine) {
  return {
    modules: machine.modules,
    cupPresent: machine.cupPresent,
    descaleIn: machine.descaleIn,
    payment: machine.payment,
    brewing: machine.brewing,
    drinks: drinks.map(d => ({
      id: d.id, name: d.name, price: d.price, active: d.active, available: canMake(d, machine)
    })),
    ingredients: machine.ingredients,
    currency: machine.currency,
    screensaverTimeoutMs: machine.screensaverTimeoutMs
  };
}

export async function postBrew(drink, machine, beanId = null) {
  const mods = machine.modules || {};

  if ((drink?.recipe?.coffee || 0) > 0 && mods.secondCoffee) {
    drink.chosenBean = beanId || 'sorte1';
  } else {
    drink.chosenBean = null;
  }

  // Optionaler Server-Guard (empfohlen)
  if (!canMake(drink, machine)) {
    return { ok: false, msg: 'Zutat leer – Getränk derzeit nicht verfügbar.' };
  }

  // >>> Effektiven Preis inkl. Preisaufschlag ermitteln
  const beans = Array.isArray(machine.modules?.beans) ? machine.modules.beans : [];
  const chosenBean = beans.find(b => b.id === (drink.chosenBean || 'sorte1'));
  const priceMod = Number(chosenBean?.priceMod || 0);
  const basePrice = Number(drink.price || 0);
  const effectivePrice = Number((basePrice + priceMod).toFixed(2));

  // Guthaben/Restbetrag anhand des effektiven Preises prüfen
  const pay = moneyState(effectivePrice, machine);
  if (pay.remain > 0) return { ok: false, msg: `Bitte noch ${pay.remain.toFixed(2)} ${machine.currency} einwerfen.` };
  if (!machine.cupPresent)  return { ok: false, msg: 'Bitte Tasse hinstellen.' };
  if (machine.brewing.inProgress) return { ok: false, msg: 'Zubereitung läuft bereits…' };

  const brewMs =
    (Number(drink?.config?.brewMs) > 0 && Number(drink.config.brewMs)) ||
    (Number(machine?.brewing?.etaMs) > 0 && Number(machine.brewing.etaMs)) ||
    DEFAULT_BREW_MS;

  machine.brewing = { inProgress: true, drinkId: drink.id, etaMs: brewMs, startedAt: Date.now(), awaitingCupRemoval: false };

  setTimeout(async () => {
    consumeIngredients(drink, machine);

    // Wechselgeld nach effektivem Preis
    const change = Number((machine.payment.inserted - effectivePrice).toFixed(2));
    machine.payment.inserted = Math.max(0, change);
    machine.payment.change = 0;

    machine.brewing = { inProgress: false, drinkId: null, etaMs: brewMs, startedAt: 0, awaitingCupRemoval: true };

    await saveMachine(machine);
  }, brewMs);

  return { ok: true, msg: 'Zubereitung gestartet…', etaMs: brewMs };
}


export async function postFinish(machine) {
  machine.brewing.awaitingCupRemoval = false;
  await saveMachine(machine);
  return { ok: true };
}
