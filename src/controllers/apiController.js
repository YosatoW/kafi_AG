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
  const mods  = machine.modules || {};
  const beans = Array.isArray(machine.modules?.beans) ? machine.modules.beans : [];

  // gewählte Bohne übernehmen (Fallback = erste Bean), nur bei Kaffee-Getränken & aktivem Modul
  if ((drink?.recipe?.coffee || 0) > 0 && mods.secondCoffee) {
    const fallbackBeanId = beans[0]?.id || null;
    drink.chosenBean = beanId || fallbackBeanId;
  } else {
    drink.chosenBean = null;
  }

  // Guards
  if (!canMake(drink, machine)) {
    return { ok: false, msg: 'Zutat leer – Getränk derzeit nicht verfügbar.' };
  }

  // Effektiver Preis
  const chosenBean = beans.find(b => b.id === drink.chosenBean);
  const priceMod   = Number(chosenBean?.priceMod || 0);
  const basePrice  = Number(drink.price || 0);
  const effectivePrice = Number((basePrice + priceMod).toFixed(2));

  // Payment check
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
    // Zutaten abbuchen
    consumeIngredients(drink, machine);

    // Wechselgeld nach effektivem Preis
    const change = Number((machine.payment.inserted - effectivePrice).toFixed(2));
    machine.payment.inserted = Math.max(0, change);
    machine.payment.change = 0;

    // auf Tassenentnahme warten
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